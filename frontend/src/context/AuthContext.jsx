/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // ===========================
  // INITIAL USER
  // ===========================

  const getStoredUser = () => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!user || !token) {
      return null;
    }

    try {
      return JSON.parse(user);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  };

  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);

  // ===========================
  // CLEAR AUTH
  // ===========================

  const clearAuth = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  // ===========================
  // VERIFY SESSION
  // ===========================

  useEffect(() => {
    let mounted = true;

    const verifySession = async () => {
      const token = localStorage.getItem("token");

      console.log("Checking authentication...");
      console.log("Token:", token);

      if (!token) {
        if (mounted) {
          setInitializing(false);
        }
        return;
      }

      try {
        const response = await api.get("/auth/me");

        console.log("Auth Response:", response.data);

        if (response.data && response.data.user) {
          if (mounted) {
            setUser(response.data.user);
            localStorage.setItem(
              "user",
              JSON.stringify(response.data.user)
            );
          }
        } else {
          clearAuth();
        }
      } catch (error) {
        console.error(
          "Authentication Failed:",
          error.response?.data || error.message
        );

        if (mounted) {
          clearAuth();
        }
      } finally {
        if (mounted) {
          console.log("Authentication initialization completed");
          setInitializing(false);
        }
      }
    };

    verifySession();

    return () => {
      mounted = false;
    };
  }, [clearAuth]);

  // ===========================
  // LOGIN
  // ===========================

  const login = useCallback(async (data) => {
    setLoading(true);
    setAuthError(null);

    try {
      const response = await api.post("/auth/login", {
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      console.log("Login Response:", response.data);

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Invalid login response");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);

      return response.data;
    } catch (error) {
      console.error(
        "Login Error:",
        error.response?.data || error.message
      );

      const message =
        error.response?.data?.message || "Login failed";

      setAuthError(message);

      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===========================
  // REGISTER
  // ===========================

  const register = useCallback(async (formData) => {
    setLoading(true);
    setAuthError(null);

    try {
      console.log("Register Data:", formData);

      const { name, email, phone, password } = formData;

      // Validation
      if (!name || !email || !password) {
        throw new Error("Name, email and password are required");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email");
      }

      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : "",
        password,
      };

      console.log("Sending Register Payload:", payload);

      const response = await api.post("/auth/register", payload);

      console.log("Register Response:", response.data);

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Invalid server response");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);

      return response.data;
    } catch (error) {
      console.error(
        "Register Error:",
        error.response?.data || error.message
      );

      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration failed";

      setAuthError(message);

      throw new Error(message, { cause: error });
    } finally {
      setLoading(false);
    }
  }, []);

  // ===========================
  // LOGOUT
  // ===========================

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      console.log("Logout API error");
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  // ===========================
  // REFRESH USER
  // ===========================

  const refreshUserData = async () => {
    try {
      const response = await api.get("/auth/me");

      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
        return response.data.user;
      }
    } catch (error) {
      console.log(error);
    }

    return null;
  };

  // ===========================
  // ROLE CHECK
  // ===========================

  const hasRole = (roles) => {
    if (!user) return false;

    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }

    return user.role === roles;
  };

  // ===========================
  // CONTEXT VALUE
  // ===========================

  const value = {
    user,
    loading,
    initializing,
    authError,

    login,
    register,
    logout,

    refreshUserData,
    hasRole,
    clearAuth,

    isAuthenticated: !!user && !!localStorage.getItem("token"),

    isAdmin:
      user?.role === "admin" || user?.role === "superadmin",

    userRole: user?.role || null,
    userId: user?.id || null,
    userName: user?.name || null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ===========================
// CUSTOM HOOK
// ===========================

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be inside AuthProvider");
  }

  return context;
};

export default AuthContext;