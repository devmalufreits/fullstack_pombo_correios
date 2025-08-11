const Cliente = require('../../models/Cliente');

class ClienteController {
  // Cadastrar cliente
  static async createCliente(req, res) {
    try {
      const { nome, email, data_nascimento, endereco } = req.body;

      // Validação dos dados
      const errors = Cliente.validateData({ nome, email, data_nascimento, endereco });
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors
        });
      }

      // Verificar se email já existe
      const existingCliente = await Cliente.findByEmail(email);
      if (existingCliente) {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso'
        });
      }

      // Validar data de nascimento
      const dataNascimento = new Date(data_nascimento);
      if (isNaN(dataNascimento.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Data de nascimento inválida'
        });
      }

      // Verificar se não é uma data futura
      if (dataNascimento > new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Data de nascimento não pode ser no futuro'
        });
      }

      // Criar cliente
      const clienteData = {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        data_nascimento: data_nascimento,
        endereco: endereco.trim()
      };

      const novoCliente = await Cliente.create(clienteData);

      res.status(201).json({
        success: true,
        message: 'Cliente cadastrado com sucesso',
        data: novoCliente.toJSON()
      });

    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Editar dados do cliente
  static async updateCliente(req, res) {
    try {
      const { id } = req.params;
      const { nome, email, data_nascimento, endereco } = req.body;

      // Buscar cliente
      const cliente = await Cliente.findById(id);
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      // Preparar dados para atualização
      const updateData = {};

      if (nome !== undefined) {
        if (!nome.trim() || nome.trim().length < 2) {
          return res.status(400).json({
            success: false,
            message: 'Nome deve ter pelo menos 2 caracteres'
          });
        }
        updateData.nome = nome.trim();
      }

      if (email !== undefined) {
        if (!Cliente.isValidEmail(email)) {
          return res.status(400).json({
            success: false,
            message: 'Email inválido'
          });
        }

        // Verificar se email já existe (exceto para o próprio cliente)
        const existingCliente = await Cliente.findByEmail(email);
        if (existingCliente && existingCliente.id !== parseInt(id)) {
          return res.status(400).json({
            success: false,
            message: 'Email já está em uso'
          });
        }

        updateData.email = email.trim().toLowerCase();
      }

      if (data_nascimento !== undefined) {
        const dataNascimento = new Date(data_nascimento);
        if (isNaN(dataNascimento.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Data de nascimento inválida'
          });
        }

        if (dataNascimento > new Date()) {
          return res.status(400).json({
            success: false,
            message: 'Data de nascimento não pode ser no futuro'
          });
        }

        updateData.data_nascimento = data_nascimento;
      }

      if (endereco !== undefined) {
        if (!endereco.trim() || endereco.trim().length < 5) {
          return res.status(400).json({
            success: false,
            message: 'Endereço deve ter pelo menos 5 caracteres'
          });
        }
        updateData.endereco = endereco.trim();
      }

      // Atualizar cliente
      const clienteAtualizado = await cliente.update(updateData);

      res.json({
        success: true,
        message: 'Cliente atualizado com sucesso',
        data: clienteAtualizado.toJSON()
      });

    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Listar clientes
  static async getClientes(req, res) {
    try {
      const { nome, email, page = 1, limit = 10 } = req.query;

      // Preparar filtros
      const filters = {};
      if (nome) {
        filters.nome = nome;
      }
      if (email) {
        filters.email = email;
      }

      // Buscar clientes
      const clientes = await Cliente.findAll(filters);

      // Implementar paginação simples
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;

      const paginatedClientes = clientes.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedClientes.map(cliente => cliente.toJSON()),
        pagination: {
          current_page: pageNum,
          per_page: limitNum,
          total: clientes.length,
          total_pages: Math.ceil(clientes.length / limitNum)
        }
      });

    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Buscar cliente por ID
  static async getClienteById(req, res) {
    try {
      const { id } = req.params;

      const cliente = await Cliente.findById(id);
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      res.json({
        success: true,
        data: cliente.toJSON()
      });

    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Buscar cliente por email
  static async getClienteByEmail(req, res) {
    try {
      const { email } = req.params;

      if (!Cliente.isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Email inválido'
        });
      }

      const cliente = await Cliente.findByEmail(email);
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      res.json({
        success: true,
        data: cliente.toJSON()
      });

    } catch (error) {
      console.error('Erro ao buscar cliente por email:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Excluir cliente
  static async deleteCliente(req, res) {
    try {
      const { id } = req.params;

      // Buscar cliente
      const cliente = await Cliente.findById(id);
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      // Verificar se cliente tem cartas associadas
      const cartasData = await cliente.getAllCartas();
      if (cartasData.total > 0) {
        return res.status(400).json({
          success: false,
          message: `Não é possível excluir cliente com cartas associadas (${cartasData.enviadas.length} enviadas, ${cartasData.recebidas.length} recebidas)`
        });
      }

      // Deletar cliente
      await cliente.delete();

      res.json({
        success: true,
        message: 'Cliente excluído com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Buscar cartas do cliente
  static async getClienteCartas(req, res) {
    try {
      const { id } = req.params;
      const { tipo } = req.query; // 'enviadas', 'recebidas', ou 'todas'

      // Buscar cliente
      const cliente = await Cliente.findById(id);
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      let cartas;
      switch (tipo) {
        case 'enviadas':
          cartas = await cliente.getCartasEnviadas();
          break;
        case 'recebidas':
          cartas = await cliente.getCartasRecebidas();
          break;
        case 'todas':
        default:
          cartas = await cliente.getAllCartas();
          break;
      }

      res.json({
        success: true,
        data: cartas,
        cliente: cliente.toJSON()
      });

    } catch (error) {
      console.error('Erro ao buscar cartas do cliente:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Buscar clientes por nome (busca parcial)
  static async searchClientesByName(req, res) {
    try {
      const { nome } = req.query;

      if (!nome || nome.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Nome deve ter pelo menos 2 caracteres para busca'
        });
      }

      const clientes = await Cliente.findByName(nome);

      res.json({
        success: true,
        data: clientes.map(cliente => cliente.toJSON()),
        total: clientes.length,
        search_term: nome
      });

    } catch (error) {
      console.error('Erro ao buscar clientes por nome:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Validar dados do cliente (endpoint para validação prévia)
  static async validateClienteData(req, res) {
    try {
      const { nome, email, data_nascimento, endereco } = req.body;

      const errors = Cliente.validateData({ nome, email, data_nascimento, endereco });

      // Verificar se email já existe (se fornecido)
      if (email && errors.length === 0) {
        const existingCliente = await Cliente.findByEmail(email);
        if (existingCliente) {
          errors.push('Email já está em uso');
        }
      }

      res.json({
        success: errors.length === 0,
        valid: errors.length === 0,
        errors: errors
      });

    } catch (error) {
      console.error('Erro ao validar dados do cliente:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }
}

module.exports = ClienteController;
