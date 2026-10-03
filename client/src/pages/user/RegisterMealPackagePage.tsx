import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, Button } from "@heroui/react";
import {
  Check,
  CreditCard,
  Flame,
  Sparkles,
  UtensilsCrossed,
  Clock,
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartPulse,
  Calculator,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useConsultationStore } from "../../store/useConsultationStore";
import { subscriptionApi, type MealPackage } from "../../api/subscription.api";

type DurationType = "ngay" | "tuan" | "thang";
type MealOptionType = "1_meal" | "2_meals";
type CalorieOption = 400 | 600 | 800;

export default function RegisterMealPackagePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const consultationData = useConsultationStore((state) => state.consultationData);

  // 1. Fetch toàn bộ các gói ăn có sẵn từ backend
  const {
    data: plans = [],
    isLoading: isLoadingPlans,
  } = useQuery({
    queryKey: ["all-meal-plans"],
    queryFn: subscriptionApi.getAllPlans,
  });

  // 2. Trạng thái lựa chọn gói ăn (khởi tạo từ consultationData nếu có)
  const initialDuration: DurationType = useMemo(() => {
    if (consultationData?.packageType === "ngay") return "ngay";
    if (consultationData?.packageType === "thang") return "thang";
    return "tuan"; // Mặc định là tuần
  }, [consultationData]);

  const initialMeals: MealOptionType = useMemo(() => {
    if (consultationData?.mealOption === "1_meal") return "1_meal";
    return "2_meals"; // Mặc định là 2 bữa
  }, [consultationData]);

  const initialCalories: CalorieOption = useMemo(() => {
    const portion = consultationData?.portion || "";
    if (portion.includes("400")) return 400;
    if (portion.includes("800")) return 800;
    return 600; // Mặc định 600 kcal
  }, [consultationData]);

  const [duration, setDuration] = useState<DurationType>(initialDuration);
  const [mealOption, setMealOption] = useState<MealOptionType>(initialMeals);
  const [calories, setCalories] = useState<CalorieOption>(initialCalories);

  // Ngày bắt đầu giao hàng (mặc định ngày mai)
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);
  const [startDate, setStartDate] = useState(tomorrow);
  const [shippingNote, setShippingNote] = useState("");

  // Công cụ tính Calo / TDEE nhanh
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcGender, setCalcGender] = useState<"male" | "female">("male");
  const [calcAge, setCalcAge] = useState(25);
  const [calcHeight, setCalcHeight] = useState(165);
  const [calcWeight, setCalcWeight] = useState(60);
  const [calcActivity, setCalcActivity] = useState(1.375);
  const [calcGoal, setCalcGoal] = useState<"lose" | "maintain" | "gain">("lose");
  const [calcResult, setCalcResult] = useState<number | null>(null);

  const handleCalculateTDEE = (e: React.FormEvent) => {
    e.preventDefault();
    let bmr = 10 * calcWeight + 6.25 * calcHeight - 5 * calcAge;
    bmr += calcGender === "male" ? 5 : -161;
    const tdee = Math.round(bmr * calcActivity);

    let target = tdee;
    if (calcGoal === "lose") target = tdee - 350;
    else if (calcGoal === "gain") target = tdee + 350;

    setCalcResult(target);

    // Tự động chọn mức calo phù hợp
    if (target < 1400) {
      setCalories(400);
    } else if (target <= 2000) {
      setCalories(600);
    } else {
      setCalories(800);
    }
  };

  // 3. Tìm MealPackage trong database khớp với các lựa chọn
  const durationLabel = duration === "ngay" ? "Ngày" : duration === "tuan" ? "Tuần" : "Tháng";
  const mealLabel = mealOption === "1_meal" ? "1 Bữa" : "2 Bữa";
  const targetPackageName = `${durationLabel} ${mealLabel}`;

  const matchedPackage: MealPackage | undefined = useMemo(() => {
    if (!plans || plans.length === 0) return undefined;
    return plans.find(
      (p) => p.name === targetPackageName && p.caloriesPerMeal === calories && p.isActive
    );
  }, [plans, targetPackageName, calories]);

  // Giá và chi tiết hiển thị dự phòng nếu database chưa seed xong
  const fallbackPrice = useMemo(() => {
    if (matchedPackage) return matchedPackage.price;
    // Bảng giá tham khảo
    const priceTable: Record<DurationType, Record<MealOptionType, Record<CalorieOption, number>>> = {
      ngay: {
        "1_meal": { 400: 73000, 600: 77000, 800: 80000 },
        "2_meals": { 400: 140000, 600: 150000, 800: 155000 },
      },
      tuan: {
        "1_meal": { 400: 408000, 600: 438000, 800: 450000 },
        "2_meals": { 400: 816000, 600: 876000, 800: 900000 },
      },
      thang: {
        "1_meal": { 400: 1512000, 600: 1584000, 800: 1680000 },
        "2_meals": { 400: 3024000, 600: 3168000, 800: 3360000 },
      },
    };
    return priceTable[duration]?.[mealOption]?.[calories] || 876000;
  }, [matchedPackage, duration, mealOption, calories]);

  // 4. Mutation Đặt đơn (Checkout)
  const [checkoutError, setCheckoutError] = useState("");

  const checkoutMutation = useMutation({
    mutationFn: subscriptionApi.checkout,
    onSuccess: (data) => {
      // Lưu thông tin thanh toán vào sessionStorage
      if (data?.paymentInstructions) {
        sessionStorage.setItem("dietdeli_payment", JSON.stringify(data.paymentInstructions));
        navigate("/user/payment", { state: { paymentInfo: data.paymentInstructions } });
      } else {
        navigate("/user/mealpackage");
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.";
      setCheckoutError(Array.isArray(msg) ? msg.join(", ") : msg);
    },
  });

  const handleCheckout = () => {
    setCheckoutError("");
    if (!matchedPackage) {
      setCheckoutError("Gói ăn bạn chọn hiện chưa có sẵn trên hệ thống. Vui lòng chọn gói khác.");
      return;
    }

    checkoutMutation.mutate({
      packageId: matchedPackage.id,
      startDate,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Đăng ký gói ăn dinh dưỡng</h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              Cá nhân hóa
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Chọn lộ trình dinh dưỡng, số bữa và mức calo phù hợp với cơ thể bạn.
          </p>
        </div>

        <Link
          to="/user/mealpackage"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          <Clock size={16} />
          <span>Xem gói ăn hiện tại</span>
        </Link>
      </div>

      {/* Main Layout: 2 Columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Configurator Form (8 cols) */}
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          {/* STEP 1: CHỌN CHU KỲ GÓI */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="px-5 pt-5 pb-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                  1
                </div>
                <h2 className="text-base font-bold text-gray-900">Chọn chu kỳ gói ăn</h2>
              </div>
            </CardHeader>

            <Card.Content className="p-5 pt-2">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Gói Ngày */}
                <button
                  type="button"
                  onClick={() => setDuration("ngay")}
                  className={`relative flex flex-col items-start rounded-2xl border p-4 text-left transition cursor-pointer ${
                    duration === "ngay"
                      ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Dùng thử</span>
                  <h3 className="mt-1 text-base font-bold text-gray-900">Gói Ngày</h3>
                  <p className="mt-1 text-xs text-gray-500">Trải nghiệm chất lượng món ăn 1 - 2 ngày.</p>
                  {duration === "ngay" && (
                    <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>

                {/* Gói Tuần */}
                <button
                  type="button"
                  onClick={() => setDuration("tuan")}
                  className={`relative flex flex-col items-start rounded-2xl border p-4 text-left transition cursor-pointer ${
                    duration === "tuan"
                      ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Phổ biến nhất</span>
                    <span className="rounded bg-orange-100 px-1.5 py-0.2 text-[10px] font-bold text-orange-700">HOT</span>
                  </div>
                  <h3 className="mt-1 text-base font-bold text-gray-900">Gói Tuần</h3>
                  <p className="mt-1 text-xs text-gray-500">14 ngày hình thành thói quen ăn sạch khoa học.</p>
                  {duration === "tuan" && (
                    <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>

                {/* Gói Tháng */}
                <button
                  type="button"
                  onClick={() => setDuration("thang")}
                  className={`relative flex flex-col items-start rounded-2xl border p-4 text-left transition cursor-pointer ${
                    duration === "thang"
                      ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">Tiết kiệm nhất</span>
                  </div>
                  <h3 className="mt-1 text-base font-bold text-gray-900">Gói Tháng</h3>
                  <p className="mt-1 text-xs text-gray-500">60 ngày thay đổi vóc dáng và sức khỏe bền vững.</p>
                  {duration === "thang" && (
                    <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              </div>
            </Card.Content>
          </Card>

          {/* STEP 2: CHỌN SỐ BỮA MỖI NGÀY */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="px-5 pt-5 pb-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                  2
                </div>
                <h2 className="text-base font-bold text-gray-900">Số bữa ăn nhận mỗi ngày</h2>
              </div>
            </CardHeader>

            <Card.Content className="p-5 pt-2">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMealOption("1_meal")}
                  className={`relative flex items-center justify-between rounded-2xl border p-4 text-left transition cursor-pointer ${
                    mealOption === "1_meal"
                      ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                      <UtensilsCrossed size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">1 Bữa / ngày</h3>
                      <p className="text-xs text-gray-500">Linh hoạt cho bữa Trưa hoặc Tối</p>
                    </div>
                  </div>
                  {mealOption === "1_meal" && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setMealOption("2_meals")}
                  className={`relative flex items-center justify-between rounded-2xl border p-4 text-left transition cursor-pointer ${
                    mealOption === "2_meals"
                      ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-gray-900">2 Bữa / ngày</h3>
                        <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-700">
                          Khuyên dùng
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Trọn vẹn Trưa & Tối không lo nghĩ món</p>
                    </div>
                  </div>
                  {mealOption === "2_meals" && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              </div>
            </Card.Content>
          </Card>

          {/* STEP 3: CHỌN MỨC CALO */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="px-5 pt-5 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                    3
                  </div>
                  <h2 className="text-base font-bold text-gray-900">Khẩu phần calo mỗi bữa</h2>
                </div>

                {/* Nút toggle công cụ tính TDEE */}
                <button
                  type="button"
                  onClick={() => setShowCalculator(!showCalculator)}
                  className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <Calculator size={14} />
                  <span>{showCalculator ? "Ẩn công cụ tính" : "Chưa biết chọn mức nào? Tính ngay"}</span>
                </button>
              </div>
            </CardHeader>

            <Card.Content className="p-5 pt-2 space-y-4">
              {/* Expandable Calorie & TDEE Calculator */}
              {showCalculator && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-2 mb-3 text-emerald-900 font-semibold text-sm">
                    <HeartPulse size={16} className="text-emerald-600" />
                    <span>Công cụ tính Calo & TDEE mục tiêu</span>
                  </div>

                  <form onSubmit={handleCalculateTDEE} className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="text-gray-600 font-medium block mb-1">Giới tính</label>
                      <select
                        value={calcGender}
                        onChange={(e) => setCalcGender(e.target.value as "male" | "female")}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs"
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-gray-600 font-medium block mb-1">Tuổi</label>
                      <input
                        type="number"
                        min="15"
                        max="80"
                        value={calcAge}
                        onChange={(e) => setCalcAge(Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-gray-600 font-medium block mb-1">Chiều cao (cm)</label>
                      <input
                        type="number"
                        min="100"
                        max="220"
                        value={calcHeight}
                        onChange={(e) => setCalcHeight(Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-gray-600 font-medium block mb-1">Cân nặng (kg)</label>
                      <input
                        type="number"
                        min="30"
                        max="180"
                        value={calcWeight}
                        onChange={(e) => setCalcWeight(Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-gray-600 font-medium block mb-1">Mức độ vận động</label>
                      <select
                        value={calcActivity}
                        onChange={(e) => setCalcActivity(Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs"
                      >
                        <option value="1.2">Ít vận động (Ngồi văn phòng)</option>
                        <option value="1.375">Vận động nhẹ (Tập 1-3 buổi/tuần)</option>
                        <option value="1.55">Vận động vừa (Tập 3-5 buổi/tuần)</option>
                        <option value="1.725">Vận động nhiều (Tập 6-7 buổi/tuần)</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="text-gray-600 font-medium block mb-1">Mục tiêu của bạn</label>
                      <select
                        value={calcGoal}
                        onChange={(e) => setCalcGoal(e.target.value as "lose" | "maintain" | "gain")}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs"
                      >
                        <option value="lose">Giảm cân / Giảm mỡ an toàn</option>
                        <option value="maintain">Duy trì vóc dáng & Ăn lành mạnh</option>
                        <option value="gain">Tăng cân / Tăng cơ bắp</option>
                      </select>
                    </div>

                    <div className="col-span-full pt-1 flex items-center justify-between">
                      <button
                        type="submit"
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition cursor-pointer"
                      >
                        Tính toán & Đề xuất mức Calo
                      </button>

                      {calcResult && (
                        <div className="text-xs text-emerald-800">
                          Năng lượng mục tiêu: <span className="font-bold text-sm">{calcResult} kcal/ngày</span>. Đã
                          chọn mức <span className="font-bold text-sm text-emerald-700">{calories} kcal</span> cho bạn!
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* Calorie Cards (400, 600, 800 kcal) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* 400 kcal */}
                <button
                  type="button"
                  onClick={() => setCalories(400)}
                  className={`relative flex flex-col items-start rounded-2xl border p-4 text-left transition cursor-pointer ${
                    calories === 400
                      ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <Flame size={14} />
                    </span>
                    <span className="text-xs font-bold text-emerald-700">400 kcal / bữa</span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-gray-900">Suất Nhẹ Nhàng</h3>
                  <p className="mt-1 text-xs text-gray-500">Phù hợp thâm hụt calo, giảm mỡ nhanh và kiểm soát cân nặng.</p>
                  {calories === 400 && (
                    <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>

                {/* 600 kcal */}
                <button
                  type="button"
                  onClick={() => setCalories(600)}
                  className={`relative flex flex-col items-start rounded-2xl border p-4 text-left transition cursor-pointer ${
                    calories === 600
                      ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                      <Flame size={14} />
                    </span>
                    <span className="text-xs font-bold text-orange-700">600 kcal / bữa</span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-gray-900">Suất Tiêu Chuẩn</h3>
                  <p className="mt-1 text-xs text-gray-500">Cân đối dinh dưỡng, đủ năng lượng làm việc năng suất cả ngày.</p>
                  {calories === 600 && (
                    <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>

                {/* 800 kcal */}
                <button
                  type="button"
                  onClick={() => setCalories(800)}
                  className={`relative flex flex-col items-start rounded-2xl border p-4 text-left transition cursor-pointer ${
                    calories === 800
                      ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                      <Flame size={14} />
                    </span>
                    <span className="text-xs font-bold text-purple-700">800 kcal / bữa</span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-gray-900">Suất Tăng Cơ</h3>
                  <p className="mt-1 text-xs text-gray-500">Giàu đạm & năng lượng cao cho gymer và người hay vận động.</p>
                  {calories === 800 && (
                    <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              </div>
            </Card.Content>
          </Card>

          {/* STEP 4: THÔNG TIN GIAO HÀNG */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="px-5 pt-5 pb-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                  4
                </div>
                <h2 className="text-base font-bold text-gray-900">Lịch nhận bữa ăn & Địa chỉ</h2>
              </div>
            </CardHeader>

            <Card.Content className="p-5 pt-2 space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Ngày bắt đầu giao */}
                <div>
                  <label className="text-gray-700 font-semibold block mb-1.5">
                    Ngày bắt đầu nhận món <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={tomorrow}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-gray-400">DietDeli chuẩn bị nguyên liệu sạch trước 1 ngày.</p>
                </div>

                {/* Số điện thoại nhận hàng */}
                <div>
                  <label className="text-gray-700 font-semibold block mb-1.5">Số điện thoại liên hệ</label>
                  <input
                    type="text"
                    disabled
                    value={user?.phone || "Chưa cập nhật"}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-600"
                  />
                  <p className="mt-1 text-[11px] text-gray-400">Tài xế sẽ gọi điện trước khi giao mỗi bữa.</p>
                </div>

                {/* Địa chỉ nhận hàng */}
                <div className="sm:col-span-2">
                  <label className="text-gray-700 font-semibold block mb-1.5">Địa chỉ giao hàng mặc định</label>
                  <input
                    type="text"
                    disabled
                    value={user?.address || "Chưa có địa chỉ mặc định"}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-600"
                  />
                </div>

                {/* Ghi chú giao hàng */}
                <div className="sm:col-span-2">
                  <label className="text-gray-700 font-semibold block mb-1.5">Ghi chú cho bếp & shipper (tùy chọn)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Giao trước 11h30 trưa, gửi lễ tân tầng 1..."
                    value={shippingNote}
                    onChange={(e) => setShippingNote(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Right Column: Order Summary & Checkout (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-6 space-y-4">
            <Card className="border border-gray-100 shadow-md">
              <CardHeader className="px-5 pt-5 pb-3 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900">Tóm tắt gói đăng ký</h2>
                <p className="text-xs text-gray-400">Kiểm tra thông tin trước khi thanh toán</p>
              </CardHeader>

              <Card.Content className="p-5 space-y-4">
                {/* Package Highlight Box */}
                <div className="rounded-2xl bg-emerald-50/60 p-4 border border-emerald-100">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                        {durationLabel} • {mealLabel}
                      </span>
                      <h3 className="text-base font-extrabold text-gray-900 mt-0.5">
                        {targetPackageName}
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-emerald-800 shadow-xs border border-emerald-100">
                      <Flame size={12} className="text-orange-500" />
                      {calories} kcal
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-emerald-900/80 pt-2 border-t border-emerald-200/50">
                    <span>Số bữa ăn:</span>
                    <span className="font-bold">
                      {matchedPackage?.totalMeals || (duration === "tuan" ? 14 : duration === "thang" ? 60 : 2)} bữa
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-xs text-emerald-900/80">
                    <span>Thời hạn gói:</span>
                    <span className="font-bold">
                      {matchedPackage?.durationDays || (duration === "tuan" ? 14 : duration === "thang" ? 60 : 2)} ngày
                    </span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Đơn giá gói ăn:</span>
                    <span className="font-medium text-gray-900">{fallbackPrice.toLocaleString("vi-VN")} ₫</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-gray-500">
                      <Truck size={13} className="text-emerald-600" />
                      <span>Phí giao hàng:</span>
                    </span>
                    <span className="font-semibold text-emerald-600">Miễn phí giao tận nơi</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Ngày bắt đầu nhận:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(startDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-baseline justify-between">
                    <span className="text-sm font-bold text-gray-900">Tổng thanh toán:</span>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-orange-600">
                        {fallbackPrice.toLocaleString("vi-VN")} ₫
                      </span>
                      <p className="text-[10px] text-gray-400">Đã bao gồm VAT & toàn bộ dịch vụ</p>
                    </div>
                  </div>
                </div>

                {/* Error Banner if any */}
                {checkoutError && (
                  <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-100">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                {/* Checkout Button */}
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2 text-sm"
                  onClick={handleCheckout}
                  isDisabled={checkoutMutation.isPending || isLoadingPlans}
                >
                  <CreditCard size={16} />
                  <span>
                    {checkoutMutation.isPending ? "Đang xử lý đặt gói..." : "Xác nhận & Chuyển khoản VietQR"}
                  </span>
                  {!checkoutMutation.isPending && <ArrowRight size={16} />}
                </Button>

                {/* DietDeli Trust Badges */}
                <div className="space-y-2 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                    <span>Thực phẩm sạch nguồn gốc rõ ràng, kiểm định VSATTP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck size={14} className="text-emerald-600 shrink-0" />
                    <span>Giao đúng giờ trước mỗi bữa ăn trưa và tối</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HelpCircle size={14} className="text-emerald-600 shrink-0" />
                    <span>Hỗ trợ tạm hoãn hoặc dời lịch giao món qua Zalo</span>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
