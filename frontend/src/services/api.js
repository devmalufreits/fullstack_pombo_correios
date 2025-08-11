import axios from 'axios';

// Configuração base da API
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requisições
api.interceptors.request.use(
  (config) => {
    // Adicionar token de autenticação se existir
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tratamento de erros
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviços da API
export const pombosAPI = {
  // Listar todos os pombos
  getAll: (params = {}) => api.get('/pombos', { params }),
  // Pombos disponíveis
  getAvailable: () => api.get('/pombos/available'),
  
  // Buscar pombo por ID
  getById: (id) => api.get(`/pombos/${id}`),
  
  // Criar novo pombo
  create: (data) => {
    // Se for FormData, usar multipart (para upload de foto)
    if (data instanceof FormData) {
      return api.post('/pombos', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post('/pombos', data);
  },
  
  // Atualizar pombo
  update: (id, data) => {
    if (data instanceof FormData) {
      return api.put(`/pombos/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.put(`/pombos/${id}`, data);
  },
  
  // Aposentar pombo
  retire: (id) => api.patch(`/pombos/${id}/retire`),

  // [REMOVIDO] Alternar status ativo/inativo descontinuado
  
  // Excluir pombo
  delete: (id) => api.delete(`/pombos/${id}`),
};

export const clientesAPI = {
  // Listar todos os clientes
  getAll: (params = {}) => api.get('/clientes', { params }),
  // Buscar clientes por nome
  searchByName: (q) => api.get('/clientes/search', { params: { q } }),
  
  // Buscar cliente por ID
  getById: (id) => api.get(`/clientes/${id}`),
  // Buscar cliente por email
  getByEmail: (email) => api.get(`/clientes/email/${encodeURIComponent(email)}`),
  // Cartas do cliente
  getCartas: (id) => api.get(`/clientes/${id}/cartas`),
  
  // Criar novo cliente
  create: (data) => api.post('/clientes', data),
  // Validar dados do cliente
  validate: (data) => api.post('/clientes/validate', data),
  
  // Atualizar cliente
  update: (id, data) => api.put(`/clientes/${id}`, data),
  
  // Excluir cliente
  delete: (id) => api.delete(`/clientes/${id}`),
};

export const cartasAPI = {
  // Listar todas as cartas
  getAll: (params = {}) => api.get('/cartas', { params }),
  getFila: () => api.get('/cartas/fila'),
  getEnviadas: () => api.get('/cartas/enviadas'),
  getEntregues: () => api.get('/cartas/entregues'),
  getAtrasadas: () => api.get('/cartas/atrasadas'),
  getEstatisticas: () => api.get('/cartas/estatisticas'),
  
  // Buscar carta por ID
  getById: (id) => api.get(`/cartas/${id}`),
  
  // Criar nova carta
  create: (data) => api.post('/cartas', data),
  
  // Atualizar status da carta
  updateStatus: (id, status) => api.put(`/cartas/${id}/status`, { status }),
  markAsSent: (id) => api.patch(`/cartas/${id}/enviar`),
  markAsDelivered: (id) => api.patch(`/cartas/${id}/entregar`),
  updateMensagem: (id, mensagem) => api.patch(`/cartas/${id}/mensagem`, { mensagem }),
  
  // Excluir carta
  delete: (id) => api.delete(`/cartas/${id}`),
};

export default api;