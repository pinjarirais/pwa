import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
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

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const logout = () => API.post('/auth/logout');
export const getAuthProfile = () => API.get('/auth/profile');

// Users
export const getUsers = (params) => API.get('/users', { params });
export const getUserById = (id) => API.get(`/users/${id}`);
export const createUser = (data) => API.post('/users', data);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);
export const updateProfile = (data) => API.put('/users/profile', data);
export const changePassword = (data) => API.put('/users/change-password', data);

// Cards
export const getCards = (params) => API.get('/cards', { params });
export const getCardById = (id) => API.get(`/cards/${id}`);
export const createCard = (data) => API.post('/cards', data);
export const updateCard = (id, data) => API.put(`/cards/${id}`, data);
export const deleteCard = (id) => API.delete(`/cards/${id}`);
export const changePin = (id, data) => API.put(`/cards/change-pin/${id}`, data);
export const getDashboardStats = () => API.get('/cards/stats');
export const downloadCard = (id) => API.get(`/cards/download/${id}`, { responseType: 'blob' });

export default API;
