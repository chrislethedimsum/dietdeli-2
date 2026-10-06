import CommonModal from "@/components/common/CommonModal";
import { Button, TextField, Input, Label, FieldError, Form } from "@heroui/react";
import { useState } from "react";

type UserSubscription = {
  id: number;
  id_User: number;
  package_id: number;
  user_note: string;
  plan_phone: string;
  plan_shipping_address: string;
};

export type UserSubscriptionFormData = {
  id: number;
  id_User: number;
  package_id: number;
  user_note: string;
  plan_phone: string;
  plan_shipping_address: string;
};

type MealPackageModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user_subscription?: UserSubscription | null;
  onSubmit?: (data: UserSubscriptionFormData) => void;
};

export default function EditMealPackageModal({ isOpen, onOpenChange, UserSubscription, onSubmit }: MealPackageModalProps) {
  const [phone, setPhone] = useState(UserSubscription?.plan_phone ?? "");
  const [shippingAddress, setShippingAddress] = useState(UserSubscription.plan_shipping_address ?? "");
  const [userNote, setUserNote] = useState(UserSubscription?.user_note ?? "");

  return (
    <CommonModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={"Sửa thông tin"}
      description={"Cập nhật thông tin gói ăn của bạn."}
      size="lg"
      footer={
        <div className="flex w-full justify-end gap-3">
          <Button type="button" className="border border-gray-200 bg-white text-gray-700" onPress={handleClose}>
            Huỷ
          </Button>

          <Button type="submit" form="dish-form" className="bg-emerald-600 text-white hover:bg-emerald-700">
            {"Lưu thay đổi"}
          </Button>
        </div>
      }
    >
      <Form id="dish-form" className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            name="nameVi"
            isRequired
            minLength={2}
            maxLength={100}
            defaultValue={dish?.nameVi ?? ""}
            validate={(value) => {
              if (!value.trim()) {
                return "Vui lòng nhập tên món ăn";
              }

              if (value.trim().length < 2) {
                return "Tên món ăn phải có ít nhất 2 ký tự";
              }

              return true;
            }}
          >
            <Label>Tên món (Tiếng Việt)</Label>

            <Input value={nameVi} onChange={(e) => setNameVi(e.target.value)} placeholder="Ví dụ: Ức gà áp chảo" />

            <FieldError />
          </TextField>

          <TextField
            name="nameEn"
            isRequired
            minLength={2}
            maxLength={100}
            defaultValue={dish?.nameEn ?? ""}
            validate={(value) => {
              if (!value.trim()) {
                return "Please fill the dish name";
              }

              if (value.trim().length < 2) {
                return "Dish name must be at least 2 characters";
              }

              return true;
            }}
          >
            <Label>Tên món (Tiếng Anh)</Label>

            <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Ví dụ: Grilled Chicken Breast" />

            <FieldError />
          </TextField>
        </div>

        <TextField name="descriptionVi" maxLength={500}>
          <Label>Mô tả (Tiếng Việt)</Label>

          <TextArea
            value={descriptionVi}
            onChange={(e) => setDescriptionVi(e.target.value)}
            placeholder="Nhập mô tả món ăn..."
            className="min-h-24 w-full"
          />

          <FieldError />
        </TextField>

        <TextField name="descriptionEn" maxLength={500}>
          <Label>Mô tả (Tiếng Anh)</Label>

          <TextArea
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            placeholder="Enter dish description..."
            className="min-h-24 w-full"
          />

          <FieldError />
        </TextField>

        <div>
          <Label className="mb-2 block">Hình ảnh món ăn</Label>

          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />

          <div className="flex flex-col gap-4 sm:flex-row">
            {imagePreview && (
              <div className="h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-gray-200">
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-32 flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 px-4 text-center hover:border-emerald-400 hover:bg-emerald-50/30"
            >
              <span className="text-sm font-medium text-gray-700">
                {image ? image.name : isEdit ? "Chọn hình ảnh mới" : "Chọn hình ảnh"}
              </span>

              <span className="mt-1 text-xs text-gray-400">PNG, JPG hoặc WEBP</span>
            </button>
          </div>
        </div>
      </Form>
    </CommonModal>
  );
}
