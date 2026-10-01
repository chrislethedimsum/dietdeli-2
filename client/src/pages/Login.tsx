import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import { Lock, Mail } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { authApi } from "../api/auth";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  // 1. Quản lý trạng thái form (State)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 2. Xử lý khi bấm nút "Login Now"
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const data = await authApi.login({ email, password });
      login(data.accessToken, data.user);
      navigate(data.user.isAdmin ? "/admin" : "/");
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* CỘT TRÁI: FORM ĐĂNG NHẬP */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Header / Logo */}
            <div className="mb-6">
              <Link to="/">
                <img src="/images/logoc.png" alt="Diet Deli Logo" className="h-12 object-contain" />
              </Link>
            </div>

            {/* Title */}
            <div className="mb-8">
              <p className="text-orange-500 font-medium text-sm text-center">Welcome Back!</p>
              <h2 className="text-3xl font-bold text-purple-950 mt-1 text-center">Login Your Account</h2>
            </div>

            {/* Thông báo lỗi nếu có */}
            {errorMessage && <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-sm">{errorMessage}</div>}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-400 mr-2"
                  />
                  <span className="text-gray-600">Remember Password</span>
                </label>
                <Link to="/forgot-password" className="text-orange-500 hover:underline">
                  Forget Password?
                </Link>
              </div>

              {/* Nút Login */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-200 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login Now"}
              </button>
            </form>
          </div>

          {/* Footer form: Đăng ký & Social */}
          <div className="mt-8 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-600">
              Don’t Have an Account?
              <Link to="/register" className="text-orange-500 font-semibold hover:underline">
                Sign Up Now
              </Link>
            </p>

            <div className="mt-6">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Login With</span>
              <div className="flex justify-center gap-4 mt-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
                  Google
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                >
                  <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-4 h-4" />
                  Facebook
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-8">Copyright © 2026 Diet Deli. All rights reserved.</p>
          </div>
        </div>

        {/* CỘT PHẢI: BANNER HÌNH ẢNH */}
        <div
          className="hidden md:flex md:w-1/2 relative items-center justify-center p-12 overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: "url('/images/half_column_bg.jpg')" }}
        >
          {/* Lớp phủ làm tối để chữ nổi bật */}
          <div className="absolute inset-0 bg-black/50"></div>

          <div className="relative z-10 text-white text-center">
            <h1 className="text-4xl font-extrabold leading-tight">
              Choosing The Best <br />
              <span className="text-orange-400">Quality Food</span>
            </h1>
            <p className="mt-4 text-gray-200 text-sm max-w-xs mx-auto">
              Trải nghiệm dịch vụ giao suất ăn dinh dưỡng định kỳ cho lối sống lành mạnh.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
