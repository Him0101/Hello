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

# ─── DB ───
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
    return jwt.encode({"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=60), "type": "access"}, JWT_SECRET, algorithm=JWT_ALG)

def create_refresh_token(user_id: str) -> str:
    return jwt.encode({"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}, JWT_SECRET, algorithm=JWT_ALG)

def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie(key="access_token", value=access, httponly=True, secure=True, samesite="none", max_age=3600, path="/")
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
    except (jwt.InvalidTokenError, Exception) as e:
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

class CheckoutReq(BaseModel):
    origin_url: str


# ─── Auth ───
@api.post("/auth/register")
async def register(req: RegisterReq, response: Response):
    email = req.email.strip().lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "email": email, "name": req.name.strip(), "password_hash": hash_password(req.password),
        "role": "user", "is_premium": False, "created_at": datetime.now(timezone.utc).isoformat(),
    }
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
            if lt.tzinfo is None:
                lt = lt.replace(tzinfo=timezone.utc)
            if datetime.now(timezone.utc) - lt < timedelta(minutes=15):
                raise HTTPException(status_code=429, detail="Too many attempts. Try again in 15 minutes.")

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": ident},
            {"$inc": {"count": 1}, "$set": {"locked_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await db.login_attempts.delete_many({"identifier": ident})
    uid = str(user["_id"])
    at, rt = create_access_token(uid, email), create_refresh_token(uid)
    set_auth_cookies(response, at, rt)
    return {"user_id": uid, "email": email, "name": user.get("name", ""), "role": user.get("role", "user"), "is_premium": user.get("is_premium", False)}


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/", secure=True, samesite="none")
    response.delete_cookie("refresh_token", path="/", secure=True, samesite="none")
    return {"message": "Logged out"}


@api.get("/auth/me")
async def auth_me(request: Request):
    user = await get_current_user(request)
    return {"user_id": user["_id"], "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "user"), "is_premium": user.get("is_premium", False)}


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
        response.set_cookie(key="access_token", value=at, httponly=True, secure=True, samesite="none", max_age=3600, path="/")
        return {"message": "Token refreshed"}
    except:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


# ─── Translate (real Sarvam API) ───
@api.post("/translate")
async def translate(req: TranslateRequest, request: Request):
    src = req.source_language if "-" in req.source_language else f"{req.source_language}-IN"
    tgt = req.target_language if "-" in req.target_language else f"{req.target_language}-IN"
    translated = ""

    try:
        async with httpx.AsyncClient(timeout=15.0) as http:
            resp = await http.post(
                f"{SARVAM_BASE}/translate",
                headers={"api-subscription-key": SARVAM_API_KEY, "Content-Type": "application/json"},
                json={"input": req.text, "source_language_code": src, "target_language_code": tgt, "model": "mayura:v1"},
            )
        if resp.status_code == 200:
            translated = resp.json().get("translated_text", req.text)
        else:
            translated = f"[Translation unavailable] {req.text}"
    except Exception as e:
        logger.error(f"Sarvam API error: {e}")
        translated = f"[Translation error] {req.text}"

    user = await get_optional_user(request)
    doc = {
        "id": str(uuid.uuid4()), "source_text": req.text, "translated_text": translated,
        "source_language": src, "target_language": tgt,
        "user_id": user["_id"] if user else None,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.translations.insert_one(doc)
    return {"translated_text": translated, "source_language": src, "target_language": tgt}


# ─── Chat (real Sarvam API) ───
@api.post("/chat")
async def chat(msg: ChatMessage, request: Request):
    src = msg.language if "-" in msg.language else f"{msg.language}-IN"
    tgt = msg.target_language if "-" in msg.target_language else f"{msg.target_language}-IN"
    content = ""

    try:
        if src != tgt:
            async with httpx.AsyncClient(timeout=15.0) as http:
                resp = await http.post(
                    f"{SARVAM_BASE}/translate",
                    headers={"api-subscription-key": SARVAM_API_KEY, "Content-Type": "application/json"},
                    json={"input": msg.message, "source_language_code": src, "target_language_code": tgt, "model": "mayura:v1"},
                )
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
    doc = {
        "id": str(uuid.uuid4()), "user_message": msg.message, "bot_response": content,
        "source_language": src, "target_language": tgt,
        "user_id": user["_id"] if user else None,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.chat_history.insert_one(doc)
    return {"id": doc["id"], "role": "assistant", "content": content}


# ─── Chat History ───
@api.get("/chat/history")
async def get_chat_history(request: Request):
    user = await get_current_user(request)
    history = await db.chat_history.find({"user_id": user["_id"]}, {"_id": 0}).sort("timestamp", -1).to_list(100)
    return history


# ─── Translation History ───
@api.get("/translations/history")
async def get_translation_history(request: Request):
    user = await get_current_user(request)
    history = await db.translations.find({"user_id": user["_id"]}, {"_id": 0}).sort("timestamp", -1).to_list(100)
    return history


# ─── Stripe Payment ───
PLANS = {"premium_monthly": 499.00}

@api.post("/payments/checkout")
async def create_checkout(req: CheckoutReq, request: Request):
    user = await get_current_user(request)
    amount = PLANS["premium_monthly"]
    success_url = f"{req.origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{req.origin_url}/payment-cancel"

    stripe_key = os.environ.get("STRIPE_API_KEY", "")
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_key, webhook_url=webhook_url)

    checkout_req = CheckoutSessionRequest(
        amount=amount, currency="inr",
        success_url=success_url, cancel_url=cancel_url,
        metadata={"user_id": user["_id"], "email": user["email"], "plan": "premium_monthly"},
    )
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_req)

    await db.payment_transactions.insert_one({
        "session_id": session.session_id, "user_id": user["_id"], "email": user["email"],
        "amount": amount, "currency": "inr", "plan": "premium_monthly",
        "payment_status": "initiated", "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"url": session.url, "session_id": session.session_id}


@api.get("/payments/status/{session_id}")
async def check_payment_status(session_id: str, request: Request):
    user = await get_current_user(request)
    stripe_key = os.environ.get("STRIPE_API_KEY", "")
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_key, webhook_url=webhook_url)

    status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)

    txn = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if txn and txn.get("payment_status") != "paid" and status.payment_status == "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid", "status": "complete", "paid_at": datetime.now(timezone.utc).isoformat()}}
        )
        await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$set": {"is_premium": True}})

    return {"status": status.status, "payment_status": status.payment_status, "amount_total": status.amount_total, "currency": status.currency}


@api.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("Stripe-Signature", "")
    stripe_key = os.environ.get("STRIPE_API_KEY", "")
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_key, webhook_url=webhook_url)

    try:
        event = await stripe_checkout.handle_webhook(body, sig)
        if event.payment_status == "paid":
            txn = await db.payment_transactions.find_one({"session_id": event.session_id})
            if txn and txn.get("payment_status") != "paid":
                await db.payment_transactions.update_one(
                    {"session_id": event.session_id},
                    {"$set": {"payment_status": "paid", "status": "complete", "paid_at": datetime.now(timezone.utc).isoformat()}}
                )
                if txn.get("user_id"):
                    await db.users.update_one({"_id": ObjectId(txn["user_id"])}, {"$set": {"is_premium": True}})
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error"}


# ─── Health ───
@api.get("/")
async def root():
    return {"message": "Sarvbhasa API is running"}


# ─── Startup ───
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.chat_history.create_index("user_id")
    await db.translations.create_index("user_id")
    await db.payment_transactions.create_index("session_id", unique=True)
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@sarvbhasa.com")
    admin_pw = os.environ.get("ADMIN_PASSWORD", "Sarvbhasa@123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({"email": admin_email, "name": "Admin", "password_hash": hash_password(admin_pw), "role": "admin", "is_premium": True, "created_at": datetime.now(timezone.utc).isoformat()})
    elif not verify_password(admin_pw, existing.get("password_hash", "")):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_pw)}})


@app.on_event("shutdown")
async def shutdown():
    client.close()

app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
