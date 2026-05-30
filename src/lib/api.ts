import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API functions
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
};

export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  getById: (id: string) => api.get(`/inventory/${id}`),
  create: (data: any) => api.post('/inventory', data),
  update: (id: string, data: any) => api.put(`/inventory/${id}`, data),
  delete: (id: string) => api.delete(`/inventory/${id}`),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data: any) => api.post('/categories', data),
};

export const usersAPI = {
  getAll: (role?: string) => api.get('/users', { params: { role } }),
  create: (data: any) => api.post('/users', data),
  updateStatus: (id: string, is_active: boolean) => api.patch(`/users/${id}/status`, { is_active }),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const aeRequestsAPI = {
  getAll: () => api.get('/ae-requests'),
  create: (data: any) => api.post('/ae-requests', data),
  accept: (id: string) => api.post(`/ae-requests/${id}/accept`),
  reject: (id: string) => api.post(`/ae-requests/${id}/reject`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getProducts: (category_id?: string) => api.get('/dashboard/products', { params: { category_id } }),
};
