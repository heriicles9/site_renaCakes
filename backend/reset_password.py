import os
from pymongo import MongoClient
from passlib.context import CryptContext
from dotenv import load_dotenv

# Carrega as variáveis de ambiente (sua URL do Mongo)
load_dotenv()

# Configura a criptografia igual à do seu sistema
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------------------------------------------------
# CONFIGURAÇÃO
NOVA_SENHA = "Cakes123"  # <--- Coloque a nova senha aqui
USUARIO_ADMIN = "admin"         # O usuário que você quer alterar
# ---------------------------------------------------------

def resetar_senha():
    # Pega a URL do banco do arquivo .env
    mongo_url = os.getenv("MONGO_URL")
    
    if not mongo_url:
        print("❌ Erro: Não encontrei a variável MONGO_URL no arquivo .env")
        return

    try:
        # Conecta ao banco
        client = MongoClient(mongo_url)
        db = client["renaildes_cakes"] # Nome do banco definido no projeto
        collection = db["users"]

        # Gera o Hash (senha criptografada)
        senha_hash = pwd_context.hash(NOVA_SENHA)

        # Atualiza no banco
        resultado = collection.update_one(
            {"username": USUARIO_ADMIN},
            {"$set": {"hashed_password": senha_hash}} # Nota: O campo pode ser 'hashed_password' ou 'password', depende de como o Emergent gerou.
        )

        if resultado.matched_count > 0:
            print(f"✅ Sucesso! A senha do usuário '{USUARIO_ADMIN}' foi atualizada.")
        else:
            print(f"⚠️ Usuário '{USUARIO_ADMIN}' não encontrado. Verifique se o nome está correto.")

    except Exception as e:
        print(f"❌ Erro ao conectar: {e}")

if __name__ == "__main__":
    resetar_senha()
