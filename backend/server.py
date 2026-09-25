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

FOOD_IMAGES = {
    "hamur": "https://images.pexels.com/photos/38356208/pexels-photo-38356208.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "zeytinyagli": "https://images.pexels.com/photos/36425899/pexels-photo-36425899.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "tatli": "https://images.unsplash.com/photo-1749549028894-fb0adae64a67?auto=format&fit=crop&w=900&q=85",
}

def item(id, name, category, price, unit, description, image):
    return {"id": id, "name": name, "category": category, "price": price, "unit": unit, "description": description, "image": FOOD_IMAGES[image]}

MENU_ITEMS = [
    item("milfoy-tepsi", "Milföylü Tepsi Böreği", "Hamur İşi", 800, "tepsi", "Kat kat, çıtır ve fırından taze.", "hamur"),
    item("katmer-pogaca", "Katmer Poğaça", "Hamur İşi", 600, "kg", "Tel tel açılan yumuşacık poğaça.", "hamur"),
    item("peynirli-pogaca", "1 Tepsi Peynirli Poğaça", "Hamur İşi", 500, "tepsi", "Ev yapımı peynirli poğaça.", "hamur"),
    item("sade-pogaca", "1 Tepsi Sade Poğaça", "Hamur İşi", 400, "tepsi", "Çayın yanına taptaze.", "hamur"),
    item("sakalli-pogaca", "1 Tepsi Sakallı Poğaça", "Hamur İşi", 500, "tepsi", "Peynirli, yumuşak ve doyurucu.", "hamur"),
    item("midye-borek", "Midye Börek", "Hamur İşi", 550, "kg", "Özel kıvrımıyla çıtır börek.", "hamur"),
    item("gul-boregi", "Gül Böreği", "Hamur İşi", 550, "kg", "Peynirli veya patatesli hazırlanır.", "hamur"),
    item("kalem-boregi", "Kalem Böreği", "Hamur İşi", 450, "kg", "Çıtır çıtır atıştırmalık.", "hamur"),
    item("yaprak-sarma-cig", "Yaprak Sarma", "Zeytinyağlılar", 700, "çiğ kg", "Zeytinyağlı, incecik sarılmış.", "zeytinyagli"),
    item("yaprak-sarma-pismis", "Yaprak Sarma", "Zeytinyağlılar", 750, "pişmiş kg", "Servise hazır, limonuyla nefis.", "zeytinyagli"),
    item("kuru-dolma-cig", "Kuru Gaziantep Dolma", "Zeytinyağlılar", 650, "çiğ kg", "Gaziantep usulü baharatlı dolma.", "zeytinyagli"),
    item("kuru-dolma-pismis", "Kuru Gaziantep Dolma", "Zeytinyağlılar", 700, "pişmiş kg", "Geleneksel tarifle hazırlanır.", "zeytinyagli"),
    item("lahana-sarma-cig", "Lahana Sarma", "Zeytinyağlılar", 700, "çiğ kg", "Taze lahanadan ev usulü.", "zeytinyagli"),
    item("lahana-sarma-pismis", "Lahana Sarma", "Zeytinyağlılar", 750, "pişmiş kg", "Pişmiş, servise hazır.", "zeytinyagli"),
    item("icli-kofte-dondurulmus", "İçli Köfte", "Köfteler & Salatalar", 75, "adet", "Dondurulmuş, pişirmeye hazır.", "zeytinyagli"),
    item("icli-kofte-kizartilmis", "İçli Köfte", "Köfteler & Salatalar", 85, "adet", "Kızartılmış, sıcak servis.", "zeytinyagli"),
    item("cig-kofte", "Çiğ Köfte", "Köfteler & Salatalar", 400, "kg", "Bol yeşillikli ev yapımı çiğ köfte.", "zeytinyagli"),
    item("mercimek-kofte", "Mercimek Köftesi", "Köfteler & Salatalar", 500, "kg", "Nar ekşili, bol yeşillikli.", "zeytinyagli"),
    item("fellah-kofte", "Fellah Köftesi", "Köfteler & Salatalar", 550, "kg", "Sarımsaklı sosuyla nefis.", "zeytinyagli"),
    item("tavuklu-sehriye", "Tavuklu Şehriye Salatası", "Köfteler & Salatalar", 800, "kg", "Günlük ve taptaze hazırlanır.", "zeytinyagli"),
    item("patates-salatasi", "Patates Salatası", "Köfteler & Salatalar", 500, "kg", "Ev usulü, bol yeşillikli.", "zeytinyagli"),
    item("mor-lahana", "Mor Lahana Salatası", "Köfteler & Salatalar", 450, "kg", "Renkli, kıtır ve taze.", "zeytinyagli"),
    item("kuskus-tarator", "Kuskuslu Havuç Tarator", "Köfteler & Salatalar", 600, "kg", "Yoğurtlu, hafif ve doyurucu.", "zeytinyagli"),
    item("havuc-tarator", "Havuç Tarator", "Köfteler & Salatalar", 400, "kg", "Sarımsaklı yoğurtla hazırlanır.", "zeytinyagli"),
    item("cheesecake", "Cheesecake", "Kurabiyeler & Tatlılar", 2000, "borcam", "İpeksi dokulu ev yapımı cheesecake.", "tatli"),
    item("trilece", "Trileçe", "Kurabiyeler & Tatlılar", 1000, "borcam", "Üç sütlü, hafif ve yumuşak.", "tatli"),
    item("orman-meyveli-trilece", "Orman Meyveli Trileçe", "Kurabiyeler & Tatlılar", 1100, "borcam", "Meyveli, ferah ve nefis.", "tatli"),
    item("islak-kek", "Islak Kek", "Kurabiyeler & Tatlılar", 800, "kg / borcam", "Bol çikolatalı ev keki.", "tatli"),
    item("aglayan-pasta", "Ağlayan Pasta", "Kurabiyeler & Tatlılar", 850, "kg / borcam", "Çikolata soslu yumuşak pasta.", "tatli"),
    item("coco-star", "Coco Star", "Kurabiyeler & Tatlılar", 1100, "kg", "Hindistan cevizli özel tatlı.", "tatli"),
    item("latte-pasta", "Latte Pasta", "Kurabiyeler & Tatlılar", 1200, "borcam", "Kahve aromalı hafif pasta.", "tatli"),
    item("sekerpare", "Şekerpare", "Kurabiyeler & Tatlılar", 600, "kg", "Şerbetini tam çekmiş.", "tatli"),
    item("misir-kurabiye", "Mısır Gevrekli Kurabiye", "Kurabiyeler & Tatlılar", 650, "kg", "Kıtır dokulu özel kurabiye.", "tatli"),
    item("elmali-kurabiye", "Elmalı Kurabiye", "Kurabiyeler & Tatlılar", 650, "kg", "Tarçınlı elmalı iç harç.", "tatli"),
    item("brownie", "Brownie Kurabiye", "Kurabiyeler & Tatlılar", 600, "kg", "Yoğun çikolatalı.", "tatli"),
    item("sutlu-kurabiye", "Sütlü Kurabiye", "Kurabiyeler & Tatlılar", 600, "kg", "Ağızda dağılan yumuşaklık.", "tatli"),
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