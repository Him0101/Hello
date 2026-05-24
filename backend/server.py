

# from dotenv import load_dotenv
# from pathlib import Path
# import os
# import logging
# import httpx
# import bcrypt
# import jwt
# import uuid
# from datetime import datetime, timezone, timedelta

# from fastapi import FastAPI, APIRouter, Response, HTTPException, UploadFile, File, Form, Request
# from starlette.middleware.cors import CORSMiddleware
# from motor.motor_asyncio import AsyncIOMotorClient
# from pydantic import BaseModel

# ROOT_DIR = Path(__file__).parent
# load_dotenv(ROOT_DIR / ".env")

# MONGO_URL = os.environ.get("MONGO_URL")
# DB_NAME = os.environ.get("DB_NAME", "sarvbhasa")
# JWT_SECRET = os.environ.get("JWT_SECRET", "secret")

# SARVAM_API_KEY = os.environ.get("SARVAM_API_KEY", "")
# SARVAM_BASE = "https://api.sarvam.ai"

# client = AsyncIOMotorClient(MONGO_URL)
# db = client[DB_NAME]

# app = FastAPI()
# api = APIRouter(prefix="/api")

# logging.basicConfig(level=logging.INFO)


# def hash_password(pw: str):
#     return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


# def verify_password(pw, hashed):
#     return bcrypt.checkpw(pw.encode(), hashed.encode())


# def create_token(user_id, email):
#     return jwt.encode(
#         {
#             "sub": user_id,
#             "email": email,
#             "exp": datetime.now(timezone.utc) + timedelta(hours=2),
#         },
#         JWT_SECRET,
#         algorithm="HS256",
#     )


# def get_uid_from_request(request: Request):
#     token = request.cookies.get("access_token")
#     if not token:
#         return "guest"

#     try:
#         payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
#         return payload.get("sub", "guest")
#     except Exception:
#         return "guest"


# class Register(BaseModel):
#     name: str
#     email: str
#     password: str


# class Login(BaseModel):
#     email: str
#     password: str


# class TranslateReq(BaseModel):
#     text: str
#     source_language: str = "en-IN"
#     target_language: str = "hi-IN"


# class ChatReq(BaseModel):
#     message: str
#     language: str = "en-IN"
#     target_language: str = "hi-IN"
#     thread_id: str | None = None


# @api.post("/auth/register")
# async def register(data: Register, response: Response):
#     if await db.users.find_one({"email": data.email}):
#         raise HTTPException(400, "User exists")

#     user = {
#         "name": data.name,
#         "email": data.email,
#         "password": hash_password(data.password),
#         "created_at": datetime.utcnow(),
#     }

#     res = await db.users.insert_one(user)
#     token = create_token(str(res.inserted_id), data.email)
#     response.set_cookie("access_token", token)

#     return {"message": "registered"}


# @api.post("/auth/login")
# async def login(data: Login, response: Response):
#     user = await db.users.find_one({"email": data.email})

#     if not user or not verify_password(data.password, user["password"]):
#         raise HTTPException(401, "Invalid credentials")

#     token = create_token(str(user["_id"]), user["email"])
#     response.set_cookie("access_token", token)

#     return {"message": "logged in"}


# @api.post("/translate")
# async def translate(req: TranslateReq):
#     print("🌐 TRANSLATE API CALLED")

#     try:
#         async with httpx.AsyncClient(timeout=60) as client:
#             r = await client.post(
#                 f"{SARVAM_BASE}/translate",
#                 headers={"api-subscription-key": SARVAM_API_KEY},
#                 json={
#                     "input": req.text,
#                     "source_language_code": req.source_language,
#                     "target_language_code": req.target_language,
#                     "model": "mayura:v1",
#                 },
#             )

#         print("🧠 TRANSLATE RESPONSE:", r.text)

#         translated_text = ""
#         if r.status_code == 200:
#             translated_text = r.json().get("translated_text", "")
#         else:
#             return {"translated": "", "error": r.text}

#         await db.translations.insert_one({
#             "source_text": req.text,
#             "translated_text": translated_text,
#             "source_language": req.source_language,
#             "target_language": req.target_language,
#             "timestamp": datetime.utcnow()
#         })

#         return {"translated": translated_text}

#     except Exception as e:
#         print("❌ TRANSLATE ERROR:", e)
#         return {"translated": "", "error": str(e)}


# # @api.post("/speech-to-text")
# # async def speech_to_text(
# #     file: UploadFile = File(...),
# #     language: str = Form("hi-IN")
# # ):
# #     try:
# #         audio_bytes = await file.read()

# #         print("\n🎤 STT CALLED")
# #         print("📦 File size:", len(audio_bytes))
# #         print("🌐 Language:", language)

# #         if len(audio_bytes) < 20000:
# #             return {
# #                 "text": "",
# #                 "error": "Audio too short or mic not capturing properly. Speak for 5 seconds."
# #             }

# #         payload = {
# #             "model": "saarika:v2.5",
# #             "language_code": language
# #         }

# #         files = {
# #             "file": ("recording.webm", audio_bytes, "audio/webm")
# #         }

# #         async with httpx.AsyncClient(timeout=60) as client:
# #             r = await client.post(
# #                 f"{SARVAM_BASE}/speech-to-text",
# #                 headers={"api-subscription-key": SARVAM_API_KEY},
# #                 data=payload,
# #                 files=files,
# #             )

# #         print("🧠 Sarvam raw response:", r.text)

# #         if r.status_code == 200:
# #             data = r.json()
# #             transcript = data.get("transcript") or data.get("text") or ""

# #             if not transcript.strip():
# #                 return {
# #                     "text": "",
# #                     "error": "Sarvam received audio but returned empty transcript. Check mic volume or try English."
# #                 }

# #             return {"text": transcript}

# #         return {"text": "", "error": f"Sarvam API failed: {r.text}"}

# #     except Exception as e:
# #         print("❌ STT ERROR:", e)
# #         return {"text": "", "error": str(e)}


# @api.post("/speech-to-text")
# async def speech_to_text(
#     file: UploadFile = File(...),
#     language: str = Form("hi-IN")
# ):
#     try:
#         audio_bytes = await file.read()

#         print("\n🎤 STT CALLED")
#         print("📄 Filename:", file.filename)
#         print("🎧 Original Content-Type:", file.content_type)
#         print("📦 File size:", len(audio_bytes))
#         print("🌐 Language:", language)

#         if not SARVAM_API_KEY:
#             return {
#                 "text": "",
#                 "error": "SARVAM_API_KEY missing in backend .env file."
#             }

#         if not audio_bytes:
#             return {
#                 "text": "",
#                 "error": "No audio received from frontend."
#             }

#         # Do not block 4000-5000 byte files.
#         # Earlier 15000 check stopped the Sarvam API call.
#         if len(audio_bytes) < 1000:
#             return {
#                 "text": "",
#                 "error": f"Audio too small: {len(audio_bytes)} bytes. Mic did not capture audio properly."
#             }

#         original_content_type = file.content_type or "audio/webm"

#         # Browser sends: audio/webm;codecs=opus
#         # Sarvam accepts: audio/webm
#         if "webm" in original_content_type:
#             clean_content_type = "audio/webm"
#             clean_filename = "recording.webm"
#         elif "ogg" in original_content_type:
#             clean_content_type = "audio/ogg"
#             clean_filename = "recording.ogg"
#         elif "opus" in original_content_type:
#             clean_content_type = "audio/opus"
#             clean_filename = "recording.opus"
#         elif "wav" in original_content_type:
#             clean_content_type = "audio/wav"
#             clean_filename = "recording.wav"
#         elif "mpeg" in original_content_type or "mp3" in original_content_type:
#             clean_content_type = "audio/mpeg"
#             clean_filename = "recording.mp3"
#         elif "mp4" in original_content_type or "m4a" in original_content_type:
#             clean_content_type = "audio/mp4"
#             clean_filename = "recording.m4a"
#         elif "aac" in original_content_type:
#             clean_content_type = "audio/aac"
#             clean_filename = "recording.aac"
#         elif "flac" in original_content_type:
#             clean_content_type = "audio/flac"
#             clean_filename = "recording.flac"
#         else:
#             clean_content_type = "application/octet-stream"
#             clean_filename = file.filename or "recording.webm"

#         print("✅ Clean Content-Type sent to Sarvam:", clean_content_type)
#         print("✅ Clean filename sent to Sarvam:", clean_filename)

#         files = {
#             "file": (
#                 clean_filename,
#                 audio_bytes,
#                 clean_content_type
#             )
#         }

#         data = {
#             "model": "saarika:v2.5",
#             "language_code": language
#         }

#         async with httpx.AsyncClient(timeout=90) as client:
#             r = await client.post(
#                 f"{SARVAM_BASE}/speech-to-text",
#                 headers={
#                     "api-subscription-key": SARVAM_API_KEY
#                 },
#                 data=data,
#                 files=files,
#             )

#         print("🧠 Sarvam STT status:", r.status_code)
#         print("🧠 Sarvam STT raw response:", r.text)

#         if r.status_code != 200:
#             return {
#                 "text": "",
#                 "error": f"Sarvam API failed: {r.text}"
#             }

#         result = r.json()

#         transcript = (
#             result.get("transcript")
#             or result.get("text")
#             or result.get("transcribed_text")
#             or ""
#         )

#         if not transcript.strip():
#             return {
#                 "text": "",
#                 "error": "Sarvam received audio but returned empty transcript. Speak louder and record for 6 to 8 seconds."
#             }

#         return {
#             "text": transcript.strip(),
#             "language_code": result.get("language_code", language),
#             "request_id": result.get("request_id", "")
#         }

#     except Exception as e:
#         print("❌ STT ERROR:", str(e))
#         return {
#             "text": "",
#             "error": str(e)
#         }

# @api.get("/translation/history")
# async def get_translation_history():
#     data = []
#     cursor = db.translations.find().sort("timestamp", -1)

#     async for item in cursor:
#         data.append({
#             "_id": str(item["_id"]),
#             "source_text": item.get("source_text", ""),
#             "translated_text": item.get("translated_text", ""),
#             "timestamp": item.get("timestamp")
#         })

#     return data


# async def call_sarvam_chat(message: str, source_lang: str, target_lang: str):
#     system_prompt = f"""
# You are Sarvbhasa AI.

# Give only the final user-facing answer.
# Do not show reasoning.
# Do not show analysis.
# Do not show planning.
# Do not write steps.

# If the user asks for translation, translate from {source_lang} to {target_lang}.
# Otherwise answer the question normally.
# """

#     async with httpx.AsyncClient(timeout=90) as client:
#         r = await client.post(
#             f"{SARVAM_BASE}/v1/chat/completions",
#             headers={
#                 "api-subscription-key": SARVAM_API_KEY,
#                 "Content-Type": "application/json",
#             },
#             json={
#                 "model": "sarvam-105b",
#                 "messages": [
#                     {"role": "system", "content": system_prompt},
#                     {"role": "user", "content": message}
#                 ],
#                 "temperature": 0.2,
#                 "max_tokens": 1200
#             },
#         )

#     print("🤖 SARVAM CHAT STATUS:", r.status_code)
#     print("🤖 SARVAM CHAT RESPONSE:", r.text)

#     if r.status_code != 200:
#         return f"Chat error: {r.text}"

#     data = r.json()
#     msg = data.get("choices", [{}])[0].get("message", {})

#     answer = msg.get("content")

#     if answer and answer.strip():
#         return answer.strip()

#     return "Sorry, I could not generate a final answer. Please try again."


# @api.post("/chat")
# async def chat(req: ChatReq, request: Request):
#     uid = get_uid_from_request(request)
#     now = datetime.utcnow()

#     thread_id = req.thread_id or str(uuid.uuid4())

#     old_thread = await db.chat_threads.find_one({
#         "thread_id": thread_id,
#         "uid": uid
#     })

#     if not old_thread:
#         await db.chat_threads.insert_one({
#             "thread_id": thread_id,
#             "uid": uid,
#             "title": req.message[:35],
#             "source_language": req.language,
#             "target_language": req.target_language,
#             "created_at": now,
#             "updated_at": now,
#         })
#     else:
#         await db.chat_threads.update_one(
#             {"thread_id": thread_id, "uid": uid},
#             {
#                 "$set": {
#                     "updated_at": now,
#                     "source_language": req.language,
#                     "target_language": req.target_language,
#                 }
#             }
#         )

#     await db.chat_messages.insert_one({
#         "thread_id": thread_id,
#         "uid": uid,
#         "role": "user",
#         "content": req.message,
#         "created_at": now,
#     })

#     ai_response = await call_sarvam_chat(
#         req.message,
#         req.language,
#         req.target_language
#     )

#     await db.chat_messages.insert_one({
#         "thread_id": thread_id,
#         "uid": uid,
#         "role": "assistant",
#         "content": ai_response,
#         "created_at": datetime.utcnow(),
#     })

#     return {
#         "thread_id": thread_id,
#         "role": "assistant",
#         "content": ai_response
#     }


# @api.get("/chat/threads")
# async def get_chat_threads(request: Request):
#     uid = get_uid_from_request(request)

#     cursor = db.chat_threads.find({"uid": uid}).sort("updated_at", -1)
#     result = []

#     async for t in cursor:
#         result.append({
#             "thread_id": t.get("thread_id"),
#             "title": t.get("title", "New Chat"),
#             "source_language": t.get("source_language", "en-IN"),
#             "target_language": t.get("target_language", "hi-IN"),
#             "created_at": t.get("created_at"),
#             "updated_at": t.get("updated_at"),
#         })

#     return result


# @api.get("/chat/threads/{thread_id}/messages")
# async def get_thread_messages(thread_id: str, request: Request):
#     uid = get_uid_from_request(request)

#     cursor = db.chat_messages.find({
#         "thread_id": thread_id,
#         "uid": uid
#     }).sort("created_at", 1)

#     result = []

#     async for m in cursor:
#         result.append({
#             "role": m.get("role", "assistant"),
#             "content": m.get("content", ""),
#             "created_at": m.get("created_at"),
#         })

#     return result


# @api.delete("/chat/threads/{thread_id}")
# async def delete_chat_thread(thread_id: str, request: Request):
#     uid = get_uid_from_request(request)

#     await db.chat_threads.delete_one({
#         "thread_id": thread_id,
#         "uid": uid
#     })

#     await db.chat_messages.delete_many({
#         "thread_id": thread_id,
#         "uid": uid
#     })

#     return {"status": "deleted"}


# @api.post("/chat/save")
# async def save_chat(data: dict):
#     await db.chats.insert_one({
#         "uid": data.get("uid", "guest"),
#         "message": data.get("message", ""),
#         "response": data.get("response", ""),
#         "timestamp": datetime.utcnow(),
#     })
#     return {"status": "saved"}


# @api.get("/chat/history/{uid}")
# async def get_history(uid: str):
#     chats = db.chats.find({"uid": uid}).sort("timestamp", -1)
#     result = []

#     async for c in chats:
#         c["_id"] = str(c["_id"])
#         result.append(c)

#     return result


# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:3000",
#         "http://127.0.0.1:3000",
#         "*"
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.include_router(api)

# add on
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
import httpx
import bcrypt
import jwt
import uuid
from datetime import datetime, timezone, timedelta

from fastapi import FastAPI, APIRouter, Response, HTTPException, UploadFile, File, Form, Request
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "sarvbhasa")
JWT_SECRET = os.environ.get("JWT_SECRET", "secret")

SARVAM_API_KEY = os.environ.get("SARVAM_API_KEY", "")
SARVAM_BASE = "https://api.sarvam.ai"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI()
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)


LANGUAGE_NAMES = {
    "en-IN": "English",
    "hi-IN": "Hindi",
    "mr-IN": "Marathi",
    "gu-IN": "Gujarati",
    "bn-IN": "Bengali",
    "kn-IN": "Kannada",
    "ml-IN": "Malayalam",
    "ta-IN": "Tamil",
    "te-IN": "Telugu",
    "pa-IN": "Punjabi",
}


def hash_password(pw: str):
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw, hashed):
    return bcrypt.checkpw(pw.encode(), hashed.encode())


def create_token(user_id, email):
    return jwt.encode(
        {
            "sub": user_id,
            "email": email,
            "exp": datetime.now(timezone.utc) + timedelta(hours=2),
        },
        JWT_SECRET,
        algorithm="HS256",
    )


def get_uid_from_request(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        return "guest"

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload.get("sub", "guest")
    except Exception:
        return "guest"


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
    language: str = "en-IN"
    target_language: str = "hi-IN"
    thread_id: str | None = None


@api.post("/auth/register")
async def register(data: Register, response: Response):
    if await db.users.find_one({"email": data.email}):
        raise HTTPException(400, "User exists")

    user = {
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "created_at": datetime.utcnow(),
    }

    res = await db.users.insert_one(user)
    token = create_token(str(res.inserted_id), data.email)
    response.set_cookie("access_token", token)

    return {"message": "registered"}


@api.post("/auth/login")
async def login(data: Login, response: Response):
    user = await db.users.find_one({"email": data.email})

    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(401, "Invalid credentials")

    token = create_token(str(user["_id"]), user["email"])
    response.set_cookie("access_token", token)

    return {"message": "logged in"}


async def translate_text(text: str, source_lang: str, target_lang: str):
    if not text.strip():
        return ""

    if source_lang == target_lang:
        return text

    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(
            f"{SARVAM_BASE}/translate",
            headers={"api-subscription-key": SARVAM_API_KEY},
            json={
                "input": text,
                "source_language_code": source_lang,
                "target_language_code": target_lang,
                "model": "mayura:v1",
            },
        )

    print("🌐 TRANSLATE STATUS:", r.status_code)
    print("🌐 TRANSLATE RESPONSE:", r.text)

    if r.status_code == 200:
        return r.json().get("translated_text", text)

    return text


@api.post("/translate")
async def translate(req: TranslateReq):
    try:
        translated_text = await translate_text(
            req.text,
            req.source_language,
            req.target_language
        )

        await db.translations.insert_one({
            "source_text": req.text,
            "translated_text": translated_text,
            "source_language": req.source_language,
            "target_language": req.target_language,
            "timestamp": datetime.utcnow()
        })

        return {"translated": translated_text}

    except Exception as e:
        print("❌ TRANSLATE ERROR:", e)
        return {"translated": "", "error": str(e)}


async def call_sarvam_chat(message: str, source_lang: str, target_lang: str):
    source_name = LANGUAGE_NAMES.get(source_lang, source_lang)
    target_name = LANGUAGE_NAMES.get(target_lang, target_lang)

    system_prompt = f"""
You are Sarvbhasa AI.

User input language: {source_name}
Selected output language: {target_name}

Rules:
1. Always answer only in {target_name}.
2. Never answer in English unless selected output language is English.
3. If the user asks a question, answer the question in {target_name}.
4. If the user asks for translation, translate into {target_name}.
5. Give only final user-facing answer.
6. Do not show reasoning, analysis, planning, or internal thoughts.
7. Keep the answer natural and helpful.
"""

    async with httpx.AsyncClient(timeout=90) as client:
        r = await client.post(
            f"{SARVAM_BASE}/v1/chat/completions",
            headers={
                "api-subscription-key": SARVAM_API_KEY,
                "Content-Type": "application/json",
            },
            json={
                "model": "sarvam-105b",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user",
                        "content": f"Answer only in {target_name}: {message}"
                    }
                ],
                "temperature": 0.2,
                "max_tokens": 1200
            },
        )

    print("🤖 SARVAM CHAT STATUS:", r.status_code)
    print("🤖 SARVAM CHAT RESPONSE:", r.text)

    if r.status_code != 200:
        return f"Chat error: {r.text}"

    data = r.json()
    msg = data.get("choices", [{}])[0].get("message", {})
    answer = msg.get("content") or ""

    if not answer.strip():
        return "Sorry, I could not generate a final answer. Please try again."

    if target_lang != "en-IN":
        final_answer = await translate_text(
            answer.strip(),
            "en-IN",
            target_lang
        )
        return final_answer.strip()

    return answer.strip()


@api.post("/chat")
async def chat(req: ChatReq, request: Request):
    uid = get_uid_from_request(request)
    now = datetime.utcnow()
    thread_id = req.thread_id or str(uuid.uuid4())

    old_thread = await db.chat_threads.find_one({
        "thread_id": thread_id,
        "uid": uid
    })

    if not old_thread:
        await db.chat_threads.insert_one({
            "thread_id": thread_id,
            "uid": uid,
            "title": req.message[:35],
            "source_language": req.language,
            "target_language": req.target_language,
            "created_at": now,
            "updated_at": now,
        })
    else:
        await db.chat_threads.update_one(
            {"thread_id": thread_id, "uid": uid},
            {
                "$set": {
                    "updated_at": now,
                    "source_language": req.language,
                    "target_language": req.target_language,
                }
            }
        )

    await db.chat_messages.insert_one({
        "thread_id": thread_id,
        "uid": uid,
        "role": "user",
        "content": req.message,
        "created_at": now,
    })

    ai_response = await call_sarvam_chat(
        req.message,
        req.language,
        req.target_language
    )

    await db.chat_messages.insert_one({
        "thread_id": thread_id,
        "uid": uid,
        "role": "assistant",
        "content": ai_response,
        "created_at": datetime.utcnow(),
    })

    return {
        "thread_id": thread_id,
        "role": "assistant",
        "content": ai_response
    }


@api.post("/speech-to-text")
async def speech_to_text(
    file: UploadFile = File(...),
    language: str = Form("hi-IN")
):
    try:
        audio_bytes = await file.read()

        print("\n🎤 STT CALLED")
        print("📄 Filename:", file.filename)
        print("🎧 Original Content-Type:", file.content_type)
        print("📦 File size:", len(audio_bytes))
        print("🌐 Language:", language)

        if not SARVAM_API_KEY:
            return {"text": "", "error": "SARVAM_API_KEY missing in backend .env file."}

        if not audio_bytes:
            return {"text": "", "error": "No audio received from frontend."}

        if len(audio_bytes) < 1000:
            return {
                "text": "",
                "error": f"Audio too small: {len(audio_bytes)} bytes. Mic did not capture audio properly."
            }

        original_content_type = file.content_type or "audio/webm"

        if "webm" in original_content_type:
            clean_content_type = "audio/webm"
            clean_filename = "recording.webm"
        elif "ogg" in original_content_type:
            clean_content_type = "audio/ogg"
            clean_filename = "recording.ogg"
        elif "opus" in original_content_type:
            clean_content_type = "audio/opus"
            clean_filename = "recording.opus"
        elif "wav" in original_content_type:
            clean_content_type = "audio/wav"
            clean_filename = "recording.wav"
        elif "mpeg" in original_content_type or "mp3" in original_content_type:
            clean_content_type = "audio/mpeg"
            clean_filename = "recording.mp3"
        elif "mp4" in original_content_type or "m4a" in original_content_type:
            clean_content_type = "audio/mp4"
            clean_filename = "recording.m4a"
        else:
            clean_content_type = "application/octet-stream"
            clean_filename = file.filename or "recording.webm"

        files = {
            "file": (
                clean_filename,
                audio_bytes,
                clean_content_type
            )
        }

        data = {
            "model": "saarika:v2.5",
            "language_code": language
        }

        async with httpx.AsyncClient(timeout=90) as client:
            r = await client.post(
                f"{SARVAM_BASE}/speech-to-text",
                headers={"api-subscription-key": SARVAM_API_KEY},
                data=data,
                files=files,
            )

        print("🧠 Sarvam STT status:", r.status_code)
        print("🧠 Sarvam STT raw response:", r.text)

        if r.status_code != 200:
            return {"text": "", "error": f"Sarvam API failed: {r.text}"}

        result = r.json()

        transcript = (
            result.get("transcript")
            or result.get("text")
            or result.get("transcribed_text")
            or ""
        )

        if not transcript.strip():
            return {
                "text": "",
                "error": "Sarvam received audio but returned empty transcript. Speak louder and record for 6 to 8 seconds."
            }

        return {
            "text": transcript.strip(),
            "language_code": result.get("language_code", language),
            "request_id": result.get("request_id", "")
        }

    except Exception as e:
        print("❌ STT ERROR:", str(e))
        return {"text": "", "error": str(e)}


@api.get("/translation/history")
async def get_translation_history():
    data = []
    cursor = db.translations.find().sort("timestamp", -1)

    async for item in cursor:
        data.append({
            "_id": str(item["_id"]),
            "source_text": item.get("source_text", ""),
            "translated_text": item.get("translated_text", ""),
            "timestamp": item.get("timestamp")
        })

    return data


@api.get("/chat/threads")
async def get_chat_threads(request: Request):
    uid = get_uid_from_request(request)

    cursor = db.chat_threads.find({"uid": uid}).sort("updated_at", -1)
    result = []

    async for t in cursor:
        result.append({
            "thread_id": t.get("thread_id"),
            "title": t.get("title", "New Chat"),
            "source_language": t.get("source_language", "en-IN"),
            "target_language": t.get("target_language", "hi-IN"),
            "created_at": t.get("created_at"),
            "updated_at": t.get("updated_at"),
        })

    return result


@api.get("/chat/threads/{thread_id}/messages")
async def get_thread_messages(thread_id: str, request: Request):
    uid = get_uid_from_request(request)

    cursor = db.chat_messages.find({
        "thread_id": thread_id,
        "uid": uid
    }).sort("created_at", 1)

    result = []

    async for m in cursor:
        result.append({
            "role": m.get("role", "assistant"),
            "content": m.get("content", ""),
            "created_at": m.get("created_at"),
        })

    return result


@api.delete("/chat/threads/{thread_id}")
async def delete_chat_thread(thread_id: str, request: Request):
    uid = get_uid_from_request(request)

    await db.chat_threads.delete_one({
        "thread_id": thread_id,
        "uid": uid
    })

    await db.chat_messages.delete_many({
        "thread_id": thread_id,
        "uid": uid
    })

    return {"status": "deleted"}


@api.post("/chat/save")
async def save_chat(data: dict):
    await db.chats.insert_one({
        "uid": data.get("uid", "guest"),
        "message": data.get("message", ""),
        "response": data.get("response", ""),
        "timestamp": datetime.utcnow(),
    })
    return {"status": "saved"}


@api.get("/chat/history/{uid}")
async def get_history(uid: str):
    chats = db.chats.find({"uid": uid}).sort("timestamp", -1)
    result = []

    async for c in chats:
        c["_id"] = str(c["_id"])
        result.append(c)

    return result


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api)