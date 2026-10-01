import axiosClient from "./axiosClient";

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    isAdmin: boolean;
  };
}

export const authApi = {
  login: async (dto: LoginDto): Promise<LoginResponse> => {
    const response = await axiosClient.post<LoginResponse>("/auth/login", dto);
    return response.data;
  },
  logout: () => axiosClient.post("/auth/logout"),
  getMe: async () => {
    const response = await axiosClient.get("/auth/me");
    return response.data;
  },
  // Sau này có thể thêm:
  // register: (dto: RegisterDto) => axiosClient.post("/auth/register", dto),
  // getMe: () => axiosClient.get("/auth/me"),
};
