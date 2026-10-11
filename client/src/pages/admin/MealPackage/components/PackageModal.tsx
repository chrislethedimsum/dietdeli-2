import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@heroui/react";

import CommonModal from "@/components/common/CommonModal";
import type { MealPackage, CreateMealPackageDto } from "@/api/meal-package.api";
import { useAlertStore } from "@/store/useAlertStore";
import { getErrorMessage } from "@/utils";

interface PackageFormData {
    name: string;
    description: string;
    caloriesPerMeal: string;
    durationDays: string;
    totalMeals: string;
    price: string;
}

interface PackageModalProps {
    isOpen: boolean;
    initialData: MealPackage | null;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (data: CreateMealPackageDto) => Promise<void>;
}

const emptyForm: PackageFormData = {
    name: "",
    description: "",
    caloriesPerMeal: "500",
    durationDays: "30",
    totalMeals: "60",
    price: "",
};

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function PackageModal({ isOpen, initialData, onOpenChange, onSave }: PackageModalProps) {
    const [form, setForm] = useState<PackageFormData>(() =>
        initialData
            ? {
                  name: initialData.name ?? "",
                  description: initialData.description ?? "",
                  caloriesPerMeal: String(initialData.caloriesPerMeal),
                  durationDays: String(initialData.durationDays),
                  totalMeals: String(initialData.totalMeals),
                  price: String(initialData.price),
              }
            : { ...emptyForm }
    );

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    // Đồng bộ dữ liệu khi mở modal thêm mới hoặc chuyển sang sửa gói khác.
    const [previousState, setPreviousState] = useState({
        isOpen,
        packageId: initialData?.id ?? null,
    });

    const packageId = initialData?.id ?? null;

    if (previousState.isOpen !== isOpen || previousState.packageId !== packageId) {
        setPreviousState({ isOpen, packageId });

        if (isOpen) {
            setForm(
                initialData
                    ? {
                          name: initialData.name ?? "",
                          description: initialData.description ?? "",
                          caloriesPerMeal: String(initialData.caloriesPerMeal),
                          durationDays: String(initialData.durationDays),
                          totalMeals: String(initialData.totalMeals),
                          price: String(initialData.price),
                      }
                    : { ...emptyForm }
            );
            setErrors({});
            setSaving(false);
        }
    }

    const updateField = (field: keyof PackageFormData, value: string) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [field]: "",
        }));
    };

    const handleDurationChange = (value: string) => {
        setForm((previous) => {
            const oldDuration = Number(previous.durationDays);
            const oldMeals = Number(previous.totalMeals);
            const newDuration = Number(value);

            const followsDefault = oldMeals === oldDuration * 2 || previous.totalMeals === "";

            return {
                ...previous,
                durationDays: value,
                totalMeals: newDuration > 0 && followsDefault ? String(newDuration * 2) : previous.totalMeals,
            };
        });

        setErrors((previous) => ({
            ...previous,
            durationDays: "",
            totalMeals: "",
        }));
    };

    const validate = () => {
        const nextErrors: Record<string, string> = {};

        if (!form.name.trim()) {
            nextErrors.name = "Vui lòng nhập tên gói.";
        }

        if (!form.durationDays || !Number.isInteger(Number(form.durationDays)) || Number(form.durationDays) <= 0) {
            nextErrors.durationDays = "Thời hạn phải là số nguyên lớn hơn 0.";
        }

        if (!form.totalMeals || !Number.isInteger(Number(form.totalMeals)) || Number(form.totalMeals) <= 0) {
            nextErrors.totalMeals = "Tổng số bữa phải là số nguyên lớn hơn 0.";
        }

        if (form.caloriesPerMeal === "" || !Number.isInteger(Number(form.caloriesPerMeal)) || Number(form.caloriesPerMeal) < 0) {
            nextErrors.caloriesPerMeal = "Calo mỗi bữa phải là số nguyên không âm.";
        }

        if (!form.price || !Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
            nextErrors.price = "Giá gói phải lớn hơn 0.";
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const { showAlert } = useAlertStore();
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validate() || saving) return;

        const payload: CreateMealPackageDto = {
            name: form.name.trim(),
            description: form.description.trim(),
            caloriesPerMeal: Number(form.caloriesPerMeal),
            durationDays: Number(form.durationDays),
            totalMeals: Number(form.totalMeals),
            price: Number(form.price),
        };

        setSaving(true);

        try {
            await onSave(payload);
        } catch (error) {
            showAlert("error", getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    return (
        <CommonModal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={initialData ? "Chỉnh sửa gói suất ăn" : "Thêm gói suất ăn"}
            description="Nhập thông tin gói dịch vụ dinh dưỡng."
            size="lg"
            footer={
                <div className="flex w-full justify-end gap-2">
                    <Button type="button" variant="secondary" onPress={() => onOpenChange(false)} isDisabled={saving}>
                        Hủy
                    </Button>

                    <Button type="submit" form="mealpackage-form" variant="primary" isDisabled={saving}>
                        {saving ? "Đang lưu..." : initialData ? "Lưu thay đổi" : "Tạo gói suất ăn"}
                    </Button>
                </div>
            }
        >
            <form id="mealpackage-form" onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="package-name" className="mb-1.5 block text-sm font-medium text-gray-700">
                        Tên gói <span className="text-rose-500">*</span>
                    </label>

                    <input
                        id="package-name"
                        value={form.name}
                        onChange={(event) => updateField("name", event.target.value)}
                        placeholder="Ví dụ: Gói dinh dưỡng 30 ngày"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />

                    {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="package-duration" className="mb-1.5 block text-sm font-medium text-gray-700">
                            Thời hạn <span className="text-rose-500">*</span>
                        </label>

                        <select
                            id="package-duration"
                            value={form.durationDays}
                            onChange={(event) => handleDurationChange(event.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        >
                            <option value="7">7 ngày</option>
                            <option value="14">14 ngày</option>
                            <option value="30">30 ngày</option>
                            <option value="60">60 ngày</option>
                            <option value="90">90 ngày</option>
                            <option value="180">180 ngày</option>
                            <option value="365">365 ngày</option>
                        </select>

                        {errors.durationDays && <p className="mt-1 text-xs text-rose-600">{errors.durationDays}</p>}
                    </div>

                    <div>
                        <label htmlFor="package-meals" className="mb-1.5 block text-sm font-medium text-gray-700">
                            Tổng số bữa <span className="text-rose-500">*</span>
                        </label>

                        <input
                            id="package-meals"
                            type="number"
                            min="1"
                            step="1"
                            value={form.totalMeals}
                            onChange={(event) => updateField("totalMeals", event.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />

                        {errors.totalMeals && <p className="mt-1 text-xs text-rose-600">{errors.totalMeals}</p>}
                    </div>

                    <div>
                        <label htmlFor="package-calories" className="mb-1.5 block text-sm font-medium text-gray-700">
                            Calo mỗi bữa (kcal) <span className="text-rose-500">*</span>
                        </label>

                        <input
                            id="package-calories"
                            type="number"
                            min="0"
                            step="1"
                            value={form.caloriesPerMeal}
                            onChange={(event) => updateField("caloriesPerMeal", event.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />

                        {errors.caloriesPerMeal && <p className="mt-1 text-xs text-rose-600">{errors.caloriesPerMeal}</p>}
                    </div>

                    <div>
                        <label htmlFor="package-price" className="mb-1.5 block text-sm font-medium text-gray-700">
                            Giá gói (VND) <span className="text-rose-500">*</span>
                        </label>

                        <input
                            id="package-price"
                            type="number"
                            min="1"
                            step="1"
                            value={form.price}
                            onChange={(event) => updateField("price", event.target.value)}
                            placeholder="Ví dụ: 4500000"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />

                        {errors.price && <p className="mt-1 text-xs text-rose-600">{errors.price}</p>}

                        {Number(form.price) > 0 && <p className="mt-1.5 text-xs text-gray-500">{formatCurrency(Number(form.price))}</p>}
                    </div>
                </div>

                <div>
                    <label htmlFor="package-description" className="mb-1.5 block text-sm font-medium text-gray-700">
                        Mô tả
                    </label>

                    <textarea
                        id="package-description"
                        rows={3}
                        value={form.description}
                        onChange={(event) => updateField("description", event.target.value)}
                        placeholder="Mô tả thông tin và quyền lợi của gói..."
                        className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                </div>
            </form>
        </CommonModal>
    );
}
