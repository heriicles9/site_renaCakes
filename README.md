# 🍰 Renaildes Cakes - E-commerce de Bolos Artesanais

Aplicação web completa para venda de bolos e doces artesanais, desenvolvida com React, FastAPI e MongoDB.

## 📋 Funcionalidades

### Área Pública (Cliente)
- **Landing Page** com destaques e apresentação da loja
- **Catálogo de Produtos** com filtros por categoria
- **Detalhes do Produto** com seleção de quantidade
- **Carrinho de Compras** persistente
- **Checkout** com múltiplas formas de pagamento:
  - PIX (com exibição de chave)
  - Cartão (maquininha na entrega)
  - Dinheiro (com campo para troco)

### Área Administrativa
- **Login** com autenticação JWT
- **Gestão de Produtos** (CRUD completo)
- **Gestão de Pedidos** com atualização de status
- **Configurações** (taxa de entrega e chave PIX)

## 🚀 Tecnologias Utilizadas

### Frontend
- React 19
- React Router DOM
- Tailwind CSS
- Framer Motion (animações)
- Lucide React (ícones)
- Axios
- Sonner (toasts)

### Backend
- FastAPI
- Motor (MongoDB async driver)
- JWT (autenticação)
- Passlib + Bcrypt (hash de senhas)
- Pydantic (validação)

### Banco de Dados
- MongoDB

## 📦 Estrutura do Projeto

```
/app
├── backend/
│   ├── server.py          # API FastAPI
│   ├── seed_data.py       # Seed do banco de dados
│   ├── requirements.txt   # Dependências Python
│   └── .env              # Variáveis de ambiente
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, Footer
│   │   ├── context/      # CartContext
│   │   ├── pages/        # Home, Catalog, Product, Checkout, Admin
│   │   ├── App.js
│   │   └── index.css
│   ├── package.json
│   └── .env
└── README.md
```

## 🛠️ Instalação Local

### Backend
```bash
cd backend
pip install -r requirements.txt
python seed_data.py  # Popular banco de dados
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend
```bash
cd frontend
yarn install
yarn start
```

## 🌐 Deploy no Render.com

### 1. Preparar Repositório
Suba o código para um repositório Git (GitHub, GitLab, etc).

### 2. Deploy do Backend (Web Service)

**Configurações:**
- **Build Command:**
  ```bash
  pip install -r requirements.txt
  ```

- **Start Command:**
  ```bash
  uvicorn server:app --host 0.0.0.0 --port $PORT
  ```

**Variáveis de Ambiente:**
```
MONGO_URL=mongodb+srv://seu-usuario:senha@cluster.mongodb.net/
DB_NAME=renaildes_cakes
CORS_ORIGINS=https://seu-frontend.onrender.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sua-senha-segura
JWT_SECRET=sua-chave-secreta-aleatoria
```

**Importante:**
- Use PostgreSQL ou MongoDB Atlas (não use SQLite em produção no Render)
- O `$PORT` é automaticamente fornecido pelo Render

### 3. Deploy do Frontend (Static Site)

**Configurações:**
- **Build Command:**
  ```bash
  cd frontend && yarn install && yarn build
  ```

- **Publish Directory:**
  ```
  frontend/build
  ```

**Variáveis de Ambiente:**
```
REACT_APP_BACKEND_URL=https://seu-backend.onrender.com
```

### 4. Configurar MongoDB (Recomendado: MongoDB Atlas)

1. Crie uma conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie um cluster gratuito
3. Configure acesso de rede (whitelist 0.0.0.0/0 para Render)
4. Obtenha a string de conexão
5. Atualize `MONGO_URL` no backend

### 5. Popular Banco de Dados (Produção)

Após o deploy do backend, execute:
```bash
# Via Render Shell ou localmente apontando para produção
python seed_data.py
```

## 🔐 Credenciais Padrão (Admin)

**⚠️ ALTERAR EM PRODUÇÃO!**
- **Usuário:** admin
- **Senha:** admin123

Altere as variáveis `ADMIN_USERNAME` e `ADMIN_PASSWORD` no `.env` do backend.

## 🎨 Design

O design segue uma paleta elegante e apetitosa:
- **Chocolate:** #5D4037 (primária)
- **Rosa Pastel:** #F8E7E7 (secundária)
- **Rose:** #D88C9A (acentos)
- **Cream:** #FFFCF9 (fundo)

**Fontes:**
- Playfair Display (títulos)
- Manrope (corpo)
- Dancing Script (acentos)

## 📱 Responsividade

A aplicação é **mobile-first**, otimizada para celulares (principal dispositivo dos clientes).

## 🗂️ Categorias de Produtos

1. **Bolos Redondos** (8 tamanhos: 10cm a 40cm)
2. **Bolos Retangulares** (8 tamanhos: 30x20cm a 75x45cm)
3. **Doces** (Comuns, Finos, Gourmet)
4. **Kits** (Combos especiais)

## 🔄 Fluxo de Pedido

1. Cliente navega pelo catálogo
2. Adiciona produtos ao carrinho
3. Preenche dados de entrega no checkout
4. Seleciona forma de pagamento
5. Confirma pedido
6. Admin recebe pedido no painel
7. Admin atualiza status (Pendente → Em preparo → Entregue)

## 📞 Contato

**WhatsApp:** (75) 98177-7873  
**Instagram:** @renaildes_cakes

## 📝 Licença

Este projeto é proprietário da Renaildes Cakes.

---

**Desenvolvido com ❤️ e muito chocolate!**
