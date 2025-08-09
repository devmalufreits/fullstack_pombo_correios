const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const config = require('./config');

// Garantir que o diretório do banco existe
const dbDir = path.dirname(config.dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Criar conexão com o banco
const db = new sqlite3.Database(config.dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar com o banco de dados:', err.message);
  } else {
    console.log('✅ Conectado ao banco de dados SQLite');
    initializeTables();
  }
});

// Inicializar tabelas
function initializeTables() {
  // Tabela de Pombos
  db.run(`CREATE TABLE IF NOT EXISTS pombos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    apelido TEXT NOT NULL UNIQUE,
    velocidade REAL NOT NULL,
    data_nascimento TEXT NOT NULL,
    foto_url TEXT,
    ativo BOOLEAN DEFAULT 1,
    aposentado BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de Clientes
  db.run(`CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    data_nascimento TEXT NOT NULL,
    endereco TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de Cartas
  db.run(`CREATE TABLE IF NOT EXISTS cartas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mensagem TEXT NOT NULL,
    destinatario_id INTEGER NOT NULL,
    remetente_id INTEGER NOT NULL,
    pombo_id INTEGER NOT NULL,
    status TEXT DEFAULT 'na_fila' CHECK (status IN ('na_fila', 'enviado', 'entregue')),
    data_envio DATETIME,
    data_entrega DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (destinatario_id) REFERENCES clientes (id),
    FOREIGN KEY (remetente_id) REFERENCES clientes (id),
    FOREIGN KEY (pombo_id) REFERENCES pombos (id)
  )`);

  console.log('📋 Tabelas inicializadas com sucesso');
}

// Função para executar queries com Promise
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

// Função para buscar uma linha
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Função para buscar múltiplas linhas
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = {
  db,
  run,
  get,
  all
}; 