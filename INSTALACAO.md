# Instruções de Instalação - Sistema de Delivery Pombos-Correio

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

1. **Node.js** (versão 16 ou superior)
   - Download: https://nodejs.org/
   - Verificar instalação: `node --version`

2. **npm** (vem com o Node.js)
   - Verificar instalação: `npm --version`

## Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd Oper-Teste-Pratico
```

### 2. Configurar o Backend

```bash
# Entrar na pasta do backend
cd backend

# Instalar dependências
npm install

# Criar arquivo .env (copie do .env.example se existir)
# ou configure as variáveis de ambiente manualmente

# Iniciar o servidor em modo desenvolvimento
npm run dev
```

O backend estará disponível em: `http://localhost:3001`

### 3. Configurar o Frontend

```bash
# Em um novo terminal, entrar na pasta do frontend
cd frontend

# Instalar dependências
npm install

# Iniciar o aplicativo React
npm start
```

O frontend estará disponível em: `http://localhost:3000`

## Estrutura de Arquivos Criada

### Backend
- ✅ `package.json` - Dependências e scripts
- ✅ `src/server.js` - Servidor principal
- ✅ `src/config/config.js` - Configurações
- ✅ `src/config/database.js` - Configuração do SQLite
- ✅ `.gitignore` - Arquivos ignorados pelo Git

### Frontend
- ✅ `package.json` - Dependências e scripts
- ✅ `tailwind.config.js` - Configuração do Tailwind CSS
- ✅ `postcss.config.js` - Configuração do PostCSS
- ✅ `src/index.css` - Estilos globais
- ✅ `src/services/api.js` - Configuração da API
- ✅ `public/index.html` - HTML principal
- ✅ `.gitignore` - Arquivos ignorados pelo Git

## Scripts Disponíveis

### Backend
- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em desenvolvimento com nodemon
- `npm test` - Executa os testes

### Frontend
- `npm start` - Inicia o aplicativo React
- `npm run build` - Cria build de produção
- `npm test` - Executa os testes

## Configurações Importantes

### Variáveis de Ambiente (Backend)
Crie um arquivo `.env` na pasta `backend/` com:

```env
PORT=3001
NODE_ENV=development
DB_PATH=./database/pombos_correio.db
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
```

### Banco de Dados
O SQLite será criado automaticamente na primeira execução em:
`backend/database/pombos_correio.db`

## Próximos Passos

Após a instalação, você pode:

1. **Desenvolver o Backend**:
   - Implementar controllers para Pombos, Clientes e Cartas
   - Criar rotas da API
   - Implementar middlewares de validação

2. **Desenvolver o Frontend**:
   - Criar componentes React
   - Implementar páginas
   - Configurar roteamento

3. **Testar a Aplicação**:
   - Verificar se o backend está rodando: `http://localhost:3001/api/health`
   - Verificar se o frontend está rodando: `http://localhost:3000`

## Solução de Problemas

### Erro: "npm não é reconhecido"
- Instale o Node.js: https://nodejs.org/
- Reinicie o terminal após a instalação

### Erro: "Porta já em uso"
- Mude a porta no arquivo de configuração
- Ou pare o processo que está usando a porta

### Erro de CORS
- Verifique se o `CORS_ORIGIN` está configurado corretamente
- Certifique-se de que o frontend está rodando na porta 3000

## Suporte

Para dúvidas ou problemas, consulte:
- Documentação do Node.js: https://nodejs.org/docs/
- Documentação do React: https://reactjs.org/docs/
- Documentação do Tailwind CSS: https://tailwindcss.com/docs 