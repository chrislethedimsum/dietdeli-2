export interface MealCardData {
  id: string;
  title: string;
  description: string;
  image: string;
  soldCount: number;
  anchor?: string;
  tagline?: string;
  suitableFor?: string;
  features?: string[];
  note?: string;
  pricing?: {
    oneMeal: string;
    twoMeals: string;
  };
  htmlContent?: string;
}

export const MEAL_PACKAGES: MealCardData[] = [
  {
    id: "ngay",
    title: "Gói Ngày",
    tagline: "Trải nghiệm linh hoạt từng ngày",
    description:
      "Phù hợp với khách hàng muốn trải nghiệm thử chất lượng sản phẩm của Diet Deli trước khi sử dụng một gói ăn lớn hơn. Đơn hàng được giao sau 2 ngày đặt hàng.",
    image: "/images/food_04.jpg",
    soldCount: 10,
    anchor: "#ngay",
    suitableFor:
      "Khách hàng muốn trải nghiệm thử dịch vụ và chất lượng đồ ăn của Diet Deli trước khi mua gói dài hạn.",
    features: [
      "Bữa trưa - Bữa tối, khẩu phần mặc định 400 - 600 kcal",
      "Sử dụng thực đơn 2 bữa Trưa - Tối vào ngày được chọn trên menu",
      "Menu được thay đổi mỗi tuần, xoay vòng sau 2 tháng không lo ngán",
      "Giao 02 phần ăn tận nơi mỗi ngày, từ thứ 2 đến thứ 7",
      "Calories mỗi ngày được cân đối theo tình trạng và mục tiêu sức khỏe của bạn",
    ],
    note: "Giá trên là giá cho thực đơn tiêu chuẩn từ thứ 2 đến thứ 7. Nếu bạn đặt vào thứ 2, đơn sẽ được giao từ thứ 4 cùng tuần để bếp chuẩn bị nguyên liệu tươi nhất.",
    pricing: {
      oneMeal: "65.000đ - 85.000đ / bữa",
      twoMeals: "130.000đ - 165.000đ / ngày",
    },
  },
  {
    id: "tuan",
    title: "Gói Tuần",
    tagline: "Tiết kiệm thời gian, tối ưu sức khỏe",
    description:
      "Phù hợp với khách hàng đang công tác tại Hà Nội trong một thời gian ngắn, khách hàng có một khoảng thời gian bận rộn ngắn và không thể chuẩn bị đồ ăn.",
    image: "/images/food_01.jpg",
    soldCount: 30,
    anchor: "#tuan",
    suitableFor:
      "Dân văn phòng bận rộn, người đi công tác, vừa muốn giảm cân vừa tiết kiệm thời gian nấu nướng.",
    features: [
      "Trọn gói từ thứ 2 đến thứ 7 (5 - 6 ngày liên tục)",
      "Đầy đủ dinh dưỡng cân bằng Macro (Tinh bột chậm, Đạm sạch, Chất béo tốt)",
      "Đổi món mỗi ngày theo menu tuần của Diet Deli",
      "Giao hàng đúng giờ trưa và tối tận nơi",
      "Chốt đổi/hủy món linh hoạt trước 12h trưa ngày hôm trước",
    ],
    note: "Khách hàng có thể đặt trước toàn bộ món cho cả tuần vào khung giờ từ 12h trưa thứ 6 đến 12h trưa Chủ nhật.",
    pricing: {
      oneMeal: "360.000đ - 450.000đ / tuần",
      twoMeals: "720.000đ - 880.000đ / tuần",
    },
  },
  {
    id: "thang",
    title: "Gói Tháng",
    tagline: "Chuyển hóa vóc dáng dài hạn",
    description:
      "Phù hợp với khách hàng có mục tiêu, muốn đầu tư cho sức khoẻ nói chung và hướng đến một mục tiêu thể chất cụ thể dài hạn nói riêng.",
    image: "/images/food_02.jpg",
    soldCount: 50,
    anchor: "#thang",
    suitableFor:
      "Người ăn kiêng có mục tiêu rõ ràng (giảm mỡ, tăng cơ, cải thiện chỉ số sức khỏe dài hạn).",
    features: [
      "Gói ăn 20 - 24 ngày trong tháng (thứ 2 đến thứ 7)",
      "Đồng hành theo dõi cân nặng và điều chỉnh khẩu phần theo tuần",
      "Tiết kiệm chi phí lên đến 20% so với đặt lẻ từng ngày",
      "Ưu tiên giữ suất và điều phối giao hàng chuẩn giờ",
      "Hỗ trợ tạm ngưng gói khi đi công tác hoặc có việc đột xuất",
    ],
    note: "Miễn phí tư vấn chỉ số BMR/TDEE và cá nhân hóa lượng calo theo mục tiêu tăng/giảm cân.",
    pricing: {
      oneMeal: "1.450.000đ - 1.750.000đ / tháng",
      twoMeals: "2.800.000đ - 3.400.000đ / tháng",
    },
  },
  {
    id: "dacbiet",
    title: "Gói Đơn Hàng Đặc Biệt",
    tagline: "Thiết kế riêng 1:1 theo nhu cầu",
    description:
      "Phù hợp với khách hàng có nhu cầu đặc biệt về sức khoẻ, ăn kiêng theo bệnh lý hoặc ăn kiêng để thi đấu.",
    image: "/images/food_03.jpg",
    soldCount: 50,
    anchor: "#dacbiet",
    suitableFor:
      "Vận động viên thi đấu, người có bệnh lý cần kiêng khem (tiểu đường, gút, mỡ máu, suy thận...).",
    features: [
      "Cân đo chính xác từng gram đạm, tinh bột, chất béo theo chỉ định",
      "Thực đơn độc quyền nấu riêng theo hồ sơ dinh dưỡng của bạn",
      "Không sử dụng gia vị công nghiệp hoặc chất bảo quản",
      "Đầu bếp & Chuyên viên dinh dưỡng kiểm soát từng bữa ăn",
      "Tùy chỉnh lịch giao hàng theo thời gian biểu cá nhân",
    ],
    note: "Vui lòng liên hệ trực tiếp qua Zalo hoặc Hotline để chuyên viên dinh dưỡng lên thực đơn và báo giá chi tiết.",
    pricing: {
      oneMeal: "Báo giá theo thực đơn riêng",
      twoMeals: "Liên hệ Hotline / Zalo 0389150399",
    },
  },
];
