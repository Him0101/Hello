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

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str = "assistant"
    content: str


MOCK_RESPONSES = [
    "Namaste! I can help you with translations across multiple Indian languages including Hindi, Marathi, Gujarati, English, and Malayalam.",
    "Sarvbhasa uses the Sarvam Maurya API to provide high-quality translations. How can I assist you today?",
    "I'd be happy to help! You can ask me to translate text between any of the supported languages.",
    "That's a great question! Sarvbhasa supports 5 languages currently and we're expanding to more regional languages soon.",
    "The Sarvam Maurya API powers all our translations with state-of-the-art AI models built specifically for Indian languages.",
]


@api_router.get("/")
async def root():
    return {"message": "Sarvbhasa API is running"}

@api_router.post("/chat", response_model=ChatResponse)
async def chat(msg: ChatMessage):
    response_text = random.choice(MOCK_RESPONSES)
    chat_entry = {
        "id": str(uuid.uuid4()),
        "user_message": msg.message,
        "bot_response": response_text,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.chat_history.insert_one(chat_entry)
    return ChatResponse(content=response_text)

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
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
