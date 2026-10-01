import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự động đính kèm Token từ Zustand vào mọi request nếu có
axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tự động xử lý khi Token hết hạn (401)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Hết hạn phiên đăng nhập -> tự động logout
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
