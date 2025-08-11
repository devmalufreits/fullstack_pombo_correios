# Sistema de Delivery Pombos-Correio

Sistema de gerenciamento de delivery de cartas utilizando pombos-correio, desenvolvido com Node.js, React.js, SQLite e Tailwind CSS.

## Repositório

URL: https://github.com/devmalufreits/fullstack_pombo_correios.git

Para clonar e iniciar rapidamente:

```bash
git clone https://github.com/devmalufreits/fullstack_pombo_correios.git
cd fullstack_pombo_correios

# Backend
cd backend && npm install && npm run dev

# Em outro terminal
cd ../frontend && npm install && npm start
```

Para instruções detalhadas de instalação e variáveis de ambiente, consulte `INSTALACAO.md`.

## Estrutura do Projeto

### Backend (Node.js)
```
backend/
├── src/
│   ├── controllers/
│   │   ├── pombos/pomboController.js
│   │   ├── clientes/clienteController.js
│   │   └── cartas/cartaController.js
│   ├── models/
│   │   ├── Pombo.js
│   │   ├── Cliente.js
│   │   └── Carta.js
│   ├── routes/
│   │   ├── pombos/pomboRoutes.js
│   │   ├── clientes/clienteRoutes.js
│   │   ├── cartas/cartaRoutes.js
│   │   └── index.js
│   ├── config/
│   │   ├── database.js
│   │   └── config.js
│   └── server.js
├── public/
└── uploads/pombos/
```

### Frontend (React.js)
```
frontend/
├── src/
│   ├── components/
│   │   ├── pombos/
│   │   ├── clientes/
│   │   ├── cartas/
│   │   ├── layout/
│   │   └── ui/
│   ├── pages/
│   │   ├── pombos/
│   │   ├── clientes/
│   │   └── cartas/
│   ├── services/
│   ├── utils/
│   ├── assets/
│   └── hooks/
└── public/
```

## Status do Projeto

✅ Estrutura de pastas criada
✅ Configuração do ambiente
✅ Banco de dados SQLite configurado
✅ Models (Pombo, Cliente, Carta) implementados
✅ Controllers implementados
✅ Rotas RESTful criadas
✅ Frontend: estrutura criada e primeiras páginas de listagem (Pombos, Clientes, Cartas) implementadas
⏳ Integração e testes

## API Endpoints

### Base URL
```
http://localhost:3001/api
```

Observações:
- O frontend (CRA) roda em http://localhost:3000.
- O `frontend/package.json` possui `"proxy": "http://localhost:3001"`, permitindo chamadas a `/api` sem CORS durante desenvolvimento.
- Alternativamente, defina `REACT_APP_API_URL` no `.env` do frontend para apontar explicitamente ao backend.

### 📦 Pombos

#### Listar Pombos
```http
GET /api/pombos
GET /api/pombos?ativo=true&aposentado=false
```

#### Buscar Pombos Disponíveis
```http
GET /api/pombos/available
```

#### Buscar Pombo por ID
```http
GET /api/pombos/:id
```

#### Cadastrar Pombo
```http
POST /api/pombos
Content-Type: multipart/form-data

{
  "apelido": "Flash",
  "velocidade": 45.5,
  "data_nascimento": "2023-01-15",
  "foto": [arquivo de imagem]
}
```

#### Atualizar Pombo
```http
PUT /api/pombos/:id
Content-Type: multipart/form-data

{
  "apelido": "Flash Atualizado",
  "velocidade": 50.0,
  "foto": [arquivo de imagem]
}
```

#### Aposentar Pombo
```http
PATCH /api/pombos/:id/retire
```

#### Excluir Pombo
```http
DELETE /api/pombos/:id
```

### 👤 Clientes

#### Listar Clientes
```http
GET /api/clientes
GET /api/clientes?page=1&limit=10&nome=João
```

#### Buscar Cliente por ID
```http
GET /api/clientes/:id
```

#### Buscar Cliente por Email
```http
GET /api/clientes/email/:email
```

#### Buscar Clientes por Nome
```http
GET /api/clientes/search?nome=João
```

#### Buscar Cartas do Cliente
```http
GET /api/clientes/:id/cartas?tipo=enviadas
GET /api/clientes/:id/cartas?tipo=recebidas
GET /api/clientes/:id/cartas?tipo=todas
```

#### Cadastrar Cliente
```http
POST /api/clientes
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@email.com",
  "data_nascimento": "1990-05-15",
  "endereco": "Rua das Flores, 123, Centro"
}
```

#### Atualizar Cliente
```http
PUT /api/clientes/:id
Content-Type: application/json

{
  "nome": "João Silva Santos",
  "endereco": "Rua Nova, 456, Bairro Novo"
}
```

#### Validar Dados do Cliente
```http
POST /api/clientes/validate
Content-Type: application/json

{
  "nome": "João",
  "email": "joao@email.com",
  "data_nascimento": "1990-05-15",
  "endereco": "Rua das Flores, 123"
}
```

#### Excluir Cliente
```http
DELETE /api/clientes/:id
```

### ✉️ Cartas

#### Listar Cartas
```http
GET /api/cartas
GET /api/cartas?status=na_fila&page=1&limit=10
GET /api/cartas?remetente_id=1&destinatario_id=2
```

#### Buscar Carta por ID
```http
GET /api/cartas/:id
```

#### Buscar Cartas por Status
```http
GET /api/cartas/fila
GET /api/cartas/enviadas
GET /api/cartas/entregues
GET /api/cartas/atrasadas
```

#### Estatísticas das Cartas
```http
GET /api/cartas/estatisticas
```

#### Cadastrar Carta
```http
POST /api/cartas
Content-Type: application/json

{
  "mensagem": "Olá! Como você está?",
  "remetente_id": 1,
  "destinatario_id": 2,
  "pombo_id": 1
}
```

#### Atualizar Status da Carta
```http
PUT /api/cartas/:id/status
Content-Type: application/json

{
  "status": "enviado"
}
```

#### Marcar como Enviada
```http
PATCH /api/cartas/:id/enviar
```

#### Marcar como Entregue
```http
PATCH /api/cartas/:id/entregar
```

#### Atualizar Mensagem
```http
PATCH /api/cartas/:id/mensagem
Content-Type: application/json

{
  "mensagem": "Nova mensagem atualizada"
}
```

#### Excluir Carta
```http
DELETE /api/cartas/:id
```

## Regras de Negócio

### Pombos
- ✅ Apelido deve ser único
- ✅ Velocidade deve ser um número positivo
- ✅ Pombos aposentados não podem ser usados para entregas
- ✅ Pombos aposentados não podem ser editados nem excluídos
- ✅ Upload de fotos (jpeg, jpg, png, gif) até 5MB
- ✅ Soft delete (quando permitido; bloqueado para aposentados)

### Clientes
- ✅ Email deve ser único e válido
- ✅ Nome deve ter pelo menos 2 caracteres
- ✅ Endereço deve ter pelo menos 5 caracteres
- ✅ Não pode excluir cliente com cartas associadas

### Cartas
- ✅ Remetente e destinatário devem ser diferentes
- ✅ Pombo deve estar ativo e não aposentado
- ✅ Status segue fluxo: `na_fila` → `enviado` → `entregue`
- ✅ Status "entregue" não pode ser alterado
- ✅ Só pode excluir cartas que estão na fila
- ✅ Cartas são consideradas atrasadas após 24h enviadas

## Tecnologias Utilizadas

- **Backend**: Node.js, Express.js, SQLite, Multer
- **Frontend**: React.js, Tailwind CSS
- **Banco de Dados**: SQLite
- **Upload**: Multer para fotos dos pombos

## Como Executar

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Frontend

### Estrutura criada
```
frontend/
├── src/
│   ├── index.js
│   ├── App.jsx
│   ├── pages/
│   │   ├── pombos/PombosList.jsx
│   │   ├── clientes/ClientesList.jsx
│   │   └── cartas/CartasList.jsx
│   └── services/api.js
└── public/index.html
```

### Rotas (SPA)
- `/pombos`: lista de pombos
- `/clientes`: lista de clientes
- `/cartas`: lista de cartas

### Serviços de API
`src/services/api.js` alinhado às rotas do backend:
- Pombos: `getAll`, `getAvailable`, `getById`, `create`, `update`, `retire`, `delete`
- Clientes: `getAll`, `searchByName`, `getById`, `getByEmail`, `getCartas`, `create`, `validate`, `update`, `delete`
- Cartas: `getAll`, `getFila`, `getEnviadas`, `getEntregues`, `getAtrasadas`, `getEstatisticas`, `getById`, `create`, `updateStatus`, `markAsSent`, `markAsDelivered`, `updateMensagem`, `delete`

## Exemplos de Resposta

### Sucesso
```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": { ... }
}
```

### Erro
```json
{
  "success": false,
  "message": "Descrição do erro",
  "errors": ["Lista de erros específicos"]
}