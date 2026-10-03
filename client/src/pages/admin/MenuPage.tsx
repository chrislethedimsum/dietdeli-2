import { useMemo, useState } from "react";
import { Card, Input, Label, ListBox, Select, TextField } from "@heroui/react";

type Dish = {
    id: string;
    nameVi: string;
    nameEn: string;
    image: string;
    calories: number;
};

type MenuDay = {
    id: number;
    dayName: string;
    date: string;
    dishes: Dish[];
};

const menuDays: MenuDay[] = [
    {
        id: 1,
        dayName: "Thứ 2",
        date: "28/09/2026",
        dishes: [
            {
                id: "DISH-001",
                nameVi: "Ức gà áp chảo",
                nameEn: "Pan-seared Chicken Breast",
                image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435",
                calories: 420,
            },
            {
                id: "DISH-004",
                nameVi: "Salad ức gà",
                nameEn: "Chicken Breast Salad",
                image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
                calories: 320,
            },
        ],
    },
    {
        id: 2,
        dayName: "Thứ 3",
        date: "29/09/2026",
        dishes: [
            {
                id: "DISH-002",
                nameVi: "Cá hồi nướng",
                nameEn: "Grilled Salmon",
                image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288",
                calories: 510,
            },
            {
                id: "DISH-005",
                nameVi: "Cơm gạo lứt thịt gà",
                nameEn: "Brown Rice Chicken",
                image: "https://images.unsplash.com/photo-1512058564366-18510be2db19",
                calories: 480,
            },
        ],
    },
    {
        id: 3,
        dayName: "Thứ 4",
        date: "30/09/2026",
        dishes: [
            {
                id: "DISH-003",
                nameVi: "Bò lúc lắc",
                nameEn: "Vietnamese Shaking Beef",
                image: "https://images.unsplash.com/photo-1544025162-d76694265947",
                calories: 560,
            },
            {
                id: "DISH-007",
                nameVi: "Tôm xào rau củ",
                nameEn: "Stir-fried Shrimp",
                image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828",
                calories: 390,
            },
        ],
    },
    {
        id: 4,
        dayName: "Thứ 5",
        date: "01/10/2026",
        dishes: [
            {
                id: "DISH-008",
                nameVi: "Trứng cuộn rau củ",
                nameEn: "Vegetable Egg Roll",
                image: "https://images.unsplash.com/photo-1525351484163-7529414344d8",
                calories: 280,
            },
            {
                id: "DISH-001",
                nameVi: "Ức gà áp chảo",
                nameEn: "Pan-seared Chicken Breast",
                image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435",
                calories: 420,
            },
        ],
    },
    {
        id: 5,
        dayName: "Thứ 6",
        date: "02/10/2026",
        dishes: [
            {
                id: "DISH-002",
                nameVi: "Cá hồi nướng",
                nameEn: "Grilled Salmon",
                image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288",
                calories: 510,
            },
            {
                id: "DISH-003",
                nameVi: "Bò lúc lắc",
                nameEn: "Vietnamese Shaking Beef",
                image: "https://images.unsplash.com/photo-1544025162-d76694265947",
                calories: 560,
            },
        ],
    },
    {
        id: 6,
        dayName: "Thứ 7",
        date: "03/10/2026",
        dishes: [
            {
                id: "DISH-005",
                nameVi: "Cơm gạo lứt thịt gà",
                nameEn: "Brown Rice Chicken",
                image: "https://images.unsplash.com/photo-1512058564366-18510be2db19",
                calories: 480,
            },
            {
                id: "DISH-007",
                nameVi: "Tôm xào rau củ",
                nameEn: "Stir-fried Shrimp",
                image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828",
                calories: 390,
            },
        ],
    },
    {
        id: 7,
        dayName: "Chủ nhật",
        date: "04/10/2026",
        dishes: [
            {
                id: "DISH-004",
                nameVi: "Salad ức gà",
                nameEn: "Chicken Breast Salad",
                image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
                calories: 320,
            },
            {
                id: "DISH-008",
                nameVi: "Trứng cuộn rau củ",
                nameEn: "Vegetable Egg Roll",
                image: "https://images.unsplash.com/photo-1525351484163-7529414344d8",
                calories: 280,
            },
        ],
    },
];

const getWeekNumber = () => {
    return "Tuần 40 - 2026";
};

function DishItem({ dish }: { dish: Dish }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
            <img src={dish.image} alt={dish.nameVi} className="h-16 w-16 shrink-0 rounded-lg object-cover" />

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{dish.nameVi}</p>

                <p className="mt-0.5 truncate text-xs text-gray-400">{dish.nameEn}</p>

                <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-gray-500">{dish.id}</span>

                    <span className="text-xs text-emerald-600">{dish.calories} kcal</span>
                </div>
            </div>

            <button type="button" className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-white hover:text-gray-700" aria-label={`Chỉnh sửa ${dish.nameVi}`}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 7.5-7.5z" />
                </svg>
            </button>
        </div>
    );
}

export default function MenuPage() {
    const [search, setSearch] = useState("");
    const [week, setWeek] = useState("current");

    const filteredDays = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        if (!keyword) {
            return menuDays;
        }

        return menuDays
            .map((day) => ({
                ...day,
                dishes: day.dishes.filter((dish) => dish.nameVi.toLowerCase().includes(keyword) || dish.nameEn.toLowerCase().includes(keyword) || dish.id.toLowerCase().includes(keyword)),
            }))
            .filter((day) => day.dishes.length > 0);
    }, [search]);

    const totalDishes = menuDays.reduce((sum, day) => sum + day.dishes.length, 0);

    const totalCalories = menuDays.reduce((sum, day) => sum + day.dishes.reduce((dishSum, dish) => dishSum + dish.calories, 0), 0);

    const averageCalories = Math.round(totalCalories / totalDishes);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Menu</h1>

                    <p className="mt-1 text-sm text-gray-500">Quản lý thực đơn theo tuần</p>
                </div>

                <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700">
                    <span className="text-lg">+</span>
                    Thêm món vào menu
                </button>
            </div>

            {/* Week selector */}
            <Card className="rounded-xl border border-gray-200 shadow-sm">
                <Card.Content className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Menu hiện tại</p>

                            <h2 className="mt-1 text-xl font-bold text-gray-900">{getWeekNumber()}</h2>

                            <p className="mt-1 text-sm text-gray-500">28/09/2026 - 04/10/2026</p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row items-end">
                            <Select value={week} onChange={() => setWeek} className="w-full sm:w-52">
                                <Label>Tuần</Label>

                                <Select.Trigger>
                                    <Select.Value />
                                    <Select.Indicator />
                                </Select.Trigger>

                                <Select.Popover>
                                    <ListBox>
                                        <ListBox.Item id="current" textValue="Tuần hiện tại">
                                            Tuần hiện tại
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>

                                        <ListBox.Item id="previous" textValue="Tuần trước">
                                            Tuần trước
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>

                                        <ListBox.Item id="next" textValue="Tuần sau">
                                            Tuần sau
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                    </ListBox>
                                </Select.Popover>
                            </Select>

                            <button type="button" className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                                Sao chép tuần
                            </button>
                        </div>
                    </div>
                </Card.Content>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="rounded-xl border border-gray-200 shadow-sm">
                    <Card.Content className="p-5">
                        <p className="text-sm text-gray-500">Số ngày</p>

                        <p className="mt-2 text-2xl font-bold text-gray-900">7</p>

                        <p className="mt-1 text-xs text-gray-500">Trong tuần</p>
                    </Card.Content>
                </Card>

                <Card className="rounded-xl border border-gray-200 shadow-sm">
                    <Card.Content className="p-5">
                        <p className="text-sm text-gray-500">Tổng món</p>

                        <p className="mt-2 text-2xl font-bold text-emerald-600">{totalDishes}</p>

                        <p className="mt-1 text-xs text-gray-500">2 món mỗi ngày</p>
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

            {/* Search */}
            <Card className="rounded-xl border border-gray-200 shadow-sm">
                <Card.Content className="p-5">
                    <TextField>
                        <Label>Tìm kiếm món trong menu</Label>

                        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm món ăn trong menu..." className="w-full" />
                    </TextField>
                </Card.Content>
            </Card>

            {/* Weekly menu */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
                {filteredDays.map((day) => (
                    <Card key={day.id} className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                        {/* Day header */}
                        <Card.Header className="border-b border-gray-100 bg-gray-50 p-4">
                            <div className="flex w-full items-center justify-between">
                                <div>
                                    <Card.Title className="text-base font-semibold text-gray-900">{day.dayName}</Card.Title>

                                    <Card.Description className="mt-1">{day.date}</Card.Description>
                                </div>

                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">{day.dishes.length} món</span>
                            </div>
                        </Card.Header>

                        {/* Dishes */}
                        <Card.Content className="space-y-3 p-4">
                            {day.dishes.map((dish) => (
                                <DishItem key={dish.id} dish={dish} />
                            ))}

                            {day.dishes.length < 2 && (
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-4 text-sm font-medium text-gray-500 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600"
                                >
                                    <span className="text-lg">+</span>
                                    Thêm món
                                </button>
                            )}
                        </Card.Content>

                        {/* Footer */}
                        <Card.Footer className="border-t border-gray-100 p-3">
                            <div className="flex w-full items-center justify-between">
                                <span className="text-xs text-gray-400">{day.dishes.length}/2 món</span>

                                <button type="button" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                                    Chỉnh sửa
                                </button>
                            </div>
                        </Card.Footer>
                    </Card>
                ))}
            </div>

            {/* Empty */}
            {filteredDays.length === 0 && (
                <Card className="rounded-xl border border-gray-200 shadow-sm">
                    <Card.Content className="py-16 text-center">
                        <p className="text-sm font-medium text-gray-900">Không tìm thấy món ăn</p>

                        <p className="mt-1 text-sm text-gray-500">Thử tìm kiếm với tên món hoặc mã món khác.</p>
                    </Card.Content>
                </Card>
            )}
        </div>
    );
}
