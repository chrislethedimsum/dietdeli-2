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

// Tự động refresh token khi Access Token hết hạn (401)
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 (hết hạn 15 phút) và request này chưa từng retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const { refreshToken, setToken, logout } = useAuthStore.getState();

      if (refreshToken) {
        try {
          const baseURL = axiosClient.defaults.baseURL || "http://localhost:3000/api";
          const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
          const newAccessToken = res.data.accessToken;

          // Cập nhật token mới vào Zustand
          setToken(newAccessToken);

          // Gắn token mới và thực hiện lại request ban đầu
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);
        } catch {
          // Refresh Token (7 ngày) cũng hết hạn hoặc không hợp lệ -> Đăng xuất
          logout();
        }
      } else {
        logout();
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
