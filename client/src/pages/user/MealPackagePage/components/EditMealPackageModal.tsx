import { useState } from "react";
import { Button, Form, Input, Label, TextArea, TextField } from "@heroui/react";
import { AlertCircle, Calendar, FileText, MapPin, Phone, Sparkles } from "lucide-react";
import CommonModal from "@/components/common/CommonModal";
import { subscriptionApi, type UserSubscription } from "@/api/subscription.api";

type EditMealPackageModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  subscription?: UserSubscription | null;
  onSuccess?: () => void;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

function EditMealPackageForm({
  subscription,
  onClose,
  onSuccess,
}: {
  subscription: UserSubscription;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [phone, setPhone] = useState(subscription.planPhone ?? "");
  const [shippingAddress, setShippingAddress] = useState(subscription.planShippingAddress ?? "");
  const [userNote, setUserNote] = useState(subscription.userNote ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim()) {
      setError("Vui lòng nhập số điện thoại nhận hàng.");
      return;
    }

    if (!shippingAddress.trim()) {
      setError("Vui lòng nhập địa chỉ giao hàng.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await subscriptionApi.updateSubscription(subscription.id, {
        planPhone: phone.trim(),
        planShippingAddress: shippingAddress.trim(),
        userNote: userNote.trim(),
      });

      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      console.error(err);
      const apiError = err as { response?: { data?: { message?: string } }; message?: string };
      setError(
        apiError?.response?.data?.message ||
          apiError?.message ||
          "Không thể cập nhật thông tin gói ăn. Vui lòng thử lại sau!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      id="edit-subscription-form"
      className="space-y-4"
      onSubmit={handleSubmit}
    >
      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Thông tin tóm tắt gói ăn (Readonly) */}
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
            <Sparkles size={14} className="text-emerald-600" />
            {subscription.package?.name}
          </span>
          <span className="font-medium text-emerald-700">
            Còn {subscription.remainingMeals} bữa
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <Calendar size={13} className="text-emerald-600 shrink-0" />
          <span>
            Hạn dùng: {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
          </span>
        </div>
      </div>

      {/* 1. Số điện thoại nhận hàng */}
      <TextField name="planPhone" isRequired>
        <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          <Phone size={13} className="text-emerald-600" />
          Số điện thoại nhận cơm
        </Label>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ví dụ: 0987654321"
          className="mt-1"
        />
      </TextField>

      {/* 2. Địa chỉ giao hàng */}
      <TextField name="planShippingAddress" isRequired>
        <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          <MapPin size={13} className="text-emerald-600" />
          Địa chỉ giao cơm
        </Label>
        <Input
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
          className="mt-1"
        />
      </TextField>

      {/* 3. Ghi chú của khách hàng */}
      <TextField name="userNote">
        <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          <FileText size={13} className="text-emerald-600" />
          Ghi chú cho Bếp & Shipper
        </Label>
        <TextArea
          value={userNote}
          onChange={(e) => setUserNote(e.target.value)}
          placeholder="Ví dụ: Giao trước 11h30, không hành, gửi lễ tân tầng 1..."
          className="mt-1 min-h-20 w-full"
        />
      </TextField>

      {loading && (
        <div className="text-center text-xs text-gray-400">
          Đang lưu thay đổi...
        </div>
      )}
    </Form>
  );
}

export default function EditMealPackageModal({
  isOpen,
  onOpenChange,
  subscription,
  onSuccess,
}: EditMealPackageModalProps) {
  return (
    <CommonModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Sửa thông tin gói ăn"
      description="Cập nhật địa chỉ, số điện thoại giao hàng và ghi chú cho gói ăn của bạn."
      size="md"
      footer={
        <div className="flex w-full justify-end gap-3">
          <Button
            type="button"
            className="border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
            onPress={() => onOpenChange(false)}
          >
            Hủy
          </Button>

          <Button
            type="submit"
            form="edit-subscription-form"
            className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold cursor-pointer shadow-sm"
          >
            Lưu thay đổi
          </Button>
        </div>
      }
    >
      {subscription ? (
        <EditMealPackageForm
          key={subscription.id}
          subscription={subscription}
          onClose={() => onOpenChange(false)}
          onSuccess={onSuccess}
        />
      ) : null}
    </CommonModal>
  );
}
