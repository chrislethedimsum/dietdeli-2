import { useEffect, useMemo, useState } from "react";
import { Card, Label, ListBox, Select } from "@heroui/react";
import { Plus, Trash2 } from "lucide-react";

import SelectDishModal, { type Dish } from "./components/SelectDishModal";

import { createMenu, deleteMenu, getMenusByDateRange, type Menu } from "@/api/menu.api";
import { getDishes } from "@/api/dishes.api";
import { formatLocalDate, getCurrentWeekDates } from "@/utils";

export default function MenuPage() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [dishes, setDishes] = useState<Dish[]>([]);

    const [week, setWeek] = useState("current");

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [isSelectDishOpen, setIsSelectDishOpen] = useState(false);

    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const [selectedExistingDishIds, setSelectedExistingDishIds] = useState<number[]>([]);

    /**
     * =========================
     * Get selected week
     * =========================
     */
    const selectedWeekDates = useMemo(() => {
        const currentWeek = getCurrentWeekDates();

        const firstDate = new Date(`${currentWeek[0]}T00:00:00`);

        if (week === "previous") {
            firstDate.setDate(firstDate.getDate() - 7);
        }

        if (week === "next") {
            firstDate.setDate(firstDate.getDate() + 7);
        }

        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(firstDate);

            date.setDate(firstDate.getDate() + index);

            return formatLocalDate(date);
        });
    }, [week]);

    const startDate = selectedWeekDates[0];
    const endDate = selectedWeekDates[6];

    /**
     * =========================
     * Fetch menu theo tuần
     * =========================
     */
    const fetchMenus = async () => {
        if (!startDate || !endDate) {
            return;
        }

        try {
            setLoading(true);

            const data = await getMenusByDateRange(startDate, endDate);

            setMenus(data);
        } catch (error) {
            console.error("Không thể lấy danh sách menu:", error);

            setMenus([]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * =========================
     * Fetch dishes
     * =========================
     */
    const fetchDishes = async () => {
        try {
            const data = await getDishes();

            setDishes(data);
        } catch (error) {
            console.error("Không thể lấy danh sách món ăn:", error);

            setDishes([]);
        }
    };

    /**
     * =========================
     * Load dishes
     * =========================
     */
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchDishes();
    }, []);

    /**
     * =========================
     * Load menu khi đổi tuần
     * =========================
     */
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchMenus();
    }, [startDate, endDate]);

    /**
     * =========================
     * Group menu theo ngày
     * =========================
     */
    const menuDays = useMemo(() => {
        return selectedWeekDates.map((date) => ({
            date,
            dishes: menus.filter((menu) => menu.date.slice(0, 10) === date),
        }));
    }, [menus, selectedWeekDates]);

    /**
     * =========================
     * Open select dish modal
     * =========================
     */
    const handleOpenSelectDish = (date: string, existingDishIds: number[]) => {
        setSelectedDate(date);

        setSelectedExistingDishIds(existingDishIds);

        setIsSelectDishOpen(true);
    };

    /**
     * =========================
     * Select dish
     * =========================
     */
    const handleSelectDish = async (dishId: number) => {
        if (!selectedDate) {
            return;
        }

        try {
            setSaving(true);

            await createMenu({
                dishId,
                date: selectedDate,
            });

            setIsSelectDishOpen(false);
            setSelectedDate(null);
            setSelectedExistingDishIds([]);

            await fetchMenus();
        } catch (error) {
            console.error(error);

            alert(error instanceof Error ? error.message : "Không thể thêm món vào menu");
        } finally {
            setSaving(false);
        }
    };

    /**
     * =========================
     * Delete menu
     * =========================
     */
    const handleDelete = async (menuId: number) => {
        const confirmed = window.confirm("Bạn có chắc muốn xoá món này khỏi menu?");

        if (!confirmed) {
            return;
        }

        try {
            setSaving(true);

            await deleteMenu(menuId);

            await fetchMenus();
        } catch (error) {
            console.error(error);

            alert(error instanceof Error ? error.message : "Không thể xoá món");
        } finally {
            setSaving(false);
        }
    };

    /**
     * =========================
     * Format date
     * =========================
     */
    const formatDate = (date: string) => {
        return new Date(`${date}T00:00:00`).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    /**
     * =========================
     * Day name
     * =========================
     */
    const getDayName = (date: string) => {
        const day = new Date(`${date}T00:00:00`).getDay();

        switch (day) {
            case 1:
                return "Thứ 2";
            case 2:
                return "Thứ 3";
            case 3:
                return "Thứ 4";
            case 4:
                return "Thứ 5";
            case 5:
                return "Thứ 6";
            case 6:
                return "Thứ 7";
            default:
                return "Chủ nhật";
        }
    };

    /**
     * =========================
     * Week title
     * =========================
     */
    const weekTitle = useMemo(() => {
        switch (week) {
            case "previous":
                return "Tuần trước";

            case "next":
                return "Tuần sau";

            default:
                return "Tuần hiện tại";
        }
    }, [week]);

    return (
        <div className="space-y-6">
            {/* ================= Header ================= */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Menu</h1>

                <p className="mt-1 text-sm text-gray-500">Quản lý thực đơn theo tuần</p>
            </div>

            {/* ================= Week selector ================= */}
            <Card className="rounded-xl border border-gray-200 shadow-sm">
                <Card.Content className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Menu</p>

                            <h2 className="mt-1 text-xl font-bold text-gray-900">{weekTitle}</h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {formatDate(startDate)} - {formatDate(endDate)}
                            </p>
                        </div>

                        <Select value={week} onChange={(value) => setWeek(value ? String(value) : "current")} className="w-full sm:w-52">
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
                    </div>
                </Card.Content>
            </Card>

            {/* ================= Weekly menu ================= */}
            {loading ? (
                <div className="py-12 text-center text-sm text-gray-500">Đang tải menu...</div>
            ) : (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
                    {menuDays.map((day) => {
                        const slots = [day.dishes[0] ?? null, day.dishes[1] ?? null];

                        return (
                            <Card key={day.date} className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                                {/* Day header */}
                                <Card.Header className="border-b border-gray-100 bg-gray-50 p-4">
                                    <div className="flex w-full items-center justify-between">
                                        <div>
                                            <Card.Title className="text-base font-semibold text-gray-900">{getDayName(day.date)}</Card.Title>

                                            <Card.Description className="mt-1">{formatDate(day.date)}</Card.Description>
                                        </div>

                                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">{day.dishes.length}/2 món</span>
                                    </div>
                                </Card.Header>

                                {/* Dishes */}
                                <Card.Content className="space-y-3 p-4">
                                    {slots.map((menu, index) => {
                                        if (!menu) {
                                            return (
                                                <button
                                                    key={`empty-${day.date}-${index}`}
                                                    type="button"
                                                    disabled={saving}
                                                    onClick={() =>
                                                        handleOpenSelectDish(
                                                            day.date,
                                                            day.dishes.map((item) => item.dishId)
                                                        )
                                                    }
                                                    className="flex min-h-[88px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white transition hover:border-emerald-400 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <Plus size={20} className="text-emerald-600" />

                                                    <span className="text-sm font-medium text-gray-500">Thêm món</span>
                                                </button>
                                            );
                                        }

                                        return (
                                            <div key={menu.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                                                {/* Image */}
                                                {menu.dish.image ? (
                                                    <img src={menu.dish.image} alt={menu.dish.nameVi} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-xs text-gray-400">No image</div>
                                                )}

                                                {/* Info */}
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-gray-900">{menu.dish.nameVi}</p>

                                                    <p className="mt-0.5 truncate text-xs text-gray-400">{menu.dish.nameEn}</p>
                                                </div>

                                                {/* Delete */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(menu.id)}
                                                    disabled={saving}
                                                    className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                    aria-label="Xoá món"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </Card.Content>

                                {/* Footer */}
                                <Card.Footer className="border-t border-gray-100 p-3">
                                    <div className="flex w-full items-center justify-between">
                                        <span className="text-xs text-gray-400">{day.dishes.length}/2 món</span>

                                        {day.dishes.length < 2 && <span className="text-xs text-emerald-600">Còn {2 - day.dishes.length} món</span>}
                                    </div>
                                </Card.Footer>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* ================= Select dish modal ================= */}
            <SelectDishModal isOpen={isSelectDishOpen} onOpenChange={setIsSelectDishOpen} dishes={dishes} existingDishIds={selectedExistingDishIds} onSelect={handleSelectDish} loading={saving} />
        </div>
    );
}
