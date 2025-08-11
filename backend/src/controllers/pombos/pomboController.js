const Pombo = require('../../models/Pombo');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do multer para upload de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/pombos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pombo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif)'));
    }
  }
});

class PomboController {
  // Cadastrar pombo (foto, apelido, velocidade, nascimento)
  static async createPombo(req, res) {
    try {
      const { apelido, velocidade, data_nascimento } = req.body;

      // Validação dos dados obrigatórios
      if (!apelido || !velocidade || !data_nascimento) {
        return res.status(400).json({
          success: false,
          message: 'Apelido, velocidade e data de nascimento são obrigatórios'
        });
      }

      // Validação da velocidade
      if (isNaN(velocidade) || velocidade <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Velocidade deve ser um número positivo'
        });
      }

      // Validação da data
      const dataNascimento = new Date(data_nascimento);
      if (isNaN(dataNascimento.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Data de nascimento inválida'
        });
      }

      // Verificar se já existe pombo com mesmo apelido
      const existingPombo = await Pombo.findByApelido(apelido);
      if (existingPombo) {
        return res.status(400).json({
          success: false,
          message: 'Já existe um pombo com este apelido'
        });
      }

      // Processar foto se enviada
      let foto_url = null;
      if (req.file) {
        foto_url = `/uploads/pombos/${req.file.filename}`;
      }

      // Criar pombo
      const pomboData = {
        apelido: apelido.trim(),
        velocidade: parseFloat(velocidade),
        data_nascimento: data_nascimento,
        foto_url
      };

      const novoPombo = await Pombo.create(pomboData);

      res.status(201).json({
        success: true,
        message: 'Pombo cadastrado com sucesso',
        data: novoPombo.toJSON()
      });

    } catch (error) {
      console.error('Erro ao criar pombo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Editar dados do pombo
  static async updatePombo(req, res) {
    try {
      const { id } = req.params;
      const { apelido, velocidade, data_nascimento } = req.body;

      // Buscar pombo
      const pombo = await Pombo.findById(id);
      if (!pombo) {
        return res.status(404).json({
          success: false,
          message: 'Pombo não encontrado'
        });
      }

      // Bloquear qualquer alteração se estiver aposentado
      if (pombo.aposentado) {
        return res.status(400).json({
          success: false,
          message: 'Pombo aposentado: alterações não são permitidas'
        });
      }

      // Preparar dados para atualização
      const updateData = {};

      if (apelido !== undefined) {
        if (!apelido.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Apelido não pode estar vazio'
          });
        }

        // Verificar se apelido já existe (exceto para o próprio pombo)
        const existingPombo = await Pombo.findByApelido(apelido);
        if (existingPombo && existingPombo.id !== parseInt(id)) {
          return res.status(400).json({
            success: false,
            message: 'Já existe um pombo com este apelido'
          });
        }

        updateData.apelido = apelido.trim();
      }

      if (velocidade !== undefined) {
        if (isNaN(velocidade) || velocidade <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Velocidade deve ser um número positivo'
          });
        }
        updateData.velocidade = parseFloat(velocidade);
      }

      if (data_nascimento !== undefined) {
        const dataNascimento = new Date(data_nascimento);
        if (isNaN(dataNascimento.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Data de nascimento inválida'
          });
        }
        updateData.data_nascimento = data_nascimento;
      }

      // Processar nova foto se enviada
      if (req.file) {
        // Remover foto antiga se existir
        if (pombo.foto_url) {
          const oldPhotoPath = path.join(__dirname, '../../../public', pombo.foto_url);
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        }
        updateData.foto_url = `/uploads/pombos/${req.file.filename}`;
      }

      // Atualizar pombo
      const pomboAtualizado = await pombo.update(updateData);

      res.json({
        success: true,
        message: 'Pombo atualizado com sucesso',
        data: pomboAtualizado.toJSON()
      });

    } catch (error) {
      console.error('Erro ao atualizar pombo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Marcar como aposentado
  static async retirePombo(req, res) {
    try {
      const { id } = req.params;

      // Buscar pombo
      const pombo = await Pombo.findById(id);
      if (!pombo) {
        return res.status(404).json({
          success: false,
          message: 'Pombo não encontrado'
        });
      }

      // Verificar se já está aposentado
      if (pombo.aposentado) {
        return res.status(400).json({
          success: false,
          message: 'Pombo já está aposentado'
        });
      }

      // Aposentar pombo
      const pomboAposentado = await pombo.aposentar();

      res.json({
        success: true,
        message: 'Pombo aposentado com sucesso',
        data: pomboAposentado.toJSON()
      });

    } catch (error) {
      console.error('Erro ao aposentar pombo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Excluir pombo
  static async deletePombo(req, res) {
    try {
      const { id } = req.params;

      // Buscar pombo
      const pombo = await Pombo.findById(id);
      if (!pombo) {
        return res.status(404).json({
          success: false,
          message: 'Pombo não encontrado'
        });
      }

      // Verificar se pombo tem cartas associadas
      const Carta = require('../../models/Carta');
      const cartasAssociadas = await Carta.findByPombo(id);
      
      if (cartasAssociadas.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Não é possível excluir pombo com cartas associadas. Considere aposentá-lo.'
        });
      }

      // Remover foto se existir
      if (pombo.foto_url) {
        const photoPath = path.join(__dirname, '../../../public', pombo.foto_url);
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      }

      // Deletar pombo (soft delete)
      await pombo.delete();

      res.json({
        success: true,
        message: 'Pombo excluído com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir pombo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Listar pombos
  static async getPombos(req, res) {
    try {
      const { ativo, aposentado } = req.query;
      
      const filters = {};
      if (ativo !== undefined) {
        filters.ativo = ativo === 'true' ? 1 : 0;
      }
      if (aposentado !== undefined) {
        filters.aposentado = aposentado === 'true' ? 1 : 0;
      }

      const pombos = await Pombo.findAll(filters);

      res.json({
        success: true,
        data: pombos.map(pombo => pombo.toJSON()),
        total: pombos.length
      });

    } catch (error) {
      console.error('Erro ao listar pombos:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Buscar pombos disponíveis
  static async getAvailablePombos(req, res) {
    try {
      const pombosDisponiveis = await Pombo.findAvailable();

      res.json({
        success: true,
        data: pombosDisponiveis.map(pombo => pombo.toJSON()),
        total: pombosDisponiveis.length
      });

    } catch (error) {
      console.error('Erro ao buscar pombos disponíveis:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Buscar pombo por ID
  static async getPomboById(req, res) {
    try {
      const { id } = req.params;

      const pombo = await Pombo.findById(id);
      if (!pombo) {
        return res.status(404).json({
          success: false,
          message: 'Pombo não encontrado'
        });
      }

      res.json({
        success: true,
        data: pombo.toJSON()
      });

    } catch (error) {
      console.error('Erro ao buscar pombo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Ativar/desativar pombo
  static async togglePomboStatus(req, res) {
    try {
      const { id } = req.params;

      const pombo = await Pombo.findById(id);
      if (!pombo) {
        return res.status(404).json({
          success: false,
          message: 'Pombo não encontrado'
        });
      }

      const pomboAtualizado = await pombo.toggleAtivo();

      res.json({
        success: true,
        message: `Pombo ${pomboAtualizado.ativo ? 'ativado' : 'desativado'} com sucesso`,
        data: pomboAtualizado.toJSON()
      });

    } catch (error) {
      console.error('Erro ao alterar status do pombo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }
}

// Middleware para upload de foto
PomboController.uploadPhoto = upload.single('foto');

module.exports = PomboController;
