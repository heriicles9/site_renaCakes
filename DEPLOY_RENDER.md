# 🚀 Guia Completo de Deploy no Render.com - Renaildes Cakes

## 📋 Pré-requisitos

1. Conta no [Render.com](https://render.com) (gratuita)
2. Conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratuita)
3. Código em repositório Git (GitHub, GitLab ou Bitbucket)

---

## 🗄️ PASSO 1: Configurar MongoDB Atlas

### 1.1 Criar Cluster
1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie um novo projeto "Renaildes Cakes"
3. Crie um cluster gratuito (M0)
4. Região: Escolha a mais próxima (ex: São Paulo ou US East)

### 1.2 Configurar Acesso
1. **Database Access**: Crie um usuário
   - Username: `renaildes_admin`
   - Password: Gere uma senha forte e **GUARDE**
   - Role: Atlas Admin

2. **Network Access**: Adicione IP
   - Clique em "Add IP Address"
   - Selecione "Allow Access from Anywhere" (`0.0.0.0/0`)
   - Confirme

### 1.3 Obter String de Conexão
1. Clique em "Connect" no seu cluster
2. Escolha "Connect your application"
3. Driver: Python, Version: 3.12 ou later
4. Copie a string de conexão:
   ```
   mongodb+srv://renaildes_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Substitua** `<password>` pela senha real do usuário

---

## 🔧 PASSO 2: Preparar Código para Deploy

### 2.1 Atualizar backend/.env (NÃO COMMITAR)
Crie um arquivo `.env` **local** apenas para referência. No Render, configuraremos via interface.

```bash
# NÃO COMMITAR ESTE ARQUIVO
MONGO_URL=mongodb+srv://renaildes_admin:SUA_SENHA@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=renaildes_cakes
CORS_ORIGINS=https://seu-frontend.onrender.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=MUDE_ESSA_SENHA_FORTE
JWT_SECRET=gere-uma-chave-aleatoria-segura-aqui
```

### 2.2 Adicionar .gitignore
Certifique-se que o `.gitignore` inclui:
```
*.env
.env.local
.env.production
node_modules/
build/
dist/
```

### 2.3 Fazer Push para o Repositório
```bash
git add .
git commit -m "Preparado para deploy no Render"
git push origin main
```

---

## 🖥️ PASSO 3: Deploy do Backend no Render

### 3.1 Criar Web Service
1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório Git
4. Selecione o repositório "renaildes-cakes"

### 3.2 Configurar Service
- **Name**: `renaildes-cakes-backend`
- **Region**: Oregon (US West) ou Frankfurt (Europe)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: Python 3
- **Build Command**:
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command**:
  ```bash
  uvicorn server:app --host 0.0.0.0 --port $PORT
  ```

### 3.3 Configurar Variáveis de Ambiente
Na seção "Environment Variables", adicione:

| Key | Value |
|-----|-------|
| `MONGO_URL` | `mongodb+srv://renaildes_admin:SUA_SENHA@cluster...` |
| `DB_NAME` | `renaildes_cakes` |
| `CORS_ORIGINS` | `https://renaildes-cakes.onrender.com` (ajustar depois) |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | **SENHA FORTE SEGURA** |
| `JWT_SECRET` | **CHAVE ALEATÓRIA** (ex: use gerador online) |

### 3.4 Deploy
1. Clique em "Create Web Service"
2. Aguarde o build (2-5 minutos)
3. **Copie a URL** gerada (ex: `https://renaildes-cakes-backend.onrender.com`)

### 3.5 Popular Banco de Dados
Após o backend estar rodando:
1. Abra o Shell do Render (botão "Shell" no dashboard)
2. Execute:
   ```bash
   python seed_data.py
   ```
3. Verifique: `✅ 13 produtos inseridos com sucesso!`

---

## 🎨 PASSO 4: Deploy do Frontend no Render

### 4.1 Criar Static Site
1. No Render Dashboard: "New +" → "Static Site"
2. Conecte o mesmo repositório
3. Selecione o repositório

### 4.2 Configurar Site
- **Name**: `renaildes-cakes`
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Build Command**:
  ```bash
  yarn install && yarn build
  ```
- **Publish Directory**: `build`

### 4.3 Configurar Variável de Ambiente
| Key | Value |
|-----|-------|
| `REACT_APP_BACKEND_URL` | `https://renaildes-cakes-backend.onrender.com` |

(Use a URL do backend copiada no PASSO 3.4)

### 4.4 Deploy
1. Clique em "Create Static Site"
2. Aguarde o build (3-7 minutos)
3. Sua URL final será: `https://renaildes-cakes.onrender.com`

---

## 🔄 PASSO 5: Atualizar CORS no Backend

### 5.1 Atualizar Variável
1. Vá para o backend no Render Dashboard
2. Acesse "Environment"
3. Edite `CORS_ORIGINS`
4. Valor: `https://renaildes-cakes.onrender.com`
5. Salve (o serviço reiniciará automaticamente)

---

## ✅ PASSO 6: Testar a Aplicação

### 6.1 Testes Básicos
1. Acesse: `https://renaildes-cakes.onrender.com`
2. Navegue pelo catálogo
3. Personalize um bolo
4. Adicione ao carrinho
5. Faça checkout (use dados de teste)
6. **Verifique**: WhatsApp deve abrir automaticamente!

### 6.2 Testar Admin
1. Acesse: `https://renaildes-cakes.onrender.com/admin`
2. Login: `admin` / Senha que você configurou
3. Verifique pedidos recebidos

---

## 📱 Funcionalidades Ativas

✅ **Personalização Completa de Bolos**
- 8 massas, 17 recheios, 5 coberturas
- Observações especiais
- Preço calculado automaticamente

✅ **Envio Automático para WhatsApp**
- Quando cliente finaliza pedido
- Mensagem formatada com todos os detalhes
- Abre automaticamente: `https://wa.me/5575981777873`

✅ **Carrinho Inteligente**
- Bolos personalizados ficam separados
- Persistente (localStorage)

✅ **Painel Admin**
- Visualiza todos os pedidos
- Detalhes completos de personalização
- Status dos pedidos

---

## 🔧 Manutenção

### Atualizar Código
```bash
git add .
git commit -m "Atualização"
git push origin main
```
O Render fará deploy automático!

### Alterar Senha Admin
1. Render Dashboard → Backend → Environment
2. Edite `ADMIN_PASSWORD`
3. Salve (reinicia automaticamente)

### Adicionar Produtos
1. Edite `/app/backend/seed_data.py`
2. Commit e push
3. No Render Shell: `python seed_data.py`

### Logs
- Backend: Render Dashboard → Logs
- MongoDB: Atlas → Metrics & Logs

---

## 💰 Custos (Plano Gratuito)

- **Render**: Grátis (backend + frontend)
  - Backend hiberna após 15 min de inatividade
  - 750 horas/mês (suficiente para MVP)
- **MongoDB Atlas**: Grátis (M0)
  - 512 MB storage
  - Conexões compartilhadas

**Para produção:** Considere upgrade para evitar hibernação.

---

## 🆘 Troubleshooting

### Backend não inicia
- Verifique logs no Render
- Confirme `MONGO_URL` está correta
- Teste conexão MongoDB Atlas

### Frontend erro 404 nas APIs
- Verifique `REACT_APP_BACKEND_URL`
- Confirme CORS está configurado
- Backend deve ter `/api` nas rotas

### WhatsApp não abre
- Verifique número no código: `5575981777873`
- Teste URL manualmente

---

## 📞 Suporte

- Render: https://render.com/docs
- MongoDB: https://docs.atlas.mongodb.com
- WhatsApp API: https://wa.me/5575981777873

**Desenvolvido com ❤️ para Renaildes Cakes**
