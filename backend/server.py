from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    mongo_url = "mongodb://localhost:27017"

client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'renaildes_cakes')]

app = FastAPI()
api_router = APIRouter(prefix="/api")

security = HTTPBearer()
SECRET_KEY = os.environ.get('JWT_SECRET', 'secret-key')
ALGORITHM = "HS256"

# --- MODELOS ---
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str = ""
    price: float
    category: str
    image_url: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProductCreate(BaseModel):
    name: str
    description: str = ""
    price: float
    category: str
    image_url: str = ""

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "app_settings"
    delivery_fee: float = 5.0
    pix_key: str = "chave@pix.com"
    available_massas: str = "Baunilha, Chocolate, Cenoura"
    available_recheios: str = "Brigadeiro, Ninho, Doce de Leite"
    contact_phone: str = "(00) 00000-0000"

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_phone: str
    customer_address: str
    items: List[dict]
    total: float
    payment_method: str
    status: str = "Pendente"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_address: str
    items: List[dict]
    subtotal: float
    delivery_fee: float
    total: float
    payment_method: str
    payment_details: Optional[dict] = None

class AdminLogin(BaseModel):
    username: str
    password: str

# --- AUTH ---
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Token inválido")

# --- ROTAS ---

@api_router.post("/admin/login")
async def admin_login(login: AdminLogin):
    admin_user = os.environ.get('ADMIN_USERNAME', 'admin')
    admin_pass = os.environ.get('ADMIN_PASSWORD', 'admin123')
    
    if login.username == admin_user and login.password == admin_pass:
        token = create_access_token({"sub": login.username})
        return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Senha incorreta")

# CONFIGURAÇÕES
@api_router.get("/settings")
async def get_settings():
    settings = await db.settings.find_one({"id": "app_settings"}, {"_id": 0})
    if not settings:
        default = Settings()
        await db.settings.insert_one(default.model_dump())
        return default
    return settings

@api_router.put("/settings")
async def update_settings(settings: Settings, token: dict = Depends(verify_token)):
    doc = settings.model_dump()
    await db.settings.update_one({"id": "app_settings"}, {"$set": doc}, upsert=True)
    return doc

# PRODUTOS
@api_router.get("/products")
async def get_products():
    return await db.products.find({}, {"_id": 0}).to_list(1000)

# --- AQUI ESTAVA FALTANDO ESSA ROTA! ---
@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return product
# ---------------------------------------

@api_router.post("/products")
async def create_product(product: ProductCreate, token: dict = Depends(verify_token)):
    product_obj = Product(**product.model_dump())
    await db.products.insert_one(product_obj.model_dump())
    return product_obj

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, product: ProductCreate, token: dict = Depends(verify_token)):
    doc = product.model_dump()
    await db.products.update_one({"id": product_id}, {"$set": doc})
    return {**doc, "id": product_id}

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, token: dict = Depends(verify_token)):
    await db.products.delete_one({"id": product_id})
    return {"message": "Deletado"}

# PEDIDOS
@api_router.get("/orders")
async def get_orders(token: dict = Depends(verify_token)):
    return await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)

@api_router.post("/orders")
async def create_order(order: OrderCreate):
    order_obj = Order(**order.model_dump())
    await db.orders.insert_one(order_obj.model_dump())
    return order_obj

@api_router.patch("/orders/{order_id}/status")
async def update_status(order_id: str, status: str, token: dict = Depends(verify_token)):
    await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    return {"status": "ok"}

@api_router.delete("/orders/{order_id}")
async def delete_order(order_id: str, token: dict = Depends(verify_token)):
    await db.orders.delete_one({"id": order_id})
    return {"status": "deleted"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("server:app", host="0.0.0.0", port=port)
