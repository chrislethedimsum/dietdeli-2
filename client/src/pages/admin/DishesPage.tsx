import { useMemo, useState } from "react";
import { Card, Input, Label, ListBox, Select, TextField } from "@heroui/react";

type DishStatus = "available" | "unavailable";

type Dish = {
    id: string;
    nameVi: string;
    nameEn: string;
    descriptionVi: string;
    image: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    price: number;
    status: DishStatus;
    createdAt: string;
};

const dishes: Dish[] = [
    {
        id: "DISH-001",
        nameVi: "Ức gà áp chảo",
        nameEn: "Pan-seared Chicken Breast",
        descriptionVi: "Ức gà áp chảo kết hợp rau củ và khoai lang, giàu protein.",
        image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435",
        calories: 420,
        protein: 38,
        carbs: 32,
        fat: 14,
        price: 85000,
        status: "available",
        createdAt: "20/09/2026",
    },
    {
        id: "DISH-002",
        nameVi: "Cá hồi nướng",
        nameEn: "Grilled Salmon",
        descriptionVi: "Cá hồi nướng cùng bông cải xanh và khoai tây, giàu Omega-3.",
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288",
        calories: 510,
        protein: 35,
        carbs: 28,
        fat: 25,
        price: 125000,
        status: "available",
        createdAt: "20/09/2026",
    },
    {
        id: "DISH-003",
        nameVi: "Bò lúc lắc",
        nameEn: "Vietnamese Shaking Beef",
        descriptionVi: "Thịt bò mềm áp chảo cùng rau củ, cung cấp protein và năng lượng.",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947",
        calories: 560,
        protein: 42,
        carbs: 35,
        fat: 22,
        price: 110000,
        status: "available",
        createdAt: "21/09/2026",
    },
    {
        id: "DISH-004",
        nameVi: "Salad ức gà",
        nameEn: "Chicken Breast Salad",
        descriptionVi: "Salad rau xanh kết hợp ức gà và sốt mè rang.",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
        calories: 320,
        protein: 31,
        carbs: 18,
        fat: 12,
        price: 75000,
        status: "available",
        createdAt: "21/09/2026",
    },
    {
        id: "DISH-005",
        nameVi: "Cơm gạo lứt thịt gà",
        nameEn: "Brown Rice Chicken",
        descriptionVi: "Gạo lứt kết hợp ức gà, rau củ và trứng luộc.",
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19",
        calories: 480,
        protein: 36,
        carbs: 48,
        fat: 13,
        price: 90000,
        status: "available",
        createdAt: "22/09/2026",
    },
    {
        id: "DISH-006",
        nameVi: "Mì Ý bò bằm",
        nameEn: "Beef Bolognese",
        descriptionVi: "Mì Ý sốt cà chua thịt bò bằm, phù hợp cho bữa ăn giàu năng lượng.",
        image: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0",
        calories: 590,
        protein: 32,
        carbs: 65,
        fat: 18,
        price: 95000,
        status: "unavailable",
        createdAt: "22/09/2026",
    },
    {
        id: "DISH-007",
        nameVi: "Tôm xào rau củ",
        nameEn: "Stir-fried Shrimp",
        descriptionVi: "Tôm tươi xào cùng các loại rau củ theo mùa.",
        image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828",
        calories: 390,
        protein: 34,
        carbs: 25,
        fat: 15,
        price: 105000,
        status: "available",
        createdAt: "23/09/2026",
    },
    {
        id: "DISH-008",
        nameVi: "Trứng cuộn rau củ",
        nameEn: "Vegetable Egg Roll",
        descriptionVi: "Trứng cuộn với rau củ tươi, nhẹ nhàng và giàu dinh dưỡng.",
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8",
        calories: 280,
        protein: 19,
        carbs: 14,
        fat: 16,
        price: 65000,
        status: "available",
        createdAt: "23/09/2026",
    },
];

const statusConfig: Record<
    DishStatus,
    {
        label: string;
        className: string;
    }
> = {
    available: {
        label: "Đang bán",
        className: "bg-emerald-50 text-emerald-700",
    },
    unavailable: {
        label: "Ngừng bán",
        className: "bg-red-50 text-red-700",
    },
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);
};

function StatusBadge({ status }: { status: DishStatus }) {
    const config = statusConfig[status];

    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>{config.label}</span>;
}

function NutritionItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-[11px] text-gray-500">{label}</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-900">{value}</p>
        </div>
    );
}

export default function DishesPage() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<string>("all");

    const filteredDishes = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        return dishes.filter((dish) => {
            const matchesSearch = !keyword || dish.nameVi.toLowerCase().includes(keyword) || dish.nameEn.toLowerCase().includes(keyword) || dish.id.toLowerCase().includes(keyword);

            const matchesStatus = status === "all" || dish.status === status;

            return matchesSearch && matchesStatus;
        });
    }, [search, status]);

    const availableCount = dishes.filter((dish) => dish.status === "available").length;

    const unavailableCount = dishes.filter((dish) => dish.status === "unavailable").length;

    const averageCalories = Math.round(dishes.reduce((sum, dish) => sum + dish.calories, 0) / dishes.length);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Món ăn</h1>

                    <p className="mt-1 text-sm text-gray-500">Quản lý các món ăn và thông tin dinh dưỡng</p>
                </div>

                <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700">
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

                        <p className="mt-2 text-2xl font-bold text-emerald-600">{availableCount}</p>

                        <p className="mt-1 text-xs text-gray-500">Món đang có sẵn</p>
                    </Card.Content>
                </Card>

                <Card className="rounded-xl border border-gray-200 shadow-sm">
                    <Card.Content className="p-5">
                        <p className="text-sm text-gray-500">Ngừng bán</p>

                        <p className="mt-2 text-2xl font-bold text-red-600">{unavailableCount}</p>

                        <p className="mt-1 text-xs text-gray-500">Món tạm ngừng</p>
                    </Card.Content>
                </Card>

                <Card className="rounded-xl border border-gray-200 shadow-sm">
                    <Card.Content className="p-5">
                        <p className="text-sm text-gray-500">Calories trung bình</p>

                        <p className="mt-2 text-2xl font-bold text-gray-900">{averageCalories}</p>

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
                    {filteredDishes.length === 0 ? (
                        <div className="px-5 py-16 text-center">
                            <p className="text-sm font-medium text-gray-900">Không tìm thấy món ăn</p>

                            <p className="mt-1 text-sm text-gray-500">Thử thay đổi từ khóa hoặc bộ lọc.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredDishes.map((dish) => (
                                <Card key={dish.id} className="group overflow-hidden rounded-xl border border-gray-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                    {/* Image */}
                                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                                        <img src={dish.image} alt={dish.nameVi} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />

                                        <div className="absolute left-3 top-3">
                                            <StatusBadge status={dish.status} />
                                        </div>

                                        <div className="absolute right-3 top-3 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">{dish.id}</div>
                                    </div>

                                    <Card.Content className="p-4">
                                        {/* Name */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="truncate text-base font-semibold text-gray-900">{dish.nameVi}</h3>

                                                <p className="mt-0.5 truncate text-xs text-gray-400">{dish.nameEn}</p>
                                            </div>

                                            <p className="shrink-0 text-sm font-bold text-emerald-600">{formatCurrency(dish.price)}</p>
                                        </div>

                                        {/* Description */}
                                        <p className="mt-3 line-clamp-2 text-sm leading-5 text-gray-500">{dish.descriptionVi}</p>

                                        {/* Nutrition */}
                                        <div className="mt-4 grid grid-cols-4 gap-2">
                                            <NutritionItem label="Calories" value={`${dish.calories} kcal`} />

                                            <NutritionItem label="Protein" value={`${dish.protein}g`} />

                                            <NutritionItem label="Carbs" value={`${dish.carbs}g`} />

                                            <NutritionItem label="Fat" value={`${dish.fat}g`} />
                                        </div>
                                    </Card.Content>

                                    {/* Actions */}
                                    <Card.Footer className="border-t border-gray-100 p-3">
                                        <div className="flex w-full items-center justify-between">
                                            <span className="text-xs text-gray-400">Tạo ngày {dish.createdAt}</span>

                                            <div className="flex items-center gap-3">
                                                <button type="button" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                                                    Sửa
                                                </button>

                                                <button type="button" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
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
        </div>
    );
}
