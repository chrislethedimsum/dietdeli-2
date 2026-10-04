import { useEffect, useMemo, useState } from "react";
import { Card, Label, ListBox, Select } from "@heroui/react";
import { Plus, Trash2 } from "lucide-react";

import SelectDishModal, { type Dish } from "./components/SelectDishModal";

import { createMenu, deleteMenu, getMenusByDateRange, type Menu } from "@/api/menu.api";

import { getDishes } from "@/api/dishes.api";
import { formatLocalDate, getCurrentWeekDates } from "@/utils";
import ConfirmModal from "@/components/common/ConfirmModal";

export default function MenuPage() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [dishes, setDishes] = useState<Dish[]>([]);

    /**
     * =========================
     * Current year / week
     * =========================
     */
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    /**
     * Lấy ngày đầu tuần hiện tại
     * để xác định tuần hiện tại.
     */
    const currentWeekDates = getCurrentWeekDates();

    /**
     * =========================
     * Get ISO week number
     * =========================
     *
     * ISO week:
     * - Thứ 2 là ngày đầu tuần
     * - Tuần 1 là tuần chứa ngày thứ 4 đầu tiên của năm
     */
    const getWeekNumber = (date: Date) => {
        const target = new Date(date);

        target.setHours(0, 0, 0, 0);

        const dayNumber = (target.getDay() + 6) % 7;

        target.setDate(target.getDate() - dayNumber + 3);

        const firstThursday = new Date(target.getFullYear(), 0, 4);

        const firstThursdayDay = (firstThursday.getDay() + 6) % 7;

        firstThursday.setDate(firstThursday.getDate() - firstThursdayDay + 3);

        const weekNumber = 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000));

        return weekNumber;
    };

    /**
     * =========================
     * Initial week
     * =========================
     */
    const initialWeek = getWeekNumber(new Date(`${currentWeekDates[0]}T00:00:00`));

    const [year, setYear] = useState(currentYear);

    const [week, setWeek] = useState(initialWeek);

    const [loading, setLoading] = useState(false);

    const [saving, setSaving] = useState(false);

    const [isSelectDishOpen, setIsSelectDishOpen] = useState(false);

    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const [selectedExistingDishIds, setSelectedExistingDishIds] = useState<number[]>([]);

    /**
     * =========================
     * Get dates of selected week
     * =========================
     */
    const selectedWeekDates = useMemo(() => {
        /**
         * ISO week 1 luôn chứa ngày 4/1.
         */
        const january4 = new Date(year, 0, 4);

        const dayOfWeek = (january4.getDay() + 6) % 7;

        /**
         * Monday của tuần 1.
         */
        const mondayOfWeek1 = new Date(january4);

        mondayOfWeek1.setDate(january4.getDate() - dayOfWeek);

        /**
         * Monday của tuần được chọn.
         */
        const monday = new Date(mondayOfWeek1);

        monday.setDate(mondayOfWeek1.getDate() + (week - 1) * 7);

        /**
         * Tạo 7 ngày:
         * Thứ 2 -> Chủ nhật.
         */
        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(monday);

            date.setDate(monday.getDate() + index);

            return formatLocalDate(date);
        });
    }, [year, week]);

    const startDate = selectedWeekDates[0];

    const endDate = selectedWeekDates[6];

    /**
     * =========================
     * Generate years
     * =========================
     */
    const years = useMemo(() => {
        return Array.from({ length: 11 }, (_, index) => currentYear - 5 + index);
    }, [currentYear]);

    /**
     * =========================
     * Get number of weeks
     * =========================
     */
    const getWeeksInYear = (targetYear: number) => {
        /**
         * ISO week cuối cùng của năm
         * được xác định bằng ngày 28/12.
         */
        const december28 = new Date(targetYear, 11, 28);

        return getWeekNumber(december28);
    };

    const weeksInYear = getWeeksInYear(year);

    /**
     * =========================
     * Fetch menu
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
     * Check past date
     * =========================
     *
     * true:
     *   ngày đã qua
     *
     * false:
     *   hôm nay hoặc tương lai
     */
    const isPastDate = (date: string) => {
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const targetDate = new Date(`${date}T00:00:00`);

        targetDate.setHours(0, 0, 0, 0);

        return targetDate < today;
    };

    /**
     * =========================
     * Open select dish modal
     * =========================
     */
    const handleOpenSelectDish = (date: string, existingDishIds: number[]) => {
        /**
         * Không cho mở modal
         * nếu ngày đã qua.
         */
        if (isPastDate(date)) {
            return;
        }

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

        /**
         * Frontend check.
         * Backend cũng phải check
         * để đảm bảo an toàn.
         */
        if (isPastDate(selectedDate)) {
            alert("Không thể thêm món vào ngày đã qua");

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

    const [deleteMenuId, setDeleteMenuId] = useState<number | null>(null);
    /**
     * =========================
     * Delete menu
     * =========================
     */
    const handleDelete = (menuId: number) => {
        const menu = menus.find((item) => item.id === menuId);

        if (!menu) {
            return;
        }

        if (isPastDate(menu.date.slice(0, 10))) {
            alert("Không thể xoá menu của ngày đã qua");
            return;
        }

        setDeleteMenuId(menuId);
    };

    const handleConfirmDelete = async () => {
        if (!deleteMenuId) {
            return;
        }

        try {
            setSaving(true);

            await deleteMenu(deleteMenuId);

            setDeleteMenuId(null);

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
                        {/* Week information */}
                        <div>
                            <p className="text-sm font-medium text-gray-500">Thực đơn</p>

                            <h2 className="mt-1 text-xl font-bold text-gray-900">
                                Tuần {week} - {year}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {formatDate(startDate)} - {formatDate(endDate)}
                            </p>
                        </div>

                        {/* Select year / week */}
                        <div className="flex flex-col gap-3 sm:flex-row">
                            {/* ================= Year ================= */}
                            <Select
                                value={String(year)}
                                onChange={(value) => {
                                    const selectedYear = Number(value);

                                    setYear(selectedYear);

                                    const maxWeek = getWeeksInYear(selectedYear);

                                    /**
                                     * Nếu năm mới không có
                                     * tuần đang chọn thì
                                     * chuyển về tuần cuối.
                                     */
                                    if (week > maxWeek) {
                                        setWeek(maxWeek);
                                    }
                                }}
                                className="w-full sm:w-32"
                            >
                                <Label>Năm</Label>

                                <Select.Trigger>
                                    <Select.Value />
                                    <Select.Indicator />
                                </Select.Trigger>

                                <Select.Popover>
                                    <ListBox>
                                        {years.map((itemYear) => (
                                            <ListBox.Item key={itemYear} id={String(itemYear)} textValue={String(itemYear)}>
                                                {itemYear}

                                                <ListBox.ItemIndicator />
                                            </ListBox.Item>
                                        ))}
                                    </ListBox>
                                </Select.Popover>
                            </Select>

                            {/* ================= Week ================= */}
                            <Select
                                value={String(week)}
                                onChange={(value) => {
                                    if (value) {
                                        setWeek(Number(value));
                                    }
                                }}
                                className="w-full sm:w-52"
                            >
                                <Label>Tuần</Label>

                                <Select.Trigger>
                                    <Select.Value />
                                    <Select.Indicator />
                                </Select.Trigger>

                                <Select.Popover>
                                    <ListBox>
                                        {Array.from(
                                            {
                                                length: weeksInYear,
                                            },
                                            (_, index) => {
                                                const weekNumber = index + 1;

                                                return (
                                                    <ListBox.Item key={weekNumber} id={String(weekNumber)} textValue={`Tuần ${weekNumber}`}>
                                                        Tuần {weekNumber}
                                                        <ListBox.ItemIndicator />
                                                    </ListBox.Item>
                                                );
                                            }
                                        )}
                                    </ListBox>
                                </Select.Popover>
                            </Select>
                        </div>
                    </div>
                </Card.Content>
            </Card>

            {/* ================= Weekly menu ================= */}
            {loading ? (
                <div className="py-12 text-center text-sm text-gray-500">Đang tải menu...</div>
            ) : (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
                    {menuDays.map((day) => {
                        const pastDate = isPastDate(day.date);

                        const slots = [day.dishes[0] ?? null, day.dishes[1] ?? null];

                        return (
                            <Card key={day.date} className={`overflow-hidden rounded-xl border shadow-sm ${pastDate ? "border-gray-200" : "border-gray-200"}`}>
                                {/* ================= Day header ================= */}
                                <Card.Header className={`border-b p-4 ${pastDate ? "border-gray-200 bg-gray-100" : "border-gray-100 bg-gray-50"}`}>
                                    <div className="flex w-full items-center justify-between gap-3">
                                        <div>
                                            <Card.Title className="text-base font-semibold text-gray-900">{getDayName(day.date)}</Card.Title>

                                            <Card.Description className="mt-1">{formatDate(day.date)}</Card.Description>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {pastDate && <span className="rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500">Đã qua</span>}

                                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                                {day.dishes.length}
                                                /2 món
                                            </span>
                                        </div>
                                    </div>
                                </Card.Header>

                                {/* ================= Dishes ================= */}
                                <Card.Content className="space-y-3 p-4">
                                    {slots.map((menu, index) => {
                                        /**
                                         * Empty slot
                                         */
                                        if (!menu) {
                                            /**
                                             * Ngày đã qua:
                                             * không cho thêm món.
                                             */
                                            if (pastDate) {
                                                return (
                                                    <div
                                                        key={`empty-${day.date}-${index}`}
                                                        className="flex min-h-[88px] w-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50"
                                                    >
                                                        <span className="text-sm text-gray-400">Không thể thêm món</span>
                                                    </div>
                                                );
                                            }

                                            /**
                                             * Hôm nay / tương lai:
                                             * cho phép thêm món.
                                             */
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
                                                    className="flex cursor-pointer min-h-[88px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white transition hover:border-emerald-400 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <Plus size={20} className="text-emerald-600" />

                                                    <span className="text-sm font-medium text-gray-500">Thêm món</span>
                                                </button>
                                            );
                                        }

                                        /**
                                         * =========================
                                         * Existing menu
                                         * =========================
                                         */
                                        return (
                                            <div key={menu.id} className={`flex items-center gap-3 rounded-xl border p-3 ${pastDate ? "border-gray-200 bg-gray-100" : "border-gray-100 bg-gray-50"}`}>
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
                                                {!pastDate && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(menu.id)}
                                                        disabled={saving}
                                                        className="cursor-pointer shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                        aria-label="Xoá món"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </Card.Content>

                                {/* ================= Footer ================= */}
                                <Card.Footer className="border-t border-gray-100 p-3">
                                    <div className="flex w-full items-center justify-between">
                                        <span className="text-xs text-gray-400">
                                            {day.dishes.length}
                                            /2 món
                                        </span>

                                        {pastDate ? (
                                            <span className="text-xs text-gray-400">Menu đã khóa</span>
                                        ) : (
                                            day.dishes.length < 2 && <span className="text-xs text-emerald-600">Còn {2 - day.dishes.length} món</span>
                                        )}
                                    </div>
                                </Card.Footer>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* ================= Select dish modal ================= */}
            <SelectDishModal isOpen={isSelectDishOpen} onOpenChange={setIsSelectDishOpen} dishes={dishes} existingDishIds={selectedExistingDishIds} onSelect={handleSelectDish} loading={saving} />

            <ConfirmModal
                isOpen={deleteMenuId !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteMenuId(null);
                    }
                }}
                title="Xác nhận xoá món khỏi menu"
                description="Bạn có chắc chắn muốn xoá món này khỏi menu? Thao tác này không thể hoàn tác."
                confirmText="Xoá"
                cancelText="Hủy"
                onConfirm={handleConfirmDelete}
                loading={saving}
            />
        </div>
    );
}
