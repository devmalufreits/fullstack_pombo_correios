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
  getAll: () => api.get('/pombos'),
  
  // Buscar pombo por ID
  getById: (id) => api.get(`/pombos/${id}`),
  
  // Criar novo pombo
  create: (data) => api.post('/pombos', data),
  
  // Atualizar pombo
  update: (id, data) => api.put(`/pombos/${id}`, data),
  
  // Aposentar pombo
  aposentar: (id) => api.patch(`/pombos/${id}/aposentar`),
  
  // Excluir pombo
  delete: (id) => api.delete(`/pombos/${id}`),
  
  // Upload de foto
  uploadFoto: (id, formData) => api.post(`/pombos/${id}/foto`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export const clientesAPI = {
  // Listar todos os clientes
  getAll: () => api.get('/clientes'),
  
  // Buscar cliente por ID
  getById: (id) => api.get(`/clientes/${id}`),
  
  // Criar novo cliente
  create: (data) => api.post('/clientes', data),
  
  // Atualizar cliente
  update: (id, data) => api.put(`/clientes/${id}`, data),
  
  // Excluir cliente
  delete: (id) => api.delete(`/clientes/${id}`),
};

export const cartasAPI = {
  // Listar todas as cartas
  getAll: (status) => api.get('/cartas', { params: { status } }),
  
  // Buscar carta por ID
  getById: (id) => api.get(`/cartas/${id}`),
  
  // Criar nova carta
  create: (data) => api.post('/cartas', data),
  
  // Atualizar status da carta
  updateStatus: (id, status) => api.patch(`/cartas/${id}/status`, { status }),
  
  // Excluir carta
  delete: (id) => api.delete(`/cartas/${id}`),
};

export default api; 