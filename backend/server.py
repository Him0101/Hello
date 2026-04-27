from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from fastapi import FastAPI, APIRouter, Request, Response, HTTPException
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import logging, uuid, httpx, bcrypt, jwt
from sarvamai import SarvamAI
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
from bson import ObjectId

MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ.get("JWT_SECRET", "secret")
SARVAM_API_KEY = os.environ.get("SARVAM_API_KEY", "")
SARVAM_BASE = "https://api.sarvam.ai"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

sarvam_client = SarvamAI(api_subscription_key=SARVAM_API_KEY)

app = FastAPI()
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ─── Password ───
def hash_password(pw: str):
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw, hashed):
    return bcrypt.checkpw(pw.encode(), hashed.encode())


# ─── JWT ───
def create_token(user_id, email):
    return jwt.encode({"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=2)}, JWT_SECRET, algorithm="HS256")

def set_cookie(response, token):
    response.set_cookie(key="access_token", value=token, httponly=True, secure=True, samesite="none", max_age=7200, path="/")


async def get_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        auth_h = request.headers.get("Authorization", "")
        if auth_h.startswith("Bearer "):
            token = auth_h[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not logged in")
    try:
        data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user = await db.users.find_one({"_id": ObjectId(data["sub"])})
        if not user:
            raise HTTPException(status_code=401)
        user["_id"] = str(user["_id"])
        user.pop("password", None)
        user.pop("password_hash", None)
        return user
    except:
        raise HTTPException(status_code=401)


async def get_optional_user(request: Request):
    try:
        return await get_user(request)
    except:
        return None


# ─── Models ───
class Register(BaseModel):
    name: str
    email: str
    password: str

class Login(BaseModel):
    email: str
    password: str

class TranslateReq(BaseModel):
    text: str
    source_language: str = "en-IN"
    target_language: str = "hi-IN"

class ChatReq(BaseModel):
    message: str
    source_language: str = "en-IN"
    target_language: str = "hi-IN"
    thread_id: Optional[str] = None

class GoogleSessionReq(BaseModel):
    session_id: str


# ─── Auth ───
@api.post("/auth/register")
async def register(data: Register, response: Response):
    email = data.email.strip().lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email already registered")
    doc = {"name": data.name.strip(), "email": email, "password": hash_password(data.password),
           "role": "user", "is_premium": False, "provider": "email", "created_at": datetime.now(timezone.utc).isoformat()}
    res = await db.users.insert_one(doc)
    uid = str(res.inserted_id)
    token = create_token(uid, email)
    set_cookie(response, token)
    return {"user_id": uid, "email": email, "name": data.name.strip(), "role": "user", "is_premium": False}


@api.post("/auth/login")
async def login(data: Login, request: Request, response: Response):
    email = data.email.strip().lower()
    ip = request.client.host if request.client else "unknown"
    ident = f"{ip}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": ident}, {"_id": 0})
    if attempt and attempt.get("count", 0) >= 5:
        locked = attempt.get("locked_at", "")
        if locked:
            lt = datetime.fromisoformat(locked) if isinstance(locked, str) else locked
            if lt.tzinfo is None: lt = lt.replace(tzinfo=timezone.utc)
            if datetime.now(timezone.utc) - lt < timedelta(minutes=15):
                raise HTTPException(429, "Too many attempts. Try in 15 minutes.")

    user = await db.users.find_one({"email": email})
    pw_field = user.get("password") or user.get("password_hash", "") if user else ""
    if not user or not pw_field or not verify_password(data.password, pw_field):
        await db.login_attempts.update_one({"identifier": ident}, {"$inc": {"count": 1}, "$set": {"locked_at": datetime.now(timezone.utc).isoformat()}}, upsert=True)
        raise HTTPException(401, "Invalid email or password")

    await db.login_attempts.delete_many({"identifier": ident})
    uid = str(user["_id"])
    token = create_token(uid, email)
    set_cookie(response, token)
    return {"user_id": uid, "email": email, "name": user.get("name", ""), "role": user.get("role", "user"),
            "is_premium": user.get("is_premium", False), "picture": user.get("picture", "")}


@api.post("/auth/google")
async def google_auth(req: GoogleSessionReq, response: Response):
    async with httpx.AsyncClient() as http:
        resp = await http.get("https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data", headers={"X-Session-ID": req.session_id})
    if resp.status_code != 200:
        raise HTTPException(401, "Invalid Google session")
    data = resp.json()
    email = data.get("email", "").lower()
    name = data.get("name", "User")
    picture = data.get("picture", "")
    if not email:
        raise HTTPException(401, "No email from Google")

    existing = await db.users.find_one({"email": email})
    if existing:
        uid = str(existing["_id"])
        await db.users.update_one({"email": email}, {"$set": {"name": name, "picture": picture, "provider": "google"}})
    else:
        result = await db.users.insert_one({"email": email, "name": name, "picture": picture, "role": "user",
                                             "is_premium": False, "provider": "google", "created_at": datetime.now(timezone.utc).isoformat()})
        uid = str(result.inserted_id)

    token = create_token(uid, email)
    set_cookie(response, token)
    user = await db.users.find_one({"_id": ObjectId(uid)})
    return {"user_id": uid, "email": email, "name": name, "picture": picture, "role": user.get("role", "user"), "is_premium": user.get("is_premium", False)}


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/", secure=True, samesite="none")
    return {"message": "Logged out"}


@api.get("/auth/me")
async def auth_me(request: Request):
    user = await get_user(request)
    return {"user_id": user["_id"], "email": user["email"], "name": user.get("name", ""),
            "role": user.get("role", "user"), "is_premium": user.get("is_premium", False), "picture": user.get("picture", "")}


# ─── Translate (Sarvam Maurya) ───
@api.post("/translate")
async def translate(req: TranslateReq, request: Request):
    src = req.source_language if "-" in req.source_language else f"{req.source_language}-IN"
    tgt = req.target_language if "-" in req.target_language else f"{req.target_language}-IN"
    translated = ""
    try:
        async with httpx.AsyncClient(timeout=15.0) as http:
            r = await http.post(f"{SARVAM_BASE}/translate",
                headers={"api-subscription-key": SARVAM_API_KEY, "Content-Type": "application/json"},
                json={"input": req.text, "source_language_code": src, "target_language_code": tgt, "model": "mayura:v1"})
        if r.status_code == 200:
            translated = r.json().get("translated_text", req.text)
        else:
            logger.error(f"Translate error {r.status_code}: {r.text}")
            translated = f"[Translation unavailable] {req.text}"
    except Exception as e:
        logger.error(f"Translate exception: {e}")
        translated = f"[Translation error] {req.text}"

    user = await get_optional_user(request)
    await db.translations.insert_one({
        "id": str(uuid.uuid4()), "source_text": req.text, "translated_text": translated,
        "source_language": src, "target_language": tgt,
        "user_id": user["_id"] if user else None, "timestamp": datetime.now(timezone.utc).isoformat()})
    return {"translated_text": translated, "source_language": src, "target_language": tgt}


# ─── Chat (Sarvam 30B) ───
@api.post("/chat")
async def chat(req: ChatReq, request: Request):
    user = await get_optional_user(request)
    user_id = user["_id"] if user else None
    thread_id = req.thread_id or str(uuid.uuid4())

    # Build conversation history for multi-turn
    history_messages = []
    if user_id and req.thread_id:
        past = await db.chat_messages.find(
            {"thread_id": req.thread_id, "user_id": user_id},
            {"_id": 0, "role": 1, "content": 1}
        ).sort("timestamp", 1).to_list(20)
        history_messages = [{"role": m["role"], "content": m["content"]} for m in past]

    # System prompt for multilingual assistant
    system_msg = (
        f"You are Sarvbhasa, India's multilingual AI assistant powered by Sarvam AI. "
        f"You speak all Indian languages fluently. "
        f"The user's source language is {req.source_language} and target language is {req.target_language}. "
        f"Respond naturally in the target language ({req.target_language}). "
        f"If the user asks for translation, translate their text. "
        f"If they ask a question, answer it in the target language. "
        f"Be helpful, concise, and culturally aware."
    )

    messages = [{"role": "system", "content": system_msg}]
    messages.extend(history_messages)
    messages.append({"role": "user", "content": req.message})

    content = ""
    try:
        response = sarvam_client.chat.completions(
            model="sarvam-30b",
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )
        content = response.choices[0].message.content
    except Exception as e:
        logger.error(f"Sarvam 30B chat error: {e}")
        # Fallback to translation if chat fails
        try:
            src = req.source_language if "-" in req.source_language else f"{req.source_language}-IN"
            tgt = req.target_language if "-" in req.target_language else f"{req.target_language}-IN"
            async with httpx.AsyncClient(timeout=15.0) as http:
                r = await http.post(f"{SARVAM_BASE}/translate",
                    headers={"api-subscription-key": SARVAM_API_KEY, "Content-Type": "application/json"},
                    json={"input": req.message, "source_language_code": src, "target_language_code": tgt, "model": "mayura:v1"})
            if r.status_code == 200:
                content = r.json().get("translated_text", req.message)
            else:
                content = "Translation service error. Please try again."
        except Exception as e2:
            logger.error(f"Fallback translate error: {e2}")
            content = "Service temporarily unavailable. Please try again."

    # Save to thread
    if user_id:
        existing = await db.chat_threads.find_one({"thread_id": thread_id, "user_id": user_id}, {"_id": 0})
        if not existing:
            preview = req.message[:50] + ("..." if len(req.message) > 50 else "")
            await db.chat_threads.insert_one({
                "thread_id": thread_id, "user_id": user_id, "title": preview,
                "source_language": req.source_language, "target_language": req.target_language,
                "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()})
        else:
            await db.chat_threads.update_one({"thread_id": thread_id}, {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}})

    await db.chat_messages.insert_one({"thread_id": thread_id, "user_id": user_id, "role": "user", "content": req.message, "timestamp": datetime.now(timezone.utc).isoformat()})
    await db.chat_messages.insert_one({"thread_id": thread_id, "user_id": user_id, "role": "assistant", "content": content, "timestamp": datetime.now(timezone.utc).isoformat()})

    return {"content": content, "thread_id": thread_id}


# ─── Chat History ───
@api.get("/chat/threads")
async def get_threads(request: Request):
    user = await get_user(request)
    return await db.chat_threads.find({"user_id": user["_id"]}, {"_id": 0}).sort("updated_at", -1).to_list(50)


@api.get("/chat/threads/{thread_id}/messages")
async def get_thread_messages(thread_id: str, request: Request):
    user = await get_user(request)
    return await db.chat_messages.find({"thread_id": thread_id, "user_id": user["_id"]}, {"_id": 0}).sort("timestamp", 1).to_list(200)


@api.delete("/chat/threads/{thread_id}")
async def delete_thread(thread_id: str, request: Request):
    user = await get_user(request)
    await db.chat_threads.delete_one({"thread_id": thread_id, "user_id": user["_id"]})
    await db.chat_messages.delete_many({"thread_id": thread_id, "user_id": user["_id"]})
    return {"message": "Deleted"}


# ─── Translation History ───
@api.get("/translations/history")
async def translation_history(request: Request):
    user = await get_user(request)
    return await db.translations.find({"user_id": user["_id"]}, {"_id": 0}).sort("timestamp", -1).to_list(100)


# ─── Stripe ───
@api.post("/payments/checkout")
async def create_checkout(request: Request):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    user = await get_user(request)
    body = await request.json()
    origin = body.get("origin_url", "")
    stripe_key = os.environ.get("STRIPE_API_KEY", "")
    host_url = str(request.base_url)
    sc = StripeCheckout(api_key=stripe_key, webhook_url=f"{host_url}api/webhook/stripe")
    session = await sc.create_checkout_session(CheckoutSessionRequest(
        amount=499.00, currency="inr",
        success_url=f"{origin}?session_id={{CHECKOUT_SESSION_ID}}", cancel_url=origin,
        metadata={"user_id": user["_id"], "email": user["email"], "plan": "premium"}))
    await db.payments.insert_one({"session_id": session.session_id, "user_id": user["_id"],
        "amount": 499, "status": "pending", "created_at": datetime.now(timezone.utc).isoformat()})
    return {"url": session.url, "session_id": session.session_id}


@api.get("/payments/status/{session_id}")
async def payment_status(session_id: str, request: Request):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    user = await get_user(request)
    stripe_key = os.environ.get("STRIPE_API_KEY", "")
    host_url = str(request.base_url)
    sc = StripeCheckout(api_key=stripe_key, webhook_url=f"{host_url}api/webhook/stripe")
    status = await sc.get_checkout_status(session_id)
    if status.payment_status == "paid":
        await db.payments.update_one({"session_id": session_id}, {"$set": {"status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}})
        await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$set": {"is_premium": True}})
    return {"status": status.status, "payment_status": status.payment_status, "amount_total": status.amount_total, "currency": status.currency}


# ─── Root ───
@api.get("/")
async def root():
    return {"message": "Sarvbhasa API is running"}


# ─── Startup ───
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.chat_messages.create_index([("thread_id", 1), ("timestamp", 1)])
    await db.chat_threads.create_index([("user_id", 1), ("updated_at", -1)])
    await db.translations.create_index("user_id")
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@sarvbhasa.com")
    admin_pw = os.environ.get("ADMIN_PASSWORD", "Sarvbhasa@123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({"email": admin_email, "name": "Admin", "password": hash_password(admin_pw),
            "role": "admin", "is_premium": True, "provider": "email", "created_at": datetime.now(timezone.utc).isoformat()})


@app.on_event("shutdown")
async def shutdown():
    client.close()


app.include_router(api)
app.add_middleware(CORSMiddleware,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
