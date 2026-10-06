import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Phone,
  CheckCircle2,
  Star,
  Quote,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Utensils,
  TrendingDown,
  Users,
  PackageCheck,
  Award,
} from "lucide-react";
import { useConsultationStore } from "@/store/useConsultationStore";

// Dữ liệu 4 bước đặt hàng từ htdocs/index.html
const ORDER_STEPS = [
  {
    step: "01",
    title: "Nhận tư vấn khẩu phần",
    desc: "Được tư vấn mức năng lượng TDEE và mục tiêu calo phù hợp với thể trạng của bạn.",
    image: "/images/step_01.png",
  },
  {
    step: "02",
    title: "Chọn bữa ăn hàng tuần",
    desc: "Lên thực đơn linh hoạt từ Thứ 2 đến Thứ 7, đổi món mỗi ngày không lo nhàm chán.",
    image: "/images/step_02.png",
  },
  {
    step: "03",
    title: "Thanh toán tiện lợi",
    desc: "Xác nhận và thanh toán trực tuyến qua mã VietQR PayOS an toàn, nhanh chóng.",
    image: "/images/step_03.png",
  },
  {
    step: "04",
    title: "Thưởng thức suất ăn",
    desc: "Suất ăn nóng hổi, chuẩn dinh dưỡng được giao tận tay vào khung giờ trưa và tối.",
    image: "/images/step_04.png",
  },
];

// Dữ liệu các tab Menu tuần này từ htdocs/index.html
const MENU_DAYS = [
  {
    id: "mon",
    dayName: "Thứ 2",
    category: "Thịt bò & Gà",
    icon: "/images/meat-icon.png",
    dishes: [
      {
        name: "Chicken And Olive Pizza",
        nameEn: "Healthy Pizza ức gà & quả ô-liu",
        cal: "490 kcal",
        price: "69.000 ₫",
        rating: 4.8,
        image: "/images/food_01.jpg",
      },
      {
        name: "Chicken Masala",
        nameEn: "Ức gà sốt cà ri Ấn Độ ít béo",
        cal: "520 kcal",
        price: "75.000 ₫",
        rating: 5.0,
        image: "/images/food_02.jpg",
      },
    ],
  },
  {
    id: "tue",
    dayName: "Thứ 3",
    category: "Hải sản tươi",
    icon: "/images/fish-icon.png",
    dishes: [
      {
        name: "Grilled Salmon Steak",
        nameEn: "Cá hồi áp chảo sốt bơ chanh",
        cal: "540 kcal",
        price: "89.000 ₫",
        rating: 5.0,
        image: "/images/food_02.jpg",
      },
      {
        name: "Shrimp Quinoa Bowl",
        nameEn: "Tôm sú xào tỏi & cơm hạt quinoa",
        cal: "460 kcal",
        price: "79.000 ₫",
        rating: 4.9,
        image: "/images/food_03.jpg",
      },
    ],
  },
  {
    id: "wed",
    dayName: "Thứ 4",
    category: "Healthy Burger & Wrap",
    icon: "/images/burger-icon.png",
    dishes: [
      {
        name: "Diet Beef Burger",
        nameEn: "Burger bò Úc bánh mì nguyên cám",
        cal: "510 kcal",
        price: "72.000 ₫",
        rating: 4.9,
        image: "/images/food_05.jpg",
      },
      {
        name: "Avocado Chicken Wrap",
        nameEn: "Bánh cuộn bơ sáp & ức gà xé",
        cal: "470 kcal",
        price: "68.000 ₫",
        rating: 4.7,
        image: "/images/food_02.jpg",
      },
    ],
  },
  {
    id: "thu",
    dayName: "Thứ 5",
    category: "Cơm gạo lứt & Khoai tây",
    icon: "/images/potato-icon.png",
    dishes: [
      {
        name: "Brown Rice Beefsteak",
        nameEn: "Bò bít tết & khoai lang nướng mật",
        cal: "550 kcal",
        price: "85.000 ₫",
        rating: 4.9,
        image: "/images/food_01.jpg",
      },
      {
        name: "Chicken & Mash Bowl",
        nameEn: "Gà sốt nấm khoai tây nghiền sữa hạnh nhân",
        cal: "490 kcal",
        price: "69.000 ₫",
        rating: 4.8,
        image: "/images/food_06.jpg",
      },
    ],
  },
  {
    id: "fri",
    dayName: "Thứ 6",
    category: "Salad & Tráng miệng",
    icon: "/images/desert-icon.png",
    dishes: [
      {
        name: "Rainbow Chicken Salad",
        nameEn: "Salad 7 sắc cầu vồng sốt mè rang",
        cal: "410 kcal",
        price: "62.000 ₫",
        rating: 5.0,
        image: "/images/food_02.jpg",
      },
      {
        name: "Chia Seed Yogurt Cup",
        nameEn: "Sữa chua Hy Lạp hạt chia & việt quất",
        cal: "220 kcal",
        price: "35.000 ₫",
        rating: 4.9,
        image: "/images/food_04.jpg",
      },
    ],
  },
  {
    id: "sat",
    dayName: "Thứ 7",
    category: "Detox & Suất cuối tuần",
    icon: "/images/glass-icon.png",
    dishes: [
      {
        name: "Detox Green Juice Bowl",
        nameEn: "Nước ép cần tây, táo xanh và dưa chuột",
        cal: "150 kcal",
        price: "42.000 ₫",
        rating: 4.9,
        image: "/images/food_03.jpg",
      },
      {
        name: "Smoked Turkey Breast",
        nameEn: "Ức gà tây hun khói sốt nam việt quất",
        cal: "480 kcal",
        price: "79.000 ₫",
        rating: 4.8,
        image: "/images/food_06.jpg",
      },
    ],
  },
];

// Dữ liệu đánh giá từ khách hàng từ htdocs/index.html
const CUSTOMER_REVIEWS = [
  {
    id: 1,
    name: "Vũ Hồng Ngọc",
    role: "Người mẫu",
    avatar: "/images/author_01.png",
    comment:
      "Ngon Vãi! Đồ ăn vị thanh mát, đóng gói rất cẩn thận và quan trọng là mình vẫn giữ được form dáng sau chuỗi ngày bận rộn chụp lookbook.",
    rating: 5,
  },
  {
    id: 2,
    name: "Trịnh Minh Nguyệt",
    role: "Giảng viên đại học",
    avatar: "/images/author_02.png",
    comment: "Lần đầu tiên mình sử dụng một dịch vụ ăn kiêng và thực sự có được kết quả và biết chính xác lượng calo của từng bữa ăn.",
    rating: 5,
  },
  {
    id: 3,
    name: "Hứa Như Tùng",
    role: "Kế toán viên",
    avatar: "/images/author_03.png",
    comment:
      "Phàn nàn duy nhất là shop không bán hàng vào Chủ Nhật =]]]]]]] Còn lại các món từ T2-T7 đều rất ngon, thịt mềm thơm và đậm đà vừa phải.",
    rating: 5,
  },
  {
    id: 4,
    name: "Lê Xuân Phúc",
    role: "Sinh viên",
    avatar: "/images/author_04.png",
    comment:
      "Không nghĩ là bản thân có thể giảm tới 4kg trong tháng đầu tiên. Cảm ơn Diet Deli rất nhiều ❤. Mình sẽ tiếp tục duy trì gói tháng!",
    rating: 5,
  },
  {
    id: 5,
    name: "Lê Tuyết Anh",
    role: "Sinh viên",
    avatar: "/images/author_06.png",
    comment:
      "Ước gì ngày nào các bạn cũng làm Taco Pulled Pork, nghiện từ miếng đầu tiên ạ. Bữa ăn nhiều rau củ tươi giòn, nước sốt ngon xuất sắc.",
    rating: 5,
  },
  {
    id: 6,
    name: "Ngô Quang Minh",
    role: "Huấn luyện viên Gym & Fitness",
    avatar: "/images/author_07.png",
    comment:
      "Dạo này ít khi phải quản lý tình hình ăn uống của học viên vì Diet Deli làm hộ rồi. Cảm ơn người anh em :))), tôi nhàn mà các bạn lại có thêm khách.",
    rating: 5,
  },
];

export default function IndexMain() {
  const navigate = useNavigate();
  const setConsultationData = useConsultationStore((state) => state.setConsultationData);

  // Phone input for Hero form
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Menu tab state (default Monday)
  const [activeTab, setActiveTab] = useState("mon");
  const currentMenu = MENU_DAYS.find((d) => d.id === activeTab) || MENU_DAYS[0];

  // Embla Carousel for Reviews with Autoplay
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 4500, stopOnInteraction: false })],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    const onInit = () => {
      setScrollSnaps(emblaApi.scrollSnapList());
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onInit);

    queueMicrotask(() => {
      onInit();
    });

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onInit);
    };
  }, [emblaApi]);

  // Handle Quick Consultation Submission
  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim();

    if (!cleanPhone) {
      setPhoneError("Vui lòng nhập số điện thoại hoặc Zalo");
      return;
    }

    if (!/(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(cleanPhone)) {
      setPhoneError("Số điện thoại không đúng định dạng Việt Nam");
      return;
    }

    setPhoneError("");
    setConsultationData({
      phone: cleanPhone,
      source: "homepage_hero",
      createdAt: new Date().toISOString(),
    });

    navigate("/baogia");
  };

  return (
    <div className="w-full bg-white text-gray-800">
      {/* =========================================================================
          1. HERO AREA (from .hero-area-wrapper in index.html)
         ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/50 via-white to-gray-50/30 py-12 lg:py-20">
        {/* Subtle background blur accent */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/80 text-orange-700 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Giải pháp bữa ăn dinh dưỡng thông minh</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.15]">
                Ăn Kiêng <span className="text-orange-500">Thật Dễ Dàng</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Chúng tôi mang đến giải pháp ăn kiêng khoa học, từng suất ăn được tính toán chính xác lượng calories và tinh chỉnh phù hợp
                với nhu cầu cơ thể của bạn.
              </p>

              {/* Consultation Input Form */}
              <div className="pt-2">
                <form
                  onSubmit={handleConsultationSubmit}
                  className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl border border-gray-100 max-w-lg mx-auto lg:mx-0 transition-all hover:shadow-2xl"
                >
                  <div className="text-left px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                    <span>Cần tư vấn khẩu phần ngay?</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative w-full">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (phoneError) setPhoneError("");
                        }}
                        placeholder="Số điện thoại hoặc Zalo của bạn"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto shrink-0 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition active:scale-98 cursor-pointer text-center"
                    >
                      Nhận tư vấn
                    </button>
                  </div>

                  {phoneError && <p className="mt-2 text-xs text-red-500 text-left px-2 font-medium">{phoneError}</p>}
                </form>
              </div>

              {/* Quick Feature Bullets */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200/60 max-w-lg mx-auto lg:mx-0 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Đong calo chuẩn</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Giao nóng tận nơi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">100% Rau sạch</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image / Carousel */}
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="relative group max-w-lg">
                {/* Decorative circular backdrop glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-400 to-amber-200 rounded-full blur-2xl opacity-40 scale-90 group-hover:scale-100 transition-transform duration-500" />

                <img
                  src="/images/food.png"
                  alt="Healthy Diet Food Dish"
                  className="relative z-10 w-full h-auto object-contain drop-shadow-2xl animate-float"
                />

                {/* Floating Badge 1: Calories */}
                <div className="absolute -top-4 -left-4 z-20 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-2.5 animate-bounce-subtle">
                  <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 font-medium">Khẩu phần tính sẵn</p>
                    <p className="text-sm font-bold text-gray-900">450 - 650 kcal</p>
                  </div>
                </div>

                {/* Floating Badge 2: Quality */}
                <div className="absolute -bottom-4 -right-4 z-20 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 font-medium">Tiêu chuẩn thực phẩm</p>
                    <p className="text-sm font-bold text-gray-900">Chuẩn Eat Clean</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. ORDER STEPS (from .order-step-area in index.html)
         ========================================================================= */}
      <section className="py-16 lg:py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">4 bước đặt hàng</h2>
            <p className="mt-3 text-base text-gray-500">
              Quy trình nhanh chóng và rõ ràng, giúp bạn bắt đầu lộ trình ăn uống lành mạnh mà không tốn thời gian chuẩn bị.
            </p>
          </div>

          {/* 4 Step Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {ORDER_STEPS.map((item, idx) => (
              <div
                key={item.step}
                className="group relative flex flex-col items-center text-center p-6 rounded-3xl bg-gray-50/70 border border-gray-100 hover:border-orange-200 hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                {/* Step Pill */}
                <span className="inline-block px-3 py-1 mb-4 rounded-full bg-orange-100 text-orange-600 text-xs font-bold tracking-wider">
                  BƯỚC {item.step}
                </span>

                {/* Step Illustration */}
                <div className="h-32 flex items-center justify-center my-2">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="max-h-28 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <h3 className="mt-4 text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{item.title}</h3>
                <p className="mt-2 text-xs text-gray-500 leading-relaxed">{item.desc}</p>

                {/* Arrow connector between steps on desktop */}
                {idx < ORDER_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 text-gray-300 z-10 pointer-events-none">
                    <ArrowRight className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. FOODS TABS AREA (from .foods-tabs-area in index.html)
         ========================================================================= */}
      <section className="py-16 lg:py-24 bg-gray-50/80 border-y border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">
                <Utensils className="w-3.5 h-3.5" />
                <span>Thực đơn tươi mới mỗi ngày</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Menu tuần này</h2>
            </div>
            <Link
              to="/baogia"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 transition"
            >
              <span>Xem toàn bộ gói ăn & chi tiết</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Tabs (Days of the week) */}
            <div className="lg:col-span-4 flex flex-row lg:flex-col gap-2.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              {MENU_DAYS.map((day) => {
                const isCurrent = activeTab === day.id;
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setActiveTab(day.id)}
                    className={`flex items-center gap-3.5 p-3.5 rounded-2xl text-left transition-all cursor-pointer shrink-0 lg:shrink ${
                      isCurrent
                        ? "bg-white text-orange-600 shadow-md border-l-4 border-orange-500 font-semibold"
                        : "bg-white/60 hover:bg-white text-gray-700 border border-gray-100"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center p-2 shrink-0">
                      <img src={day.icon} alt={day.dayName} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{day.dayName}</div>
                      <div className="text-xs text-gray-500 font-normal">{day.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Dish Cards Grid */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {currentMenu.dishes.map((dish, i) => (
                  <div
                    key={i}
                    className="group flex flex-col rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    {/* Dish Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-orange-600 shadow-sm flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span>{dish.cal}</span>
                      </div>
                    </div>

                    {/* Dish Info */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{dish.name}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{dish.nameEn}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{dish.rating}</span>
                        </div>
                        <span className="text-sm font-extrabold text-orange-600">{dish.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom CTA Button */}
              <div className="mt-8 text-center">
                <Link
                  to="/baogia"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition active:scale-98"
                >
                  <Utensils className="w-4 h-4" />
                  <span>Xem bảng giá & Đăng ký gói ăn ngay</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. ABOUT / NUTRITION PHILOSOPHY (from .about-section-area in index.html)
         ========================================================================= */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Photo Plate */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative max-w-md w-full">
                <div className="absolute inset-0 bg-orange-200/40 rounded-full blur-2xl scale-95" />
                <img
                  src="/images/food_plate.png"
                  alt="Đĩa ăn dinh dưỡng khoa học"
                  className="relative z-10 w-full h-auto object-contain drop-shadow-xl"
                />
              </div>
            </div>

            {/* Right Story & Metrics */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                <Award className="w-3.5 h-3.5" />
                <span>Triết lý dinh dưỡng Diet Deli</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-snug">
                Ăn đúng chưa đủ, <span className="text-orange-500">ăn đủ mới đủ</span>
              </h2>

              <div className="space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-900">&quot;Eat clean&quot;</strong> là một cụm từ rất phổ biến trong cộng đồng ăn kiêng,
                  nhưng bản thân &quot;eat clean&quot; không phải là một chế độ ăn kiêng, nó chỉ là một cách lựa chọn thực phẩm.
                </p>
                <p>
                  Diet Deli sẽ giúp bạn thực sự ăn kiêng — <span className="text-orange-600 font-semibold">thực sự diet</span>.
                </p>
                <p>
                  Chúng tôi tính toán chính xác calories của từng đơn hàng — yếu tố then chốt quyết định cân nặng và mục tiêu hình thể của
                  bạn. Đồng thời, Diet Deli vẫn giữ trọn vẹn tinh thần Eat Clean qua việc lựa chọn thực phẩm sạch, tươi ngon và an toàn cho
                  sức khoẻ.
                </p>
              </div>

              {/* 3 Counter Statistics */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-center shadow-xs">
                  <div className="flex justify-center text-orange-500 mb-1">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">9.874+</div>
                  <div className="text-xs text-gray-500 font-medium mt-1">Đơn đã giao</div>
                </div>

                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-center shadow-xs">
                  <div className="flex justify-center text-emerald-500 mb-1">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">2.034+</div>
                  <div className="text-xs text-gray-500 font-medium mt-1">Khách hàng</div>
                </div>

                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-center shadow-xs">
                  <div className="flex justify-center text-rose-500 mb-1">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">22+</div>
                  <div className="text-xs text-gray-500 font-medium mt-1">Kg mỡ đã giảm</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. CALL TO ACTION BANNER (from .call-to-action-area in index.html)
         ========================================================================= */}
      <section
        className="relative py-16 lg:py-20 bg-cover bg-center text-white overflow-hidden"
        style={{ backgroundImage: "url('/images/action_bg.jpg')" }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left Text */}
            <div className="md:col-span-8 text-center md:text-left space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-white drop-shadow-md">
                Chăm sóc bạn trên bàn ăn để có kết quả trên bàn cân
              </h2>
              <p className="text-gray-200 text-sm sm:text-base max-w-xl">
                Bắt đầu hành trình sống khỏe cùng những bữa ăn ngon lành, cân bằng dinh dưỡng từ hôm nay.
              </p>
              <div className="pt-2">
                <Link
                  to="/baogia"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-orange-500/40 transition active:scale-98"
                >
                  <span>Liên hệ đặt hàng ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Pizza Graphic */}
            <div className="md:col-span-4 flex justify-center">
              <img src="/images/pizza.png" alt="Diet Pizza" className="max-h-56 w-auto object-contain drop-shadow-2xl animate-float" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. CLIENTS REVIEWS CAROUSEL (from .clients-reviews-area in index.html)
         ========================================================================= */}
      <section
        className="relative py-16 lg:py-24 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('/images/carousel_bg.jpg')" }}
      >
        {/* Soft overlay */}
        <div className="absolute inset-0 bg-white/90 backdrop-blur-xs" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">
                <Quote className="w-3.5 h-3.5" />
                <span>Cảm nhận người dùng</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Khách hàng nói gì về Diet Deli</h2>
            </div>

            {/* Nav Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={scrollPrev}
                aria-label="Previous review"
                className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-orange-50 hover:border-orange-300 text-gray-700 hover:text-orange-600 flex items-center justify-center transition shadow-xs cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                aria-label="Next review"
                className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-orange-50 hover:border-orange-300 text-gray-700 hover:text-orange-600 flex items-center justify-center transition shadow-xs cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Embla Carousel Viewport */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-5">
              {CUSTOMER_REVIEWS.map((review) => (
                <div key={review.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-5 min-w-0">
                  <div className="h-full flex flex-col justify-between bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                    <div>
                      {/* Author Info */}
                      <div className="flex items-center gap-3.5 mb-4">
                        <img
                          src={review.avatar}
                          alt={review.name}
                          className="w-13 h-13 rounded-full object-cover border-2 border-orange-200 shrink-0"
                        />
                        <div>
                          <h4 className="text-base font-bold text-gray-900">{review.name}</h4>
                          <p className="text-xs text-orange-600 font-medium">{review.role}</p>
                        </div>
                      </div>

                      {/* Comment text */}
                      <p className="text-sm text-gray-600 leading-relaxed italic">&quot;{review.comment}&quot;</p>
                    </div>

                    {/* Bottom stars & quote mark */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: review.rating }).map((_, s) => (
                          <Star key={s} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <Quote className="w-6 h-6 text-orange-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {scrollSnaps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  selectedIndex === idx ? "w-8 bg-orange-500" : "w-2.5 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
