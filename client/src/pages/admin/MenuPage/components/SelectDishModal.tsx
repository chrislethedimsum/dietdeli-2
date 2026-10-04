import { useEffect, useMemo, useState } from "react";
import { Button, Input, Label, ListBox, Modal, TextField } from "@heroui/react";
import { Search, X } from "lucide-react";

export type Dish = {
    id: number;
    nameVi: string;
    nameEn: string;
    image?: string | null;
    isDeleted: boolean;
};

type SelectDishModalProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;

    dishes: Dish[];

    /**
     * Những dish đã được thêm vào ngày đang chọn.
     * Dùng để không cho chọn trùng món.
     */
    existingDishIds?: number[];

    /**
     * Trả về dishId khi user chọn món.
     */
    onSelect: (dishId: number) => void;

    loading?: boolean;
};

export default function SelectDishModal({ isOpen, onOpenChange, dishes, existingDishIds = [], onSelect, loading = false }: SelectDishModalProps) {
    const [search, setSearch] = useState("");
    const [selectedDishId, setSelectedDishId] = useState<string | null>(null);

    /**
     * Reset khi mở modal
     */
    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSearch("");
            setSelectedDishId(null);
        }
    }, [isOpen]);

    /**
     * Chỉ lấy dish chưa xoá
     * và chưa được thêm vào ngày hiện tại.
     */
    const availableDishes = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return dishes.filter((dish) => {
            // Không hiển thị dish đã xoá
            if (dish.isDeleted) {
                return false;
            }

            // Không cho thêm trùng món trong cùng ngày
            if (existingDishIds.includes(dish.id)) {
                return false;
            }

            if (!keyword) {
                return true;
            }

            return dish.nameVi.toLowerCase().includes(keyword) || dish.nameEn.toLowerCase().includes(keyword) || String(dish.id).includes(keyword);
        });
    }, [dishes, existingDishIds, search]);

    /**
     * Xác nhận
     */
    const handleConfirm = () => {
        if (!selectedDishId || loading) {
            return;
        }

        onSelect(Number(selectedDishId));
    };

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container size="md" className="p-4">
                <Modal.Dialog className="max-h-[90vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                    <Modal.CloseTrigger />

                    {/* Header */}
                    <Modal.Header className="border-b border-gray-100 px-6 py-5">
                        <div>
                            <Modal.Heading className="text-lg font-semibold text-gray-900">Chọn món ăn</Modal.Heading>

                            <p className="mt-1 text-sm text-gray-500">Chọn món để thêm vào menu</p>
                        </div>
                    </Modal.Header>

                    {/* Body */}
                    <Modal.Body className="overflow-hidden px-6 py-5">
                        <div className="space-y-4">
                            {/* Search */}
                            <TextField>
                                <Label>Tìm kiếm món ăn</Label>

                                <div className="relative">
                                    <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                    <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên món hoặc ID..." className="w-full pl-9" />

                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => setSearch("")}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                        >
                                            <X size={15} />
                                        </button>
                                    )}
                                </div>
                            </TextField>

                            {/* Result count */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">{availableDishes.length} món</span>

                                {selectedDishId && <span className="text-xs font-medium text-emerald-600">Đã chọn món #{selectedDishId}</span>}
                            </div>

                            {/* Dish list */}
                            <div className="max-h-[400px] overflow-y-auto rounded-xl border border-gray-200">
                                {availableDishes.length === 0 ? (
                                    <div className="px-4 py-12 text-center">
                                        <p className="text-sm font-medium text-gray-900">Không tìm thấy món ăn</p>

                                        <p className="mt-1 text-xs text-gray-500">Thử tìm kiếm với từ khóa khác.</p>
                                    </div>
                                ) : (
                                    <ListBox
                                        aria-label="Danh sách món ăn"
                                        selectionMode="single"
                                        selectedKeys={selectedDishId ? new Set([selectedDishId]) : new Set()}
                                        onSelectionChange={(keys) => {
                                            if (keys === "all") {
                                                return;
                                            }

                                            const value = Array.from(keys)[0];

                                            setSelectedDishId(value ? String(value) : null);
                                        }}
                                    >
                                        {availableDishes.map((dish) => (
                                            <ListBox.Item key={dish.id} id={String(dish.id)} textValue={`${dish.nameVi} ${dish.nameEn}`} className="border-b border-gray-100 px-4 py-3 last:border-b-0">
                                                <div className="flex items-center gap-3">
                                                    {/* Image */}
                                                    {dish.image ? (
                                                        <img src={dish.image} alt={dish.nameVi} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                                                    ) : (
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">No image</div>
                                                    )}

                                                    {/* Info */}
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-gray-900">{dish.nameVi}</p>

                                                        <p className="mt-0.5 truncate text-xs text-gray-400">{dish.nameEn}</p>
                                                    </div>

                                                    <ListBox.ItemIndicator />
                                                </div>
                                            </ListBox.Item>
                                        ))}
                                    </ListBox>
                                )}
                            </div>
                        </div>
                    </Modal.Body>

                    {/* Footer */}
                    <Modal.Footer className="border-t border-gray-100 px-6 py-4">
                        <div className="flex w-full justify-end gap-3">
                            <Button className="border border-gray-200 bg-white text-gray-700" onPress={() => onOpenChange(false)} isDisabled={loading}>
                                Huỷ
                            </Button>

                            <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onPress={handleConfirm} isDisabled={!selectedDishId || loading}>
                                {loading ? "Đang thêm..." : "Thêm vào menu"}
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
