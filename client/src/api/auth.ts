import axiosClient from "./axiosClient";

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  message: string;
  email: string;
  password: string;
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

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
  gender?: string;
  height?: number;
  weight?: number;
  goal?: string;
  packageType?: string;
  mealOption?: string;
  calories?: number;
  userNote?: string;
  planShippingAddress?: string;
  planPhone?: string;
}
export interface RegisterResponse {
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
  subscription?: any;
  paymentInstructions?: {
    subscriptionId: number;
    packageName: string;
    calories: number;
    amount: number;
    bankAccount: string;
    bankCode: string;
    accountName: string;
    transferContent: string;
    qrUrl: string;
  };
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
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const response = await axiosClient.post<RegisterResponse>("/auth/register", payload);
    return response.data;
  },
};
