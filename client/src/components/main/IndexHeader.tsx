import { useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router";
import { ChevronDown, Menu, X, User as UserIcon, LogOut } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

interface IndexHeaderProps {
  pageTitle?: string;
}

export default function IndexHeader({ pageTitle }: IndexHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Menu states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

  // Auth state from Zustand
  const { user, logout } = useAuthStore();

  // Handle Logout
  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  // Route title mapping for subpages
  const routeTitles: Record<string, string> = {
    "/baogia": "Báo giá sản phẩm",
    "/vechungtoi": "Về chúng tôi",
    "/muatheonhom": "Mua theo nhóm",
    "/moitruong": "Môi trường",
    "/faqs": "Câu hỏi thường gặp",
    "/chinhsachchung": "Chính sách và Quy định chung",
    "/quydinhthanhtoan": "Quy định hình thức thanh toán",
    "/chinhsachgiaohang": "Chính sách vận chuyển và giao hàng",
    "/baomatthongtin": "Chính sách bảo mật thông tin",
    "/account": "Tài khoản của tôi",
  };

  const displayTitle = pageTitle || routeTitles[location.pathname] || "Diet Deli";

  // Helper check active link
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* 1. Main Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <NavLink to="/" className="flex items-center shrink-0">
              <img src="/images/logoc.png" alt="Diet Deli Logo" className="h-10 md:h-12 w-auto object-contain" />
            </NavLink>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <NavLink
                to="/"
                className={`text-sm font-medium transition-colors ${
                  isActive("/") ? "text-orange-500 font-semibold" : "text-gray-700 hover:text-orange-500"
                }`}
              >
                Trang chủ
              </NavLink>

              <NavLink
                to="/vechungtoi"
                className={`text-sm font-medium transition-colors ${
                  isActive("/vechungtoi") ? "text-orange-500 font-semibold" : "text-gray-700 hover:text-orange-500"
                }`}
              >
                Về chúng tôi
              </NavLink>

              {/* Dropdown Đặt hàng */}
              <div
                className="relative group py-2"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button
                  type="button"
                  className={`flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer ${
                    isActive("/baogia") || isActive("/muatheonhom")
                      ? "text-orange-500 font-semibold"
                      : "text-gray-700 hover:text-orange-500"
                  }`}
                >
                  <span>Đặt hàng</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Content */}
                <div
                  className={`absolute top-full left-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-2 transition-all duration-200 ${
                    isDropdownOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2 pointer-events-none"
                  }`}
                >
                  <NavLink to="/baogia" className="block p-3 rounded-lg hover:bg-orange-50 transition group/item">
                    <div className="text-sm font-semibold text-gray-800 group-hover/item:text-orange-600">Báo giá sản phẩm</div>
                    <p className="text-xs text-gray-500 italic mt-0.5">Chi tiết về cách đặt hàng</p>
                  </NavLink>

                  <NavLink to="/muatheonhom" className="block p-3 rounded-lg hover:bg-orange-50 transition group/item">
                    <div className="text-sm font-semibold text-gray-800 group-hover/item:text-orange-600">Mua theo nhóm</div>
                    <p className="text-xs text-gray-500 italic mt-0.5">Ăn kiêng vui và rẻ hơn khi mua với bạn bè</p>
                  </NavLink>
                </div>
              </div>

              <NavLink
                to="/moitruong"
                className={`text-sm font-medium transition-colors ${
                  isActive("/moitruong") ? "text-orange-500 font-semibold" : "text-gray-700 hover:text-orange-500"
                }`}
              >
                Môi trường
              </NavLink>

              <NavLink
                to="/faqs"
                className={`text-sm font-medium transition-colors ${
                  isActive("/faqs") ? "text-orange-500 font-semibold" : "text-gray-700 hover:text-orange-500"
                }`}
              >
                Câu hỏi thường gặp
              </NavLink>

              {/* User Account / Auth */}
              {user ? (
                <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                  <Link
                    to="/account"
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-orange-500 transition"
                  >
                    <UserIcon size={18} className="text-orange-500" />
                    <span>{user.name || "Tài khoản"}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Đăng xuất"
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition cursor-pointer"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg shadow-xs hover:shadow-md transition cursor-pointer"
                >
                  <UserIcon size={16} />
                  <span>Đăng nhập</span>
                </Link>
              )}
            </nav>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-orange-500 hover:bg-gray-50 rounded-lg transition"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                isActive("/") ? "bg-orange-50 text-orange-600" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Trang chủ
            </Link>

            <Link
              to="/vechungtoi"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                isActive("/vechungtoi") ? "bg-orange-50 text-orange-600" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Về chúng tôi
            </Link>

            {/* Mobile Accordion Dropdown */}
            <div>
              <button
                type="button"
                onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                <span>Đặt hàng</span>
                <ChevronDown size={18} className={`transition-transform duration-200 ${isMobileDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isMobileDropdownOpen && (
                <div className="pl-4 pr-2 py-1 space-y-1 bg-gray-50/70 rounded-lg mt-1">
                  <Link to="/baogia" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md">
                    <div className="text-sm font-semibold text-gray-800">Báo giá sản phẩm</div>
                    <div className="text-xs text-gray-500 italic">Chi tiết về cách đặt hàng</div>
                  </Link>
                  <Link to="/muatheonhom" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md">
                    <div className="text-sm font-semibold text-gray-800">Mua theo nhóm</div>
                    <div className="text-xs text-gray-500 italic">Ăn kiêng vui và rẻ hơn khi mua với bạn bè</div>
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/moitruong"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                isActive("/moitruong") ? "bg-orange-50 text-orange-600" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Môi trường
            </Link>

            <Link
              to="/faqs"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                isActive("/faqs") ? "bg-orange-50 text-orange-600" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Câu hỏi thường gặp
            </Link>

            {/* Mobile Auth */}
            <div className="pt-4 border-t border-gray-100">
              {user ? (
                <div className="space-y-2">
                  <Link
                    to="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-gray-800 hover:bg-gray-50"
                  >
                    <UserIcon size={20} className="text-orange-500" />
                    <span>{user.name || "Tài khoản của tôi"}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 text-left"
                  >
                    <LogOut size={20} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-sm"
                >
                  <UserIcon size={18} />
                  <span>Đăng nhập</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. Page Header Banner (from header.ejs) */}
      <div
        className="relative bg-cover bg-center py-16 md:py-24 text-white text-center overflow-hidden"
        style={{ backgroundImage: "url('/images/header_bg_01.jpg')" }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-sm">{displayTitle}</h1>
        </div>
      </div>
    </>
  );
}
