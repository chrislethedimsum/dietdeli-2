import { Card, CardHeader, Chip, Button, Avatar, Table } from "@heroui/react";
import { getMenusByDateRange, type Menu } from "@/api/menu.api";
import { useEffect, useState, useMemo } from "react";
import { formatLocalDate, getCurrentWeekDates } from "@/utils";
import { Tabs } from "@heroui/react";
import { Link } from "react-router";
import { UtensilsCrossed, Flame, ArrowRight, Utensils, RefreshCw } from "lucide-react";

const statistics = [
  {
    title: "Tổng doanh thu",
    value: "128.450.000 ₫",
    change: "+12.5%",
    description: "so với tháng trước",
    type: "revenue",
  },
  {
    title: "Đơn hàng",
    value: "1,284",
    change: "+8.2%",
    description: "so với tháng trước",
    type: "order",
  },
  {
    title: "Khách hàng",
    value: "856",
    change: "+5.4%",
    description: "so với tháng trước",
    type: "customer",
  },
  {
    title: "Subscription",
    value: "324",
    change: "+10.8%",
    description: "đang hoạt động",
    type: "subscription",
  },
];

const recentOrders = [
  {
    id: "#DD-10284",
    customer: "Nguyễn Minh Anh",
    plan: "Healthy 7 ngày",
    amount: "1.250.000 ₫",
    status: "Đang giao",
  },
  {
    id: "#DD-10283",
    customer: "Trần Quốc Bảo",
    plan: "Weight Loss",
    amount: "980.000 ₫",
    status: "Đã giao",
  },
  {
    id: "#DD-10282",
    customer: "Lê Thu Hà",
    plan: "Balanced 14 ngày",
    amount: "2.100.000 ₫",
    status: "Đang chuẩn bị",
  },
  {
    id: "#DD-10281",
    customer: "Phạm Đức Anh",
    plan: "Healthy 7 ngày",
    amount: "1.250.000 ₫",
    status: "Đã giao",
  },
  {
    id: "#DD-10280",
    customer: "Nguyễn Hoàng Nam",
    plan: "Muscle Gain",
    amount: "1.850.000 ₫",
    status: "Đang giao",
  },
];
function StatisticIcon({ type }: { type: string }) {
  const commonClass = "h-6 w-6";

  switch (type) {
    case "revenue":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className={commonClass}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v12m-3-2.5c0 1.1 1.34 2 3 2s3-.9 3-2-1.34-2-3-2-3-.9-3-2 1.34-2 3-2 3 .9 3 2"
          />
        </svg>
      );

    case "order":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className={commonClass}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 2h12v20H6zM9 6h6M9 10h6M9 14h4" />
        </svg>
      );

    case "customer":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className={commonClass}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19a6 6 0 0 0-12 0m6-8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm6-3a3 3 0 1 1 0-6m0 10a5 5 0 0 1 4 2"
          />
        </svg>
      );

    case "subscription":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className={commonClass}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12a7.5 7.5 0 0 1 12.73-5.36L20 9m0 0V4m0 5h-5.5M19.5 12a7.5 7.5 0 0 1-12.73 5.36L4 15m0 0v5m0-5h5.5"
          />
        </svg>
      );

    default:
      return null;
  }
}

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

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => (
          <Card key={item.title} className="border border-gray-100">
            <Card.Content className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{item.title}</p>

                  <p className="mt-2 text-2xl font-bold text-gray-900">{item.value}</p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <StatisticIcon type={item.type} />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm font-medium text-emerald-600">{item.change}</span>

                <span className="text-xs text-gray-400">{item.description}</span>
              </div>
            </Card.Content>
          </Card>
        ))}
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

      {/* Recent Orders */}
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="px-5 pt-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Đơn hàng gần đây</h2>

              <p className="text-sm text-gray-500">Các đơn hàng mới nhất</p>
            </div>

            <Button size="sm" variant="tertiary" className="text-success hover:bg-success/10">
              Xem tất cả
            </Button>
          </div>
        </CardHeader>

        <Card.Content className="px-5">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <Table.ScrollContainer>
                <Table.Content aria-label="Danh sách khách hàng" className="min-w-[950px]">
                  <Table.Header>
                    <Table.Column id="code" className="pb-3 text-xs font-medium uppercase text-gray-400">
                      Mã đơn
                    </Table.Column>

                    <Table.Column id="customer" className="pb-3 text-xs font-medium uppercase text-gray-400">
                      Khách hàng
                    </Table.Column>

                    <Table.Column id="combo" className="pb-3 text-xs font-medium uppercase text-gray-400">
                      Gói ăn
                    </Table.Column>

                    <Table.Column id="cost" className="pb-3 text-xs font-medium uppercase text-gray-400">
                      Giá trị
                    </Table.Column>

                    <Table.Column id="status" className="pb-3 text-xs font-medium uppercase text-gray-400">
                      Trạng thái
                    </Table.Column>
                  </Table.Header>

                  <Table.Body>
                    {recentOrders.map((order) => (
                      <Table.Row key={order.id} className="border-b border-gray-50 last:border-0">
                        <Table.Cell className="py-4 text-sm font-medium text-gray-900">{order.id}</Table.Cell>

                        <Table.Cell className="py-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <Avatar.Fallback className="bg-emerald-100 text-emerald-700">
                                {order.customer
                                  .split(" ")
                                  .map((x) => x[0])
                                  .join("")
                                  .slice(-2)}
                              </Avatar.Fallback>
                            </Avatar>

                            <span className="text-sm text-gray-700">{order.customer}</span>
                          </div>
                        </Table.Cell>

                        <Table.Cell className="py-4 text-sm text-gray-600">{order.plan}</Table.Cell>

                        <Table.Cell className="py-4 text-sm font-medium text-gray-900">{order.amount}</Table.Cell>

                        <Table.Cell className="py-4">
                          <Chip
                            size="sm"
                            variant="soft"
                            color={getStatusColor(order.status) as "success" | "accent" | "warning" | "default"}
                          >
                            {order.status}
                          </Chip>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {recentOrders.map((order) => (
              <div key={order.id} className="rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <Avatar.Fallback className="bg-emerald-100 text-emerald-700">
                        {order.customer
                          .split(" ")
                          .map((x) => x[0])
                          .join("")
                          .slice(-2)}
                      </Avatar.Fallback>
                    </Avatar>

                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.customer}</p>

                      <p className="text-xs text-gray-400">{order.id}</p>
                    </div>
                  </div>

                  <Chip size="sm" variant="soft" color={getStatusColor(order.status) as "success" | "accent" | "warning" | "default"}>
                    {order.status}
                  </Chip>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-xs text-gray-500">{order.plan}</span>

                  <span className="text-sm font-semibold text-gray-900">{order.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
