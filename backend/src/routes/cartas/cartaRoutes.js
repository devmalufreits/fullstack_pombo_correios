const express = require('express');
const router = express.Router();
const CartaController = require('../../controllers/cartas/cartaController');

// Rotas para Cartas

// GET /api/cartas - Listar todas as cartas (com filtros e paginação)
router.get('/', CartaController.getCartas);

// GET /api/cartas/fila - Buscar cartas na fila
router.get('/fila', CartaController.getCartasNaFila);

// GET /api/cartas/enviadas - Buscar cartas enviadas
router.get('/enviadas', CartaController.getCartasEnviadas);

// GET /api/cartas/entregues - Buscar cartas entregues
router.get('/entregues', CartaController.getCartasEntregues);

// GET /api/cartas/atrasadas - Buscar cartas atrasadas
router.get('/atrasadas', CartaController.getCartasAtrasadas);

// GET /api/cartas/estatisticas - Estatísticas das cartas
router.get('/estatisticas', CartaController.getEstatisticas);

// GET /api/cartas/:id - Buscar carta por ID
router.get('/:id', CartaController.getCartaById);

// POST /api/cartas - Cadastrar nova carta
router.post('/', CartaController.createCarta);

// PUT /api/cartas/:id/status - Atualizar status da carta
router.put('/:id/status', CartaController.updateStatus);

// PATCH /api/cartas/:id/enviar - Marcar carta como enviada
router.patch('/:id/enviar', CartaController.markAsSent);

// PATCH /api/cartas/:id/entregar - Marcar carta como entregue
router.patch('/:id/entregar', CartaController.markAsDelivered);

// PATCH /api/cartas/:id/mensagem - Atualizar mensagem da carta
router.patch('/:id/mensagem', CartaController.updateMensagem);

// DELETE /api/cartas/:id - Excluir carta (apenas se na fila)
router.delete('/:id', CartaController.deleteCarta);

module.exports = router;
