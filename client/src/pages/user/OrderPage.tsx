import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Card, Label, ListBox, Select, Button } from "@heroui/react";
import {
  Utensils,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Flame,
  Calendar,
  Sparkles,
  MapPin,
  Phone,
  FileText,
  Package,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import { getMenusByDateRange, type Menu } from "@/api/menu.api";
import { subscriptionApi, type UserSubscription } from "@/api/subscription.api";
import { orderApi, type Order, type MealShift } from "@/api/order.api";
import { formatLocalDate, getCurrentWeekDates } from "@/utils";
import ConfirmModal from "@/components/common/ConfirmModal";
import CommonModal from "@/components/common/CommonModal";

export default function OrderPage() {
  // Data states
  const [menus, setMenus] = useState<Menu[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Loading states
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [, setLoadingSubs] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // User feedback toast/banner
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modals
  const [bookingTarget, setBookingTarget] = useState<{
    date: string;
    dish: Menu["dish"];
    shift: MealShift;
  } | null>(null);

  const [cancelTarget, setCancelTarget] = useState<{
    orderId: number;
    dishName: string;
    date: string;
  } | null>(null);

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

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return formatLocalDate(date);
    });
  }, [year, week]);

  const startDate = selectedWeekDates[0];
  const endDate = selectedWeekDates[6];

  const years = useMemo(() => {
    return Array.from({ length: 5 }, (_, index) => currentYear - 1 + index);
  }, [currentYear]);

  const getWeeksInYear = (targetYear: number) => {
    const december28 = new Date(targetYear, 11, 28);
    return getWeekNumber(december28);
  };

  const weeksInYear = getWeeksInYear(year);

  /**
   * ==========================================
   * Fetch Subscriptions, Menus & Orders
   * ==========================================
   */
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

  const fetchOrders = async () => {
    if (!startDate || !endDate) return;
    try {
      setLoadingOrders(true);
      const data = await orderApi.getMyOrders(startDate, endDate);
      setOrders(data);
    } catch (error) {
      console.error("Không thể lấy danh sách đơn đặt món:", error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    fetchMenus();
    fetchOrders();
  }, [startDate, endDate]);

  /**
   * ==========================================
   * Business Rules & Helpers
   * ==========================================
   */
  // Active subscription (Must be PAID with remaining meals > 0)
  const activeSubscription = useMemo(() => {
    return subscriptions.find((s) => s.paymentStatus === "PAID" && s.remainingMeals > 0);
  }, [subscriptions]);

  const pendingSubscription = useMemo(() => {
    return subscriptions.find((s) => s.paymentStatus === "UNPAID");
  }, [subscriptions]);

  // Tìm gói ăn hợp lệ cho ngày cụ thể (PAID, còn bữa, ngày giao nằm trong thời hạn gói)
  const getSubscriptionForDate = (dateStr: string) => {
    const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
    const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

    return subscriptions.find((sub) => {
      if (sub.paymentStatus !== "PAID" || sub.remainingMeals <= 0) return false;
      const subStart = new Date(sub.startDate);
      const subEnd = new Date(sub.endDate);
      return subStart <= dayEnd && subEnd >= dayStart;
    });
  };

  // Kiểm tra chi tiết trạng thái áp dụng gói ăn cho ngày dateStr
  const checkDateSubscriptionStatus = (dateStr: string) => {
    const matchedSub = getSubscriptionForDate(dateStr);
    if (matchedSub) {
      return {
        isValid: true,
        subscription: matchedSub,
        reason: null,
      };
    }

    const referenceSub = activeSubscription || subscriptions.find((s) => s.paymentStatus === "PAID") || null;

    if (!referenceSub) {
      return {
        isValid: false,
        subscription: null,
        reason: "no_subscription" as const,
      };
    }

    const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
    const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);
    const subStart = new Date(referenceSub.startDate);
    const subEnd = new Date(referenceSub.endDate);

    if (subStart > dayEnd) {
      return {
        isValid: false,
        subscription: referenceSub,
        reason: "before_start" as const,
      };
    }

    if (subEnd < dayStart) {
      return {
        isValid: false,
        subscription: referenceSub,
        reason: "after_end" as const,
      };
    }

    if (referenceSub.remainingMeals <= 0) {
      return {
        isValid: false,
        subscription: referenceSub,
        reason: "out_of_meals" as const,
      };
    }

    return {
      isValid: false,
      subscription: referenceSub,
      reason: "invalid" as const,
    };
  };

  // Quy tắc chốt món: Trước 22:00 của ngày hôm trước (DeliveryDate - 1)
  const isDateOrderable = (dateStr: string) => {
    const now = new Date();
    const [y, m, d] = dateStr.split("-").map(Number);
    const cutoff = new Date(y, m - 1, d - 1, 22, 0, 0, 0);
    return now <= cutoff;
  };

  // Check if date is in the past
  const isPastDate = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(`${dateStr}T00:00:00`);
    target.setHours(0, 0, 0, 0);
    return target < today;
  };

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

  // Find user's active booked orders for a specific date
  const getActiveOrdersByDate = (dateStr: string) => {
    return orders.filter((o) => {
      if (o.status === "CANCELLED") return false;
      const isoDate = o.deliveryDate.slice(0, 10);
      const localDate = formatLocalDate(new Date(o.deliveryDate));
      return isoDate === dateStr || localDate === dateStr;
    });
  };

  // Find if a specific dish was already booked on that date
  const getBookedOrderForDish = (dateOrders: Order[], dishId: number) => {
    return dateOrders.find((o) => o.orderItems.some((item) => item.dishId === dishId));
  };

  // Số bữa tối đa được đặt trong ngày theo gói (1 bữa/ngày hoặc 2 bữa/ngày)
  const maxMealsPerDay = useMemo(() => {
    const pkgName = (activeSubscription?.package?.name || "").toLowerCase();
    if (pkgName.includes("2 bữa") || pkgName.includes("2 bua") || pkgName.includes("2bữa")) {
      return 2;
    }
    if (pkgName.includes("3 bữa") || pkgName.includes("3 bua") || pkgName.includes("3bữa")) {
      return 3;
    }
    return 1;
  }, [activeSubscription]);

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

  /**
   * ==========================================
   * Booking & Cancellation Handlers
   * ==========================================
   */
  const handleOpenBookingModal = (date: string, dish: Menu["dish"], shift: MealShift = "LUNCH") => {
    setFeedback(null);
    if (!activeSubscription) {
      setFeedback({
        type: "error",
        message: "Bạn cần có gói ăn đã thanh toán và còn bữa ăn khả dụng để đặt món!",
      });
      return;
    }
    const subStatus = checkDateSubscriptionStatus(date);
    if (!subStatus.isValid) {
      if (subStatus.reason === "before_start") {
        setFeedback({
          type: "error",
          message: `Ngày ${formatDate(date)} chưa tới thời hạn bắt đầu của gói ăn (Gói áp dụng từ ${formatDate(activeSubscription.startDate)} đến ${formatDate(activeSubscription.endDate)})!`,
        });
        return;
      }
      if (subStatus.reason === "after_end") {
        setFeedback({
          type: "error",
          message: `Ngày ${formatDate(date)} đã vượt quá thời hạn của gói ăn (Gói kết thúc vào ngày ${formatDate(activeSubscription.endDate)})!`,
        });
        return;
      }
      if (subStatus.reason === "out_of_meals") {
        setFeedback({
          type: "error",
          message: "Gói ăn của bạn đã sử dụng hết số suất ăn khả dụng!",
        });
        return;
      }
      setFeedback({
        type: "error",
        message: "Ngày chọn đặt món không nằm trong thời hạn hiệu lực của gói ăn!",
      });
      return;
    }
    if (!isDateOrderable(date)) {
      setFeedback({
        type: "error",
        message: "Đã quá 22:00 hôm trước. Không thể đặt món cho ngày này nữa!",
      });
      return;
    }
    setBookingTarget({ date, dish, shift });
  };

  const handleConfirmBooking = async () => {
    if (!bookingTarget) return;

    try {
      setActionLoading(true);
      await orderApi.bookMeal({
        deliveryDate: bookingTarget.date,
        mealShift: bookingTarget.shift,
        totalMealsToDeduct: 1,
        items: [{ dishId: bookingTarget.dish.id, quantity: 1 }],
      });

      setFeedback({
        type: "success",
        message: `Đặt món "${bookingTarget.dish.nameVi}" cho ngày ${getDayName(bookingTarget.date)} (${formatDate(bookingTarget.date)}) thành công! Đã trừ 1 bữa ăn.`,
      });
      setBookingTarget(null);

      // Re-fetch orders and subscription remaining meals
      await Promise.all([fetchOrders(), fetchSubscriptions()]);
    } catch (err: any) {
      console.error(err);
      setFeedback({
        type: "error",
        message: err?.response?.data?.message || err.message || "Đặt món thất bại. Vui lòng thử lại!",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCancelModal = (orderId: number, dishName: string, date: string) => {
    setFeedback(null);
    if (!isDateOrderable(date)) {
      setFeedback({
        type: "error",
        message: "Không thể hủy món sau 22:00 của ngày hôm trước vì bếp đã chuẩn bị nguyên liệu!",
      });
      return;
    }
    setCancelTarget({ orderId, dishName, date });
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;

    try {
      setActionLoading(true);
      await orderApi.cancelMealOrder(cancelTarget.orderId);

      setFeedback({
        type: "success",
        message: `Đã hủy đặt món cho ngày ${getDayName(cancelTarget.date)} (${formatDate(cancelTarget.date)}). 1 bữa ăn đã được hoàn lại vào gói của bạn!`,
      });
      setCancelTarget(null);

      // Re-fetch orders and subscription remaining meals
      await Promise.all([fetchOrders(), fetchSubscriptions()]);
    } catch (err: any) {
      console.error(err);
      setFeedback({
        type: "error",
        message: err?.response?.data?.message || err.message || "Hủy món thất bại. Vui lòng thử lại!",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ================= Header ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Utensils className="h-7 w-7 text-emerald-600" />
            Đặt món ăn hàng ngày
          </h1>
        </div>

        {/* Reload button */}
        <Button
          className="border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer self-start md:self-auto"
          onPress={() => {
            fetchSubscriptions();
            fetchMenus();
            fetchOrders();
          }}
          isDisabled={loadingMenus || loadingOrders}
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loadingMenus || loadingOrders ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {/* ================= Feedback Alert ================= */}
      {feedback && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 text-sm transition-all ${
            feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{feedback.message}</div>
          <button type="button" onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ================= Subscription Status Banner ================= */}
      {activeSubscription ? (
        <Card className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 shadow-sm overflow-hidden">
          <Card.Content className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left info */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Gói đang hoạt động
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1 text-xs font-semibold">
                    Gói {maxMealsPerDay} Bữa / Ngày
                  </span>
                  <h2 className="text-lg font-bold text-gray-900">{activeSubscription.package?.name || "Gói ăn dinh dưỡng"}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      Hạn dùng:{" "}
                      <strong className="text-gray-800">
                        {formatDate(activeSubscription.startDate)} - {formatDate(activeSubscription.endDate)}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="truncate max-w-[200px]" title={activeSubscription.planShippingAddress || ""}>
                      Giao tới: <strong className="text-gray-800">{activeSubscription.planShippingAddress || "Theo tài khoản"}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      SĐT: <strong className="text-gray-800">{activeSubscription.planPhone || "Theo tài khoản"}</strong>
                    </span>
                  </div>

                  {activeSubscription.userNote && (
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="truncate" title={activeSubscription.userNote}>
                        Ghi chú: <strong className="text-gray-800">{activeSubscription.userNote}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right remaining meals indicator */}
              <div className="flex items-center gap-4 border-t lg:border-t-0 lg:border-l border-emerald-100 pt-4 lg:pt-0 lg:pl-6 shrink-0">
                <div className="text-center sm:text-right">
                  <p className="text-xs uppercase font-semibold text-emerald-700 tracking-wider">Suất ăn khả dụng</p>
                  <p className="text-3xl font-extrabold text-emerald-600 mt-0.5">
                    {activeSubscription.remainingMeals}
                    <span className="text-sm font-medium text-gray-500 ml-1">bữa</span>
                  </p>
                </div>

                <Link
                  to="/user/mealpackage"
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition flex items-center gap-1.5"
                >
                  Quản lý gói
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </Card.Content>
        </Card>
      ) : pendingSubscription ? (
        <Card className="rounded-2xl border border-amber-200 bg-amber-50/60 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Clock className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 text-base">Gói ăn đang chờ Admin xác nhận thanh toán</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Đơn đăng ký gói #{pendingSubscription.id} của bạn đang được kiểm tra. Sau khi được duyệt, bạn sẽ có thể đặt món ngay lập
                  tức.
                </p>
              </div>
            </div>
            <Link
              to={`/user/payment/${pendingSubscription.id}`}
              className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-700 transition whitespace-nowrap"
            >
              Xem chi tiết thanh toán
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Package className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 text-base">Bạn chưa có gói ăn hoạt động hoặc đã dùng hết số bữa</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Vui lòng đăng ký gói ăn dinh dưỡng để mở tính năng đặt món giao tận nơi hàng ngày.
                </p>
              </div>
            </div>
            <Link
              to="/user/registerpackage"
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition whitespace-nowrap shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              Đăng ký gói ăn ngay
            </Link>
          </div>
        </Card>
      )}

      {/* ================= Rules Reminder Box ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 leading-relaxed">
            <strong className="font-semibold block text-sm mb-0.5">Giờ chốt món hàng ngày (22:00)</strong>
            Bạn có thể đặt hoặc hủy món ăn cho ngày hôm sau trước <strong>22:00</strong> tối hôm nay. Sau 22:00, bếp sẽ chốt số lượng và
            chuẩn bị nấu nướng.
          </div>
        </div>

        <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-4 flex items-start gap-3">
          <Calendar className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
          <div className="text-xs text-purple-900 leading-relaxed">
            <strong className="font-semibold block text-sm mb-0.5">Đặt trước cho cả tuần mới</strong>
            Từ <strong>23:00 tối Thứ 6</strong> đến <strong>22:00 tối Chủ Nhật</strong>, bạn có thể đặt trước thực đơn cho toàn bộ các ngày
            trong tuần tiếp theo.
          </div>
        </div>
      </div>

      {/* ================= Week Selector (Admin style) ================= */}
      <Card className="rounded-xl border border-gray-200 shadow-sm">
        <Card.Content className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Week information */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Thực đơn theo tuần</p>
              <h2 className="mt-1 text-xl font-bold text-gray-900">
                Tuần {week} - {year}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {formatDate(startDate)} — {formatDate(endDate)}
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setYear(currentYear);
                  setWeek(initialWeek);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                  week === initialWeek && year === currentYear
                    ? "bg-white text-emerald-600 shadow-xs font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Tuần hiện tại
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextWeek = initialWeek + 1;
                  const maxW = getWeeksInYear(currentYear);
                  if (nextWeek > maxW) {
                    setYear(currentYear + 1);
                    setWeek(1);
                  } else {
                    setYear(currentYear);
                    setWeek(nextWeek);
                  }
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                  week === initialWeek + 1 && year === currentYear
                    ? "bg-white text-emerald-600 shadow-xs font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Tuần tới
              </button>
            </div>
            {/* Quick buttons & Select Year / Week */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Quick Jump Buttons */}

              {/* Year Select */}
              <Select
                value={String(year)}
                onChange={(value) => {
                  const selectedYear = Number(value);
                  setYear(selectedYear);
                  const maxWeek = getWeeksInYear(selectedYear);
                  if (week > maxWeek) {
                    setWeek(maxWeek);
                  }
                }}
                className="w-28"
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

              {/* Week Select */}
              <Select
                value={String(week)}
                onChange={(value) => {
                  if (value) setWeek(Number(value));
                }}
                className="w-40 sm:w-44"
              >
                <Label>Tuần</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {Array.from({ length: weeksInYear }, (_, index) => {
                      const weekNumber = index + 1;
                      return (
                        <ListBox.Item key={weekNumber} id={String(weekNumber)} textValue={`Tuần ${weekNumber}`}>
                          Tuần {weekNumber}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      );
                    })}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* ================= Weekly Menu & Orders Grid ================= */}
      {loadingMenus || loadingOrders ? (
        <div className="py-20 text-center">
          <div className="inline-flex h-10 w-10 animate-spin items-center justify-center rounded-full border-4 border-emerald-600 border-t-transparent mb-3" />
          <p className="text-sm font-medium text-gray-500">Đang tải thực đơn và đơn đặt món...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
          {menuDays.map((day) => {
            const pastDate = isPastDate(day.date);
            const orderable = isDateOrderable(day.date);
            const dayOrders = getActiveOrdersByDate(day.date);
            const isFullyBooked = dayOrders.length >= maxMealsPerDay;
            const subStatus = checkDateSubscriptionStatus(day.date);
            const isSubscriptionValid = subStatus.isValid;

            return (
              <Card
                key={day.date}
                className={`overflow-hidden rounded-2xl border transition shadow-sm ${
                  isFullyBooked
                    ? "border-emerald-300 ring-2 ring-emerald-500/20 bg-white"
                    : dayOrders.length > 0
                      ? "border-amber-300 ring-2 ring-amber-500/20 bg-white"
                      : pastDate || !isSubscriptionValid
                        ? "border-gray-200 bg-gray-50/50"
                        : "border-gray-200 bg-white"
                }`}
              >
                {/* Day Header */}
                <Card.Header
                  className={`border-b p-4 ${
                    isFullyBooked
                      ? "border-emerald-100 bg-emerald-50/80"
                      : dayOrders.length > 0
                        ? "border-amber-100 bg-amber-50/70"
                        : pastDate || !isSubscriptionValid
                          ? "border-gray-200 bg-gray-100/70"
                          : orderable
                            ? "border-gray-100 bg-gray-50"
                            : "border-gray-200 bg-amber-50/40"
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-3">
                    <div>
                      <Card.Title className="text-base font-bold text-gray-900 flex items-center gap-2">
                        {getDayName(day.date)}
                        {dayOrders.length > 0 && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white ${
                              isFullyBooked ? "bg-emerald-600" : "bg-amber-600"
                            }`}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            {isFullyBooked
                              ? `Đã đặt đủ (${dayOrders.length}/${maxMealsPerDay})`
                              : `Đã đặt ${dayOrders.length}/${maxMealsPerDay} món`}
                          </span>
                        )}
                      </Card.Title>
                      <Card.Description className="mt-0.5 text-xs text-gray-500">{formatDate(day.date)}</Card.Description>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {pastDate ? (
                        <span className="rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600">Đã qua</span>
                      ) : !isSubscriptionValid ? (
                        subStatus.reason === "before_start" ? (
                          <span className="rounded-full bg-slate-200/80 px-2.5 py-1 text-xs font-medium text-slate-700">
                            Chưa tới hạn gói
                          </span>
                        ) : subStatus.reason === "after_end" ? (
                          <span className="rounded-full bg-slate-200/80 px-2.5 py-1 text-xs font-medium text-slate-600">Ngoài hạn gói</span>
                        ) : subStatus.reason === "out_of_meals" ? (
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">Hết suất ăn</span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">Chưa có gói</span>
                        )
                      ) : !orderable ? (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Đã khóa
                        </span>
                      ) : isFullyBooked ? (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                          Đã đặt đủ ({dayOrders.length}/{maxMealsPerDay})
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          Đang nhận đặt ({dayOrders.length}/{maxMealsPerDay})
                        </span>
                      )}
                    </div>
                  </div>
                </Card.Header>

                {/* Day Content */}
                <Card.Content className="p-4 space-y-3">
                  {day.dishes.length === 0 ? (
                    <div className="flex min-h-[140px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-4 text-center">
                      <Utensils className="h-6 w-6 text-gray-300 mb-1.5" />
                      <span className="text-xs text-gray-400 font-medium">Bếp chưa lên thực đơn cho ngày này</span>
                    </div>
                  ) : (
                    day.dishes.map((menuItem) => {
                      const dish = menuItem.dish;
                      const bookedOrder = getBookedOrderForDish(dayOrders, dish.id);

                      if (bookedOrder) {
                        // 👉 MÓN NÀY ĐÃ ĐƯỢC USER ĐẶT
                        return (
                          <div
                            key={menuItem.id}
                            className="flex flex-col gap-2 rounded-xl border border-emerald-300 bg-emerald-50/70 p-3 shadow-xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {dish.image ? (
                                <img
                                  src={dish.image}
                                  alt={dish.nameVi}
                                  className="h-14 w-14 shrink-0 rounded-lg object-cover border border-emerald-200 shadow-2xs"
                                />
                              ) : (
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs text-emerald-700 font-bold">
                                  DietDeli
                                </div>
                              )}

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <p className="truncate text-sm font-bold text-gray-900">{dish.nameVi}</p>
                                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                                    ✓ Đã đặt ({bookedOrder.mealShift === "LUNCH" ? "Trưa" : "Tối"})
                                  </span>
                                </div>
                                <p className="truncate text-xs text-gray-500">{dish.nameEn}</p>
                                {dish.calories && (
                                  <div className="mt-0.5 flex items-center gap-1 text-xs text-amber-600 font-medium">
                                    <Flame className="h-3 w-3 shrink-0" />
                                    <span>{dish.calories} kcal</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Cancel button if before cutoff */}
                            <div className="flex items-center justify-between pt-1.5 border-t border-emerald-200/60 text-xs">
                              {orderable && !pastDate ? (
                                <>
                                  <span className="text-[11px] text-gray-500">Hủy trước 22:00 để hoàn 1 suất</span>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCancelModal(bookedOrder.id, dish.nameVi, day.date)}
                                    disabled={actionLoading}
                                    className="cursor-pointer text-xs font-semibold text-red-600 hover:text-red-700 hover:underline transition"
                                  >
                                    Hủy đặt món
                                  </button>
                                </>
                              ) : (
                                <span className="text-[11px] text-gray-500 italic">Bếp đã chốt và đang chuẩn bị</span>
                              )}
                            </div>
                          </div>
                        );
                      }

                      // 👉 MÓN NÀY CHƯA ĐẶT
                      const canBookMore = dayOrders.length < maxMealsPerDay;
                      const hasRemainingMeals = Boolean(activeSubscription && activeSubscription.remainingMeals > 0);
                      const disabledToOrder = !orderable || pastDate || !isSubscriptionValid || !hasRemainingMeals || !canBookMore;

                      // Ca ăn gợi ý
                      const hasLunch = dayOrders.some((o) => o.mealShift === "LUNCH");
                      const suggestedShift: MealShift = hasLunch ? "DINNER" : "LUNCH";
                      const shiftName = suggestedShift === "LUNCH" ? "Bữa trưa" : "Bữa tối";

                      return (
                        <div
                          key={menuItem.id}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3 transition ${
                            disabledToOrder
                              ? "border-gray-200 bg-gray-50/70 opacity-80"
                              : "border-gray-200 bg-white hover:border-emerald-300 hover:shadow-2xs"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {dish.image ? (
                              <img
                                src={dish.image}
                                alt={dish.nameVi}
                                className="h-14 w-14 shrink-0 rounded-lg object-cover border border-gray-100"
                              />
                            ) : (
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                                No img
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-gray-900">{dish.nameVi}</p>
                              <p className="truncate text-xs text-gray-400">{dish.nameEn}</p>
                              {dish.calories && (
                                <div className="mt-0.5 flex items-center gap-1 text-xs text-amber-600 font-medium">
                                  <Flame className="h-3 w-3 shrink-0" />
                                  <span>{dish.calories} kcal</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          {!isSubscriptionValid ? (
                            <span className="text-[11px] font-medium text-gray-400 self-end sm:self-center">
                              {subStatus.reason === "before_start"
                                ? `Gói áp dụng từ ${formatDate(activeSubscription?.startDate)}`
                                : subStatus.reason === "after_end"
                                  ? `Gói kết thúc ngày ${formatDate(activeSubscription?.endDate)}`
                                  : subStatus.reason === "out_of_meals"
                                    ? "Đã hết số suất trong gói"
                                    : "Cần gói ăn để đặt"}
                            </span>
                          ) : orderable && !pastDate ? (
                            canBookMore ? (
                              <button
                                type="button"
                                disabled={actionLoading || !activeSubscription || !hasRemainingMeals}
                                onClick={() => handleOpenBookingModal(day.date, dish, suggestedShift)}
                                className="w-full sm:w-auto shrink-0 cursor-pointer rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 active:scale-98 transition disabled:opacity-50 disabled:cursor-not-allowed text-center"
                              >
                                {maxMealsPerDay === 2 && dayOrders.length === 1 ? `Đặt món (${shiftName})` : "Đặt món này"}
                              </button>
                            ) : (
                              <span className="text-[11px] font-medium text-gray-400 self-end sm:self-center">
                                {maxMealsPerDay === 1 ? "Đã chọn 1 món (Gói 1 bữa/ngày)" : "Đã chọn đủ 2 món trong ngày"}
                              </span>
                            )
                          ) : (
                            <span className="text-[11px] font-medium text-gray-400 self-end sm:self-center">
                              {pastDate ? "Đã qua" : "Đã khóa đơn"}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </Card.Content>

                {/* Day Footer */}
                <Card.Footer className="border-t border-gray-100 p-3 bg-gray-50/50">
                  <div className="flex w-full items-center justify-between text-xs text-gray-500">
                    <span>{day.dishes.length} món trong thực đơn</span>
                    {!isSubscriptionValid ? (
                      <span className="text-gray-400">
                        {subStatus.reason === "before_start"
                          ? `Gói áp dụng từ ${formatDate(activeSubscription?.startDate)}`
                          : subStatus.reason === "after_end"
                            ? `Gói kết thúc ngày ${formatDate(activeSubscription?.endDate)}`
                            : "Ngoài thời hạn áp dụng gói"}
                      </span>
                    ) : isFullyBooked ? (
                      <span className="text-emerald-700 font-semibold">
                        ✓ Đã đặt đủ ({dayOrders.length}/{maxMealsPerDay} bữa)
                      </span>
                    ) : dayOrders.length > 0 ? (
                      <span className="text-amber-700 font-medium">
                        Đã đặt {dayOrders.length}/{maxMealsPerDay} bữa
                      </span>
                    ) : orderable && !pastDate ? (
                      <span className="text-emerald-600 font-medium">Chưa chọn món (0/{maxMealsPerDay})</span>
                    ) : (
                      <span className="text-gray-400">Đã kết thúc nhận đặt</span>
                    )}
                  </div>
                </Card.Footer>
              </Card>
            );
          })}
        </div>
      )}

      {/* ================= Modal Xác nhận Đặt món ================= */}
      {bookingTarget && (
        <CommonModal
          isOpen={bookingTarget !== null}
          onOpenChange={(open) => {
            if (!open) setBookingTarget(null);
          }}
          title="Xác nhận đặt món ăn"
          description="Kiểm tra thông tin trước khi hoàn tất đặt món"
          size="sm"
          footer={
            <div className="flex w-full justify-end gap-3">
              <Button
                className="border border-gray-200 bg-white text-gray-700"
                onPress={() => setBookingTarget(null)}
                isDisabled={actionLoading}
              >
                Hủy
              </Button>
              <Button
                className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
                onPress={handleConfirmBooking}
                isDisabled={actionLoading}
              >
                {actionLoading ? "Đang xử lý..." : "Xác nhận đặt món"}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Dish Card Preview */}
            <div className="flex items-center gap-3.5 rounded-xl border border-gray-200 p-3 bg-gray-50">
              {bookingTarget.dish.image ? (
                <img
                  src={bookingTarget.dish.image}
                  alt={bookingTarget.dish.nameVi}
                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-xs text-gray-400">
                  DietDeli
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-gray-900 text-sm truncate">{bookingTarget.dish.nameVi}</h4>
                <p className="text-xs text-gray-500 truncate">{bookingTarget.dish.nameEn}</p>
                {bookingTarget.dish.calories && (
                  <p className="text-xs text-amber-600 font-semibold mt-1">{bookingTarget.dish.calories} kcal</p>
                )}
              </div>
            </div>

            {/* Delivery Details */}
            <div className="space-y-2 rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Ngày nhận món:</span>
                <strong className="text-gray-900">
                  {getDayName(bookingTarget.date)} ({formatDate(bookingTarget.date)})
                </strong>
              </div>
              <div className="flex justify-between items-center">
                <span>Ca nhận món:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBookingTarget((prev) => (prev ? { ...prev, shift: "LUNCH" } : null))}
                    disabled={getActiveOrdersByDate(bookingTarget.date).some((o) => o.mealShift === "LUNCH")}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                      bookingTarget.shift === "LUNCH"
                        ? "bg-emerald-600 text-white font-semibold shadow-2xs"
                        : getActiveOrdersByDate(bookingTarget.date).some((o) => o.mealShift === "LUNCH")
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Bữa trưa
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingTarget((prev) => (prev ? { ...prev, shift: "DINNER" } : null))}
                    disabled={getActiveOrdersByDate(bookingTarget.date).some((o) => o.mealShift === "DINNER")}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                      bookingTarget.shift === "DINNER"
                        ? "bg-emerald-600 text-white font-semibold shadow-2xs"
                        : getActiveOrdersByDate(bookingTarget.date).some((o) => o.mealShift === "DINNER")
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Bữa tối
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span>Giao tới:</span>
                <strong className="text-gray-900 truncate max-w-[200px]" title={activeSubscription?.planShippingAddress || ""}>
                  {activeSubscription?.planShippingAddress || "Địa chỉ mặc định"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Số điện thoại:</span>
                <strong className="text-gray-900">{activeSubscription?.planPhone || "SĐT mặc định"}</strong>
              </div>
            </div>

            {/* Meal deduction reminder */}
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs text-emerald-800 leading-relaxed">
              💡 Thao tác này sẽ trừ <strong>1 bữa ăn</strong> trong gói <strong>{activeSubscription?.package?.name}</strong> của bạn (còn
              lại: {activeSubscription ? activeSubscription.remainingMeals - 1 : 0} bữa).
            </div>
          </div>
        </CommonModal>
      )}

      {/* ================= Modal Xác nhận Hủy món ================= */}
      <ConfirmModal
        isOpen={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        title="Xác nhận hủy đặt món"
        description={
          cancelTarget
            ? `Bạn có chắc chắn muốn hủy đặt món "${cancelTarget.dishName}" cho ngày ${getDayName(
                cancelTarget.date,
              )} (${formatDate(cancelTarget.date)})? 1 suất ăn sẽ được hoàn lại vào gói của bạn.`
            : "Bạn có chắc chắn muốn hủy đặt món cho ngày này?"
        }
        confirmText="Hủy đặt món"
        cancelText="Giữ lại món"
        onConfirm={handleConfirmCancel}
        loading={actionLoading}
      />
    </div>
  );
}
