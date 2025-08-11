const { run, get, all } = require('../config/database');

class Cliente {
  constructor(data) {
    this.id = data.id;
    this.nome = data.nome;
    this.email = data.email;
    this.data_nascimento = data.data_nascimento;
    this.endereco = data.endereco;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Criar um novo cliente
  static async create(clienteData) {
    const { nome, email, data_nascimento, endereco } = clienteData;
    
    const sql = `
      INSERT INTO clientes (nome, email, data_nascimento, endereco)
      VALUES (?, ?, ?, ?)
    `;
    
    try {
      const result = await run(sql, [nome, email, data_nascimento, endereco]);
      return await this.findById(result.id);
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Email já está em uso');
      }
      throw new Error(`Erro ao criar cliente: ${error.message}`);
    }
  }

  // Buscar cliente por ID
  static async findById(id) {
    const sql = 'SELECT * FROM clientes WHERE id = ?';
    
    try {
      const row = await get(sql, [id]);
      return row ? new Cliente(row) : null;
    } catch (error) {
      throw new Error(`Erro ao buscar cliente: ${error.message}`);
    }
  }

  // Buscar cliente por email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM clientes WHERE email = ?';
    
    try {
      const row = await get(sql, [email]);
      return row ? new Cliente(row) : null;
    } catch (error) {
      throw new Error(`Erro ao buscar cliente: ${error.message}`);
    }
  }

  // Listar todos os clientes
  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM clientes WHERE 1=1';
    const params = [];

    if (filters.nome) {
      sql += ' AND nome LIKE ?';
      params.push(`%${filters.nome}%`);
    }

    if (filters.email) {
      sql += ' AND email LIKE ?';
      params.push(`%${filters.email}%`);
    }

    sql += ' ORDER BY nome ASC';

    try {
      const rows = await all(sql, params);
      return rows.map(row => new Cliente(row));
    } catch (error) {
      throw new Error(`Erro ao listar clientes: ${error.message}`);
    }
  }

  // Buscar clientes por nome (busca parcial)
  static async findByName(nome) {
    return await this.findAll({ nome });
  }

  // Atualizar cliente
  async update(updateData) {
    const allowedFields = ['nome', 'email', 'data_nascimento', 'endereco'];
    const fields = [];
    const params = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (fields.length === 0) {
      throw new Error('Nenhum campo válido para atualizar');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(this.id);

    const sql = `UPDATE clientes SET ${fields.join(', ')} WHERE id = ?`;

    try {
      await run(sql, params);
      const updated = await Cliente.findById(this.id);
      Object.assign(this, updated);
      return this;
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Email já está em uso');
      }
      throw new Error(`Erro ao atualizar cliente: ${error.message}`);
    }
  }

  // Deletar cliente (hard delete - cuidado com relacionamentos)
  async delete() {
    // Verificar se cliente tem cartas associadas
    const cartasEnviadas = await all(
      'SELECT COUNT(*) as count FROM cartas WHERE remetente_id = ?',
      [this.id]
    );
    
    const cartasRecebidas = await all(
      'SELECT COUNT(*) as count FROM cartas WHERE destinatario_id = ?',
      [this.id]
    );

    if (cartasEnviadas[0].count > 0 || cartasRecebidas[0].count > 0) {
      throw new Error('Não é possível deletar cliente com cartas associadas');
    }

    const sql = 'DELETE FROM clientes WHERE id = ?';
    
    try {
      await run(sql, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Erro ao deletar cliente: ${error.message}`);
    }
  }

  // Buscar cartas enviadas pelo cliente
  async getCartasEnviadas() {
    const Carta = require('./Carta');
    return await Carta.findByRemetente(this.id);
  }

  // Buscar cartas recebidas pelo cliente
  async getCartasRecebidas() {
    const Carta = require('./Carta');
    return await Carta.findByDestinatario(this.id);
  }

  // Buscar todas as cartas do cliente (enviadas e recebidas)
  async getAllCartas() {
    const cartasEnviadas = await this.getCartasEnviadas();
    const cartasRecebidas = await this.getCartasRecebidas();
    
    return {
      enviadas: cartasEnviadas,
      recebidas: cartasRecebidas,
      total: cartasEnviadas.length + cartasRecebidas.length
    };
  }

  // Validar email
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar dados do cliente
  static validateData(clienteData) {
    const errors = [];

    if (!clienteData.nome || clienteData.nome.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    if (!clienteData.email || !this.isValidEmail(clienteData.email)) {
      errors.push('Email inválido');
    }

    if (!clienteData.data_nascimento) {
      errors.push('Data de nascimento é obrigatória');
    }

    if (!clienteData.endereco || clienteData.endereco.trim().length < 5) {
      errors.push('Endereço deve ter pelo menos 5 caracteres');
    }

    return errors;
  }

  // Converter para JSON
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      data_nascimento: this.data_nascimento,
      endereco: this.endereco,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Cliente;
