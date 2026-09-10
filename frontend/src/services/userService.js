// // src/services/userService.js
// import axios from 'axios';

// const API_URL = (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.REACT_APP_API_URL)
//   ? window.__ENV__.REACT_APP_API_URL
//   : 'http://localhost:5000/api';

// export const userService = {
//   getAll: async () => {
//     const response = await axios.get(`${API_URL}/users`);
//     return response.data;
//   },
//   getById: async (id) => {
//     const response = await axios.get(`${API_URL}/users/${id}`);
//     return response.data;
//   },
//   create: async (data) => {
//     const response = await axios.post(`${API_URL}/users`, data);
//     return response.data;
//   },
//   update: async (id, data) => {
//     const response = await axios.put(`${API_URL}/users/${id}`, data);
//     return response.data;
//   },
//   delete: async (id) => {
//     const response = await axios.delete(`${API_URL}/users/${id}`);
//     return response.data;
//   },
// };




// src/services/userService.js
import api from "./api";

export const userService = {
  getAll: async () => {
    try {
      const response = await api.get("/users");
      if (Array.isArray(response.data)) return response.data;
      if (Array.isArray(response.data?.users)) return response.data.users;
      if (Array.isArray(response.data?.data)) return response.data.data;
      return [];
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data?.user || response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return null;
    }
  },

  create: async (data) => {
    const response = await api.post("/users", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};





