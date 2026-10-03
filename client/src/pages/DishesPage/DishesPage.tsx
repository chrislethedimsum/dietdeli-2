import { useEffect, useMemo, useState } from "react";
import { Card, Input, Label, TextField } from "@heroui/react";
import { getDishes, addDish, updateDish } from "../../api/dishes.api";
import { formatDate, removeVietnameseTones } from "../../utils";
import DishModal from "./components/AddDishModal";

type Dish = {
    id: number;
    nameVi: string;
    nameEn: string;
    descriptionVi: string;
    descriptionEn: string;
    image: string;
    createdAt: string;
};

export type DishFormData = {
    nameVi: string;
    nameEn: string;
    descriptionVi: string;
    descriptionEn: string;
    image: File | null;
};

/**
 * Skeleton card
 */
function DishCardSkeleton() {
    return (
        <Card className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            {/* Image */}
            <div className="aspect-[16/10] animate-pulse bg-gray-200" />

            <Card.Content className="p-4">
                {/* Name */}
                <div className="animate-pulse">
                    <div className="h-5 w-3/4 rounded bg-gray-200" />

                    <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
                </div>

                {/* Description */}
                <div className="mt-4 space-y-2 animate-pulse">
                    <div className="h-3 w-full rounded bg-gray-200" />

                    <div className="h-3 w-5/6 rounded bg-gray-200" />
                </div>
            </Card.Content>

            {/* Footer */}
            <Card.Footer className="border-t border-gray-100 p-3">
                <div className="flex w-full items-center justify-between animate-pulse">
                    <div className="h-3 w-24 rounded bg-gray-200" />

                    <div className="flex gap-3">
                        <div className="h-4 w-8 rounded bg-gray-200" />

                        <div className="h-4 w-12 rounded bg-gray-200" />
                    </div>
                </div>
            </Card.Footer>
        </Card>
    );
}

export default function DishesPage() {
    const [search, setSearch] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [dishes, setDishes] = useState<Dish[]>([]);

    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

    const [isLoading, setIsLoading] = useState(true);

    /**
     * Lấy danh sách món ăn
     */
    const fetchDishes = async () => {
        try {
            setIsLoading(true);

            const data = await getDishes();

            setDishes(data);
        } catch (error) {
            console.error("Error fetching dishes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Load danh sách khi page được mount
     */
    useEffect(() => {
        let cancelled = false;
        const loadDishes = async () => {
            try {
                setIsLoading(true);

                const data = await getDishes();

                if (!cancelled) {
                    setDishes(data);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Error fetching dishes:", error);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };
        loadDishes();
        return () => {
            cancelled = true;
        };
    }, []);

    /**
     * Mở modal sửa
     */
    const handleEdit = (dish: Dish) => {
        setSelectedDish(dish);
        setIsModalOpen(true);
    };

    /**
     * Mở modal xóa
     */
    const handleRemove = () => {
        alert("Xóa món ăn");
    }

    /**
     * Mở modal thêm
     */
    const handleOpenAddModal = () => {
        setSelectedDish(null);
        setIsModalOpen(true);
    };

    /**
     * Đóng modal
     */
    const handleModalOpenChange = (isOpen: boolean) => {
        setIsModalOpen(isOpen);

        if (!isOpen) {
            setSelectedDish(null);
        }
    };

    /**
     * Thêm món ăn
     */
    const handleAddDish = async (data: DishFormData) => {
        await addDish(data);
    };

    /**
     * Cập nhật món ăn
     */
    const handleUpdateDish = async (id: number, data: DishFormData) => {
        await updateDish(id, data);
    };

    /**
     * Submit modal
     *
     * Nếu selectedDish có giá trị
     * => UPDATE
     *
     * Nếu selectedDish null
     * => CREATE
     */
    const handleSubmitDish = async (data: DishFormData) => {
        try {
            if (selectedDish) {
                await handleUpdateDish(selectedDish.id, data);
            } else {
                await handleAddDish(data);
            }

            setIsModalOpen(false);
            setSelectedDish(null);

            await fetchDishes();
        } catch (error) {
            console.error("Lưu món ăn thất bại:", error);
        }
    };

    /**
     * Filter danh sách món ăn
     */
    const filteredDishes = useMemo(() => {
        const keyword = removeVietnameseTones(search);

        if (!keyword) {
            return dishes;
        }

        return dishes.filter((dish) => {
            const nameVi = removeVietnameseTones(dish.nameVi);

            const nameEn = removeVietnameseTones(dish.nameEn);

            const id = String(dish.id);

            return nameVi.includes(keyword) || nameEn.includes(keyword) || id.includes(keyword);
        });
    }, [dishes, search]);

    return (
        <div className="space-y-6">
            {/* =========================
                Header
            ========================= */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Món ăn</h1>

                    <p className="mt-1 text-sm text-gray-500">Quản lý các món ăn và thông tin dinh dưỡng</p>
                </div>

                <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 cursor-pointer"
                >
                    <span className="text-lg">+</span>
                    Thêm món ăn
                </button>
            </div>

            {/* =========================
                Main Card
            ========================= */}
            <Card className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                {/* Card Header */}
                <Card.Header className="border-b border-gray-100 p-5">
                    <Card.Title className="text-lg font-semibold text-gray-900">Danh sách món ăn</Card.Title>

                    <Card.Description>Tìm kiếm, xem và quản lý các món ăn của DietDeli</Card.Description>
                </Card.Header>

                <Card.Content className="p-0">
                    {/* =========================
                        Filters
                    ========================= */}
                    <div className="grid grid-cols-1 gap-4 border-b border-gray-100 p-5">
                        <TextField>
                            <Label>Tìm kiếm món ăn</Label>

                            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên món hoặc mã món..." className="w-full" />
                        </TextField>
                    </div>

                    {/* =========================
                        Loading
                    ========================= */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3">
                            {Array.from({
                                length: 6,
                            }).map((_, index) => (
                                <DishCardSkeleton key={index} />
                            ))}
                        </div>
                    ) : filteredDishes.length === 0 ? (
                        /* =========================
                            Empty
                        ========================= */
                        <div className="px-5 py-16 text-center">
                            <p className="text-sm font-medium text-gray-900">Không tìm thấy món ăn</p>

                            <p className="mt-1 text-sm text-gray-500">{search ? "Thử thay đổi từ khóa tìm kiếm." : "Chưa có món ăn nào trong hệ thống."}</p>
                        </div>
                    ) : (
                        /* =========================
                            Grid
                        ========================= */
                        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredDishes.map((dish) => (
                                <Card key={dish.id} className="group overflow-hidden rounded-xl border border-gray-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                    {/* Image */}
                                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                                        {dish.image ? (
                                            <img src={dish.image} alt={dish.nameVi} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-sm text-gray-400">Chưa có hình ảnh</div>
                                        )}

                                        {/* ID */}
                                        <div className="absolute right-3 top-3 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">#{dish.id}</div>
                                    </div>

                                    {/* Content */}
                                    <Card.Content className="p-4">
                                        {/* Name */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="truncate text-base font-semibold text-gray-900">{dish.nameVi}</h3>

                                                <p className="mt-0.5 truncate text-xs text-gray-400">{dish.nameEn}</p>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="mt-3 line-clamp-2 text-sm leading-5 text-gray-500">{dish.descriptionVi}</p>
                                    </Card.Content>

                                    {/* Footer */}
                                    <Card.Footer className="border-t border-gray-100 p-3">
                                        <div className="flex w-full items-center justify-between">
                                            <span className="text-xs text-gray-400">Tạo ngày {formatDate(dish.createdAt)}</span>

                                            <div className="flex items-center gap-3">
                                                <button type="button" onClick={() => handleEdit(dish)} className="cursor-pointer text-sm font-medium text-emerald-600 hover:text-emerald-700">
                                                    Sửa
                                                </button>

                                                <button type="button" onClick={handleRemove} className="cursor-pointer text-sm font-medium text-danger ">
                                                    Xóa
                                                </button>
                                            </div>
                                        </div>
                                    </Card.Footer>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* =========================
                        Footer
                    ========================= */}
                    <div className="border-t border-gray-100 px-5 py-4">
                        {isLoading ? (
                            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                        ) : (
                            <p className="text-sm text-gray-500">
                                Hiển thị <span className="font-medium text-gray-900">{filteredDishes.length}</span> / {dishes.length} món ăn
                            </p>
                        )}
                    </div>
                </Card.Content>
            </Card>

            {/* =========================
                Dish Modal
            ========================= */}
            <DishModal key={selectedDish?.id ?? "new"} isOpen={isModalOpen} onOpenChange={handleModalOpenChange} dish={selectedDish} onSubmit={handleSubmitDish} />
        </div>
    );
}
