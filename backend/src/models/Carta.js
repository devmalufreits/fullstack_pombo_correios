const { run, get, all } = require('../config/database');

class Carta {
  constructor(data) {
    this.id = data.id;
    this.mensagem = data.mensagem;
    this.destinatario_id = data.destinatario_id;
    this.remetente_id = data.remetente_id;
    this.pombo_id = data.pombo_id;
    this.status = data.status;
    this.data_envio = data.data_envio;
    this.data_entrega = data.data_entrega;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Criar uma nova carta
  static async create(cartaData) {
    const { mensagem, destinatario_id, remetente_id, pombo_id } = cartaData;
    
    // Validar se os IDs existem
    await this.validateRelationships(remetente_id, destinatario_id, pombo_id);
    
    const sql = `
      INSERT INTO cartas (mensagem, destinatario_id, remetente_id, pombo_id, status)
      VALUES (?, ?, ?, ?, 'na_fila')
    `;
    
    try {
      const result = await run(sql, [mensagem, destinatario_id, remetente_id, pombo_id]);
      return await this.findById(result.id);
    } catch (error) {
      throw new Error(`Erro ao criar carta: ${error.message}`);
    }
  }

  // Validar relacionamentos
  static async validateRelationships(remetente_id, destinatario_id, pombo_id) {
    const Cliente = require('./Cliente');
    const Pombo = require('./Pombo');

    // Verificar se remetente existe
    const remetente = await Cliente.findById(remetente_id);
    if (!remetente) {
      throw new Error('Remetente não encontrado');
    }

    // Verificar se destinatário existe
    const destinatario = await Cliente.findById(destinatario_id);
    if (!destinatario) {
      throw new Error('Destinatário não encontrado');
    }

    // Verificar se pombo existe e está disponível
    const pombo = await Pombo.findById(pombo_id);
    if (!pombo) {
      throw new Error('Pombo não encontrado');
    }

    if (!pombo.isAvailable()) {
      throw new Error('Pombo não está disponível para entrega');
    }

    // Verificar se remetente e destinatário são diferentes
    if (remetente_id === destinatario_id) {
      throw new Error('Remetente e destinatário devem ser diferentes');
    }

    return true;
  }

  // Buscar carta por ID
  static async findById(id) {
    const sql = 'SELECT * FROM cartas WHERE id = ?';
    
    try {
      const row = await get(sql, [id]);
      return row ? new Carta(row) : null;
    } catch (error) {
      throw new Error(`Erro ao buscar carta: ${error.message}`);
    }
  }

  // Listar todas as cartas
  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM cartas WHERE 1=1';
    const params = [];

    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.remetente_id) {
      sql += ' AND remetente_id = ?';
      params.push(filters.remetente_id);
    }

    if (filters.destinatario_id) {
      sql += ' AND destinatario_id = ?';
      params.push(filters.destinatario_id);
    }

    if (filters.pombo_id) {
      sql += ' AND pombo_id = ?';
      params.push(filters.pombo_id);
    }

    sql += ' ORDER BY created_at DESC';

    try {
      const rows = await all(sql, params);
      return rows.map(row => new Carta(row));
    } catch (error) {
      throw new Error(`Erro ao listar cartas: ${error.message}`);
    }
  }

  // Buscar cartas por remetente
  static async findByRemetente(remetente_id) {
    return await this.findAll({ remetente_id });
  }

  // Buscar cartas por destinatário
  static async findByDestinatario(destinatario_id) {
    return await this.findAll({ destinatario_id });
  }

  // Buscar cartas por pombo
  static async findByPombo(pombo_id) {
    return await this.findAll({ pombo_id });
  }

  // Buscar cartas por status
  static async findByStatus(status) {
    return await this.findAll({ status });
  }

  // Buscar cartas na fila
  static async findInQueue() {
    return await this.findByStatus('na_fila');
  }

  // Buscar cartas enviadas
  static async findSent() {
    return await this.findByStatus('enviado');
  }

  // Buscar cartas entregues
  static async findDelivered() {
    return await this.findByStatus('entregue');
  }

  // Atualizar status da carta
  async updateStatus(newStatus) {
    const validStatuses = ['na_fila', 'enviado', 'entregue'];
    
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Status inválido');
    }

    const updateData = { status: newStatus };

    // Adicionar timestamps baseados no status
    if (newStatus === 'enviado' && this.status === 'na_fila') {
      updateData.data_envio = new Date().toISOString();
    } else if (newStatus === 'entregue' && this.status === 'enviado') {
      updateData.data_entrega = new Date().toISOString();
    } else if (newStatus === 'na_fila' && this.status === 'enviado') {
      // Reversão: voltar para fila deve limpar timestamps de envio/entrega
      updateData.data_envio = null;
      updateData.data_entrega = null;
    }

    return await this.update(updateData);
  }

  // Marcar como enviada
  async markAsSent() {
    return await this.updateStatus('enviado');
  }

  // Marcar como entregue
  async markAsDelivered() {
    return await this.updateStatus('entregue');
  }

  // Atualizar carta
  async update(updateData) {
    const allowedFields = ['mensagem', 'status', 'data_envio', 'data_entrega'];
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

    const sql = `UPDATE cartas SET ${fields.join(', ')} WHERE id = ?`;

    try {
      await run(sql, params);
      const updated = await Carta.findById(this.id);
      Object.assign(this, updated);
      return this;
    } catch (error) {
      throw new Error(`Erro ao atualizar carta: ${error.message}`);
    }
  }

  // Deletar carta
  async delete() {
    // Só permitir deletar cartas que ainda estão na fila
    if (this.status !== 'na_fila') {
      throw new Error('Só é possível deletar cartas que ainda estão na fila');
    }

    const sql = 'DELETE FROM cartas WHERE id = ?';
    
    try {
      await run(sql, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Erro ao deletar carta: ${error.message}`);
    }
  }

  // Buscar dados completos da carta com relacionamentos
  async getFullData() {
    const Cliente = require('./Cliente');
    const Pombo = require('./Pombo');

    try {
      const [remetente, destinatario, pombo] = await Promise.all([
        Cliente.findById(this.remetente_id),
        Cliente.findById(this.destinatario_id),
        Pombo.findById(this.pombo_id)
      ]);

      return {
        ...this.toJSON(),
        remetente: remetente ? remetente.toJSON() : null,
        destinatario: destinatario ? destinatario.toJSON() : null,
        pombo: pombo ? pombo.toJSON() : null
      };
    } catch (error) {
      throw new Error(`Erro ao buscar dados completos: ${error.message}`);
    }
  }

  // Calcular tempo de entrega (se entregue)
  getDeliveryTime() {
    if (this.status !== 'entregue' || !this.data_envio || !this.data_entrega) {
      return null;
    }

    const envio = new Date(this.data_envio);
    const entrega = new Date(this.data_entrega);
    const diffMs = entrega - envio;
    
    return {
      milliseconds: diffMs,
      seconds: Math.floor(diffMs / 1000),
      minutes: Math.floor(diffMs / (1000 * 60)),
      hours: Math.floor(diffMs / (1000 * 60 * 60))
    };
  }

  // Verificar se carta está atrasada (mais de 24h enviada)
  isOverdue() {
    if (this.status !== 'enviado' || !this.data_envio) {
      return false;
    }

    const envio = new Date(this.data_envio);
    const agora = new Date();
    const diffHours = (agora - envio) / (1000 * 60 * 60);
    
    return diffHours > 24;
  }

  // Validar dados da carta
  static validateData(cartaData) {
    const errors = [];

    if (!cartaData.mensagem || cartaData.mensagem.trim().length < 1) {
      errors.push('Mensagem é obrigatória');
    }

    if (cartaData.mensagem && cartaData.mensagem.length > 1000) {
      errors.push('Mensagem não pode ter mais de 1000 caracteres');
    }

    if (!cartaData.remetente_id) {
      errors.push('Remetente é obrigatório');
    }

    if (!cartaData.destinatario_id) {
      errors.push('Destinatário é obrigatório');
    }

    if (!cartaData.pombo_id) {
      errors.push('Pombo é obrigatório');
    }

    if (cartaData.remetente_id === cartaData.destinatario_id) {
      errors.push('Remetente e destinatário devem ser diferentes');
    }

    return errors;
  }

  // Converter para JSON
  toJSON() {
    return {
      id: this.id,
      mensagem: this.mensagem,
      destinatario_id: this.destinatario_id,
      remetente_id: this.remetente_id,
      pombo_id: this.pombo_id,
      status: this.status,
      data_envio: this.data_envio,
      data_entrega: this.data_entrega,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Carta;
