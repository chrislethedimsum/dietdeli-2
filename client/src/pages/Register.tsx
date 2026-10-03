import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import { authApi } from "../api/auth";
import { useConsultationStore } from "../store/useConsultationStore";

export default function Register() {
  const navigate = useNavigate();

  // 1. Hứng dữ liệu tư vấn gửi từ Modal (nếu có)
  const consultationData = useConsultationStore((state) => state.consultationData);
  const clearConsultationData = useConsultationStore((state) => state.clearConsultation);
  // 2. State cho các trường còn lại để hoàn thành tài khoản
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState(""); // Địa chỉ nhận hàng
  // Đọc lựa chọn bữa ăn đã chọn từ Modal làm giá trị mặc định:
  const [mealPlanOption, setMealPlanOption] = useState<"1_meal" | "2_meals">((consultationData as any)?.mealOption || "2_meals");
  // state quản lý lỗi và loading
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  // Thêm State lưu kết quả đơn hàng:
  const login = useAuthStore((state) => state.login);

  // 3. Xử lý submit đăng ký
  const handleRegisterSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError("");
    const newErrors: Record<string, string> = {};

    // 1. Kiểm tra Họ tên
    if (!fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên";
    }

    // 2. Kiểm tra Số điện thoại (10 số, bắt đầu bằng 0)
    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    if (!phoneRegex.test(phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08, 09)";
    }

    // 3. Kiểm tra Mật khẩu
    if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    // 4. Kiểm tra Địa chỉ
    if (!address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ nhận hàng";
    }

    // Nếu có lỗi -> Dừng lại và hiển thị lỗi lên UI
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Nếu hợp lệ -> Gọi API
    setErrors({});
    setLoading(true);
    try {
      // Tách calo từ chuỗi portion (ví dụ: "Suất 600 kcal..." -> 600)
      let calories = 600;
      if (consultationData?.portion?.includes("400")) calories = 400;
      if (consultationData?.portion?.includes("800")) calories = 800;
      // 2. Gom dữ liệu gửi lên backend
      const res = await authApi.register({
        name: fullName,
        email,
        password,
        phone,
        address,
        gender: consultationData?.customerStats?.gender,
        height: consultationData?.customerStats?.height,
        weight: consultationData?.customerStats?.weight,
        goal: consultationData?.customerStats?.goal,
        // Gói ăn
        packageType: consultationData?.packageId,
        mealOption: mealPlanOption,
        calories,
      });

      // 1. Lưu thông tin thanh toán vào sessionStorage dự phòng (để F5 không mất & GuestRoute bắt đúng)
      if (res.paymentInstructions) {
        sessionStorage.setItem("dietdeli_payment", JSON.stringify(res.paymentInstructions));
      }

      // 2. Tự động đăng nhập
      login(res.accessToken, res.refreshToken, res.user);

      // 3. Xoá dữ liệu nháp tư vấn
      clearConsultationData();

      // 4. Chuyển thẳng sang trang thanh toán kèm dữ liệu đơn
      if (res.paymentInstructions) {
        navigate("/user/payment", { state: { paymentInfo: res.paymentInstructions } });
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Đăng ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* CỘT 1: TÓM TẮT GÓI ĂN ĐÃ CHỌN TỪ MODAL */}
        <div className="p-8 bg-orange-50 border-r border-orange-100 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-orange-950">Gói ăn bạn đã chọn</h3>
            <p className="text-xs text-orange-700 mt-1">Thông tin được tính toán dựa trên chỉ số cơ thể của bạn</p>

            {consultationData ? (
              <div className="mt-6 space-y-4 bg-white p-5 rounded-2xl border border-orange-200 shadow-sm">
                <div>
                  <span className="text-xs text-gray-500">Gói đăng ký:</span>
                  <div className="font-bold text-gray-800 text-lg">{consultationData.packageName}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Khẩu phần khuyến nghị:</span>
                  <div className="font-semibold text-orange-600">{consultationData.portion}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Calo mục tiêu:</span>
                  <div className="font-semibold text-gray-700">{consultationData.targetCalories} kcal/ngày</div>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Lựa chọn bữa ăn:</span>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setMealPlanOption("1_meal")}
                      className={`flex-1 py-2 text-xs rounded-xl border font-medium ${
                        mealPlanOption === "1_meal" ? "border-orange-500 bg-orange-50 text-orange-600 font-bold" : "border-gray-200"
                      }`}
                    >
                      1 Bữa ({consultationData.pricing?.oneMeal})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMealPlanOption("2_meals")}
                      className={`flex-1 py-2 text-xs rounded-xl border font-medium ${
                        mealPlanOption === "2_meals" ? "border-orange-500 bg-orange-50 text-orange-600 font-bold" : "border-gray-200"
                      }`}
                    >
                      2 Bữa ({consultationData.pricing?.twoMeals})
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 p-4 bg-white rounded-2xl text-xs text-gray-500 border border-gray-200">
                Chưa có gói ăn được chọn từ bảng tính. Bạn vẫn có thể đăng ký tài khoản thành viên bình thường.
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 mt-6">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-orange-600 font-bold hover:underline">
              Đăng nhập
            </Link>
          </div>
        </div>

        {/* CỘT 2: FORM ĐIỀN THÔNG TIN CÒN THIẾU */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900">Hoàn tất đăng ký</h2>
          <p className="text-xs text-gray-500 mt-1">Vui lòng điền thông tin để chúng mình giao hàng đúng địa chỉ nhé</p>
          {serverError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">{serverError}</div>
          )}
          <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Họ và tên</label>
              <input
                required
                type="text"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-orange-500"
              />
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Số điện thoại</label>
              <input
                required
                type="tel"
                placeholder="0987654321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-orange-500"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
              <input
                required
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-orange-500"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-orange-500"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Địa chỉ nhận hàng (Hà Nội)</label>
              <input
                required
                type="text"
                placeholder="Số nhà, ngõ, tên đường, quận..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-orange-500"
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold text-sm transition cursor-pointer shadow-md"
            >
              {loading ? "Đang xử lý..." : "Hoàn tất đăng ký gói ăn"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
