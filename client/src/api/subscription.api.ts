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

export interface CheckoutResponse {
  message: string;
  subscription: UserSubscription;
  paymentInstructions: {
    method: string;
    subscriptionId: number;
    packageName: string;
    calories: number;
    amount: number;
    bankAccount: string;
    bankCode: string;
    accountName: string;
    transferContent: string;
    qrUrl: string;
    orderId: number;
    note: string;
  };
}

export interface CheckoutPayload {
  packageId: number;
  startDate?: string;
  userNote?: string;
  planShippingAddress?: string;
  planPhone?: string;
}

export const subscriptionApi = {
  getMySubscriptions: async (): Promise<UserSubscription[]> => {
    const response = await axiosClient.get<UserSubscription[]>("/subscriptions/my-subscriptions");
    return response.data;
  },

  getAllPlans: async (): Promise<MealPackage[]> => {
    const response = await axiosClient.get<MealPackage[]>("/plans");
    return response.data;
  },

  checkout: async (data: CheckoutPayload): Promise<CheckoutResponse> => {
    const response = await axiosClient.post<CheckoutResponse>("/subscriptions/checkout", data);
    return response.data;
  },
};
