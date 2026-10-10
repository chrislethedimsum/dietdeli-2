import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Bell, ChevronDown, LogOut, Menu, UserRound } from "lucide-react";

import { useAuthStore } from "../../store/useAuthStore";
import { authApi } from "../../api/auth";

interface UserHeaderProps {
    setSidebarOpen: (open: boolean) => void;
}

export default function UserHeader({ setSidebarOpen }: UserHeaderProps) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Đóng dropdown khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleGoToProfile = () => {
        setIsDropdownOpen(false);
        navigate("/user/profile");
    };

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error("Đăng xuất thất bại:", error);
        } finally {
            logout();
            setIsDropdownOpen(false);
            navigate("/login", { replace: true });
        }
    };

    const userName = user?.name || "Tài khoản của tôi";
    const avatarText = userName.trim().charAt(0).toUpperCase() || "U";

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
            <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden" aria-label="Mở thanh điều hướng">
                    <Menu className="h-6 w-6" />
                </button>

                <div>
                    <h1 className="text-base font-semibold text-gray-900 sm:text-lg">DietDeli</h1>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                {/* Notification */}
                <button type="button" aria-label="Thông báo" className="relative rounded-full p-2 text-gray-500 transition hover:bg-gray-100">
                    <Bell className="h-5 w-5" />

                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                </button>

                {/* User dropdown */}
                <div ref={dropdownRef} className="relative border-l border-gray-200 pl-2 sm:pl-4">
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                        aria-expanded={isDropdownOpen}
                        aria-haspopup="menu"
                        className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-gray-50 sm:gap-3"
                    >
                        {/* Avatar */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">{avatarText}</div>

                        {/* User information */}
                        <div className="hidden text-left sm:block">
                            <p className="max-w-40 truncate text-sm font-medium text-gray-900">{userName}</p>

                            <p className="text-xs text-gray-500">User</p>
                        </div>

                        <ChevronDown className={`hidden h-4 w-4 text-gray-500 transition-transform sm:block ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Dropdown menu */}
                    {isDropdownOpen && (
                        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                            {/* Account summary */}
                            <div className="border-b border-gray-100 px-4 py-3">
                                <p className="truncate text-sm font-semibold text-gray-900">{userName}</p>
                                <p className="mt-1 text-xs text-gray-500">Tài khoản người dùng</p>
                            </div>

                            {/* Profile */}
                            <button
                                type="button"
                                role="menuitem"
                                onClick={handleGoToProfile}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                            >
                                <UserRound className="h-4 w-4" />
                                <span>Thông tin cá nhân</span>
                            </button>

                            {/* Logout */}
                            <button type="button" role="menuitem" onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50">
                                <LogOut className="h-4 w-4" />
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
