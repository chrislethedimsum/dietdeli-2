import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function AdminHeader({ setSidebarOpen }: { setSidebarOpen: (open: boolean) => void }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const handleGoToProfile = () => {
        setIsDropdownOpen(false);
        navigate("/admin/profile");
    };

    const { logout } = useAuthStore();
    const handleLogout = () => {
        setIsDropdownOpen(false);
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
            <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden" aria-label="Open sidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>

                <div>
                    <h1 className="text-base font-semibold text-gray-900 sm:text-lg">DietDeli</h1>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                {/* Notification */}
                <button type="button" aria-label="Thông báo" className="relative rounded-full p-2 text-gray-500 transition hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9a6 6 0 0 0-12 0v.75c0 2.15-.76 4.12-2.029 5.652a23.848 23.848 0 0 0 5.454 1.31m5.432 0a24.255 24.255 0 0 1-5.432 0m5.432 0a3 3 0 1 1-5.432 0"
                        />
                    </svg>

                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                </button>

                {/* User dropdown */}
                <div className="relative border-l border-gray-200 pl-2 sm:pl-4">
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                        aria-expanded={isDropdownOpen}
                        aria-haspopup="menu"
                        className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-gray-50 sm:gap-3"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">AD</div>

                        <div className="hidden text-left sm:block">
                            <p className="text-sm font-medium text-gray-900">Admin</p>
                            <p className="text-xs text-gray-500">Administrator</p>
                        </div>

                        {/* Chevron */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className={`hidden h-4 w-4 text-gray-400 transition-transform sm:block ${isDropdownOpen ? "rotate-180" : ""}`}
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>

                    {isDropdownOpen && (
                        <>
                            {/* Click outside to close */}
                            <button type="button" aria-label="Đóng menu" className="fixed inset-0 z-40 cursor-default" onClick={() => setIsDropdownOpen(false)} />

                            <div role="menu" className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                                <div className="border-b border-gray-100 px-4 py-3">
                                    <p className="text-sm font-medium text-gray-900">Admin</p>
                                    <p className="truncate text-xs text-gray-500">Quản lý tài khoản</p>
                                </div>

                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={handleGoToProfile}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="h-5 w-5">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.1a7.5 7.5 0 0 1 15 0A17.9 17.9 0 0 1 12 21.75c-2.7 0-5.25-.6-7.5-1.65Z"
                                        />
                                    </svg>

                                    <span>Hồ sơ cá nhân</span>
                                </button>

                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="h-5 w-5">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M18 15l3-3m0 0-3-3m3 3H9"
                                        />
                                    </svg>

                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
