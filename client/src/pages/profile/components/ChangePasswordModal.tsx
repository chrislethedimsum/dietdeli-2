import { useState } from "react";
import { Button, Input, Label, TextField } from "@heroui/react";
import CommonModal from "@/components/common/CommonModal";
import { userApi } from "@/api/user.api";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (message: string) => void;
}

interface PasswordForm {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const initialForm: PasswordForm = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
};

export default function ChangePasswordModal({ isOpen, onClose, onSuccess }: ChangePasswordModalProps) {
    const [form, setForm] = useState<PasswordForm>(initialForm);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const updateField = (field: keyof PasswordForm, value: string | number | object) => {
        // Hỗ trợ cả giá trị trực tiếp và event/object từ component Input.
        let inputValue = "";

        if (typeof value === "string" || typeof value === "number") {
            inputValue = String(value);
        } else if (value && typeof value === "object") {
            const input = value as {
                target?: { value?: string };
                value?: string | number;
            };

            inputValue = String(input.target?.value ?? input.value ?? "");
        }

        setForm((prev) => ({
            ...prev,
            [field]: inputValue,
        }));

        setError("");
    };

    const handleClose = () => {
        if (saving) return;

        setForm(initialForm);
        setError("");
        onClose();
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (!form.currentPassword.trim() || !form.newPassword || !form.confirmPassword) {
            setError("Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        if (form.newPassword.length < 8) {
            setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        if (form.currentPassword === form.newPassword) {
            setError("Mật khẩu mới phải khác mật khẩu hiện tại.");
            return;
        }

        try {
            setSaving(true);

            const result = await userApi.changeMyPassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });

            setForm(initialForm);
            onSuccess?.(result?.message || "Đổi mật khẩu thành công.");
            onClose();
        } catch (err: unknown) {
            const errorObject = err as {
                response?: {
                    data?: {
                        message?: string | string[];
                    };
                };
                message?: string;
            };

            const message = errorObject.response?.data?.message;

            setError(Array.isArray(message) ? message.join(", ") : message || errorObject.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <CommonModal
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) handleClose();
            }}
            title="Đổi mật khẩu"
            description="Cập nhật mật khẩu để bảo vệ tài khoản của bạn."
            size="md"
            footer={
                <div className="flex w-full justify-end gap-3">
                    <Button type="button" variant="secondary" onPress={handleClose} isDisabled={saving}>
                        Hủy
                    </Button>

                    <Button type="submit" form="change-password-form" isDisabled={saving}>
                        {saving ? "Đang cập nhật..." : "Đổi mật khẩu"}
                    </Button>
                </div>
            }
        >
            <form id="change-password-form" onSubmit={handleSubmit} className="space-y-4">
                <TextField className="w-full">
                    <Label>Mật khẩu hiện tại</Label>
                    <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder="Nhập mật khẩu hiện tại"
                        value={form.currentPassword}
                        onChange={(value) => updateField("currentPassword", value)}
                    />
                </TextField>

                <TextField className="w-full">
                    <Label>Mật khẩu mới</Label>
                    <Input type="password" autoComplete="new-password" placeholder="Nhập mật khẩu mới" value={form.newPassword} onChange={(value) => updateField("newPassword", value)} />
                </TextField>

                <TextField className="w-full">
                    <Label>Xác nhận mật khẩu mới</Label>
                    <Input type="password" autoComplete="new-password" placeholder="Nhập lại mật khẩu mới" value={form.confirmPassword} onChange={(value) => updateField("confirmPassword", value)} />
                </TextField>

                {error && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
                        {error}
                    </p>
                )}
            </form>
        </CommonModal>
    );
}
