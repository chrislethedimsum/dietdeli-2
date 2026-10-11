import axiosClient from "./axiosClient";

export interface MealPackage {
    id: number;
    name: string;
    description: string;
    caloriesPerMeal: number;
    durationDays: number;
    price: number;
    totalMeals: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMealPackageDto {
    name: string;
    description?: string;
    caloriesPerMeal: number;
    durationDays: number;
    price: number;
    totalMeals: number;
    isActive?: boolean;
}

export type UpdateMealPackageDto = Partial<CreateMealPackageDto>;

export interface MealPackageQuery {
    search?: string;
    isActive?: boolean;
}

export const mealPackagesApi = {
    // Lấy danh sách gói suất ăn
    getAll: (params?: MealPackageQuery) =>
        axiosClient.get<MealPackage[]>("/mealpackages", {
            params,
        }),

    // Lấy chi tiết gói suất ăn
    getById: (id: number) => axiosClient.get<MealPackage>(`/mealpackages/${id}`),

    // Tạo gói suất ăn
    create: (data: CreateMealPackageDto) => axiosClient.post<MealPackage>("/mealpackages", data),

    // Cập nhật gói suất ăn
    update: (id: number, data: UpdateMealPackageDto) => axiosClient.patch<MealPackage>(`/mealpackages/${id}`, data),

    // Bật/tắt trạng thái
    toggleStatus: (id: number) => axiosClient.patch<MealPackage>(`/mealpackages/${id}/toggle-status`),

    // Xóa gói suất ăn
    delete: (id: number) => axiosClient.delete<MealPackage>(`/mealpackages/${id}`),
};
