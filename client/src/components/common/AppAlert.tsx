import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useAlertStore } from "@/store/useAlertStore";

const alertConfig = {
    success: {
        icon: CheckCircle2,
        iconClass: "text-emerald-500",
        iconBgClass: "bg-emerald-50",
        borderClass: "border-emerald-200",
        titleClass: "text-emerald-700",
    },
    error: {
        icon: XCircle,
        iconClass: "text-red-500",
        iconBgClass: "bg-red-50",
        borderClass: "border-red-200",
        titleClass: "text-red-700",
    },
    warning: {
        icon: AlertCircle,
        iconClass: "text-amber-500",
        iconBgClass: "bg-amber-50",
        borderClass: "border-amber-200",
        titleClass: "text-amber-700",
    },
    info: {
        icon: Info,
        iconClass: "text-blue-500",
        iconBgClass: "bg-blue-50",
        borderClass: "border-blue-200",
        titleClass: "text-blue-700",
    },
};

const defaultTitles = {
    success: "Thành công",
    error: "Thất bại",
    warning: "Cảnh báo",
    info: "Thông báo",
};

export default function AppAlert() {
    const { isOpen, type, title, message, closeAlert } = useAlertStore();

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const timer = setTimeout(() => {
            closeAlert();
        }, 3000);

        return () => clearTimeout(timer);
    }, [isOpen, closeAlert]);

    if (!isOpen) {
        return null;
    }

    const config = alertConfig[type];
    const Icon = config.icon;

    return (
        <div className="fixed right-6 top-6 z-[9999] w-[380px] max-w-[calc(100vw-2rem)]">
            <div className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-lg ${config.borderClass}`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.iconBgClass}`}>
                    <Icon size={22} className={config.iconClass} />
                </div>

                <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold ${config.titleClass}`}>{title ?? defaultTitles[type]}</p>

                    <p className="mt-1 text-sm leading-5 text-gray-600">{message}</p>
                </div>

                <button type="button" onClick={closeAlert} className="shrink-0 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600" aria-label="Đóng thông báo">
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
