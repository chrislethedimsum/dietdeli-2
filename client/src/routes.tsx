import { createBrowserRouter, Navigate } from "react-router";
import Login from "./pages/Login";
import MainLayout from "./components/main/MainLayout";
import IndexMain from "./pages/IndexMain";
import BaoGia from "./pages/BaoGia";
import AdminLayout from "./components/admin/AdminLayout";
import UserLayout from "./components/dashboard/UserLayout";
import GuestRoute from "./components/auth/GuestRoute";
import DashboardPage from "./pages/admin/DashboardPage";
import UserDashboardPage from "./pages/user/UserDashboardPage";
import CustomersPage from "./pages/admin/CustomersPage";
import OrdersPage from "./pages/admin/OrdersPage";
import DishesPage from "@/pages/admin/DishesPage";
import MenuPage from "./pages/admin/MenuPage";
import { useAuthStore } from "./store/useAuthStore";
import Register from "./pages/Register";
import ConsultationRoute from "./components/auth/ConsultationRoute";
import PaymentPage from "./pages/user/PaymentPage";

const requireAuth = (Component: React.ComponentType) => {
  return (props: React.ComponentProps<React.ComponentType>) => {
    const { isAuthenticated } = useAuthStore();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <Component {...props} />;
  };
};

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
    path: "/user",
    Component: requireAuth(UserLayout),
    children: [
      { index: true, Component: UserDashboardPage },
      { path: "payment", Component: PaymentPage },
      { path: "payment/:id", Component: PaymentPage },
    ],
  },
  // Alias tiện lợi: /payment -> /user/payment
  {
    path: "/payment",
    Component: () => <Navigate to="/user/payment" replace />,
  },
  {
    path: "/payment/:id",
    Component: () => <Navigate to="/user/payment" replace />,
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
