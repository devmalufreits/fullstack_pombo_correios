const { run, get, all } = require('../config/database');

class Pombo {
  constructor(data) {
    this.id = data.id;
    this.apelido = data.apelido;
    this.velocidade = data.velocidade;
    this.data_nascimento = data.data_nascimento;
    this.foto_url = data.foto_url;
    this.ativo = data.ativo;
    this.aposentado = data.aposentado;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Criar um novo pombo
  static async create(pomboData) {
    const { apelido, velocidade, data_nascimento, foto_url } = pomboData;
    
    const sql = `
      INSERT INTO pombos (apelido, velocidade, data_nascimento, foto_url)
      VALUES (?, ?, ?, ?)
    `;
    
    try {
      const result = await run(sql, [apelido, velocidade, data_nascimento, foto_url]);
      return await this.findById(result.id);
    } catch (error) {
      throw new Error(`Erro ao criar pombo: ${error.message}`);
    }
  }

  // Buscar pombo por ID
  static async findById(id) {
    const sql = 'SELECT * FROM pombos WHERE id = ?';
    
    try {
      const row = await get(sql, [id]);
      return row ? new Pombo(row) : null;
    } catch (error) {
      throw new Error(`Erro ao buscar pombo: ${error.message}`);
    }
  }

  // Buscar pombo por apelido
  static async findByApelido(apelido) {
    const sql = 'SELECT * FROM pombos WHERE apelido = ?';
    
    try {
      const row = await get(sql, [apelido]);
      return row ? new Pombo(row) : null;
    } catch (error) {
      throw new Error(`Erro ao buscar pombo: ${error.message}`);
    }
  }

  // Listar todos os pombos
  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM pombos WHERE 1=1';
    const params = [];

    if (filters.ativo !== undefined) {
      sql += ' AND ativo = ?';
      params.push(filters.ativo);
    }

    if (filters.aposentado !== undefined) {
      sql += ' AND aposentado = ?';
      params.push(filters.aposentado);
    }

    sql += ' ORDER BY apelido ASC';

    try {
      const rows = await all(sql, params);
      return rows.map(row => new Pombo(row));
    } catch (error) {
      throw new Error(`Erro ao listar pombos: ${error.message}`);
    }
  }

  // Buscar pombos disponíveis (ativos e não aposentados)
  static async findAvailable() {
    return await this.findAll({ ativo: 1, aposentado: 0 });
  }

  // Atualizar pombo
  async update(updateData) {
    const allowedFields = ['apelido', 'velocidade', 'data_nascimento', 'foto_url', 'ativo', 'aposentado'];
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

    const sql = `UPDATE pombos SET ${fields.join(', ')} WHERE id = ?`;

    try {
      await run(sql, params);
      const updated = await Pombo.findById(this.id);
      Object.assign(this, updated);
      return this;
    } catch (error) {
      throw new Error(`Erro ao atualizar pombo: ${error.message}`);
    }
  }

  // Aposentar pombo
  async aposentar() {
    return await this.update({ aposentado: 1, ativo: 0 });
  }

  // Ativar/desativar pombo
  async toggleAtivo() {
    return await this.update({ ativo: this.ativo ? 0 : 1 });
  }

  // Deletar pombo (soft delete - apenas desativa)
  async delete() {
    return await this.update({ ativo: 0 });
  }

  // Verificar se pombo está disponível para entrega
  isAvailable() {
    return this.ativo && !this.aposentado;
  }

  // Converter para JSON
  toJSON() {
    return {
      id: this.id,
      apelido: this.apelido,
      velocidade: this.velocidade,
      data_nascimento: this.data_nascimento,
      foto_url: this.foto_url,
      ativo: Boolean(this.ativo),
      aposentado: Boolean(this.aposentado),
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Pombo;
