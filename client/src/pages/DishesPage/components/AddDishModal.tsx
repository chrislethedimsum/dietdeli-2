import { useEffect, useRef, useState } from "react";
import { Button, FieldError, Form, Input, Label, TextArea, TextField } from "@heroui/react";
import CommonModal from "../../../components/common/CommonModal";

type Dish = {
    id: number;
    nameVi: string;
    nameEn: string;
    descriptionVi: string | null;
    descriptionEn: string | null;
    image: string | null;
};

type DishFormData = {
    nameVi: string;
    nameEn: string;
    descriptionVi: string;
    descriptionEn: string;
    image: File | null;
};

type DishModalProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    dish?: Dish | null;
    onSubmit?: (data: DishFormData) => void;
};

export default function DishModal({ isOpen, onOpenChange, dish, onSubmit }: DishModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [nameVi, setNameVi] = useState("");
    const [nameEn, setNameEn] = useState("");
    const [descriptionVi, setDescriptionVi] = useState("");
    const [descriptionEn, setDescriptionEn] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const isEdit = !!dish;

    const resetForm = () => {
        setNameVi("");
        setNameEn("");
        setDescriptionVi("");
        setDescriptionEn("");
        setImage(null);
        setImagePreview(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClose = () => {
        resetForm();
        onOpenChange(false);
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setImage(file);

        // Xóa preview cũ nếu có
        if (imagePreview?.startsWith("blob:")) {
            URL.revokeObjectURL(imagePreview);
        }

        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = () => {
        if (!nameVi.trim()) {
            return;
        }

        onSubmit?.({
            nameVi: nameVi.trim(),
            nameEn: nameEn.trim(),
            descriptionVi: descriptionVi.trim(),
            descriptionEn: descriptionEn.trim(),
            image,
        });

        handleClose();
    };

    /**
     * Khi mở modal:
     * - Add: reset form
     * - Edit: fill dữ liệu dish
     */
    
    useEffect(() => {
        if (!isOpen) return;

        if (dish) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setNameVi(dish.nameVi);
            setNameEn(dish.nameEn);
            setDescriptionVi(dish.descriptionVi ?? "");
            setDescriptionEn(dish.descriptionEn ?? "");
            setImage(null);
            setImagePreview(dish.image);
        } else {
            resetForm();
        }
    }, [isOpen, dish]);

    return (
        <CommonModal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={isEdit ? "Sửa món ăn" : "Thêm món ăn"}
            description={isEdit ? "Cập nhật thông tin món ăn." : "Nhập thông tin món ăn mới vào hệ thống."}
            size="lg"
            footer={
                <div className="flex w-full justify-end gap-3">
                    <Button className="border border-gray-200 bg-white text-gray-700" onPress={handleClose}>
                        Huỷ
                    </Button>

                    <Button type="submit" form="dish-form" className="bg-emerald-600 text-white hover:bg-emerald-700">
                        {isEdit ? "Lưu thay đổi" : "Thêm món ăn"}
                    </Button>
                </div>
            }
        >
            <Form id="dish-form" className="space-y-5" onSubmit={handleSubmit}>
                {/* Tên món */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TextField
                        name="nameVi"
                        isRequired
                        minLength={2}
                        maxLength={100}
                        validate={(value) => {
                            if (!value.trim()) {
                                return "Vui lòng nhập tên món ăn";
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
                        validate={(value) => {
                            if (!value.trim()) {
                                return "Vui lòng nhập tên món ăn";
                            }

                            return true;
                        }}
                    >
                        <Label>Tên món (Tiếng Anh)</Label>

                        <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Ví dụ: Grilled Chicken Breast" />

                        <FieldError />
                    </TextField>
                </div>

                {/* Mô tả tiếng Việt */}
                <TextField name="descriptionVi" maxLength={500}>
                    <Label>Mô tả (Tiếng Việt)</Label>

                    <TextArea value={descriptionVi} onChange={(e) => setDescriptionVi(e.target.value)} placeholder="Nhập mô tả món ăn..." className="min-h-24 w-full" />

                    <FieldError />
                </TextField>

                {/* Mô tả tiếng Anh */}
                <TextField name="descriptionEn" maxLength={500}>
                    <Label>Mô tả (Tiếng Anh)</Label>

                    <TextArea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} placeholder="Enter dish description..." className="min-h-24 w-full" />

                    <FieldError />
                </TextField>

                {/* Image */}
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
                            <span className="text-sm font-medium text-gray-700">{image ? image.name : isEdit ? "Chọn hình ảnh mới" : "Chọn hình ảnh"}</span>

                            <span className="mt-1 text-xs text-gray-400">PNG, JPG hoặc WEBP</span>
                        </button>
                    </div>
                </div>
            </Form>
        </CommonModal>
    );
}
