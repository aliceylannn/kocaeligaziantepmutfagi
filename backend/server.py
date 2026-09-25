from fastapi import FastAPI, APIRouter, HTTPException
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
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class MenuItem(BaseModel):
    id: str
    name: str
    category: str
    description: str
    price: int
    unit: str
    image: str
    badge: str | None = None

class DeliveryCheck(BaseModel):
    neighborhood: str

class DeliveryResult(BaseModel):
    neighborhood: str
    available: bool
    message: str

MENU_ITEMS = [
    {"id": "haydari", "name": "Sarımsaklı Haydari", "category": "Meze", "description": "Süzme yoğurt, taze nane ve zeytinyağıyla.", "price": 135, "unit": "500 g", "image": "https://images.pexels.com/photos/36425899/pexels-photo-36425899.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "badge": "Çok sevilen"},
    {"id": "mercimek-kofte", "name": "Mercimek Köftesi", "category": "Meze", "description": "Bol yeşillik, nar ekşisi ve ev yapımı lezzet.", "price": 160, "unit": "20 adet", "image": "https://images.pexels.com/photos/36425899/pexels-photo-36425899.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
    {"id": "kol-borek", "name": "El Açması Kol Böreği", "category": "Hamur İşi", "description": "İncecik açılmış yufka, peynir ve maydanoz.", "price": 220, "unit": "6 dilim", "image": "https://images.pexels.com/photos/38356208/pexels-photo-38356208.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "badge": "Bugünün favorisi"},
    {"id": "su-borek", "name": "Peynirli Su Böreği", "category": "Hamur İşi", "description": "Kat kat, yumuşacık ve fırından yeni çıkmış.", "price": 240, "unit": "6 dilim", "image": "https://images.pexels.com/photos/38356208/pexels-photo-38356208.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
    {"id": "baklava", "name": "Ev Baklavası", "category": "Tatlı", "description": "Antep fıstığı, tereyağı ve çıtır ince yufkalar.", "price": 280, "unit": "500 g", "image": "https://images.unsplash.com/photo-1749549028894-fb0adae64a67?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzJ8MHwxfHNlYXJjaHwyfHx0dXJraXNoJTIwaG9tZW1hZGUlMjBmb29kJTIwYm9yZWslMjBkb2xsYXxlbnwwfHx8fDE3OTAzMjgyNjJ8MA&ixlib=rb-4.1.0&q=85"},
    {"id": "irmik-helvasi", "name": "Çam Fıstıklı İrmik Helvası", "category": "Tatlı", "description": "Tereyağlı, mis kokulu ve tam kıvamında.", "price": 180, "unit": "500 g", "image": "https://images.unsplash.com/photo-1749549028894-fb0adae64a67?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzJ8MHwxfHNlYXJjaHwyfHx0dXJraXNoJTIwaG9tZW1hZGUlMjBmb29kJTIwYm9yZWslMjBkb2xsYXxlbnwwfHx8fDE3OTAzMjgyNjJ8MA&ixlib=rb-4.1.0&q=85"},
]

DELIVERY_ZONES = {"Kadıköy", "Moda", "Fenerbahçe", "Göztepe", "Suadiye", "Koşuyolu"}

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Ev Lezzetleri API hazır"}

@api_router.get("/menu", response_model=List[MenuItem])
async def get_menu():
    return MENU_ITEMS

@api_router.post("/delivery-check", response_model=DeliveryResult)
async def check_delivery(input: DeliveryCheck):
    neighborhood = input.neighborhood.strip()
    if not neighborhood:
        raise HTTPException(status_code=400, detail="Mahalle adı gerekli")
    available = any(zone.casefold() == neighborhood.casefold() for zone in DELIVERY_ZONES)
    message = "Bu bölgeye teslimat yapıyoruz. Siparişinizi WhatsApp'tan bekliyoruz." if available else "Bu bölge henüz teslimat rotamızda değil; gelip alma seçeneğimiz her gün açık."
    return {"neighborhood": neighborhood, "available": available, "message": message}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()