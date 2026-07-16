import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PUBLIC_API_URL || "https://cc-motors.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      const status = error.response?.status;

      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        const rutaActual = window.location.pathname;

        if (rutaActual !== "/login") {
          window.location.href = "/login";
        }
      }

      if (status === 429 || status === 403) {
        const mensaje = error.response?.data?.mensaje || "Servidor temporalmente no disponible. Intenta más tarde.";
        console.warn(`[Seguridad] ${status}: ${mensaje}`);
      }
    }

    return Promise.reject(error);
  }
);

export default api;