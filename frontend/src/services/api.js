// src/services/api.js

import axios from "axios";

// ======================================
// Axios Instance
// ======================================

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api",

    // DO NOT set Content-Type globally.
    // Axios/browser will automatically set:
    // multipart/form-data; boundary=...
    // when FormData is used.
});

// ======================================
// Request Interceptor
// Add JWT Token Automatically
// Handle JSON vs FormData
// ======================================

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        // --------------------------------------
        // Add JWT Token
        // --------------------------------------

        if (token) {
            config.headers = config.headers || {};

            config.headers.Authorization = `Bearer ${token}`;
        }

        // --------------------------------------
        // Handle Content-Type
        // --------------------------------------
        //
        // For FormData:
        // DO NOT manually set Content-Type.
        //
        // Browser/Axios will automatically create:
        //
        // multipart/form-data; boundary=----...
        //
        // For normal JSON requests:
        // application/json is used.
        // --------------------------------------

        if (config.data instanceof FormData) {
            // Remove any previously configured Content-Type
            // so Axios/browser can create the correct boundary.
            if (config.headers) {
                delete config.headers["Content-Type"];
                delete config.headers["content-type"];
            }

            console.log("📦 API Request: FormData detected");
            console.log("📎 Content-Type will be generated automatically");
        } else {
            config.headers = config.headers || {};

            // Only set JSON Content-Type when the request
            // is NOT FormData.
            if (
                !config.headers["Content-Type"] &&
                !config.headers["content-type"]
            ) {
                config.headers["Content-Type"] = "application/json";
            }
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

// ======================================
// Auto-detect Active Backend Port Fallback
// ======================================

let activePortPromise = null;

async function findActiveApiBaseUrl() {
    const candidatePorts = [5000, 5001, 5002, 5003, 5004, 5005];
    for (const port of candidatePorts) {
        try {
            const res = await axios.get(`http://localhost:${port}/api/health`, { timeout: 1200 });
            if (res.status === 200) {
                return `http://localhost:${port}/api`;
            }
        } catch (_) {}
    }
    return null;
}

// ======================================
// Response Interceptor
// ======================================

api.interceptors.response.use(
    (response) => {
        return response;
    },

    async (error) => {
        const originalRequest = error.config;

        // If network connection failed, probe fallback ports
        if (
            originalRequest &&
            !originalRequest._retriedPort &&
            (error.code === "ERR_NETWORK" || !error.response || error.code === "ECONNREFUSED")
        ) {
            originalRequest._retriedPort = true;
            if (!activePortPromise) {
                activePortPromise = findActiveApiBaseUrl().finally(() => {
                    activePortPromise = null;
                });
            }

            const liveBase = await activePortPromise;
            if (liveBase && liveBase !== api.defaults.baseURL) {
                console.info(`🔄 Auto-switching API baseURL to active server: ${liveBase}`);
                api.defaults.baseURL = liveBase;
                originalRequest.baseURL = liveBase;
                return api(originalRequest);
            }
        }

        const status = error.response?.status;

        if (status === 401) {
            console.warn(
                "Session expired. Logging out..."
            );

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // Do not redirect here.
            // AuthContext will handle navigation.
        }

        return Promise.reject(error);
    }
);

export default api;