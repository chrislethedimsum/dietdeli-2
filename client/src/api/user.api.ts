import axiosClient from "./axiosClient";

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone: string;
    dob: string | null;
    address: string | null;
    gender: string | null;
    height: number | null;
    weight: number | null;
    goal: string | null;
    activityLevel: string | null;
    isAdmin: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateMyProfilePayload {
    name?: string;
    phone?: string;
    dob?: string | null;
    address?: string | null;
    gender?: string | null;
    height?: number | null;
    weight?: number | null;
    goal?: string | null;
    activityLevel?: string | null;
}

export interface ChangeMyPasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export const userApi = {
    /**
     * Lấy thông tin cá nhân của user đang đăng nhập.
     * GET /users/me
     */
    getMyProfile: async (): Promise<UserProfile> => {
        const response = await axiosClient.get<UserProfile>("/users/me");
        return response.data;
    },

    updateMyProfile: async (payload: UpdateMyProfilePayload): Promise<UserProfile> => {
        const response = await axiosClient.patch<UserProfile>("/users/me", payload);
        return response.data;
    },

    changeMyPassword: async (payload: ChangeMyPasswordPayload): Promise<{ message: string }> => {
        const response = await axiosClient.patch<{ message: string }>("/users/me/password", payload);
        return response.data;
    },
};
