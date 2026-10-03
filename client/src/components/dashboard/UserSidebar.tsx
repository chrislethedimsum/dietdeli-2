import { NavLink, useNavigate } from "react-router";
import { useAuthStore } from "../../store/useAuthStore";
import { authApi } from "../../api/auth";
import { Broccoli } from "lucide-react";

interface UserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    label: "User Dashboard",
    path: "/user",
    icon: "dashboard",
  },
  {
    label: "Menu",
    path: "/admin/menu",
    icon: "menu",
  },
  {
    label: "Dishes",
    path: "/admin/dishes",
    icon: "dish",
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: "order",
  },
  {
    label: "Quản lí gói ăn",
    path: "/user/mealpackage",
    icon: "mealpackage",
  },
];

function Icon({ type }: { type: string }) {
  const common = {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.8,
    stroke: "currentColor",
    className: "h-5 w-5 shrink-0",
  };

  switch (type) {
    case "dashboard":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10Zm0 8h8v-5H3v5Zm10 0h8V11h-8v10Zm0-18v5h8V3h-8Z" />
        </svg>
      );

    case "menu":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );

    case "dish":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M5 3v6a3 3 0 0 0 6 0V3M19 3v18" />
        </svg>
      );

    case "order":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 2h12v20H6zM9 6h6M9 10h6M9 14h4" />
        </svg>
      );

    case "mealpackage":
      return <Broccoli />;

    default:
      return null;
  }
}

export default function UserSidebar({ isOpen, onClose }: UserSidebarProps) {
  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.logout);
  const handleLogout = async () => {
    try {
      await authApi.logout(); // Báo cho backend xóa token
    } finally {
      logout(); // ✅ Tự xóa state và tự dọn dẹp sạch localStorage
      onClose?.();
      navigate("/login");
    }
  };

  return (
    <aside
      className={`
                fixed inset-y-0 left-0 z-50
                flex w-64 flex-col
                border-r border-gray-200
                bg-white
                transition-transform duration-300 ease-in-out

                ${isOpen ? "translate-x-0" : "-translate-x-full"}

                lg:translate-x-0
            `}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-lg font-bold text-white">D</div>

          <div>
            <h1 className="text-lg font-bold text-gray-900">DietDeli</h1>

            <p className="text-[10px] uppercase tracking-wider text-gray-400">Admin</p>
          </div>
        </div>

        {/* Close button mobile */}
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="Close sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Management</p>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/user"}
            onClick={onClose}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                isActive ? "bg-emerald-50 text-emerald-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              ].join(" ")
            }
          >
            <Icon type={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-200 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v15A2.25 2.25 0 0 0 7.5 22h6a2.25 2.25 0 0 0 2.25-2.25V16M12 15l3-3m0 0-3-3m3 3H3"
            />
          </svg>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
