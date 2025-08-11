const express = require('express');
const router = express.Router();

// Importar rotas específicas
const pomboRoutes = require('./pombos/pomboRoutes');
const clienteRoutes = require('./clientes/clienteRoutes');
const cartaRoutes = require('./cartas/cartaRoutes');

// Configurar rotas principais
router.use('/pombos', pomboRoutes);
router.use('/clientes', clienteRoutes);
router.use('/cartas', cartaRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Delivery Pombos funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rota de informações da API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Delivery Pombos - Sistema de Entrega por Pombos-Correio',
    version: '1.0.0',
    endpoints: {
      pombos: '/api/pombos',
      clientes: '/api/clientes',
      cartas: '/api/cartas',
      health: '/api/health'
    },
    documentation: 'Consulte o README.md para exemplos de uso'
  });
});

module.exports = router;
