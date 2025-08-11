const express = require('express');
const router = express.Router();
const ClienteController = require('../../controllers/clientes/clienteController');

// Rotas para Clientes

// GET /api/clientes - Listar todos os clientes (com paginação e filtros)
router.get('/', ClienteController.getClientes);

// GET /api/clientes/search - Buscar clientes por nome
router.get('/search', ClienteController.searchClientesByName);

// GET /api/clientes/:id - Buscar cliente por ID
router.get('/:id', ClienteController.getClienteById);

// GET /api/clientes/:id/cartas - Buscar cartas do cliente
router.get('/:id/cartas', ClienteController.getClienteCartas);

// GET /api/clientes/email/:email - Buscar cliente por email
router.get('/email/:email', ClienteController.getClienteByEmail);

// POST /api/clientes - Cadastrar novo cliente
router.post('/', ClienteController.createCliente);

// POST /api/clientes/validate - Validar dados do cliente
router.post('/validate', ClienteController.validateClienteData);

// PUT /api/clientes/:id - Atualizar dados do cliente
router.put('/:id', ClienteController.updateCliente);

// DELETE /api/clientes/:id - Excluir cliente
router.delete('/:id', ClienteController.deleteCliente);

module.exports = router;
