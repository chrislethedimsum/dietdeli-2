import { useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router";
import { ChevronDown, Menu, X, User as UserIcon, LogOut, CircleUserRound } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { authApi } from "../../api/auth";

export default function MainHeader() {
    const location = useLocation();
    const navigate = useNavigate();

    // Menu states
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

    // Auth state from Zustand
    const { user, logout } = useAuthStore();

    // Check active link
    const isActive = (path: string) => location.pathname === path;

    // Navigate to profile
    const handleGoToProfile = () => {
        setIsAccountDropdownOpen(false);
        setIsMobileMenuOpen(false);
        navigate("/user/profile");
    };

    // Logout
    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error("Logout API failed:", error);
        } finally {
            logout();
            setIsAccountDropdownOpen(false);
            setIsMobileMenuOpen(false);
            setIsMobileDropdownOpen(false);
            setIsDropdownOpen(false);
            navigate("/login", { replace: true });
        }
    };

    return (
        <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-xs backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo */}
                    <NavLink to="/" className="flex shrink-0 items-center">
                        <img src="/images/logoc.png" alt="Diet Deli Logo" className="h-10 w-auto object-contain md:h-12" />
                    </NavLink>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center space-x-8 md:flex">
                        <NavLink to="/" className={`text-sm font-medium transition-colors ${isActive("/") ? "font-semibold text-orange-500" : "text-gray-700 hover:text-orange-500"}`}>
                            Trang chủ
                        </NavLink>

                        <NavLink
                            to="/vechungtoi"
                            className={`text-sm font-medium transition-colors ${isActive("/vechungtoi") ? "font-semibold text-orange-500" : "text-gray-700 hover:text-orange-500"}`}
                        >
                            Về chúng tôi
                        </NavLink>

                        {/* Order dropdown */}
                        <div className="group relative py-2" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
                            <button
                                type="button"
                                aria-expanded={isDropdownOpen}
                                onClick={() => setIsDropdownOpen((prev) => !prev)}
                                className={`flex cursor-pointer items-center gap-1 text-sm font-medium transition-colors ${
                                    isActive("/baogia") || isActive("/muatheonhom") ? "font-semibold text-orange-500" : "text-gray-700 hover:text-orange-500"
                                }`}
                            >
                                <span>Đặt hàng</span>
                                <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                            </button>

                            <div
                                className={`absolute left-0 top-full z-40 w-64 rounded-xl border border-gray-100 bg-white p-2 shadow-xl transition-all duration-200 ${
                                    isDropdownOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
                                }`}
                            >
                                <NavLink to="/baogia" onClick={() => setIsDropdownOpen(false)} className="group/item block rounded-lg p-3 transition hover:bg-orange-50">
                                    <div className="text-sm font-semibold text-gray-800 group-hover/item:text-orange-600">Báo giá sản phẩm</div>
                                    <p className="mt-0.5 text-xs italic text-gray-500">Chi tiết về cách đặt hàng</p>
                                </NavLink>

                                <NavLink to="/muatheonhom" onClick={() => setIsDropdownOpen(false)} className="group/item block rounded-lg p-3 transition hover:bg-orange-50">
                                    <div className="text-sm font-semibold text-gray-800 group-hover/item:text-orange-600">Mua theo nhóm</div>
                                    <p className="mt-0.5 text-xs italic text-gray-500">Ăn kiêng vui và rẻ hơn khi mua với bạn bè</p>
                                </NavLink>
                            </div>
                        </div>

                        <NavLink
                            to="/moitruong"
                            className={`text-sm font-medium transition-colors ${isActive("/moitruong") ? "font-semibold text-orange-500" : "text-gray-700 hover:text-orange-500"}`}
                        >
                            Môi trường
                        </NavLink>

                        <NavLink to="/faqs" className={`text-sm font-medium transition-colors ${isActive("/faqs") ? "font-semibold text-orange-500" : "text-gray-700 hover:text-orange-500"}`}>
                            Câu hỏi thường gặp
                        </NavLink>

                        {/* Desktop account */}
                        {user ? (
                            <div className="relative flex items-center border-l border-gray-200 pl-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAccountDropdownOpen((prev) => !prev)}
                                    aria-expanded={isAccountDropdownOpen}
                                    aria-haspopup="menu"
                                    className="flex items-center gap-2 rounded-lg p-2 transition hover:bg-gray-50"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-600">
                                        {(user.name || "U").charAt(0).toUpperCase()}
                                    </div>

                                    <div className="text-left">
                                        <p className="text-sm font-medium text-gray-900">{user.name || "Tài khoản"}</p>
                                        <p className="text-xs text-gray-500">Tài khoản của tôi</p>
                                    </div>

                                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isAccountDropdownOpen ? "rotate-180" : ""}`} />
                                </button>

                                {isAccountDropdownOpen && (
                                    <>
                                        {/* Click outside to close */}
                                        <button type="button" aria-label="Đóng menu tài khoản" className="fixed inset-0 z-40 cursor-default" onClick={() => setIsAccountDropdownOpen(false)} />

                                        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
                                            <div className="border-b border-gray-100 px-4 py-3">
                                                <p className="truncate text-sm font-semibold text-gray-900">{user.name || "Tài khoản"}</p>
                                                <p className="text-xs text-gray-500">Quản lý tài khoản của bạn</p>
                                            </div>

                                            <button
                                                type="button"
                                                role="menuitem"
                                                onClick={handleGoToProfile}
                                                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-orange-50 hover:text-orange-600"
                                            >
                                                <CircleUserRound size={18} />
                                                <span>Thông tin cá nhân</span>
                                            </button>

                                            <button
                                                type="button"
                                                role="menuitem"
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
                                            >
                                                <LogOut size={18} />
                                                <span>Đăng xuất</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="flex cursor-pointer items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-orange-600 hover:shadow-md"
                            >
                                <UserIcon size={16} />
                                <span>Đăng nhập</span>
                            </Link>
                        )}
                    </nav>

                    {/* Mobile hamburger */}
                    <div className="flex md:hidden">
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-50 hover:text-orange-500"
                            aria-label="Toggle menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile navigation drawer */}
            {isMobileMenuOpen && (
                <div className="space-y-3 border-t border-gray-100 bg-white px-4 pb-6 pt-3 shadow-lg md:hidden">
                    <Link
                        to="/"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block rounded-lg px-3 py-2 text-base font-medium ${isActive("/") ? "bg-orange-50 text-orange-600" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                        Trang chủ
                    </Link>

                    <Link
                        to="/vechungtoi"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block rounded-lg px-3 py-2 text-base font-medium ${isActive("/vechungtoi") ? "bg-orange-50 text-orange-600" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                        Về chúng tôi
                    </Link>

                    {/* Mobile order accordion */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setIsMobileDropdownOpen((prev) => !prev)}
                            aria-expanded={isMobileDropdownOpen}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <span>Đặt hàng</span>
                            <ChevronDown size={18} className={`transition-transform duration-200 ${isMobileDropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isMobileDropdownOpen && (
                            <div className="mt-1 space-y-1 rounded-lg bg-gray-50/70 py-1 pl-4 pr-2">
                                <Link
                                    to="/baogia"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        setIsMobileDropdownOpen(false);
                                    }}
                                    className="block rounded-md px-3 py-2"
                                >
                                    <div className="text-sm font-semibold text-gray-800">Báo giá sản phẩm</div>
                                    <div className="text-xs italic text-gray-500">Chi tiết về cách đặt hàng</div>
                                </Link>

                                <Link
                                    to="/muatheonhom"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        setIsMobileDropdownOpen(false);
                                    }}
                                    className="block rounded-md px-3 py-2"
                                >
                                    <div className="text-sm font-semibold text-gray-800">Mua theo nhóm</div>
                                    <div className="text-xs italic text-gray-500">Ăn kiêng vui và rẻ hơn khi mua với bạn bè</div>
                                </Link>
                            </div>
                        )}
                    </div>

                    <Link
                        to="/moitruong"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block rounded-lg px-3 py-2 text-base font-medium ${isActive("/moitruong") ? "bg-orange-50 text-orange-600" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                        Môi trường
                    </Link>

                    <Link
                        to="/faqs"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block rounded-lg px-3 py-2 text-base font-medium ${isActive("/faqs") ? "bg-orange-50 text-orange-600" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                        Câu hỏi thường gặp
                    </Link>

                    {/* Mobile account */}
                    <div className="border-t border-gray-100 pt-4">
                        {user ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 rounded-lg bg-orange-50 px-3 py-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-600">
                                        {(user.name || "U").charAt(0).toUpperCase()}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-gray-900">{user.name || "Tài khoản"}</p>
                                        <p className="text-xs text-gray-500">Tài khoản của tôi</p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleGoToProfile}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-600"
                                >
                                    <CircleUserRound size={20} />
                                    <span>Thông tin cá nhân</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                                >
                                    <LogOut size={20} />
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-600"
                            >
                                <UserIcon size={18} />
                                <span>Đăng nhập</span>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
