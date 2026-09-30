export default function AdminHeader({ setSidebarOpen }: { setSidebarOpen: (open: boolean) => void }) {
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
                <button type="button" className="relative rounded-full p-2 text-gray-500 transition hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9a6 6 0 0 0-12 0v.75c0 2.15-.76 4.12-2.029 5.652a23.848 23.848 0 0 0 5.454 1.31m5.432 0a24.255 24.255 0 0 1-5.432 0m5.432 0a3 3 0 1 1-5.432 0"
                        />
                    </svg>

                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                </button>

                {/* User */}
                <div className="flex items-center gap-2 border-l border-gray-200 pl-2 sm:gap-3 sm:pl-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">AD</div>

                    {/* Hide text on mobile */}
                    <div className="hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">Admin</p>

                        <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
