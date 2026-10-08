import type { User } from "@/store/useAuthStore";
import axiosClient from "./axiosClient";
import type { MealPackage } from "./subscription.api";

export type MealShift = "LUNCH" | "DINNER";
export type OrderStatus = "ORDERED" | "COOKING" | "REJECTED" | "SHIPPING" | "COMPLETED" | "CANCELLED";

export interface Dish {
    id: number;
    nameVi: string;
    nameEn: string;
    image?: string | null;
    calories?: number | null;
    isDeleted?: boolean;
}

export interface OrderItem {
    id: number;
    orderId: number;
    dishId: number;
    quantity: number;
    dish: Dish;
}

export interface Order {
    id: number;
    userId: number;
    userSubscriptionId: number;
    packageId: number;
    deliveryDate: string;
    mealShift: MealShift;
    shippingAddress: string;
    shippingNote?: string;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
    orderItems: OrderItem[];
    package?: MealPackage;
    user: User;
}

export interface BookMealPayload {
    deliveryDate: string;
    mealShift: MealShift;
    totalMealsToDeduct: number;
    items: {
        dishId: number;
        quantity: number;
    }[];
}

export interface BookMealResponse {
    message: string;
    order: Order;
}

export interface CancelMealResponse {
    message: string;
}

export const orderApi = {
    bookMeal: async (data: BookMealPayload): Promise<BookMealResponse> => {
        const response = await axiosClient.post<BookMealResponse>("/order/book", data);
        return response.data;
    },

    cancelMealOrder: async (orderId: number): Promise<CancelMealResponse> => {
        const response = await axiosClient.patch<CancelMealResponse>(`/order/${orderId}/cancel`);
        return response.data;
    },

    getMyOrders: async (startDate?: string, endDate?: string): Promise<Order[]> => {
        const response = await axiosClient.get<Order[]>("/order/my-orders", {
            params: { startDate, endDate },
        });
        return response.data;
    },

    getAllOrders: async (startDate?: string, endDate?: string): Promise<Order[]> => {
        const response = await axiosClient.get<Order[]>("/order/admin", {
            params: { startDate, endDate },
        });
        return response.data;
    },

    updateStatus: async (orderId: number, status: OrderStatus): Promise<Order> => {
        const response = await axiosClient.patch<Order>(`/order/${orderId}/status`, { status });
        return response.data;
    },
};
