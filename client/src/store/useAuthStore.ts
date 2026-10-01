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
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,

      // Hàm gọi khi đăng nhập thành công
      login: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true,
          isAdmin: user.isAdmin === true,
        }),

      // Hàm gọi khi đăng xuất
      logout: () =>
        set({
          token: null,
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
