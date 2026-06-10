import axios from 'axios';

// FIX-08: Change fallback base URL from http to https to ensure TLS
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // FIX-03: Enable cookies/credentials automatically on all Axios API requests
  withCredentials: true,
});

// CSRF token storage
let csrfToken: string | null = null;

// FIX-15: Helper to fetch the CSRF token on initialization
export const fetchCsrfToken = async () => {
  try {
    const response = await api.get('/auth/csrf-token');
    csrfToken = response.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

// FIX-15: Request interceptor to attach X-CSRF-Token header on all non-GET/safe requests
api.interceptors.request.use(
  (config) => {
    const method = config.method?.toUpperCase();
    if (method && method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // FIX-03: Handle 401 Unauthorized globally by redirecting to login page
    if (error.response?.status === 401) {
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
  // FIX-03: Expose getMe to check session recovery using HttpOnly cookie authentication
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { oldPassword, newPassword }),
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
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
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
  withdraw: (id: string) => api.post(`/ae-requests/${id}/withdraw`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getProducts: (category_id?: string) => api.get('/dashboard/products', { params: { category_id } }),
};
