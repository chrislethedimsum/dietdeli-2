import axiosClient from "./axiosClient";

export interface MealPackage {
  id: number;
  name: string;
  caloriesPerMeal: number;
  durationDays: number;
  price: number;
  totalMeals: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSubscription {
  id: number;
  idUser: number;
  packageId: number;
  startDate: string;
  endDate: string;
  paymentStatus: "UNPAID" | "PAID" | "CANCELLED" | string;
  remainingMeals: number;
  createdAt: string;
  updatedAt: string;
  package: MealPackage;
}

export const subscriptionApi = {
  getMySubscriptions: async (): Promise<UserSubscription[]> => {
    const response = await axiosClient.get<UserSubscription[]>("/subscriptions/my-subscriptions");
    return response.data;
  },

  checkout: async (data: { packageId: number; startDate?: string }) => {
    const response = await axiosClient.post("/subscriptions/checkout", data);
    return response.data;
  },
};
