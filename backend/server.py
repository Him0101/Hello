from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, Request, Response, HTTPException
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os, logging, uuid, httpx, bcrypt, jwt, secrets
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from bson import ObjectId
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, CheckoutSessionRequest, CheckoutSessionResponse, CheckoutStatusResponse
)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

SARVAM_API_KEY = os.environ.get('SARVAM_API_KEY', '')
SARVAM_BASE = "https://api.sarvam.ai"
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALG = "HS256"

app = FastAPI()
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ─── Password ───
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


# ─── JWT ───
def create_access_token(user_id: str, email: str) -> str:
    return jwt.encode({"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=2), "type": "access"}, JWT_SECRET, algorithm=JWT_ALG)

def create_refresh_token(user_id: str) -> str:
    return jwt.encode({"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}, JWT_SECRET, algorithm=JWT_ALG)

def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie(key="access_token", value=access, httponly=True, secure=True, samesite="none", max_age=7200, path="/")
    response.set_cookie(key="refresh_token", value=refresh, httponly=True, secure=True, samesite="none", max_age=604800, path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_h = request.headers.get("Authorization", "")
        if auth_h.startswith("Bearer "):
            token = auth_h[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except (jwt.InvalidTokenError, Exception):
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_optional_user(request: Request):
    try:
        return await get_current_user(request)
    except:
        return None


# ─── Models ───
class RegisterReq(BaseModel):
    name: str
    email: str
    password: str

class LoginReq(BaseModel):
    email: str
    password: str

class TranslateRequest(BaseModel):
    text: str
    source_language: str = "en-IN"
    target_language: str = "hi-IN"

class ChatMessage(BaseModel):
    message: str
    language: str = "en-IN"
    target_language: str = "hi-IN"
    thread_id: Optional[str] = None

class CheckoutReq(BaseModel):
    origin_url: str

class GoogleSessionReq(BaseModel):
    session_id: str


# ─── Auth ───
@api.post("/auth/register")
async def register(req: RegisterReq, response: Response):
    email = req.email.strip().lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {"email": email, "name": req.name.strip(), "password_hash": hash_password(req.password),
           "role": "user", "is_premium": False, "provider": "email", "created_at": datetime.now(timezone.utc).isoformat()}
    result = await db.users.insert_one(doc)
    uid = str(result.inserted_id)
    at, rt = create_access_token(uid, email), create_refresh_token(uid)
    set_auth_cookies(response, at, rt)
    return {"user_id": uid, "email": email, "name": req.name.strip(), "role": "user", "is_premium": False}


@api.post("/auth/login")
async def login(req: LoginReq, request: Request, response: Response):
    email = req.email.strip().lower()
    ip = request.client.host if request.client else "unknown"
    ident = f"{ip}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": ident}, {"_id": 0})
    if attempt and attempt.get("count", 0) >= 5:
        locked_at = attempt.get("locked_at", "")
        if locked_at:
            lt = datetime.fromisoformat(locked_at) if isinstance(locked_at, str) else locked_at
            if lt.tzinfo is None: lt = lt.replace(tzinfo=timezone.utc)
            if datetime.now(timezone.utc) - lt < timedelta(minutes=15):
                raise HTTPException(status_code=429, detail="Too many attempts. Try again in 15 minutes.")
    user = await db.users.find_one({"email": email})
    if not user or not user.get("password_hash") or not verify_password(req.password, user["password_hash"]):
        await db.login_attempts.update_one({"identifier": ident}, {"$inc": {"count": 1}, "$set": {"locked_at": datetime.now(timezone.utc).isoformat()}}, upsert=True)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await db.login_attempts.delete_many({"identifier": ident})
    uid = str(user["_id"])
    at, rt = create_access_token(uid, email), create_refresh_token(uid)
    set_auth_cookies(response, at, rt)
    return {"user_id": uid, "email": email, "name": user.get("name", ""), "role": user.get("role", "user"), "is_premium": user.get("is_premium", False), "picture": user.get("picture", "")}


@api.post("/auth/google")
async def google_auth(req: GoogleSessionReq, response: Response):
    """Exchange Google OAuth session from popup for JWT tokens"""
    async with httpx.AsyncClient() as http:
        resp = await http.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": req.session_id},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google session")
    data = resp.json()
    email = data.get("email", "").lower()
    name = data.get("name", "User")
    picture = data.get("picture", "")
    if not email:
        raise HTTPException(status_code=401, detail="No email from Google")

    existing = await db.users.find_one({"email": email})
    if existing:
        uid = str(existing["_id"])
        await db.users.update_one({"email": email}, {"$set": {"name": name, "picture": picture, "provider": "google"}})
    else:
        doc = {"email": email, "name": name, "picture": picture, "role": "user",
               "is_premium": False, "provider": "google", "created_at": datetime.now(timezone.utc).isoformat()}
        result = await db.users.insert_one(doc)
        uid = str(result.inserted_id)

    at, rt = create_access_token(uid, email), create_refresh_token(uid)
    set_auth_cookies(response, at, rt)
    user = await db.users.find_one({"_id": ObjectId(uid)}, {"_id": 0, "password_hash": 0})
    return {"user_id": uid, "email": email, "name": name, "picture": picture, "role": user.get("role", "user"), "is_premium": user.get("is_premium", False)}


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/", secure=True, samesite="none")
    response.delete_cookie("refresh_token", path="/", secure=True, samesite="none")
    return {"message": "Logged out"}


@api.get("/auth/me")
async def auth_me(request: Request):
    user = await get_current_user(request)
    return {"user_id": user["_id"], "email": user["email"], "name": user.get("name", ""),
            "role": user.get("role", "user"), "is_premium": user.get("is_premium", False), "picture": user.get("picture", "")}


@api.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        uid = str(user["_id"])
        at = create_access_token(uid, user["email"])
        response.set_cookie(key="access_token", value=at, httponly=True, secure=True, samesite="none", max_age=7200, path="/")
        return {"message": "Token refreshed"}
    except:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


# ─── Translate ───
@api.post("/translate")
async def translate(req: TranslateRequest, request: Request):
    src = req.source_language if "-" in req.source_language else f"{req.source_language}-IN"
    tgt = req.target_language if "-" in req.target_language else f"{req.target_language}-IN"
    translated = ""
    try:
        async with httpx.AsyncClient(timeout=15.0) as http:
            resp = await http.post(f"{SARVAM_BASE}/translate",
                headers={"api-subscription-key": SARVAM_API_KEY, "Content-Type": "application/json"},
                json={"input": req.text, "source_language_code": src, "target_language_code": tgt, "model": "mayura:v1"})
        if resp.status_code == 200:
            translated = resp.json().get("translated_text", req.text)
        else:
            translated = f"[Translation unavailable] {req.text}"
    except Exception as e:
        logger.error(f"Sarvam error: {e}")
        translated = f"[Translation error] {req.text}"

    user = await get_optional_user(request)
    await db.translations.insert_one({
        "id": str(uuid.uuid4()), "source_text": req.text, "translated_text": translated,
        "source_language": src, "target_language": tgt,
        "user_id": user["_id"] if user else None, "timestamp": datetime.now(timezone.utc).isoformat()})
    return {"translated_text": translated, "source_language": src, "target_language": tgt}


# ─── Chat with threads ───
@api.post("/chat")
async def chat(msg: ChatMessage, request: Request):
    src = msg.language if "-" in msg.language else f"{msg.language}-IN"
    tgt = msg.target_language if "-" in msg.target_language else f"{msg.target_language}-IN"
    content = ""
    try:
        if src != tgt:
            async with httpx.AsyncClient(timeout=15.0) as http:
                resp = await http.post(f"{SARVAM_BASE}/translate",
                    headers={"api-subscription-key": SARVAM_API_KEY, "Content-Type": "application/json"},
                    json={"input": msg.message, "source_language_code": src, "target_language_code": tgt, "model": "mayura:v1"})
            if resp.status_code == 200:
                content = resp.json().get("translated_text", msg.message)
            else:
                content = "Translation service returned an error. Please try again."
        else:
            content = "Source and target languages are the same. Please select different languages."
    except Exception as e:
        logger.error(f"Chat error: {e}")
        content = "Translation service unavailable. Please try again later."

    user = await get_optional_user(request)
    user_id = user["_id"] if user else None
    thread_id = msg.thread_id or str(uuid.uuid4())

    # Create or update thread
    if user_id:
        existing_thread = await db.chat_threads.find_one({"thread_id": thread_id, "user_id": user_id}, {"_id": 0})
        if not existing_thread:
            preview = msg.message[:50] + ("..." if len(msg.message) > 50 else "")
            await db.chat_threads.insert_one({
                "thread_id": thread_id, "user_id": user_id, "title": preview,
                "source_language": src, "target_language": tgt,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()})
        else:
            await db.chat_threads.update_one({"thread_id": thread_id}, {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}})

    # Save messages
    await db.chat_messages.insert_one({
        "thread_id": thread_id, "user_id": user_id, "role": "user",
        "content": msg.message, "timestamp": datetime.now(timezone.utc).isoformat()})
    await db.chat_messages.insert_one({
        "thread_id": thread_id, "user_id": user_id, "role": "assistant",
        "content": content, "timestamp": datetime.now(timezone.utc).isoformat()})

    return {"id": str(uuid.uuid4()), "role": "assistant", "content": content, "thread_id": thread_id}


@api.get("/chat/threads")
async def get_chat_threads(request: Request):
    user = await get_current_user(request)
    threads = await db.chat_threads.find({"user_id": user["_id"]}, {"_id": 0}).sort("updated_at", -1).to_list(50)
    return threads


@api.get("/chat/threads/{thread_id}/messages")
async def get_thread_messages(thread_id: str, request: Request):
    user = await get_current_user(request)
    msgs = await db.chat_messages.find({"thread_id": thread_id, "user_id": user["_id"]}, {"_id": 0}).sort("timestamp", 1).to_list(200)
    return msgs


@api.delete("/chat/threads/{thread_id}")
async def delete_thread(thread_id: str, request: Request):
    user = await get_current_user(request)
    await db.chat_threads.delete_one({"thread_id": thread_id, "user_id": user["_id"]})
    await db.chat_messages.delete_many({"thread_id": thread_id, "user_id": user["_id"]})
    return {"message": "Thread deleted"}


# ─── Translation History ───
@api.get("/translations/history")
async def get_translation_history(request: Request):
    user = await get_current_user(request)
    return await db.translations.find({"user_id": user["_id"]}, {"_id": 0}).sort("timestamp", -1).to_list(100)


# ─── Stripe ───
PLANS = {"premium_monthly": 499.00}

@api.post("/payments/checkout")
async def create_checkout(req: CheckoutReq, request: Request):
    user = await get_current_user(request)
    amount = PLANS["premium_monthly"]
    success_url = f"{req.origin_url}?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = req.origin_url
    stripe_key = os.environ.get("STRIPE_API_KEY", "")
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    sc = StripeCheckout(api_key=stripe_key, webhook_url=webhook_url)
    checkout_req = CheckoutSessionRequest(amount=amount, currency="inr", success_url=success_url, cancel_url=cancel_url,
        metadata={"user_id": user["_id"], "email": user["email"], "plan": "premium_monthly"})
    session: CheckoutSessionResponse = await sc.create_checkout_session(checkout_req)
    await db.payment_transactions.insert_one({
        "session_id": session.session_id, "user_id": user["_id"], "email": user["email"],
        "amount": amount, "currency": "inr", "plan": "premium_monthly",
        "payment_status": "initiated", "status": "pending", "created_at": datetime.now(timezone.utc).isoformat()})
    return {"url": session.url, "session_id": session.session_id}


@api.get("/payments/status/{session_id}")
async def check_payment_status(session_id: str, request: Request):
    user = await get_current_user(request)
    stripe_key = os.environ.get("STRIPE_API_KEY", "")
    host_url = str(request.base_url)
    sc = StripeCheckout(api_key=stripe_key, webhook_url=f"{host_url}api/webhook/stripe")
    status: CheckoutStatusResponse = await sc.get_checkout_status(session_id)
    txn = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if txn and txn.get("payment_status") != "paid" and status.payment_status == "paid":
        await db.payment_transactions.update_one({"session_id": session_id},
            {"$set": {"payment_status": "paid", "status": "complete", "paid_at": datetime.now(timezone.utc).isoformat()}})
        await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$set": {"is_premium": True}})
    return {"status": status.status, "payment_status": status.payment_status, "amount_total": status.amount_total, "currency": status.currency}


@api.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("Stripe-Signature", "")
    stripe_key = os.environ.get("STRIPE_API_KEY", "")
    host_url = str(request.base_url)
    sc = StripeCheckout(api_key=stripe_key, webhook_url=f"{host_url}api/webhook/stripe")
    try:
        event = await sc.handle_webhook(body, sig)
        if event.payment_status == "paid":
            txn = await db.payment_transactions.find_one({"session_id": event.session_id})
            if txn and txn.get("payment_status") != "paid":
                await db.payment_transactions.update_one({"session_id": event.session_id},
                    {"$set": {"payment_status": "paid", "status": "complete", "paid_at": datetime.now(timezone.utc).isoformat()}})
                if txn.get("user_id"):
                    await db.users.update_one({"_id": ObjectId(txn["user_id"])}, {"$set": {"is_premium": True}})
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error"}


@api.get("/")
async def root():
    return {"message": "Sarvbhasa API is running"}


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.chat_messages.create_index([("thread_id", 1), ("timestamp", 1)])
    await db.chat_threads.create_index([("user_id", 1), ("updated_at", -1)])
    await db.translations.create_index("user_id")
    await db.payment_transactions.create_index("session_id", unique=True)
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@sarvbhasa.com")
    admin_pw = os.environ.get("ADMIN_PASSWORD", "Sarvbhasa@123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({"email": admin_email, "name": "Admin", "password_hash": hash_password(admin_pw),
            "role": "admin", "is_premium": True, "provider": "email", "created_at": datetime.now(timezone.utc).isoformat()})
    elif not verify_password(admin_pw, existing.get("password_hash", "")):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_pw)}})


@app.on_event("shutdown")
async def shutdown():
    client.close()

app.include_router(api)
app.add_middleware(CORSMiddleware,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
