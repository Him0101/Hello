from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
import random


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ChatMessage(BaseModel):
    message: str
    language: str = "en"

class ChatResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str = "assistant"
    content: str

class TranslateRequest(BaseModel):
    text: str
    source_language: str = "en"
    target_language: str = "hi"

class TranslateResponse(BaseModel):
    translated_text: str
    source_language: str
    target_language: str


# Mock data
MOCK_CHAT = [
    "Namaste! I can help you with translations across multiple Indian languages including Hindi, Marathi, Gujarati, English, and Malayalam.",
    "Sarvbhasa uses the Sarvam Maurya API to provide high-quality translations. How can I assist you today?",
    "I'd be happy to help! You can ask me to translate text between any of the supported languages.",
    "That's a great question! Sarvbhasa supports 7 languages currently and we're expanding to more regional languages soon.",
    "The Sarvam Maurya API powers all our translations with state-of-the-art AI models built specifically for Indian languages.",
]

MOCK_TRANSLATIONS = {
    "hi": {"hello": "नमस्ते", "how are you": "आप कैसे हैं", "thank you": "धन्यवाद", "good morning": "सुप्रभात", "welcome": "स्वागत है"},
    "mr": {"hello": "नमस्कार", "how are you": "तुम्ही कसे आहात", "thank you": "धन्यवाद", "good morning": "सुप्रभात", "welcome": "स्वागत आहे"},
    "gu": {"hello": "નમસ્તે", "how are you": "તમે કેમ છો", "thank you": "આભાર", "good morning": "સુપ્રભાત", "welcome": "સ્વાગત છે"},
    "bn": {"hello": "নমস্কার", "how are you": "আপনি কেমন আছেন", "thank you": "ধন্যবাদ", "good morning": "সুপ্রভাত", "welcome": "স্বাগতম"},
    "kn": {"hello": "ನಮಸ್ಕಾರ", "how are you": "ನೀವು ಹೇಗಿದ್ದೀರಿ", "thank you": "ಧನ್ಯವಾದ", "good morning": "ಶುಭೋದಯ", "welcome": "ಸ್ವಾಗತ"},
    "ml": {"hello": "നമസ്കാരം", "how are you": "സുഖമാണോ", "thank you": "നന്ദി", "good morning": "സുപ്രഭാതം", "welcome": "സ്വാഗതം"},
    "en": {"नमस्ते": "Hello", "धन्यवाद": "Thank you", "सुप्रभात": "Good morning"},
}


def mock_translate(text, source_lang, target_lang):
    """MOCKED translation - returns mock data for demo. Replace with Sarvam API later."""
    lower = text.lower().strip()
    lang_dict = MOCK_TRANSLATIONS.get(target_lang, {})
    if lower in lang_dict:
        return lang_dict[lower]
    # Generic mock: wrap text with language indicator
    lang_names = {"hi": "Hindi", "mr": "Marathi", "gu": "Gujarati", "bn": "Bengali", "kn": "Kannada", "ml": "Malayalam", "en": "English"}
    target_name = lang_names.get(target_lang, target_lang)
    return f"[{target_name} Translation] {text}"


# Routes
@api_router.get("/")
async def root():
    return {"message": "Sarvbhasa API is running"}

@api_router.post("/chat", response_model=ChatResponse)
async def chat(msg: ChatMessage):
    response_text = random.choice(MOCK_CHAT)
    await db.chat_history.insert_one({
        "id": str(uuid.uuid4()),
        "user_message": msg.message,
        "language": msg.language,
        "bot_response": response_text,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    return ChatResponse(content=response_text)

@api_router.post("/translate", response_model=TranslateResponse)
async def translate(req: TranslateRequest):
    translated = mock_translate(req.text, req.source_language, req.target_language)
    await db.translations.insert_one({
        "id": str(uuid.uuid4()),
        "source_text": req.text,
        "translated_text": translated,
        "source_language": req.source_language,
        "target_language": req.target_language,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    return TranslateResponse(
        translated_text=translated,
        source_language=req.source_language,
        target_language=req.target_language,
    )

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
