import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ConsultationState {
  consultationData: any | null;
  setConsultationData: (data: any) => void;
  clearConsultation: () => void;
}

export const useConsultationStore = create<ConsultationState>()(
  persist(
    (set) => ({
      consultationData: null,
      setConsultationData: (data) => set({ consultationData: data }),
      clearConsultation: () => set({ consultationData: null }),
    }),
    {
      name: "dietdeli-consultation",
      storage: createJSONStorage(() => sessionStorage), // 👈 Chỉ sống trong phiên duyệt hiện tại
    },
  ),
);
