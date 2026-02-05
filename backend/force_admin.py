import os
from pymongo import MongoClient
from passlib.context import CryptContext

# --- DADOS DO ADMIN ---
USUARIO = "admin"
SENHA_TEXTO = "admin123"
# ----------------------

mongo_url = os.environ.get("MONGO_URL")

if not mongo_url:
    print("❌ ERRO: Sem MONGO_URL.")
else:
    try:
        # Conecta
        client = MongoClient(mongo_url)
        db = client.get_database()
        users = db["users"]
        
        # Criptografa a senha
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        senha_hash = pwd_context.hash(SENHA_TEXTO)

        # O COMANDO MÁGICO: upsert=True (Atualiza se existe, CRIA se não existe)
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
        
        print(f"✅ SUCESSO! Usuário '{USUARIO}' garantido com senha '{SENHA_TEXTO}'.")
        
    except Exception as e:
        print(f"❌ Erro no banco: {e}")
