import axiosClient from "./axiosClient";

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
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
  // Sau này có thể thêm:
  // register: (dto: RegisterDto) => axiosClient.post("/auth/register", dto),
  // getMe: () => axiosClient.get("/auth/me"),
};
