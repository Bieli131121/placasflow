# 🪪 PlacasFlow — Sistema de Gestão de Placas

Sistema web para despachantes gerenciarem pedidos de placas, clientes, fábricas e controle financeiro.

---

## 🚀 Como colocar online (passo a passo)

### ETAPA 1 — Criar conta no Firebase (banco de dados + login)

1. Acesse https://console.firebase.google.com
2. Clique em **"Criar um projeto"**
3. Dê o nome **placasflow** → clique em Continuar
4. Desative o Google Analytics → clique em **Criar projeto**
5. Na tela do projeto, clique em **"</> Web"** para adicionar um app
6. Coloque o nome **placasflow-web** → clique em **Registrar app**
7. **COPIE o objeto `firebaseConfig`** que aparecer — você vai precisar no próximo passo

---

### ETAPA 2 — Ativar o banco de dados (Firestore)

1. No menu lateral do Firebase, clique em **Firestore Database**
2. Clique em **Criar banco de dados**
3. Selecione **Modo de teste** → clique em Avançar
4. Escolha a região `us-east1` → clique em **Ativar**

---

### ETAPA 3 — Ativar autenticação (login/senha)

1. No menu lateral, clique em **Authentication**
2. Clique em **Começar**
3. Clique em **E-mail/senha** → ative a primeira opção → **Salvar**
4. Vá em **Usuários** → clique em **Adicionar usuário**
5. Crie os usuários da sua equipe (e-mail + senha)

---

### ETAPA 4 — Colocar as configurações do Firebase no projeto

Abra o arquivo `src/lib/firebase.js` e substitua pelos dados que você copiou no Passo 1:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "placasflow.firebaseapp.com",
  projectId: "placasflow",
  storageBucket: "placasflow.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
}
```

---

### ETAPA 5 — Publicar na Vercel (domínio gratuito)

1. Acesse https://github.com e crie uma conta gratuita
2. Crie um repositório chamado **placasflow** (público ou privado)
3. Faça upload de todos os arquivos desta pasta para o repositório
4. Acesse https://vercel.com → crie conta com sua conta do GitHub
5. Clique em **"Add New Project"** → selecione o repositório **placasflow**
6. Clique em **Deploy** — pronto!
7. Seu link será algo como: **https://placasflow.vercel.app**

---

## 💻 Rodar localmente (para testar antes de publicar)

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev

# Abrir no navegador: http://localhost:5173
```

---

## 📁 Estrutura do projeto

```
placasflow/
├── src/
│   ├── lib/
│   │   └── firebase.js        ← Configurações do Firebase ⚠️
│   ├── contexts/
│   │   └── AuthContext.jsx    ← Gerenciamento de login
│   ├── hooks/
│   │   └── useFirestore.js    ← Acesso ao banco de dados
│   ├── components/
│   │   ├── Layout.jsx         ← Sidebar + header
│   │   └── Badge.jsx          ← Componentes visuais
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── PedidosPage.jsx
│   │   ├── NovoPedidoPage.jsx
│   │   ├── ClientesPage.jsx
│   │   ├── NovoClientePage.jsx
│   │   ├── FabricasPage.jsx
│   │   ├── NovaFabricaPage.jsx
│   │   └── FinanceiroPage.jsx
│   ├── App.jsx                ← Rotas do sistema
│   ├── main.jsx               ← Ponto de entrada
│   └── index.css              ← Estilos globais
├── index.html
├── vite.config.js
└── package.json
```

---

## ✅ Funcionalidades

- 🔐 Login individual por usuário
- 📊 Dashboard com estatísticas em tempo real
- 📋 Gestão de pedidos de placas
- 👥 Cadastro de clientes (CPF, RG, endereço)
- 🏭 Cadastro de fábricas de placas
- 💰 Controle financeiro:
  - Recebimentos dos clientes (pago / aguardando / parcelado)
  - Pagamentos à fábrica (pago / a pagar)
- ☁️ Dados salvos na nuvem em tempo real
- 👥 Múltiplos usuários simultaneamente

---

## 🆓 Custos

| Serviço | Plano | Custo |
|---------|-------|-------|
| Firebase | Spark (gratuito) | R$ 0 |
| Vercel | Hobby (gratuito) | R$ 0 |
| Domínio .vercel.app | Incluso | R$ 0 |

> Para um domínio personalizado (ex: placasflow.com.br), custa em torno de R$ 40/ano.
