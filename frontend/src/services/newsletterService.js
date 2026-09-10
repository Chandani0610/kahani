// src/services/newsletterService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
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

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 500 errors gracefully
    if (error.response?.status === 500) {
      console.warn('⚠️ Server error (500) - returning empty data');
      // Return a resolved promise with empty data structure
      return Promise.resolve({ 
        data: [], 
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config,
        request: {}
      });
    }
    return Promise.reject(error);
  }
);

export const newsletterService = {
  // Get all newsletters
  async getAll() {
    try {
      const response = await api.get('/newsletters');
      console.log('📧 Newsletters response:', response.status, response.data);
      
      // Handle different response structures
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data?.newsletters && Array.isArray(response.data.newsletters)) {
        return response.data.newsletters;
      }
      
      // If no data found, return empty array
      console.warn('⚠️ No newsletters data found, returning empty array');
      return [];
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      // Return empty array instead of throwing error
      if (error.response?.status === 500) {
        console.warn('⚠️ Newsletter service unavailable, returning empty array');
        return [];
      }
      throw error;
    }
  },

  // Get all subscribers
  async getSubscribers() {
    try {
      const response = await api.get('/newsletters/subscribers');
      console.log('📧 Subscribers response:', response.status, response.data);
      
      // Handle different response structures
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data?.subscribers && Array.isArray(response.data.subscribers)) {
        return response.data.subscribers;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      if (error.response?.status === 500) {
        console.warn('⚠️ Subscribers service unavailable, returning empty array');
        return [];
      }
      throw error;
    }
  },

  // Add multiple subscribers
  async addSubscribers(emails) {
    try {
      // Ensure emails is an array
      const emailArray = Array.isArray(emails) ? emails : [emails];
      
      // Validate emails
      const validEmails = emailArray.filter(email => 
        email && typeof email === 'string' && email.trim().length > 0
      );
      
      if (validEmails.length === 0) {
        throw new Error('No valid email addresses provided');
      }

      const response = await api.post('/newsletters/subscribers', { 
        emails: validEmails 
      });
      
      console.log('✅ Subscribers added:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding subscribers:', error);
      throw error;
    }
  },

  // Get single subscriber by ID
  async getSubscriberById(id) {
    try {
      const response = await api.get(`/newsletters/subscribers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subscriber ${id}:`, error);
      throw error;
    }
  },

  // Update subscriber status
  async updateSubscriber(id, data) {
    try {
      const response = await api.put(`/newsletters/subscribers/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating subscriber ${id}:`, error);
      throw error;
    }
  },

  // Delete subscriber
  async deleteSubscriber(id) {
    try {
      const response = await api.delete(`/newsletters/subscribers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting subscriber ${id}:`, error);
      throw error;
    }
  },

  // Get subscriber stats
  async getSubscriberStats() {
    try {
      const response = await api.get('/newsletters/subscribers/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscriber stats:', error);
      if (error.response?.status === 500) {
        return { total: 0, active: 0, inactive: 0 };
      }
      throw error;
    }
  },

  // Get single newsletter by ID
  async getById(id) {
    try {
      const response = await api.get(`/newsletters/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching newsletter:', error);
      throw error;
    }
  },

  // Create new newsletter
  async create(data) {
    try {
      const response = await api.post('/newsletters', data);
      return response.data;
    } catch (error) {
      console.error('Error creating newsletter:', error);
      throw error;
    }
  },

  // Update newsletter
  async update(id, data) {
    try {
      const response = await api.put(`/newsletters/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating newsletter:', error);
      throw error;
    }
  },

  // Delete newsletter
  async delete(id) {
    try {
      const response = await api.delete(`/newsletters/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting newsletter:', error);
      throw error;
    }
  },

  // Send newsletter
  async send(id) {
    try {
      const response = await api.post(`/newsletters/${id}/send`);
      return response.data;
    } catch (error) {
      console.error(`Error sending newsletter ${id}:`, error);
      throw error;
    }
  },

  // Get newsletter stats
  async getStats() {
    try {
      const response = await api.get('/newsletters/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching newsletter stats:', error);
      if (error.response?.status === 500) {
        return { total: 0, active: 0, pending: 0 };
      }
      throw error;
    }
  },

  // Bulk import subscribers from CSV/JSON
  async bulkImportSubscribers(data) {
    try {
      const response = await api.post('/newsletters/subscribers/bulk-import', data);
      return response.data;
    } catch (error) {
      console.error('Error bulk importing subscribers:', error);
      throw error;
    }
  },

  // Export subscribers
  async exportSubscribers(format = 'csv') {
    try {
      const response = await api.get(`/newsletters/subscribers/export?format=${format}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting subscribers:', error);
      throw error;
    }
  },

  // Search subscribers
  async searchSubscribers(query) {
    try {
      const response = await api.get(`/newsletters/subscribers/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching subscribers:', error);
      return [];
    }
  }
};

export default newsletterService;