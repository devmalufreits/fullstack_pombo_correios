require('dotenv').config();

module.exports = {
  // Configurações do Servidor
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Configurações do Banco de Dados
  dbPath: process.env.DB_PATH || './database/pombos_correio.db',
  
  // Configurações de Upload
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
  
  // Configurações de Segurança
  jwtSecret: process.env.JWT_SECRET || 'pombos_correio_secret_key_2024',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // Configurações CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Configurações de Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutos
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
}; 