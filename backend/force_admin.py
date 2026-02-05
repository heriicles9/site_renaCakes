import os
from pymongo import MongoClient
from passlib.context import CryptContext

# --- DADOS DO ADMIN ---
USUARIO = "admin"
SENHA_TEXTO = "admin123"
NOME_DO_BANCO = "renaildes_cakes" # <--- Aqui está a correção!
# ----------------------

mongo_url = os.environ.get("MONGO_URL")

if not mongo_url:
    print("❌ ERRO: Sem MONGO_URL.")
else:
    try:
        # Conecta
        client = MongoClient(mongo_url)
        # Força o uso do banco correto
        db = client[NOME_DO_BANCO] 
        users = db["users"]
        
        # Criptografa a senha
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        senha_hash = pwd_context.hash(SENHA_TEXTO)

        # O COMANDO MÁGICO: upsert=True
        users.update_one(
            {"username": USUARIO}, 
            {"$set": {
                "username": USUARIO,
                "hashed_password": senha_hash,
                "role": "admin",
                "email": "admin@force.com"
            }},
            upsert=True
        )
        
        print(f"✅ SUCESSO! Usuário '{USUARIO}' garantido no banco '{NOME_DO_BANCO}'.")
        
    except Exception as e:
        print(f"❌ Erro no banco: {e}")
