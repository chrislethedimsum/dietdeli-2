import { useNavigate, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, Table, Button, Chip, Avatar } from "@heroui/react";
import { Calendar, CreditCard, RefreshCw, Plus, UtensilsCrossed, Sparkles, Flame, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { subscriptionApi, type UserSubscription } from "../../api/subscription.api";

function getPaymentStatusBadge(status: string) {
  switch (status) {
    case "PAID":
      return {
        label: "Đang hoạt động",
        color: "success" as const,
        variant: "soft" as const,
      };
    case "UNPAID":
      return {
        label: "Chờ thanh toán",
        color: "warning" as const,
        variant: "soft" as const,
      };
    case "CANCELLED":
      return {
        label: "Đã hủy",
        color: "default" as const,
        variant: "soft" as const,
      };
    default:
      return {
        label: status,
        color: "default" as const,
        variant: "soft" as const,
      };
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function MealPackagePage() {
  const navigate = useNavigate();

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

  // 2. Chuyển hướng tới trang thanh toán kèm thông tin gói
  const handlePayNow = (sub: UserSubscription) => {
    const bankAccount = "0389150399";
    const bankCode = "MB";
    const accountName = "NGUYEN VIET CHINH";
    const transferContent = `DIETDELI ${sub.id}`;
    const amount = sub.package.price;
    const qrUrl = `https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
      transferContent,
    )}&accountName=${encodeURIComponent(accountName)}`;

    const paymentInfo = {
      subscriptionId: sub.id,
      packageName: sub.package.name,
      calories: sub.package.caloriesPerMeal,
      amount: sub.package.price,
      bankAccount,
      bankCode,
      accountName,
      transferContent,
      qrUrl,
    };

    sessionStorage.setItem("dietdeli_payment", JSON.stringify(paymentInfo));
    navigate("/user/payment", { state: { paymentInfo } });
  };

  // 3. Đăng ký gói mới
  const handleRegisterNewPackage = () => {
    navigate("/user/registerpackage");
  };

  // 4. Thống kê nhanh
  const activeSub = subscriptions.find((s) => s.paymentStatus === "PAID");
  const unpaidCount = subscriptions.filter((s) => s.paymentStatus === "UNPAID").length;
  const totalMealsLeft = subscriptions.filter((s) => s.paymentStatus === "PAID").reduce((acc, curr) => acc + curr.remainingMeals, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Gói ăn của tôi</h1>
          <p className="mt-1 text-sm text-gray-500">Theo dõi trạng thái các gói dinh dưỡng đã đăng ký và tiến trình các bữa ăn của bạn.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50"
            onClick={() => refetch()}
            isDisabled={isFetching}
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            <span>Làm mới</span>
          </Button>

          <Button
            size="sm"
            className="flex items-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
            onClick={() => handleRegisterNewPackage()}
          >
            <Plus size={16} />
            <span>Đăng ký gói mới</span>
          </Button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Gói hiện tại */}
        <Card className="border border-gray-100 shadow-sm">
          <Card.Content className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Gói đang dùng</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Sparkles size={18} />
              </div>
            </div>
            <div className="mt-3">
              <p className="truncate text-lg font-bold text-gray-900">{activeSub ? activeSub.package.name : "Chưa kích hoạt"}</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {activeSub ? `${activeSub.package.caloriesPerMeal} kcal/bữa` : "Đăng ký để bắt đầu bữa ăn"}
              </p>
            </div>
          </Card.Content>
        </Card>

        {/* Card 2: Bữa ăn khả dụng */}
        <Card className="border border-gray-100 shadow-sm">
          <Card.Content className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Bữa ăn còn lại</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <UtensilsCrossed size={18} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900">
                {totalMealsLeft} <span className="text-sm font-normal text-gray-500">bữa</span>
              </p>
              <p className="mt-0.5 text-xs text-gray-500">Dành cho các gói đang hoạt động</p>
            </div>
          </Card.Content>
        </Card>

        {/* Card 3: Đơn chờ thanh toán */}
        <Card className="border border-gray-100 shadow-sm">
          <Card.Content className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Chờ thanh toán</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <CreditCard size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-2xl font-bold text-gray-900">
                {unpaidCount} <span className="text-sm font-normal text-gray-500">đơn</span>
              </p>
              {unpaidCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                  Cần kích hoạt
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-gray-500">Chuyển khoản để kích hoạt gói</p>
          </Card.Content>
        </Card>

        {/* Card 4: Tổng đơn đăng ký */}
        <Card className="border border-gray-100 shadow-sm">
          <Card.Content className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Tổng gói đã mua</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Clock size={18} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900">
                {subscriptions.length} <span className="text-sm font-normal text-gray-500">gói</span>
              </p>
              <p className="mt-0.5 text-xs text-gray-500">Lịch sử trải nghiệm tại DietDeli</p>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Main Subscriptions List */}
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Lịch sử và trạng thái gói ăn</h2>
              <p className="text-xs text-gray-500">Toàn bộ danh sách các gói ăn được lưu trên hệ thống</p>
            </div>
          </div>
        </CardHeader>

        <Card.Content className="px-5 pb-5">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
              <p className="text-sm font-medium text-gray-600">Đang tải danh sách gói ăn...</p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="my-6 rounded-2xl border border-red-100 bg-red-50/50 p-6 text-center">
              <p className="text-sm font-medium text-red-800">Không thể tải danh sách gói ăn lúc này.</p>
              <p className="mt-1 text-xs text-red-600">Vui lòng kiểm tra lại kết nối mạng hoặc thử lại.</p>
              <Button size="sm" className="mt-4 bg-red-600 text-white hover:bg-red-700" onClick={() => refetch()}>
                Thử lại
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && subscriptions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
                <UtensilsCrossed size={30} />
              </div>
              <h3 className="text-base font-bold text-gray-900">Bạn chưa đăng ký gói ăn nào</h3>
              <p className="mt-1.5 max-w-sm text-xs text-gray-500">
                Hãy lựa chọn gói ăn phù hợp với nhu cầu calo và mục tiêu sức khỏe của bạn để bắt đầu nhận bữa ăn thơm ngon mỗi ngày!
              </p>
              <Link
                to="/user/registerpackage"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                <span>Khám phá & Đăng ký gói ăn ngay</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Subscriptions List (Data present) */}
          {!isLoading && !isError && subscriptions.length > 0 && (
            <>
              {/* Desktop Table View */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <Table.ScrollContainer>
                    <Table.Content aria-label="Danh sách gói ăn cá nhân" className="min-w-[950px]">
                      <Table.Header>
                        <Table.Column id="code" className="pb-3 text-xs font-medium uppercase text-gray-400">
                          Mã đơn / Gói
                        </Table.Column>
                        <Table.Column id="package" className="pb-3 text-xs font-medium uppercase text-gray-400">
                          Gói dinh dưỡng
                        </Table.Column>
                        <Table.Column id="meals" className="pb-3 text-xs font-medium uppercase text-gray-400">
                          Tiến trình bữa ăn
                        </Table.Column>
                        <Table.Column id="dates" className="pb-3 text-xs font-medium uppercase text-gray-400">
                          Thời gian áp dụng
                        </Table.Column>
                        <Table.Column id="price" className="pb-3 text-xs font-medium uppercase text-gray-400">
                          Tổng tiền
                        </Table.Column>
                        <Table.Column id="status" className="pb-3 text-xs font-medium uppercase text-gray-400">
                          Trạng thái
                        </Table.Column>
                        <Table.Column id="action" className="pb-3 text-xs font-medium uppercase text-gray-400 text-right">
                          Thao tác
                        </Table.Column>
                      </Table.Header>

                      <Table.Body>
                        {subscriptions.map((sub) => {
                          const badge = getPaymentStatusBadge(sub.paymentStatus);
                          const totalMeals = sub.package.totalMeals || 1;
                          const progress = Math.min(100, Math.max(0, Math.round(((totalMeals - sub.remainingMeals) / totalMeals) * 100)));

                          return (
                            <Table.Row key={sub.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                              {/* 1. Mã đơn */}
                              <Table.Cell className="py-4">
                                <div className="space-y-0.5">
                                  <span className="font-mono text-sm font-bold text-gray-900">#SUB-{sub.id}</span>
                                  <p className="text-[11px] text-gray-400">{formatDate(sub.createdAt)}</p>
                                </div>
                              </Table.Cell>

                              {/* 2. Gói dinh dưỡng */}
                              <Table.Cell className="py-4">
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <Avatar.Fallback className="bg-emerald-100 text-emerald-700 font-semibold text-xs">
                                      {sub.package.name.slice(0, 2).toUpperCase()}
                                    </Avatar.Fallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">{sub.package.name}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                                        <Flame size={10} />
                                        {sub.package.caloriesPerMeal} kcal
                                      </span>
                                      <span className="text-[11px] text-gray-400">({sub.package.durationDays} ngày)</span>
                                    </div>
                                  </div>
                                </div>
                              </Table.Cell>

                              {/* 3. Tiến trình bữa ăn */}
                              <Table.Cell className="py-4">
                                <div className="space-y-1.5 w-40">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500 font-medium">Còn lại:</span>
                                    <span className="font-bold text-gray-800">
                                      {sub.remainingMeals} / {totalMeals} bữa
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${sub.paymentStatus === "PAID" ? "bg-emerald-500" : "bg-gray-300"}`}
                                      style={{ width: `${sub.paymentStatus === "PAID" ? 100 - progress : 0}%` }}
                                    />
                                  </div>
                                </div>
                              </Table.Cell>

                              {/* 4. Thời gian */}
                              <Table.Cell className="py-4">
                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                  <Calendar size={13} className="text-gray-400 shrink-0" />
                                  <span>
                                    {formatDate(sub.startDate)} - {formatDate(sub.endDate)}
                                  </span>
                                </div>
                              </Table.Cell>

                              {/* 5. Tổng tiền */}
                              <Table.Cell className="py-4 text-sm font-bold text-gray-900">
                                {sub.package.price?.toLocaleString("vi-VN")} ₫
                              </Table.Cell>

                              {/* 6. Trạng thái */}
                              <Table.Cell className="py-4">
                                <Chip size="sm" variant={badge.variant} color={badge.color}>
                                  {badge.label}
                                </Chip>
                              </Table.Cell>

                              {/* 7. Thao tác */}
                              <Table.Cell className="py-4 text-right">
                                {sub.paymentStatus === "UNPAID" ? (
                                  <Button
                                    size="sm"
                                    className="bg-amber-500 text-white hover:bg-amber-600 text-xs font-semibold shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                                    onClick={() => handlePayNow(sub)}
                                  >
                                    <CreditCard size={14} />
                                    <span>Thanh toán ngay</span>
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs text-emerald-700 border border-emerald-200 hover:bg-emerald-50 inline-flex items-center gap-1 cursor-pointer"
                                    onClick={() => navigate("/user/registerpackage")}
                                  >
                                    <CheckCircle2 size={13} className="text-emerald-600" />
                                    <span>Gia hạn gói</span>
                                  </Button>
                                )}
                              </Table.Cell>
                            </Table.Row>
                          );
                        })}
                      </Table.Body>
                    </Table.Content>
                  </Table.ScrollContainer>
                </Table>
              </div>

              {/* Mobile Cards View */}
              <div className="space-y-3.5 md:hidden">
                {subscriptions.map((sub) => {
                  const badge = getPaymentStatusBadge(sub.paymentStatus);
                  const totalMeals = sub.package.totalMeals || 1;
                  const progress = Math.min(100, Math.max(0, Math.round(((totalMeals - sub.remainingMeals) / totalMeals) * 100)));

                  return (
                    <div
                      key={sub.id}
                      className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:border-gray-200 transition"
                    >
                      {/* Top row: Code + Status */}
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-gray-900">#SUB-{sub.id}</span>
                          <span className="text-[11px] text-gray-400">• {formatDate(sub.createdAt)}</span>
                        </div>
                        <Chip size="sm" variant={badge.variant} color={badge.color}>
                          {badge.label}
                        </Chip>
                      </div>

                      {/* Middle row: Package Name & Calories */}
                      <div className="mt-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{sub.package.name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                              <Flame size={10} />
                              {sub.package.caloriesPerMeal} kcal
                            </span>
                            <span className="text-[11px] text-gray-400">({sub.package.durationDays} ngày)</span>
                          </div>
                        </div>
                        <span className="text-sm font-extrabold text-gray-900">{sub.package.price?.toLocaleString("vi-VN")} ₫</span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3.5 rounded-xl bg-gray-50 p-2.5">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-gray-500 font-medium">Bữa ăn còn lại:</span>
                          <span className="font-bold text-gray-800">
                            {sub.remainingMeals} / {totalMeals} bữa
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${sub.paymentStatus === "PAID" ? "bg-emerald-500" : "bg-gray-400"}`}
                            style={{ width: `${sub.paymentStatus === "PAID" ? 100 - progress : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Validity Period */}
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-gray-400" />
                          <span>Thời hạn:</span>
                        </span>
                        <span className="font-medium text-gray-700">
                          {formatDate(sub.startDate)} - {formatDate(sub.endDate)}
                        </span>
                      </div>

                      {/* Action Button */}
                      <div className="mt-3.5 pt-3 border-t border-gray-100">
                        {sub.paymentStatus === "UNPAID" ? (
                          <Button
                            className="w-full bg-amber-500 text-white hover:bg-amber-600 text-xs font-semibold py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                            onClick={() => handlePayNow(sub)}
                          >
                            <CreditCard size={15} />
                            <span>Thanh toán ngay ({sub.package.price?.toLocaleString("vi-VN")} ₫)</span>
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            className="w-full text-xs text-emerald-700 border border-emerald-200 hover:bg-emerald-50 py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                            onClick={() => navigate("/user/registerpackage")}
                          >
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <span>Gia hạn thêm gói</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
