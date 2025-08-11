const express = require('express');
const router = express.Router();
const PomboController = require('../../controllers/pombos/pomboController');

// Middleware para upload de foto
const uploadPhoto = PomboController.uploadPhoto;

// Rotas para Pombos

// GET /api/pombos - Listar todos os pombos (com filtros opcionais)
router.get('/', PomboController.getPombos);

// GET /api/pombos/available - Buscar pombos disponíveis
router.get('/available', PomboController.getAvailablePombos);

// GET /api/pombos/:id - Buscar pombo por ID
router.get('/:id', PomboController.getPomboById);

// POST /api/pombos - Cadastrar novo pombo (com foto)
router.post('/', uploadPhoto, PomboController.createPombo);

// PUT /api/pombos/:id - Atualizar dados do pombo (com foto)
router.put('/:id', uploadPhoto, PomboController.updatePombo);

// PATCH /api/pombos/:id/retire - Marcar pombo como aposentado
router.patch('/:id/retire', PomboController.retirePombo);

// [REMOVIDO] Rota de ativar/desativar pombo foi descontinuada

// DELETE /api/pombos/:id - Excluir pombo
router.delete('/:id', PomboController.deletePombo);

module.exports = router;
