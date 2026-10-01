import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isAdmin: boolean;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  // Actions
  login: (token: string, refreshToken: string, user: User) => void;
  setToken: (newToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,

      // Hàm gọi khi đăng nhập thành công
      login: (token, refreshToken, user) =>
        set({
          token,
          refreshToken,
          user,
          isAuthenticated: true,
          isAdmin: user.isAdmin === true,
        }),

      //Hàm gọi khi cần cập nhật token mới
      setToken: (newToken) =>
        set({
          token: newToken,
          isAuthenticated: !!newToken,
        }),

      // Hàm gọi khi đăng xuất
      logout: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          isAdmin: false,
        }),
    }),
    {
      name: "dietdeli-auth", // Tên key lưu trong localStorage
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
