from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Header, Response, Depends
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Literal
import uuid
import json
import hmac
import bcrypt
import requests
import jwt
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone


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

class AIChatRequest(BaseModel):
    message: str
    mode: Literal["customer", "owner"] = "customer"
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class AdminLogin(BaseModel):
    password: str

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class ZoneInput(BaseModel):
    name: str

FOOD_IMAGES = {
    "borek": "https://images.pexels.com/photos/38356208/pexels-photo-38356208.jpeg?auto=compress&cs=tinysrgb&w=940",
    "pogaca": "https://images.pexels.com/photos/17101845/pexels-photo-17101845.jpeg?auto=compress&cs=tinysrgb&w=940",
    "sarma": "https://images.pexels.com/photos/31928139/pexels-photo-31928139.jpeg?auto=compress&cs=tinysrgb&w=940",
    "kofte": "https://images.pexels.com/photos/32402079/pexels-photo-32402079.jpeg?auto=compress&cs=tinysrgb&w=940",
    "cigkofte": "https://images.pexels.com/photos/9399948/pexels-photo-9399948.jpeg?auto=compress&cs=tinysrgb&w=940",
    "salata": "https://images.pexels.com/photos/9399948/pexels-photo-9399948.jpeg?auto=compress&cs=tinysrgb&w=940",
    "tatli": "https://images.pexels.com/photos/8681910/pexels-photo-8681910.jpeg?auto=compress&cs=tinysrgb&w=940",
    "sutlu": "https://images.pexels.com/photos/14841923/pexels-photo-14841923.jpeg?auto=compress&cs=tinysrgb&w=940",
    "kurabiye": "https://images.pexels.com/photos/14808333/pexels-photo-14808333.jpeg?auto=compress&cs=tinysrgb&w=940",
}

def item(id, name, category, price, unit, description, image):
    return {"id": id, "name": name, "category": category, "price": price, "unit": unit, "description": description, "image": FOOD_IMAGES[image]}

MENU_ITEMS = [
    item("milfoy-tepsi", "Milföylü Tepsi Böreği", "Hamur İşi", 800, "tepsi", "Kat kat, çıtır ve fırından taze.", "borek"),
    item("katmer-pogaca", "Katmer Poğaça", "Hamur İşi", 600, "kg", "Tel tel açılan yumuşacık poğaça.", "pogaca"),
    item("peynirli-pogaca", "1 Tepsi Peynirli Poğaça", "Hamur İşi", 500, "tepsi", "Ev yapımı peynirli poğaça.", "pogaca"),
    item("sade-pogaca", "1 Tepsi Sade Poğaça", "Hamur İşi", 400, "tepsi", "Çayın yanına taptaze.", "pogaca"),
    item("sakalli-pogaca", "1 Tepsi Sakallı Poğaça", "Hamur İşi", 500, "tepsi", "Peynirli, yumuşak ve doyurucu.", "pogaca"),
    item("midye-borek", "Midye Börek", "Hamur İşi", 550, "kg", "Özel kıvrımıyla çıtır börek.", "borek"),
    item("gul-boregi", "Gül Böreği", "Hamur İşi", 550, "kg", "Peynirli veya patatesli hazırlanır.", "borek"),
    item("kalem-boregi", "Kalem Böreği", "Hamur İşi", 450, "kg", "Çıtır çıtır atıştırmalık.", "borek"),
    item("yaprak-sarma-cig", "Yaprak Sarma", "Zeytinyağlılar", 700, "çiğ kg", "Zeytinyağlı, incecik sarılmış.", "sarma"),
    item("yaprak-sarma-pismis", "Yaprak Sarma", "Zeytinyağlılar", 750, "pişmiş kg", "Servise hazır, limonuyla nefis.", "sarma"),
    item("kuru-dolma-cig", "Kuru Gaziantep Dolma", "Zeytinyağlılar", 650, "çiğ kg", "Gaziantep usulü baharatlı dolma.", "sarma"),
    item("kuru-dolma-pismis", "Kuru Gaziantep Dolma", "Zeytinyağlılar", 700, "pişmiş kg", "Geleneksel tarifle hazırlanır.", "sarma"),
    item("lahana-sarma-cig", "Lahana Sarma", "Zeytinyağlılar", 700, "çiğ kg", "Taze lahanadan ev usulü.", "sarma"),
    item("lahana-sarma-pismis", "Lahana Sarma", "Zeytinyağlılar", 750, "pişmiş kg", "Pişmiş, servise hazır.", "sarma"),
    item("icli-kofte-dondurulmus", "İçli Köfte", "Köfteler & Salatalar", 75, "adet", "Dondurulmuş, pişirmeye hazır.", "kofte"),
    item("icli-kofte-kizartilmis", "İçli Köfte", "Köfteler & Salatalar", 85, "adet", "Kızartılmış, sıcak servis.", "kofte"),
    item("cig-kofte", "Çiğ Köfte", "Köfteler & Salatalar", 400, "kg", "Bol yeşillikli ev yapımı çiğ köfte.", "cigkofte"),
    item("mercimek-kofte", "Mercimek Köftesi", "Köfteler & Salatalar", 500, "kg", "Nar ekşili, bol yeşillikli.", "cigkofte"),
    item("fellah-kofte", "Fellah Köftesi", "Köfteler & Salatalar", 550, "kg", "Sarımsaklı sosuyla nefis.", "cigkofte"),
    item("tavuklu-sehriye", "Tavuklu Şehriye Salatası", "Köfteler & Salatalar", 800, "kg", "Günlük ve taptaze hazırlanır.", "salata"),
    item("patates-salatasi", "Patates Salatası", "Köfteler & Salatalar", 500, "kg", "Ev usulü, bol yeşillikli.", "salata"),
    item("mor-lahana", "Mor Lahana Salatası", "Köfteler & Salatalar", 450, "kg", "Renkli, kıtır ve taze.", "salata"),
    item("kuskus-tarator", "Kuskuslu Havuç Tarator", "Köfteler & Salatalar", 600, "kg", "Yoğurtlu, hafif ve doyurucu.", "salata"),
    item("havuc-tarator", "Havuç Tarator", "Köfteler & Salatalar", 400, "kg", "Sarımsaklı yoğurtla hazırlanır.", "salata"),
    item("cheesecake", "Cheesecake", "Kurabiyeler & Tatlılar", 2000, "borcam", "İpeksi dokulu ev yapımı cheesecake.", "sutlu"),
    item("trilece", "Trileçe", "Kurabiyeler & Tatlılar", 1000, "borcam", "Üç sütlü, hafif ve yumuşak.", "sutlu"),
    item("orman-meyveli-trilece", "Orman Meyveli Trileçe", "Kurabiyeler & Tatlılar", 1100, "borcam", "Meyveli, ferah ve nefis.", "sutlu"),
    item("islak-kek", "Islak Kek", "Kurabiyeler & Tatlılar", 800, "kg / borcam", "Bol çikolatalı ev keki.", "kurabiye"),
    item("aglayan-pasta", "Ağlayan Pasta", "Kurabiyeler & Tatlılar", 850, "kg / borcam", "Çikolata soslu yumuşak pasta.", "sutlu"),
    item("coco-star", "Coco Star", "Kurabiyeler & Tatlılar", 1100, "kg", "Hindistan cevizli özel tatlı.", "kurabiye"),
    item("latte-pasta", "Latte Pasta", "Kurabiyeler & Tatlılar", 1200, "borcam", "Kahve aromalı hafif pasta.", "sutlu"),
    item("sekerpare", "Şekerpare", "Kurabiyeler & Tatlılar", 600, "kg", "Şerbetini tam çekmiş.", "tatli"),
    item("misir-kurabiye", "Mısır Gevrekli Kurabiye", "Kurabiyeler & Tatlılar", 650, "kg", "Kıtır dokulu özel kurabiye.", "kurabiye"),
    item("elmali-kurabiye", "Elmalı Kurabiye", "Kurabiyeler & Tatlılar", 650, "kg", "Tarçınlı elmalı iç harç.", "kurabiye"),
    item("brownie", "Brownie Kurabiye", "Kurabiyeler & Tatlılar", 600, "kg", "Yoğun çikolatalı.", "kurabiye"),
    item("sutlu-kurabiye", "Sütlü Kurabiye", "Kurabiyeler & Tatlılar", 600, "kg", "Ağızda dağılan yumuşaklık.", "kurabiye"),
]

# Kocaeli/İzmit varsayılan teslimat bölgeleri — işletme panelinden düzenlenebilir
DEFAULT_ZONES = ["Yahya Kaptan", "Alikahya", "Yenişehir", "Bekirpaşa", "Kuruçeşme", "Kozluk", "Karabaş", "Ömerağa", "Kemalpaşa", "Tepeköy"]

# Object storage (Emergent playbook)
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
APP_NAME = "kg-mutfagi"
storage_key = None

def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": os.environ.get("EMERGENT_LLM_KEY")}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key, "Content-Type": content_type}, data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# Basit yönetici kimlik doğrulaması (tek işletme sahibi)
JWT_ALGORITHM = "HS256"

def create_admin_token() -> str:
    payload = {"role": "admin", "exp": datetime.now(timezone.utc) + timedelta(hours=12)}
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)

def require_admin(authorization: str | None = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Giriş gerekli")
    try:
        payload = jwt.decode(authorization[7:], os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=401, detail="Yetkisiz")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Oturum geçersiz, tekrar giriş yapın")

async def get_zones() -> List[str]:
    docs = await db.delivery_zones.find({}, {"_id": 0, "name": 1}).to_list(500)
    return [d["name"] for d in docs] or list(DEFAULT_ZONES)

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Ev Lezzetleri API hazır"}

@api_router.get("/menu", response_model=List[MenuItem])
async def get_menu():
    overrides = await db.menu_overrides.find({}, {"_id": 0}).to_list(500)
    override_map = {entry["item_id"]: entry["image"] for entry in overrides}
    return [{**entry, "image": override_map.get(entry["id"], entry["image"])} for entry in MENU_ITEMS]

@api_router.post("/delivery-check", response_model=DeliveryResult)
async def check_delivery(input: DeliveryCheck):
    neighborhood = input.neighborhood.strip()
    if not neighborhood:
        raise HTTPException(status_code=400, detail="Mahalle adı gerekli")
    zones = await get_zones()
    available = any(zone.casefold() == neighborhood.casefold() for zone in zones)
    message = "Bu bölgeye teslimat yapıyoruz. Siparişinizi WhatsApp'tan bekliyoruz." if available else "Bu bölge henüz teslimat rotamızda değil; gelip alma seçeneğimiz her gün açık."
    return {"neighborhood": neighborhood, "available": available, "message": message}

@api_router.get("/delivery/zones")
async def list_zones():
    return {"zones": await get_zones()}

async def verify_admin_password(password: str) -> bool:
    doc = await db.settings.find_one({"key": "admin_password"})
    if doc:
        return bcrypt.checkpw(password.encode("utf-8"), doc["hash"].encode("utf-8"))
    expected = os.environ.get("ADMIN_PASSWORD", "")
    return bool(expected) and hmac.compare_digest(password, expected)

@api_router.post("/admin/login")
async def admin_login(input: AdminLogin):
    if not await verify_admin_password(input.password):
        raise HTTPException(status_code=401, detail="Şifre hatalı")
    return {"token": create_admin_token()}

@api_router.post("/admin/change-password")
async def change_password(input: PasswordChange, _admin=Depends(require_admin)):
    if not await verify_admin_password(input.current_password):
        raise HTTPException(status_code=400, detail="Mevcut şifre hatalı")
    if len(input.new_password) < 8:
        raise HTTPException(status_code=400, detail="Yeni şifre en az 8 karakter olmalı")
    hashed = bcrypt.hashpw(input.new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    await db.settings.update_one({"key": "admin_password"}, {"$set": {"key": "admin_password", "hash": hashed}}, upsert=True)
    return {"message": "Şifre güncellendi"}

@api_router.post("/admin/delivery/zones")
async def add_zone(input: ZoneInput, _admin=Depends(require_admin)):
    name = input.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Mahalle adı gerekli")
    await db.delivery_zones.update_one({"name_lower": name.casefold()}, {"$set": {"name": name, "name_lower": name.casefold()}}, upsert=True)
    return {"zones": await get_zones()}

@api_router.delete("/admin/delivery/zones/{name}")
async def remove_zone(name: str, _admin=Depends(require_admin)):
    await db.delivery_zones.delete_one({"name_lower": name.casefold()})
    return {"zones": await get_zones()}

@api_router.post("/admin/menu/{item_id}/image")
async def upload_menu_image(item_id: str, _admin=Depends(require_admin), file: UploadFile = File(...)):
    if not any(entry["id"] == item_id for entry in MENU_ITEMS):
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=400, detail="Yalnızca görsel dosyası yükleyin")
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Dosya 10 MB'dan küçük olmalı")
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "jpg"
    path = f"{APP_NAME}/menu/{item_id}-{uuid.uuid4().hex[:8]}.{ext}"
    try:
        result = put_object(path, data, file.content_type)
    except Exception as exc:
        logger.exception("Storage upload failed: %s", exc)
        raise HTTPException(status_code=502, detail="Fotoğraf yüklenemedi, lütfen tekrar deneyin")
    await db.files.insert_one({"id": str(uuid.uuid4()), "storage_path": result["path"], "original_filename": file.filename, "content_type": file.content_type, "size": result["size"], "is_deleted": False, "created_at": datetime.now(timezone.utc).isoformat()})
    image = f"/api/files/{result['path']}"
    await db.menu_overrides.update_one({"item_id": item_id}, {"$set": {"item_id": item_id, "image": image}}, upsert=True)
    return {"image": image}

@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="Dosya bulunamadı")
    try:
        data, content_type = get_object(path)
    except Exception:
        raise HTTPException(status_code=404, detail="Dosya bulunamadı")
    return Response(content=data, media_type=record.get("content_type", content_type))

def menu_context():
    return "\n".join(f"- {entry['name']}: {entry['price']} TL / {entry['unit']} ({entry['category']})" for entry in MENU_ITEMS)

def system_prompt(mode: str):
    shared = f"""Sen Kocaeli Gaziantep Mutfağı'nın Türkçe dijital asistanısın. Sıcak, kısa ve güvenilir cevaplar ver. İşletme telefonu 0541 440 80 94. Güncel fiyat ve ürün bilgileri yalnızca aşağıdaki listedir; listede olmayan bir ürün veya fiyat uydurma. Sipariş için müşteriyi WhatsApp'a yönlendir.\n\nGÜNCEL MENÜ:\n{menu_context()}"""
    if mode == "owner":
        return shared + "\n\nBu oturum işletme sahibine yardım eder. Menü açıklaması, kampanya fikri, Instagram metni ve müşteri duyurusu hazırlayabilirsin. Metinleri Türkçe, pratik ve markanın ev yapımı tonunda üret."
    return shared + "\n\nBu oturum müşterilere yardımcı olur. Ürün öner, fiyat ve porsiyon bilgisi ver, teslimat/sipariş sorularını yanıtla. İşletme içi veya gizli bilgi paylaşma."

@api_router.post("/ai/chat")
async def ai_chat(input: AIChatRequest):
    message = input.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Mesaj boş olamaz")
    if len(message) > 2000:
        raise HTTPException(status_code=400, detail="Mesaj 2000 karakterden kısa olmalı")
    now = datetime.now(timezone.utc).isoformat()
    await db.ai_messages.insert_one({"session_id": input.session_id, "role": "user", "content": message, "mode": input.mode, "created_at": now})
    previous = await db.ai_messages.find({"session_id": input.session_id}, {"_id": 0, "role": 1, "content": 1}).sort("created_at", -1).to_list(8)
    context = "\n".join(f"{entry['role']}: {entry['content']}" for entry in reversed(previous[:-1]))
    prompt = f"Önceki konuşma:\n{context}\n\nYeni kullanıcı mesajı:\n{message}" if context else message
    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key:
        raise HTTPException(status_code=503, detail="AI anahtarı yapılandırılmamış")

    async def event_generator():
        answer_parts = []
        try:
            chat = LlmChat(api_key=key, session_id=input.session_id, system_message=system_prompt(input.mode)).with_model("openai", "gpt-5.4")
            async for event in chat.stream_message(UserMessage(text=prompt)):
                if isinstance(event, TextDelta):
                    answer_parts.append(event.content)
                    yield f"data: {json.dumps({'content': event.content}, ensure_ascii=False)}\n\n"
                elif isinstance(event, StreamDone):
                    break
            answer = "".join(answer_parts)
            await db.ai_messages.insert_one({"session_id": input.session_id, "role": "assistant", "content": answer, "mode": input.mode, "created_at": datetime.now(timezone.utc).isoformat()})
            yield "data: [DONE]\n\n"
        except Exception as exc:
            logger.exception("AI streaming failed: %s", exc)
            yield f"data: {json.dumps({'error': 'Şu anda yanıt veremiyorum. Lütfen biraz sonra tekrar deneyin.'}, ensure_ascii=False)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

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

@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Object storage hazır")
    except Exception as exc:
        logger.error("Storage init başarısız: %s", exc)
    if await db.delivery_zones.count_documents({}) == 0:
        await db.delivery_zones.insert_many([{"name": name, "name_lower": name.casefold()} for name in DEFAULT_ZONES])

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
