import { create } from "zustand";

export type AlertType = "success" | "error" | "warning" | "info";

type AlertState = {
    isOpen: boolean;
    type: AlertType;
    title?: string;
    message: string;

    showAlert: (type: AlertType, message: string, title?: string) => void;

    closeAlert: () => void;
};

export const useAlertStore = create<AlertState>((set) => ({
    isOpen: false,
    type: "success",
    title: undefined,
    message: "",

    showAlert: (type, message, title) =>
        set({
            isOpen: true,
            type,
            message,
            title,
        }),

    closeAlert: () =>
        set({
            isOpen: false,
        }),
}));
