# Sistema de Delivery Pombos-Correio

Sistema de gerenciamento de delivery de cartas utilizando pombos-correio, desenvolvido com Node.js, React.js, SQLite e Tailwind CSS.

## Estrutura do Projeto

### Backend (Node.js)
```
backend/
├── src/
│   ├── controllers/
│   │   ├── pombos/
│   │   ├── clientes/
│   │   └── cartas/
│   ├── models/
│   ├── routes/
│   │   ├── pombos/
│   │   ├── clientes/
│   │   └── cartas/
│   ├── middleware/
│   ├── config/
│   └── utils/
├── public/
└── uploads/
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

## Funcionalidades

### Pombos
- Cadastrar Pombo (Foto + Apelido + Velocidade + Data Nascimento)
- Editar Pombo
- Aposentar Pombo
- Excluir Pombo

### Clientes
- Cadastrar Cliente (Nome + Email + Nascimento + Endereço)
- Editar Cliente
- Ver Clientes
- Excluir Cliente

### Cartas
- Nova Carta (Mensagem + Destinatário + Remetente + Pombo Ativo)
- Atualizar Status (na fila → enviado → entregue)
- Ver Cartas (Listar por Status)

## Tecnologias Utilizadas

- **Backend**: Node.js, Express.js, SQLite
- **Frontend**: React.js, Tailwind CSS
- **Banco de Dados**: SQLite

## Status do Projeto

✅ Estrutura de pastas criada
✅ Configuração do ambiente
⏳ Desenvolvimento do backend
⏳ Desenvolvimento do frontend
⏳ Integração e testes 