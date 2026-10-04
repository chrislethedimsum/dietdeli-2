import { Button } from "@heroui/react";
import CommonModal from "@/components/common/CommonModal";

type ConfirmModalProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;

    title?: string;
    description?: string;

    confirmText?: string;
    cancelText?: string;

    onConfirm: () => void;

    loading?: boolean;
};

export default function ConfirmModal({
    isOpen,
    onOpenChange,
    title = "Xác nhận",
    description = "Bạn có chắc chắn muốn thực hiện thao tác này?",
    confirmText = "Xác nhận",
    cancelText = "Huỷ",
    onConfirm,
    loading = false,
}: ConfirmModalProps) {
    const handleCancel = () => {
        if (!loading) {
            onOpenChange(false);
        }
    };

    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <CommonModal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={title}
            size="sm"
            footer={
                <div className="flex w-full justify-end gap-3">
                    <Button className="border border-gray-200 bg-white text-gray-700" onPress={handleCancel} isDisabled={loading}>
                        {cancelText}
                    </Button>

                    <Button className="bg-red-600 text-white hover:bg-red-700" onPress={handleConfirm} isDisabled={loading}>
                        {loading ? "Đang xử lý..." : confirmText}
                    </Button>
                </div>
            }
        >
            <p className="text-sm leading-6 text-gray-600">{description}</p>
        </CommonModal>
    );
}
