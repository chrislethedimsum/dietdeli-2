import { createBrowserRouter, Navigate } from "react-router";
import Login from "./pages/Login";
import MainLayout from "./components/main/MainLayout";
import IndexMain from "./pages/IndexMain";
import BaoGia from "./pages/BaoGia";
import AdminLayout from "./components/admin/AdminLayout";
import GuestRoute from "./components/auth/GuestRoute";
import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import OrdersPage from "./pages/OrdersPage";
import DishesPage from "./pages/DishesPage";
import MenuPage from "./pages/MenuPage";
import { useAuthStore } from "./store/useAuthStore";
import Register from "./pages/Register";
import ConsultationRoute from "./components/auth/ConsultationRoute";
import PaymentPage from "./pages/PaymentPage";

const requireAdmin = (Component: React.ComponentType) => {
  return (props: React.ComponentProps<React.ComponentType>) => {
    const { isAuthenticated, isAdmin } = useAuthStore();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />;
    return <Component {...props} />;
  };
};

export const router = createBrowserRouter([
  // 1. Nhóm Public (Trang chủ & Báo giá - Khách hay User login đều xem được)
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: IndexMain },
      { path: "baogia", Component: BaoGia },
    ],
  },

  // 2. Nhóm Guest-Only (Chỉ người CHƯA đăng nhập mới vào được)
  {
    Component: GuestRoute,
    children: [
      {
        path: "/login",
        Component: Login,
      },
      // Nhóm cần có thông tin tư vấn mới được vào
      {
        Component: ConsultationRoute,
        children: [
          {
            path: "/register",
            Component: Register,
          },
        ],
      },
    ],
  },
  // 3. Nhóm User (Bảo vệ bởi requireAuth)
  {
    path: "/payment",
    Component: PaymentPage,
  },
  {
    path: "/payment/:id",
    Component: PaymentPage,
  },

  // 4. Nhóm Admin (Bảo vệ bởi requireAdmin)
  {
    path: "/admin",
    Component: requireAdmin(AdminLayout),
    children: [
      { index: true, Component: DashboardPage },
      { path: "menu", Component: MenuPage },
      { path: "dishes", Component: DishesPage },
      { path: "orders", Component: OrdersPage },
      { path: "customers", Component: CustomersPage },
    ],
  },
]);
