from fastapi import FastAPI, APIRouter, Request, Response, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
import httpx
from datetime import datetime, timezone, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

SARVAM_API_KEY = os.environ.get('SARVAM_API_KEY', '')
SARVAM_BASE = "https://api.sarvam.ai"

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ─── Models ───
class TranslateRequest(BaseModel):
    text: str
    source_language: str = "en-IN"
    target_language: str = "hi-IN"

class TranslateResponse(BaseModel):
    translated_text: str
    source_language: str
    target_language: str

class ChatMessage(BaseModel):
    message: str
    language: str = "en-IN"
    target_language: str = "hi-IN"

class ChatResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str = "assistant"
    content: str

class UserOut(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None


# ─── Auth helpers ───
async def get_current_user(request: Request) -> dict:
    token = None
    cookie_token = request.cookies.get("session_token")
    auth_header = request.headers.get("Authorization")
    if cookie_token:
        token = cookie_token
    elif auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")

    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")

    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ─── Auth routes ───
@api_router.post("/auth/session")
async def auth_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")

    async with httpx.AsyncClient() as http:
        resp = await http.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session_id")

    data = resp.json()
    email = data.get("email")
    name = data.get("name", "User")
    picture = data.get("picture", "")
    session_token = data.get("session_token", str(uuid.uuid4()))

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one({"email": email}, {"$set": {"name": name, "picture": picture}})
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id, "email": email, "name": name, "picture": picture,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    await db.user_sessions.insert_one({
        "user_id": user_id, "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    response.set_cookie(
        key="session_token", value=session_token, httponly=True,
        secure=True, samesite="none", path="/", max_age=7*24*3600,
    )
    return {"user_id": user_id, "email": email, "name": name, "picture": picture}


@api_router.get("/auth/me")
async def auth_me(request: Request):
    user = await get_current_user(request)
    return UserOut(**user)


@api_router.post("/auth/logout")
async def auth_logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_many({"session_token": token})
    response.delete_cookie("session_token", path="/", secure=True, samesite="none")
    return {"message": "Logged out"}


# ─── Translate route (real Sarvam API) ───
@api_router.post("/translate", response_model=TranslateResponse)
async def translate(req: TranslateRequest):
    src = req.source_language if "-" in req.source_language else f"{req.source_language}-IN"
    tgt = req.target_language if "-" in req.target_language else f"{req.target_language}-IN"

    try:
        async with httpx.AsyncClient(timeout=15.0) as http:
            resp = await http.post(
                f"{SARVAM_BASE}/translate",
                headers={"api-subscription-key": SARVAM_API_KEY, "Content-Type": "application/json"},
                json={"input": req.text, "source_language_code": src, "target_language_code": tgt, "model": "mayura:v1"},
            )
        if resp.status_code == 200:
            data = resp.json()
            translated = data.get("translated_text", req.text)
        else:
            logger.error(f"Sarvam API error {resp.status_code}: {resp.text}")
            translated = f"[Translation unavailable] {req.text}"
    except Exception as e:
        logger.error(f"Sarvam API exception: {e}")
        translated = f"[Translation error] {req.text}"

    await db.translations.insert_one({
        "id": str(uuid.uuid4()), "source_text": req.text, "translated_text": translated,
        "source_language": src, "target_language": tgt,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    return TranslateResponse(translated_text=translated, source_language=src, target_language=tgt)


# ─── Chat route ───
@api_router.post("/chat", response_model=ChatResponse)
async def chat(msg: ChatMessage):
    # Try to translate the user's message and provide a helpful response
    response_text = ""
    try:
        src = msg.language if "-" in msg.language else f"{msg.language}-IN"
        tgt = msg.target_language if "-" in msg.target_language else f"{msg.target_language}-IN"
        if src != tgt:
            async with httpx.AsyncClient(timeout=15.0) as http:
                resp = await http.post(
                    f"{SARVAM_BASE}/translate",
                    headers={"api-subscription-key": SARVAM_API_KEY, "Content-Type": "application/json"},
                    json={"input": msg.message, "source_language_code": src, "target_language_code": tgt, "model": "mayura:v1"},
                )
            if resp.status_code == 200:
                data = resp.json()
                response_text = data.get("translated_text", msg.message)
            else:
                response_text = f"Translation service returned error. Please try again."
        else:
            response_text = f"Source and target languages are the same. Please select different languages to translate."
    except Exception as e:
        logger.error(f"Chat translate error: {e}")
        response_text = "Sorry, translation service is temporarily unavailable. Please try again later."

    await db.chat_history.insert_one({
        "id": str(uuid.uuid4()), "user_message": msg.message,
        "language": msg.language, "target_language": msg.target_language,
        "bot_response": response_text, "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    return ChatResponse(content=response_text)


# ─── Health ───
@api_router.get("/")
async def root():
    return {"message": "Sarvbhasa API is running"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
