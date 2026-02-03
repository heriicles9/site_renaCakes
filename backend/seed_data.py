import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

PRODUCTS = [
    {
        "id": str(uuid.uuid4()),
        "name": "Bolo 10cm",
        "description": "Bolo redondo pequeno, perfeito para 8 pessoas. Massas: Tradicional, Baunilha, Chocolate, Coco. Recheios diversos disponíveis.",
        "price": 80.00,
        "category": "Bolos Redondos",
        "size": "10cm",
        "servings": "8 fatias",
        "image_url": "https://images.unsplash.com/photo-1621868402792-a5c9fa6866a3?crop=entropy&cs=srgb&fm=jpg&q=85",
        "featured": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Bolo 15cm",
        "description": "Bolo redondo médio para 12 pessoas. Escolha entre massas tradicionais e recheios especiais.",
        "price": 120.00,
        "category": "Bolos Redondos",
        "size": "15cm",
        "servings": "12 fatias",
        "image_url": "https://images.unsplash.com/photo-1583067784891-36831dbd4cb4?crop=entropy&cs=srgb&fm=jpg&q=85",
        "featured": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Bolo 20cm",
        "description": "Bolo redondo grande. Massas e recheios variados. Ideal para festas.",
        "price": 150.00,
        "category": "Bolos Redondos",
        "size": "20cm",
        "servings": "22 fatias",
        "image_url": "https://images.unsplash.com/photo-1737189409843-c86c2d4770fd?crop=entropy&cs=srgb&fm=jpg&q=85",
        "featured": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Bolo 25cm",
        "description": "Bolo redondo grande para 32 fatias. Perfeito para eventos maiores.",
        "price": 240.00,
        "category": "Bolos Redondos",
        "size": "25cm",
        "servings": "32 fatias",
        "image_url": "https://images.unsplash.com/photo-1721412742313-fbcc3e48f770?crop=entropy&cs=srgb&fm=jpg&q=85",
        "featured": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Bolo Retangular 30x20cm",
        "description": "Bolo retangular para 25 fatias. Ideal para festas e eventos.",
        "price": 185.00,
        "category": "Bolos Retangulares",
        "size": "30x20cm",
        "servings": "25 fatias",
        "image_url": "https://images.unsplash.com/photo-1621868402792-a5c9fa6866a3?crop=entropy&cs=srgb&fm=jpg&q=85",
        "featured": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Bolo Retangular 35x25cm",
        "description": "Bolo retangular médio para 30 fatias.",
        "price": 245.00,
        "category": "Bolos Retangulares",
        "size": "35x25cm",
        "servings": "30 fatias",
        "image_url": "https://images.unsplash.com/photo-1583067784891-36831dbd4cb4?crop=entropy&cs=srgb&fm=jpg&q=85",
        "featured": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Bolo Retangular 45x35cm",
        "description": "Bolo retangular grande para 100 fatias. Perfeito para eventos grandes.",
        "price": 325.00,
        "category": "Bolos Retangulares",
        "size": "45x35cm",
        "servings": "100 fatias",
        "image_url": "https://images.unsplash.com/photo-1737189409843-c86c2d4770fd?crop=entropy&cs=srgb&fm=jpg&q=85",
        "featured": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Brigadeiro Preto (Caixa)",
        "description": "Brigadeiros tradicionais. Caixa com 100 unidades.",
        "price": 140.00,
        "category": "Doces",
        "subcategory": "Comuns",
        "image_url": "https://images.unsplash.com/photo-1621868402792-a5c9fa6866a3?crop=entropy&cs=srgb&fm=jpg&q=85",
        "featured": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Beijinho (Caixa)",
        "description": "Beijinhos tradicionais de coco. Caixa com 100 unidades.",
        "price": 140.00,
        "category": "Doces",
        "subcategory": "Comuns",
        "image_url": "https://images.unsplash.com/photo-1583067784891-36831dbd4cb4?crop=entropy&cs=srgb&fm=jpg&q=85",
        "featured": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Morango Coberto (Caixa)",
        "description": "Morangos cobertos com chocolate. Doce fino. Caixa com 100 unidades.",
        "price": 160.00,
        "category": "Doces",
        "subcategory": "Finos",
        "image_url": "https://images.unsplash.com/photo-1737189409843-c86c2d4770fd?crop=entropy&cs=srgb&fm=jpg&q=85",
        "featured": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Brigadeiro Gourmet (Caixa)",
        "description": "Brigadeiros gourmet premium. Caixa com 100 unidades.",
        "price": 180.00,
        "category": "Doces",
        "subcategory": "Gourmet",
        "image_url": "https://images.unsplash.com/photo-1621868402792-a5c9fa6866a3?crop=entropy&cs=srgb&fm=jpg&q=85",
        "featured": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Tortinha de Morango (Caixa)",
        "description": "Tortinhas deliciosas de morango. Doce gourmet. Caixa com 100 unidades.",
        "price": 180.00,
        "category": "Doces",
        "subcategory": "Gourmet",
        "image_url": "https://images.unsplash.com/photo-1583067784891-36831dbd4cb4?crop=entropy&cs=srgb&fm=jpg&q=85",
        "featured": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Kit Mesversário",
        "description": "Kit completo: 1 bolo 10cm + 25 doces + 10 cupcakes + arco decorativo com balões",
        "price": 199.90,
        "category": "Kits",
        "image_url": "https://customer-assets.emergentagent.com/job_7700306c-731d-4a87-a88a-750fe92720c3/artifacts/8gsxelum_IMG-20260203-WA0061.jpg",
        "featured": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]

async def seed_database():
    await db.products.delete_many({})
    await db.products.insert_many(PRODUCTS)
    print(f"✅ {len(PRODUCTS)} produtos inseridos com sucesso!")
    
    settings = {
        "id": "app_settings",
        "delivery_fee": 5.0,
        "pix_key": "contato@renaildes-cakes.com"
    }
    await db.settings.update_one({"id": "app_settings"}, {"$set": settings}, upsert=True)
    print("✅ Configurações iniciais criadas!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
