const Carta = require('../../models/Carta');
const Cliente = require('../../models/Cliente');
const Pombo = require('../../models/Pombo');

class CartaController {
  // Cadastrar carta (mensagem, endereço, remetente, destinatário, pombo)
  static async createCarta(req, res) {
    try {
      const { mensagem, remetente_id, destinatario_id, pombo_id } = req.body;

      // Validação dos dados
      const errors = Carta.validateData({ mensagem, remetente_id, destinatario_id, pombo_id });
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors
        });
      }

      // Validar relacionamentos (remetente, destinatário, pombo)
      try {
        await Carta.validateRelationships(remetente_id, destinatario_id, pombo_id);
      } catch (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError.message
        });
      }

      // Criar carta
      const cartaData = {
        mensagem: mensagem.trim(),
        remetente_id: parseInt(remetente_id),
        destinatario_id: parseInt(destinatario_id),
        pombo_id: parseInt(pombo_id)
      };

      const novaCarta = await Carta.create(cartaData);

      // Buscar dados completos da carta para resposta
      const cartaCompleta = await novaCarta.getFullData();

      res.status(201).json({
        success: true,
        message: 'Carta cadastrada com sucesso',
        data: cartaCompleta
      });

    } catch (error) {
      console.error('Erro ao criar carta:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Atualizar status (fila → enviado → entregue)
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Buscar carta
      const carta = await Carta.findById(id);
      if (!carta) {
        return res.status(404).json({
          success: false,
          message: 'Carta não encontrada'
        });
      }

      // Validar que status "entregue" não pode ser alterado
      if (carta.status === 'entregue') {
        return res.status(400).json({
          success: false,
          message: 'Status "entregue" não pode ser alterado'
        });
      }

      // Validar transições de status
      // Permitimos retornar de "enviado" para "na_fila" (voltar para a fila)
      const validTransitions = {
        'na_fila': ['enviado'],
        'enviado': ['entregue', 'na_fila']
      };

      if (!validTransitions[carta.status] || !validTransitions[carta.status].includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Transição inválida: não é possível alterar de "${carta.status}" para "${status}"`
        });
      }

      // Atualizar status
      const cartaAtualizada = await carta.updateStatus(status);

      // Buscar dados completos da carta para resposta
      const cartaCompleta = await cartaAtualizada.getFullData();

      res.json({
        success: true,
        message: `Status atualizado para "${status}" com sucesso`,
        data: cartaCompleta
      });

    } catch (error) {
      console.error('Erro ao atualizar status da carta:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Listar cartas por status
  static async getCartas(req, res) {
    try {
      const { status, remetente_id, destinatario_id, pombo_id, page = 1, limit = 10 } = req.query;

      // Preparar filtros
      const filters = {};
      if (status) {
        const validStatuses = ['na_fila', 'enviado', 'entregue'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            message: 'Status inválido. Use: na_fila, enviado ou entregue'
          });
        }
        filters.status = status;
      }

      if (remetente_id) {
        filters.remetente_id = parseInt(remetente_id);
      }

      if (destinatario_id) {
        filters.destinatario_id = parseInt(destinatario_id);
      }

      if (pombo_id) {
        filters.pombo_id = parseInt(pombo_id);
      }

      // Buscar cartas
      const cartas = await Carta.findAll(filters);

      // Buscar dados completos para cada carta
      const cartasCompletas = await Promise.all(
        cartas.map(carta => carta.getFullData())
      );

      // Implementar paginação simples
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;

      const paginatedCartas = cartasCompletas.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedCartas,
        pagination: {
          current_page: pageNum,
          per_page: limitNum,
          total: cartasCompletas.length,
          total_pages: Math.ceil(cartasCompletas.length / limitNum)
        },
        filters: filters
      });

    } catch (error) {
      console.error('Erro ao listar cartas:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Buscar carta por ID
  static async getCartaById(req, res) {
    try {
      const { id } = req.params;

      const carta = await Carta.findById(id);
      if (!carta) {
        return res.status(404).json({
          success: false,
          message: 'Carta não encontrada'
        });
      }

      // Buscar dados completos da carta
      const cartaCompleta = await carta.getFullData();

      res.json({
        success: true,
        data: cartaCompleta
      });

    } catch (error) {
      console.error('Erro ao buscar carta:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Buscar cartas na fila
  static async getCartasNaFila(req, res) {
    try {
      const cartas = await Carta.findInQueue();
      const cartasCompletas = await Promise.all(
        cartas.map(carta => carta.getFullData())
      );

      res.json({
        success: true,
        data: cartasCompletas,
        total: cartasCompletas.length
      });

    } catch (error) {
      console.error('Erro ao buscar cartas na fila:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Buscar cartas enviadas
  static async getCartasEnviadas(req, res) {
    try {
      const cartas = await Carta.findSent();
      const cartasCompletas = await Promise.all(
        cartas.map(carta => carta.getFullData())
      );

      res.json({
        success: true,
        data: cartasCompletas,
        total: cartasCompletas.length
      });

    } catch (error) {
      console.error('Erro ao buscar cartas enviadas:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Buscar cartas entregues
  static async getCartasEntregues(req, res) {
    try {
      const cartas = await Carta.findDelivered();
      const cartasCompletas = await Promise.all(
        cartas.map(carta => carta.getFullData())
      );

      res.json({
        success: true,
        data: cartasCompletas,
        total: cartasCompletas.length
      });

    } catch (error) {
      console.error('Erro ao buscar cartas entregues:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Marcar carta como enviada
  static async markAsSent(req, res) {
    try {
      const { id } = req.params;

      const carta = await Carta.findById(id);
      if (!carta) {
        return res.status(404).json({
          success: false,
          message: 'Carta não encontrada'
        });
      }

      if (carta.status !== 'na_fila') {
        return res.status(400).json({
          success: false,
          message: 'Apenas cartas na fila podem ser marcadas como enviadas'
        });
      }

      const cartaAtualizada = await carta.markAsSent();
      const cartaCompleta = await cartaAtualizada.getFullData();

      res.json({
        success: true,
        message: 'Carta marcada como enviada com sucesso',
        data: cartaCompleta
      });

    } catch (error) {
      console.error('Erro ao marcar carta como enviada:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Marcar carta como entregue
  static async markAsDelivered(req, res) {
    try {
      const { id } = req.params;

      const carta = await Carta.findById(id);
      if (!carta) {
        return res.status(404).json({
          success: false,
          message: 'Carta não encontrada'
        });
      }

      if (carta.status !== 'enviado') {
        return res.status(400).json({
          success: false,
          message: 'Apenas cartas enviadas podem ser marcadas como entregues'
        });
      }

      const cartaAtualizada = await carta.markAsDelivered();
      const cartaCompleta = await cartaAtualizada.getFullData();

      // Calcular tempo de entrega
      const deliveryTime = cartaAtualizada.getDeliveryTime();

      res.json({
        success: true,
        message: 'Carta marcada como entregue com sucesso',
        data: {
          ...cartaCompleta,
          delivery_time: deliveryTime
        }
      });

    } catch (error) {
      console.error('Erro ao marcar carta como entregue:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Buscar cartas atrasadas
  static async getCartasAtrasadas(req, res) {
    try {
      const cartasEnviadas = await Carta.findSent();
      const cartasAtrasadas = cartasEnviadas.filter(carta => carta.isOverdue());
      
      const cartasCompletas = await Promise.all(
        cartasAtrasadas.map(carta => carta.getFullData())
      );

      res.json({
        success: true,
        data: cartasCompletas,
        total: cartasCompletas.length
      });

    } catch (error) {
      console.error('Erro ao buscar cartas atrasadas:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Deletar carta (apenas se na fila)
  static async deleteCarta(req, res) {
    try {
      const { id } = req.params;

      const carta = await Carta.findById(id);
      if (!carta) {
        return res.status(404).json({
          success: false,
          message: 'Carta não encontrada'
        });
      }

      if (carta.status !== 'na_fila') {
        return res.status(400).json({
          success: false,
          message: 'Só é possível deletar cartas que ainda estão na fila'
        });
      }

      await carta.delete();

      res.json({
        success: true,
        message: 'Carta excluída com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir carta:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Atualizar mensagem da carta (apenas se na fila)
  static async updateMensagem(req, res) {
    try {
      const { id } = req.params;
      const { mensagem } = req.body;

      if (!mensagem || mensagem.trim().length < 1) {
        return res.status(400).json({
          success: false,
          message: 'Mensagem é obrigatória'
        });
      }

      if (mensagem.length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Mensagem não pode ter mais de 1000 caracteres'
        });
      }

      const carta = await Carta.findById(id);
      if (!carta) {
        return res.status(404).json({
          success: false,
          message: 'Carta não encontrada'
        });
      }

      if (carta.status !== 'na_fila') {
        return res.status(400).json({
          success: false,
          message: 'Só é possível editar cartas que ainda estão na fila'
        });
      }

      const cartaAtualizada = await carta.update({ mensagem: mensagem.trim() });
      const cartaCompleta = await cartaAtualizada.getFullData();

      res.json({
        success: true,
        message: 'Mensagem atualizada com sucesso',
        data: cartaCompleta
      });

    } catch (error) {
      console.error('Erro ao atualizar mensagem da carta:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Estatísticas das cartas
  static async getEstatisticas(req, res) {
    try {
      const [cartasNaFila, cartasEnviadas, cartasEntregues] = await Promise.all([
        Carta.findInQueue(),
        Carta.findSent(),
        Carta.findDelivered()
      ]);

      const cartasAtrasadas = cartasEnviadas.filter(carta => carta.isOverdue());

      // Calcular tempo médio de entrega
      const cartasComTempo = cartasEntregues.filter(carta => carta.getDeliveryTime());
      const tempoMedio = cartasComTempo.length > 0 
        ? cartasComTempo.reduce((acc, carta) => acc + carta.getDeliveryTime().hours, 0) / cartasComTempo.length
        : 0;

      res.json({
        success: true,
        data: {
          total: cartasNaFila.length + cartasEnviadas.length + cartasEntregues.length,
          na_fila: cartasNaFila.length,
          enviadas: cartasEnviadas.length,
          entregues: cartasEntregues.length,
          atrasadas: cartasAtrasadas.length,
          tempo_medio_entrega_horas: Math.round(tempoMedio * 100) / 100
        }
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }
}

module.exports = CartaController;
