import { useEffect, useState } from "react";
import { Card, Input, Label, ListBox, Select, TextField } from "@heroui/react";
import AddDishModal from "./components/AddDishModal";
import { getDishes, addDish, updateDish } from "../../api/dishes.api";
import { formatDate } from "../../utils";

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

export default function DishesPage() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<string>("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [selectedDish, setSelectedDish] = useState<Dish | null>();

    const handleEdit = (dish: Dish) => {
        setSelectedDish(dish);
        setIsModalOpen(true);
    };

    const handleAddDish = (data: { nameVi: string; nameEn: string; descriptionVi: string; descriptionEn: string; image: File | null }) => {
        addDish(data);
    };

    const handleUpdateDish = (id: number, data: { nameVi: string; nameEn: string; descriptionVi: string; descriptionEn: string; image: File | null }) => {
        updateDish(id, data);
    };

    const handleSubmitDish = async (data: DishFormData) => {
        try {
            if (selectedDish) {
                // UPDATE
                await handleUpdateDish(selectedDish.id, data);
            } else {
                // CREATE
                await handleAddDish(data);
            }

            setIsModalOpen(false);
            setSelectedDish(null);

            // load lại danh sách
            await fetchDishes();
        } catch (error) {
            console.error("Lưu món ăn thất bại:", error);
        }
    };

    const filteredDishes = [];
    // const filteredDishes = useMemo(() => {
    //     const keyword = search.toLowerCase().trim();

    //     return dishes.filter((dish) => {
    //         const matchesSearch = !keyword || dish.nameVi.toLowerCase().includes(keyword) || dish.nameEn.toLowerCase().includes(keyword) || dish.id.toLowerCase().includes(keyword);

    //         const matchesStatus = status === "all" || dish.status === status;

    //         return matchesSearch && matchesStatus;
    //     });
    // }, [search, status]);

    const fetchDishes = async () => {
        try {
            const data = await getDishes();
            setDishes(data);
        } catch (error) {
            console.error("Error fetching dishes:", error);
        }
    };

    useEffect(() => {
        fetchDishes();
        return;
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Món ăn</h1>

                    <p className="mt-1 text-sm text-gray-500">Quản lý các món ăn và thông tin dinh dưỡng</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    type="button"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                    <span className="text-lg">+</span>
                    Thêm món ăn
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card className="rounded-xl border border-gray-200 shadow-sm">
                    <Card.Content className="p-5">
                        <p className="text-sm text-gray-500">Tổng món ăn</p>

                        <p className="mt-2 text-2xl font-bold text-gray-900">{dishes.length}</p>

                        <p className="mt-1 text-xs text-gray-500">Tất cả món ăn</p>
                    </Card.Content>
                </Card>

                <Card className="rounded-xl border border-gray-200 shadow-sm">
                    <Card.Content className="p-5">
                        <p className="text-sm text-gray-500">Đang bán</p>

                        <p className="mt-2 text-2xl font-bold text-emerald-600">8</p>

                        <p className="mt-1 text-xs text-gray-500">Món đang có sẵn</p>
                    </Card.Content>
                </Card>

                <Card className="rounded-xl border border-gray-200 shadow-sm">
                    <Card.Content className="p-5">
                        <p className="text-sm text-gray-500">Ngừng bán</p>

                        <p className="mt-2 text-2xl font-bold text-red-600">8</p>

                        <p className="mt-1 text-xs text-gray-500">Món tạm ngừng</p>
                    </Card.Content>
                </Card>

                <Card className="rounded-xl border border-gray-200 shadow-sm">
                    <Card.Content className="p-5">
                        <p className="text-sm text-gray-500">Calories trung bình</p>

                        <p className="mt-2 text-2xl font-bold text-gray-900">8</p>

                        <p className="mt-1 text-xs text-gray-500">kcal / món</p>
                    </Card.Content>
                </Card>
            </div>

            {/* Main */}
            <Card className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <Card.Header className="border-b border-gray-100 p-5">
                    <Card.Title className="text-lg font-semibold text-gray-900">Danh sách món ăn</Card.Title>

                    <Card.Description>Tìm kiếm, xem và quản lý các món ăn của DietDeli</Card.Description>
                </Card.Header>

                <Card.Content className="p-0">
                    {/* Filters */}
                    <div className="grid grid-cols-1 gap-4 border-b border-gray-100 p-5 md:grid-cols-[1fr_220px]">
                        <TextField>
                            <Label>Tìm kiếm món ăn</Label>

                            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên món hoặc mã món..." className="w-full" />
                        </TextField>

                        <Select value={status} onChange={() => setStatus} className="w-full">
                            <Label>Trạng thái</Label>

                            <Select.Trigger>
                                <Select.Value />
                                <Select.Indicator />
                            </Select.Trigger>

                            <Select.Popover>
                                <ListBox>
                                    <ListBox.Item id="all" textValue="Tất cả">
                                        Tất cả
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>

                                    <ListBox.Item id="available" textValue="Đang bán">
                                        Đang bán
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>

                                    <ListBox.Item id="unavailable" textValue="Ngừng bán">
                                        Ngừng bán
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                </ListBox>
                            </Select.Popover>
                        </Select>
                    </div>

                    {/* Grid */}
                    {dishes.length === 0 ? (
                        <div className="px-5 py-16 text-center">
                            <p className="text-sm font-medium text-gray-900">Không tìm thấy món ăn</p>

                            <p className="mt-1 text-sm text-gray-500">Thử thay đổi từ khóa hoặc bộ lọc.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3">
                            {dishes.map((dish) => (
                                <Card key={dish.id} className="group overflow-hidden rounded-xl border border-gray-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                    {/* Image */}
                                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                                        <img src={dish.image} alt={dish.nameVi} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />

                                        <div className="absolute right-3 top-3 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">{dish.id}</div>
                                    </div>

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

                                        {/* Nutrition */}
                                        {/* <div className="mt-4 grid grid-cols-4 gap-2">
                                            <NutritionItem label="Calories" value={`${dish.calories} kcal`} />

                                            <NutritionItem label="Protein" value={`${dish.protein}g`} />

                                            <NutritionItem label="Carbs" value={`${dish.carbs}g`} />

                                            <NutritionItem label="Fat" value={`${dish.fat}g`} />
                                        </div> */}
                                    </Card.Content>

                                    {/* Actions */}
                                    <Card.Footer className="border-t border-gray-100 p-3">
                                        <div className="flex w-full items-center justify-between">
                                            <span className="text-xs text-gray-400">Tạo ngày {formatDate(dish.createdAt)}</span>

                                            <div className="flex items-center gap-3">
                                                <button onClick={() => handleEdit(dish)} type="button" className="text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer">
                                                    Sửa
                                                </button>

                                                <button type="button" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 cursor-pointer">
                                                    Chi tiết
                                                </button>
                                            </div>
                                        </div>
                                    </Card.Footer>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="border-t border-gray-100 px-5 py-4">
                        <p className="text-sm text-gray-500">
                            Hiển thị <span className="font-medium text-gray-900">{filteredDishes.length}</span> / {dishes.length} món ăn
                        </p>
                    </div>
                </Card.Content>
            </Card>

            <AddDishModal
                isOpen={isModalOpen}
                onOpenChange={(open) => {
                    setIsModalOpen(open);

                    if (!open) {
                        setSelectedDish(null);
                    }
                }}
                dish={selectedDish}
                onSubmit={handleSubmitDish}
            />
        </div>
    );
}
