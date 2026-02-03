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

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('JWT_SECRET', 'renaildes-cakes-secret-key-change-in-production')
ALGORITHM = "HS256"

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str = ""
    price: float
    category: str
    subcategory: Optional[str] = None
    size: Optional[str] = None
    servings: Optional[str] = None
    image_url: str = ""
    featured: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str = ""
    price: float
    category: str
    subcategory: Optional[str] = None
    size: Optional[str] = None
    servings: Optional[str] = None
    image_url: str = ""
    featured: bool = False

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_phone: str
    customer_address: str
    items: List[dict]
    subtotal: float
    delivery_fee: float
    total: float
    payment_method: str
    payment_details: Optional[dict] = None
    status: str = "Pendente"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "app_settings"
    delivery_fee: float = 5.0
    pix_key: str = "contato@renaildes-cakes.com"

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminToken(BaseModel):
    access_token: str
    token_type: str = "bearer"

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
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

@api_router.post("/admin/login", response_model=AdminToken)
async def admin_login(login: AdminLogin):
    admin_user = os.environ.get('ADMIN_USERNAME', 'admin')
    admin_pass = os.environ.get('ADMIN_PASSWORD', 'admin123')
    
    if login.username == admin_user and login.password == admin_pass:
        token = create_access_token({"sub": login.username, "role": "admin"})
        return AdminToken(access_token=token)
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    for p in products:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    return product

@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate, token: dict = Depends(verify_token)):
    product_obj = Product(**product.model_dump())
    doc = product_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    return product_obj

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product: ProductCreate, token: dict = Depends(verify_token)):
    existing = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    updated_doc = product.model_dump()
    await db.products.update_one({"id": product_id}, {"$set": updated_doc})
    
    result = await db.products.find_one({"id": product_id}, {"_id": 0})
    if isinstance(result.get('created_at'), str):
        result['created_at'] = datetime.fromisoformat(result['created_at'])
    return Product(**result)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, token: dict = Depends(verify_token)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return {"message": "Produto deletado com sucesso"}

@api_router.get("/orders", response_model=List[Order])
async def get_orders(token: dict = Depends(verify_token)):
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for o in orders:
        if isinstance(o.get('created_at'), str):
            o['created_at'] = datetime.fromisoformat(o['created_at'])
    return orders

@api_router.post("/orders", response_model=Order)
async def create_order(order: OrderCreate):
    order_obj = Order(**order.model_dump())
    doc = order_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.orders.insert_one(doc)
    return order_obj

@api_router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, token: dict = Depends(verify_token)):
    result = await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return {"message": "Status atualizado com sucesso"}

@api_router.get("/settings", response_model=Settings)
async def get_settings():
    settings = await db.settings.find_one({"id": "app_settings"}, {"_id": 0})
    if not settings:
        default_settings = Settings()
        doc = default_settings.model_dump()
        await db.settings.insert_one(doc)
        return default_settings
    return Settings(**settings)

@api_router.put("/settings", response_model=Settings)
async def update_settings(settings: Settings, token: dict = Depends(verify_token)):
    doc = settings.model_dump()
    await db.settings.update_one({"id": "app_settings"}, {"$set": doc}, upsert=True)
    return settings

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
