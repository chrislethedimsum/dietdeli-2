import axiosClient from "./axiosClient";
import type { MealPackage } from "./subscription.api";

export type MealShift = "LUNCH" | "DINNER";
export type OrderStatus = "ORDERED" | "COOKING" | "SHIPPING" | "COMPLETED" | "CANCELLED";

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
  shippingPhone?: string | null; // 👈 Thêm
  shippingNote?: string | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  package?: MealPackage;
}

export interface BookMealPayload {
  deliveryDate: string;
  mealShift: MealShift;
  totalMealsToDeduct: number;
  items: {
    dishId: number;
    quantity: number;
  }[];
  shippingAddress?: string; // 👈 Thêm
  shippingPhone?: string; // 👈 Thêm
  shippingNote?: string; // 👈 Thêm
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
};
