import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { OrderStatus } from "@/api/order.api";


type StatusConfig = {
    label: string;
    className: string;
};

const statusConfig: Record<OrderStatus, StatusConfig> = {
    ORDERED: {
        label: "Đã đặt hàng",
        className: "bg-yellow-50 text-yellow-700",
    },
    COOKING: {
        label: "Đang chuẩn bị",
        className: "bg-purple-50 text-purple-700",
    },
    REJECTED: {
        label: "Bị từ chối",
        className: "bg-red-50 text-red-700",
    },
    SHIPPING: {
        label: "Đang giao",
        className: "bg-orange-50 text-orange-700",
    },
    COMPLETED: {
        label: "Hoàn thành",
        className: "bg-emerald-50 text-emerald-700",
    },
    CANCELLED: {
        label: "Đã hủy",
        className: "bg-red-50 text-red-700",
    },
};

const orderStatuses: OrderStatus[] = ["ORDERED", "COOKING", "REJECTED", "SHIPPING", "COMPLETED", "CANCELLED"];

type ChangeOrderStatusModalProps = {
    open: boolean;
    orderId?: string | number;
    currentStatus?: OrderStatus;
    loading?: boolean;
    onClose: () => void;
    onConfirm: (status: OrderStatus) => void;
};

export default function ChangeOrderStatusModal({ open, orderId, currentStatus, loading = false, onClose, onConfirm }: ChangeOrderStatusModalProps) {
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(currentStatus);

    useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedStatus(currentStatus);
        }
    }, [open, currentStatus]);

    if (!open) return null;

    const isChanged = selectedStatus !== undefined && selectedStatus !== currentStatus;

    const handleConfirm = () => {
        if (!selectedStatus || !isChanged || loading) return;

        onConfirm(selectedStatus);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" onClick={loading ? undefined : onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Đổi trạng thái đơn hàng</h2>

                        {orderId !== undefined && <p className="mt-1 text-sm text-gray-500">Đơn hàng #{orderId}</p>}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5">
                    <p className="mb-3 text-sm font-medium text-gray-700">Chọn trạng thái mới</p>

                    <div className="space-y-2">
                        {orderStatuses.map((status) => {
                            const config = statusConfig[status];
                            const isSelected = selectedStatus === status;

                            return (
                                <button
                                    key={status}
                                    type="button"
                                    disabled={loading}
                                    onClick={() => setSelectedStatus(status)}
                                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
                                        isSelected ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:bg-gray-50"
                                    } disabled:cursor-not-allowed disabled:opacity-60`}
                                >
                                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${config.className}`}>{config.label}</span>

                                    {isSelected && <span className="text-sm font-semibold text-gray-900">✓</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-gray-100 px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Hủy
                    </button>

                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!isChanged || loading}
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Đang cập nhật..." : "Cập nhật"}
                    </button>
                </div>
            </div>
        </div>
    );
}
