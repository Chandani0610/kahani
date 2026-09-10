// src/services/authService.js

import api from "./api";

export const authService = {

  // ==========================
  // Register
  // ==========================
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },


  // ==========================
  // Login
  // ==========================
  login: async (credentials) => {

    const response = await api.post(
      "/auth/login",
      credentials
    );


    const { token, user } = response.data;


    if (!token) {
      throw new Error(
        "Login successful but token not received"
      );
    }


    // Save JWT token
    localStorage.setItem(
      "token",
      token
    );


    // Save user data
    if (user) {
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );
    }


    return response.data;
  },


  // ==========================
  // Get Profile
  // ==========================
  getProfile: async () => {

    const response = await api.get(
      "/auth/profile"
    );

    return response.data;

  },


  // ==========================
  // Update Profile
  // ==========================
  updateProfile: async (userData) => {

    const response = await api.put(
      "/auth/profile",
      userData
    );

    return response.data;

  },


  // ==========================
  // Change Password
  // ==========================
  changePassword: async (passwordData) => {

    const response = await api.post(
      "/auth/change-password",
      passwordData
    );

    return response.data;

  },


  // ==========================
  // Logout
  // ==========================
  logout: async () => {

    try {

      await api.post("/auth/logout");

    } catch (error) {

      console.log(
        "Logout API error:",
        error.message
      );

    }


    localStorage.removeItem("token");
    localStorage.removeItem("user");

  },


  // ==========================
  // Get User From Storage
  // ==========================
  getCurrentUser: () => {

    const user =
      localStorage.getItem("user");


    return user
      ? JSON.parse(user)
      : null;

  },


  // ==========================
  // Check Login Status
  // ==========================
  isAuthenticated: () => {

    return Boolean(
      localStorage.getItem("token")
    );

  },


  // ==========================
  // Verify Current Session
  // ==========================
  checkAuth: async () => {

    const token =
      localStorage.getItem("token");


    if (!token) {
      return null;
    }


    try {

      const response =
        await api.get("/auth/me");


      const user =
        response.data.user;


      if (user) {

        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );


        return user;

      }


      return null;


    } catch (error) {


      console.error(
        "Session verification failed:",
        error.response?.data || error.message
      );


      localStorage.removeItem("token");
      localStorage.removeItem("user");


      return null;

    }

  },


  // ==========================
  // Get User With Server Check
  // ==========================
  getCurrentUserWithAuth: async () => {

    return await authService.checkAuth();

  }

};


export default authService;