import { Card, CardHeader, Chip, Button, Accordion } from "@heroui/react";
import { getMenusByDateRange, type Menu } from "@/api/menu.api";
import { useEffect, useState, useMemo } from "react";
import { formatLocalDate, getCurrentWeekDates } from "@/utils";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { orderApi, type Order } from "@/api/order.api";
import { subscriptionApi } from "@/api/subscription.api";
import {
  UtensilsCrossed,
  Flame,
  ArrowRight,
  Utensils,
  RefreshCw,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
} from "lucide-react";

function getStatusColor(status: string) {
  switch (status) {
    case "Đã giao":
      return "success";

    case "Đang giao":
      return "primary";

    case "Đang chuẩn bị":
      return "warning";

    default:
      return "default";
  }
}

export default function DashboardPage() {
  // Loading states
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [menus, setMenus] = useState<Menu[]>([]);
  /**
   * ==========================================
   * Date & ISO Week Calculation (from MenuPage)
   * ==========================================
   */
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentWeekDates = getCurrentWeekDates();

  const getWeekNumber = (date: Date) => {
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    const dayNumber = (target.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNumber + 3);
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    const firstThursdayDay = (firstThursday.getDay() + 6) % 7;
    firstThursday.setDate(firstThursday.getDate() - firstThursdayDay + 3);
    return 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000));
  };

  const initialWeek = getWeekNumber(new Date(`${currentWeekDates[0]}T00:00:00`));

  const [year, setYear] = useState(currentYear);
  const [week, setWeek] = useState(initialWeek);

  const selectedWeekDates = useMemo(() => {
    const january4 = new Date(year, 0, 4);
    const dayOfWeek = (january4.getDay() + 6) % 7;
    const mondayOfWeek1 = new Date(january4);
    mondayOfWeek1.setDate(january4.getDate() - dayOfWeek);

    const monday = new Date(mondayOfWeek1);
    monday.setDate(mondayOfWeek1.getDate() + (week - 1) * 7);

    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return formatLocalDate(date);
    });
  }, [year, week]);

  const startDate = selectedWeekDates[0];
  const endDate = selectedWeekDates[5];

  const years = useMemo(() => {
    return Array.from({ length: 5 }, (_, index) => currentYear - 1 + index);
  }, [currentYear]);

  const getWeeksInYear = (targetYear: number) => {
    const december28 = new Date(targetYear, 11, 28);
    return getWeekNumber(december28);
  };

  const weeksInYear = getWeeksInYear(year);

  const fetchMenus = async () => {
    if (!startDate || !endDate) return;
    try {
      setLoadingMenus(true);
      const data = await getMenusByDateRange(startDate, endDate);
      setMenus(data);
    } catch (error) {
      console.error("Không thể lấy thực đơn:", error);
      setMenus([]);
    } finally {
      setLoadingMenus(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [startDate, endDate]);

  // Group menus by day
  const menuDays = useMemo(() => {
    return selectedWeekDates.map((date) => ({
      date,
      dishes: menus.filter((menu) => {
        const isoDate = menu.date.slice(0, 10);
        const localDate = formatLocalDate(new Date(menu.date));
        return isoDate === date || localDate === date;
      }),
    }));
  }, [menus, selectedWeekDates]);

  // Xác định ngày hôm nay theo format YYYY-MM-DD
  const todayStr = useMemo(() => formatLocalDate(new Date()), []);
  // State lưu ngày đang được chọn xem menu (mặc định là hôm nay nếu thuộc tuần này, không thì là ngày đầu tuần)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return selectedWeekDates.includes(todayStr) ? todayStr : currentWeekDates[0];
  });
  // Tự động chuyển về ngày đầu tuần nếu tuần thay đổi
  useEffect(() => {
    if (selectedWeekDates.length > 0 && !selectedWeekDates.includes(selectedDate)) {
      setSelectedDate(selectedWeekDates[0]);
    }
  }, [selectedWeekDates]);
  // Lấy danh sách món ăn của ngày đang chọn
  const activeDayData = useMemo(() => {
    return menuDays.find((d) => d.date === selectedDate) || { date: selectedDate, dishes: [] };
  }, [menuDays, selectedDate]);

  const formatDate = (date?: string | null) => {
    if (!date) return "-";
    const parsedDate = date.length === 10 ? new Date(`${date}T00:00:00`) : new Date(date);
    if (isNaN(parsedDate.getTime())) return "-";
    return parsedDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDayName = (date?: string | null) => {
    if (!date) return "";
    const parsedDate = date.length === 10 ? new Date(`${date}T00:00:00`) : new Date(date);
    if (isNaN(parsedDate.getTime())) return "";
    const day = parsedDate.getDay();
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

  // 1. Lấy toàn bộ lịch sử đơn hàng của user từ API
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const data = await orderApi.getMyOrders();
        setUserOrders(data);
      } catch (error) {
        console.error("Không thể tải lịch sử đơn hàng:", error);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);
  // 2. Nhóm đơn hàng theo ngày nhận (deliveryDate) và sắp xếp ngày mới nhất lên đầu
  const groupedOrders = useMemo(() => {
    const map = new Map<string, Order[]>();
    userOrders.forEach((order) => {
      const dateStr = order.deliveryDate.slice(0, 10);
      const list = map.get(dateStr) || [];
      list.push(order);
      map.set(dateStr, list);
    });
    // Sắp xếp ngày giảm dần (ngày mới nhất đứng đầu)
    const sortedDates = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));
    return sortedDates.map((date) => ({
      date,
      dayName: getDayName(date),
      formattedDate: formatDate(date),
      orders: map.get(date) || [],
    }));
  }, [userOrders]);
  // 3. Phân trang: Mỗi trang tối đa 6 ngày
  const DAYS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(groupedOrders.length / DAYS_PER_PAGE);
  const pagedDays = useMemo(() => {
    const start = (currentPage - 1) * DAYS_PER_PAGE;
    return groupedOrders.slice(start, start + DAYS_PER_PAGE);
  }, [groupedOrders, currentPage]);
  // 4. Accordion: Luôn mở sẵn ngày mới nhất (groupedOrders[0]), những ngày khác đóng
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (groupedOrders.length > 0) {
      setExpandedKeys(new Set([groupedOrders[0].date]));
    }
  }, [groupedOrders]);
  // Hàm hiển thị nhãn trạng thái tiếng Việt
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ORDERED":
        return "Đã đặt món";
      case "COOKING":
        return "Đang chuẩn bị";
      case "SHIPPING":
        return "Đang giao";
      case "COMPLETED":
        return "Đã giao thành công";
      case "CANCELLED":
        return "Đã hủy";
      case "REJECTED":
        return "Bếp từ chối";
      default:
        return status;
    }
  };

  // 1. Fetch danh sách gói ăn của người dùng
  const {
    data: subscriptions = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["my-subscriptions"],
    queryFn: subscriptionApi.getMySubscriptions,
  });

  const fetchSubscriptions = async () => {
    try {
      setLoadingSubs(true);
      const data = await subscriptionApi.getMySubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error("Không thể lấy danh sách gói ăn:", error);
    } finally {
      setLoadingSubs(false);
    }
  };

  // 1. Gói ăn đang hoạt động
  const activeSub = useMemo(() => {
    return subscriptions.find((s) => s.paymentStatus === "PAID" && s.remainingMeals > 0);
  }, [subscriptions]);
  // 2. Tính số ngày còn lại của gói
  const daysRemaining = useMemo(() => {
    if (!activeSub) return 0;
    const end = new Date(activeSub.endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [activeSub]);
  // 3. Số bữa ăn đã đặt cho tuần này (T2 -> T7)
  const scheduledThisWeek = useMemo(() => {
    return userOrders.filter((o) => o.status !== "CANCELLED" && selectedWeekDates.includes(o.deliveryDate.slice(0, 10))).length;
  }, [userOrders, selectedWeekDates]);
  // 4. Tổng số bữa đã giao thành công
  const completedOrders = useMemo(() => {
    return userOrders.filter((o) => o.status === "COMPLETED").length;
  }, [userOrders]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>

          <p className="mt-1 text-sm text-gray-500">Tổng quan hoạt động của bạn</p>
        </div>
        <Button size="sm" variant="tertiary" className="text-success hover:bg-success/10">
          + Tạo đơn hàng
        </Button>
      </div>

      {/* Statistics dành riêng cho User */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Suất ăn còn lại */}
        <Card className="border border-gray-100 shadow-sm">
          <Card.Content className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Suất ăn khả dụng</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {activeSub ? activeSub.remainingMeals : 0} <span className="text-sm font-normal text-gray-500">bữa</span>
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Utensils className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 truncate">
              <span className="font-medium text-emerald-600">{activeSub?.package?.name || "Chưa có gói hoạt động"}</span>
            </div>
          </Card.Content>
        </Card>

        {/* Card 2: Thời hạn gói */}
        <Card className="border border-gray-100 shadow-sm">
          <Card.Content className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Thời hạn gói ăn</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{activeSub ? `Còn ${daysRemaining} ngày` : "Hết hạn"}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-400 truncate">
              {activeSub ? `Hạn đến: ${formatDate(activeSub.endDate)}` : "Đăng ký gói để bắt đầu"}
            </div>
          </Card.Content>
        </Card>

        {/* Card 3: Đã lên lịch tuần này */}
        <Card className="border border-gray-100 shadow-sm">
          <Card.Content className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Lên lịch tuần này</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {scheduledThisWeek} <span className="text-sm font-normal text-gray-500">/ 6 bữa</span>
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-xs text-amber-700 font-medium">
              {scheduledThisWeek >= 6 ? "Đã đặt đủ cả tuần ✨" : `Còn ${6 - scheduledThisWeek} ngày chưa chọn`}
            </div>
          </Card.Content>
        </Card>

        {/* Card 4: Bữa ăn đã hoàn thành */}
        <Card className="border border-gray-100 shadow-sm">
          <Card.Content className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Bữa ăn đã hoàn thành</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {completedOrders} <span className="text-sm font-normal text-gray-500">bữa</span>
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <PackageCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-400">Đã giao thành công</div>
          </Card.Content>
        </Card>
      </div>
      {/* Menu Widget */}
      <Card className="w-full border border-gray-100 shadow-sm overflow-hidden">
        {/* Header Widget */}
        <CardHeader className="px-5 pt-5 pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Thực đơn dinh dưỡng tuần này</h2>
                <p className="text-xs text-gray-500">
                  Tuần {week} ({formatDate(startDate)} – {formatDate(endDate)})
                </p>
              </div>
            </div>

            <Link
              to="/user/order"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors group self-start sm:self-auto"
            >
              <span>Xem chi tiết & Đặt món</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </CardHeader>

        <Card.Content className="px-5 pb-5 pt-1 space-y-4">
          {/* Thanh chọn ngày (Day Selector Pills) */}
          <div className="flex items-center gap-2 overflow-x-auto p-1">
            {menuDays.map((day) => {
              const isSelected = day.date === selectedDate;
              const isToday = day.date === todayStr;
              const dayName = getDayName(day.date);
              const dayMonth = `${day.date.slice(8, 10)}/${day.date.slice(5, 7)}`;
              const dishCount = day.dishes.length;

              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedDate(day.date)}
                  className={`flex min-w-[85px] flex-1 flex-col items-center justify-center rounded-xl py-2 px-2 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600 ring-offset-1"
                      : "border border-gray-100 bg-gray-50/70 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className={`text-[11px] font-medium ${isSelected ? "text-emerald-100" : "text-gray-500"}`}>
                    {dayName} {isToday && "• Nay"}
                  </span>
                  <span className="text-sm font-bold mt-0.5">{dayMonth}</span>
                  <span
                    className={`text-[10px] mt-1 px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-emerald-700/60 text-white"
                        : dishCount > 0
                          ? "bg-emerald-50 text-emerald-700 font-medium"
                          : "text-gray-400"
                    }`}
                  >
                    {dishCount > 0 ? `${dishCount} món` : "Nghỉ"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Danh sách món ăn của ngày đang chọn */}
          {loadingMenus ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <RefreshCw className="h-5 w-5 animate-spin mr-2 text-emerald-600" />
              <span className="text-sm">Đang tải thực đơn...</span>
            </div>
          ) : activeDayData.dishes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
              <UtensilsCrossed className="h-7 w-7 text-gray-300 mb-1.5" />
              <p className="text-sm font-medium text-gray-600">
                Chưa có thực đơn cho {getDayName(selectedDate)} ({formatDate(selectedDate)})
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Bếp chưa lên lịch món hoặc đây là ngày nghỉ của bạn.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
              {activeDayData.dishes.map((menuItem) => {
                const dish = menuItem.dish;
                return (
                  <div
                    key={menuItem.id}
                    className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-emerald-200 hover:shadow-sm transition-all"
                  >
                    {/* Ảnh món */}
                    <div className="relative h-15 w-15 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {dish.image ? (
                        <img
                          src={dish.image}
                          alt={dish.nameVi}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-emerald-600">
                          <Utensils className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    {/* Thông tin món */}
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {dish.nameVi}
                      </h4>
                      <p className="truncate text-xs text-gray-400">{dish.nameEn || "Món ăn dinh dưỡng"}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
                          <Flame className="h-3 w-3 text-amber-500" />
                          {dish.calories ? `${dish.calories} kcal` : "Tiêu chuẩn"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Theo dõi lịch sử đơn hàng theo từng ngày */}
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <PackageCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Lịch sử đặt món</h2>
                <p className="text-xs text-gray-500">
                  {groupedOrders.length > 0
                    ? `Theo dõi ${userOrders.length} suất ăn qua ${groupedOrders.length} ngày nhận món`
                    : "Chưa có lịch sử đặt món"}
                </p>
              </div>
            </div>

            <Link
              to="/user/order"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <span>Đặt thêm món</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardHeader>

        <Card.Content className="px-5 pb-5 pt-2">
          {loadingOrders ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <RefreshCw className="h-5 w-5 animate-spin mr-2 text-emerald-600" />
              <span className="text-sm">Đang tải lịch sử đơn hàng...</span>
            </div>
          ) : groupedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
              <Calendar className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-600">Bạn chưa có đơn đặt món nào</p>
              <p className="text-xs text-gray-400 mt-0.5">Hãy chọn các món dinh dưỡng từ thực đơn tuần để bắt đầu.</p>
              <Link
                to="/user/order"
                className="mt-3 inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
              >
                Đặt món ngay
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Accordion danh sách các ngày */}
              <Accordion
                allowsMultipleExpanded
                expandedKeys={expandedKeys}
                onExpandedChange={(keys) => setExpandedKeys(keys as Set<string>)}
                className="w-full flex flex-col gap-2.5"
              >
                {pagedDays.map((day) => {
                  const isLatest = day.date === groupedOrders[0]?.date;

                  return (
                    <Accordion.Item
                      key={day.date}
                      id={day.date}
                      className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-2xs"
                    >
                      <Accordion.Heading>
                        <Accordion.Trigger className="w-full flex items-center justify-between p-3.5 bg-gray-50/70 hover:bg-gray-100/70 transition cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-gray-200 text-emerald-600 font-semibold shadow-2xs">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-900">
                                  {day.dayName}, {day.formattedDate}
                                </span>
                                {isLatest && (
                                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                    Mới nhất
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-400">{day.orders.length} suất ăn đã đặt</span>
                            </div>
                          </div>
                          <Accordion.Indicator />
                        </Accordion.Trigger>
                      </Accordion.Heading>

                      <Accordion.Panel>
                        <Accordion.Body className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 space-y-3 bg-white">
                          {day.orders.map((order) => (
                            <div key={order.id} className="rounded-xl border border-gray-100 p-3.5 space-y-2.5 bg-gray-50/30">
                              {/* Ca ăn & Trạng thái */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                                      order.mealShift === "LUNCH"
                                        ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                                        : "bg-purple-50 text-purple-700 border border-purple-200/60"
                                    }`}
                                  >
                                    <Clock className="h-3 w-3" />
                                    {order.mealShift === "LUNCH" ? "Bữa trưa (Giao trước 11:30)" : "Bữa tối (Giao trước 18:00)"}
                                  </span>
                                  <span className="text-xs text-gray-400">Đơn #{order.id}</span>
                                </div>

                                <Chip size="sm" variant="soft" color={getStatusColor(order.status) as any}>
                                  {getStatusLabel(order.status)}
                                </Chip>
                              </div>

                              {/* Danh sách món ăn trong đơn */}
                              <div className="space-y-2">
                                {order.orderItems.map((item) => (
                                  <div key={item.id} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-gray-100">
                                    <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                      {item.dish.image ? (
                                        <img src={item.dish.image} alt={item.dish.nameVi} className="h-full w-full object-cover" />
                                      ) : (
                                        <div className="h-full w-full flex items-center justify-center text-xs text-emerald-600 bg-emerald-50">
                                          <Utensils className="h-5 w-5" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-semibold text-gray-900 truncate">{item.dish.nameVi}</p>
                                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                        <span>{item.dish.nameEn}</span>
                                        {item.dish.calories && (
                                          <span className="text-amber-600 font-medium">🔥 {item.dish.calories} kcal</span>
                                        )}
                                      </div>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-md shrink-0">
                                      x{item.quantity}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Thông tin giao hàng */}
                              {(order.shippingAddress || order.shippingPhone || order.shippingNote) && (
                                <div className="text-[11px] text-gray-500 bg-white p-2.5 rounded-lg border border-gray-100 space-y-0.5">
                                  {order.shippingAddress && (
                                    <p className="truncate">
                                      📍 <strong className="text-gray-700">Giao tới:</strong> {order.shippingAddress}
                                    </p>
                                  )}
                                  {order.shippingPhone && (
                                    <p>
                                      📞 <strong className="text-gray-700">SĐT:</strong> {order.shippingPhone}
                                    </p>
                                  )}
                                  {order.shippingNote && (
                                    <p className="italic text-gray-400">
                                      📝 <strong className="text-gray-600">Ghi chú:</strong> {order.shippingNote}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </Accordion.Body>
                      </Accordion.Panel>
                    </Accordion.Item>
                  );
                })}
              </Accordion>

              {/* 👉 Thanh phân trang (Chỉ hiển thị khi tổng số ngày > 6) */}
              {groupedOrders.length > DAYS_PER_PAGE && (
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 pt-4 gap-3">
                  <span className="text-xs text-gray-500">
                    Hiển thị <strong>{pagedDays.length}</strong> / <strong>{groupedOrders.length}</strong> ngày (Trang {currentPage} /{" "}
                    {totalPages})
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      isDisabled={currentPage === 1}
                      onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="text-xs"
                    >
                      <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                      Trước
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        size="sm"
                        variant={currentPage === page ? "solid" : "ghost"}
                        color={currentPage === page ? "primary" : "default"}
                        onPress={() => setCurrentPage(page)}
                        className="min-w-8 text-xs font-semibold"
                      >
                        {page}
                      </Button>
                    ))}

                    <Button
                      size="sm"
                      variant="outline"
                      isDisabled={currentPage === totalPages}
                      onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="text-xs"
                    >
                      Sau
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
