// src/services/contactService.js
import axios from 'axios';

// Safe access to process.env when running in environments where `process` may be undefined
const API_URL = (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.REACT_APP_API_URL)
  ? window.__ENV__.REACT_APP_API_URL
  : 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors but don't throw for 500 errors - return empty data instead
    if (error.response?.status === 500) {
      console.warn('⚠️ Server error (500) - returning empty data');
      return Promise.resolve({ data: [] });
    }
    if (error.code === 'ERR_NETWORK') {
      console.warn('⚠️ Network error - returning empty data');
      return Promise.resolve({ data: [] });
    }
    return Promise.reject(error);
  }
);

export const contactService = {
  getAll: async () => {
    try {
      const response = await api.get('/contacts');
      return response.data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return []; // Return empty array on error
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/contacts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contact ${id}:`, error);
      return null; // Return null on error
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/contacts', data);
      return response.data;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/contacts/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating contact ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/contacts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting contact ${id}:`, error);
      throw error;
    }
  },

  getPending: async () => {
    try {
      const response = await api.get('/contacts/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending contacts:', error);
      return []; // Return empty array on error
    }
  },

  getReplied: async () => {
    try {
      const response = await api.get('/contacts/replied');
      return response.data;
    } catch (error) {
      console.error('Error fetching replied contacts:', error);
      return []; // Return empty array on error
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/contacts/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching contact stats:', error);
      // Return default stats on error
      return {
        total: 0,
        pending: 0,
        replied: 0
      };
    }
  },
};