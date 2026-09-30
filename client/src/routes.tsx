import { createBrowserRouter, Navigate } from "react-router";
import Login from "./pages/Login";
import MainLayout from "./components/main/MainLayout";
import IndexMain from "./pages/IndexMain";
import AdminLayout from "./components/admin/AdminLayout";
import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import OrdersPage from "./pages/OrdersPage";
import DishesPage from "./pages/DishesPage";
import MenuPage from "./pages/MenuPage";

const requireAdmin = (Component: React.ComponentType) => {
  return (props: React.ComponentProps<React.ComponentType>) => {
    // const isAdmin = localStorage.getItem("role") === "admin"; // Kiểm tra quyền admin từ localStorage (hoặc từ context, redux, v.v.)
    const isAdmin = true;
    return isAdmin ? <Component {...props} /> : <Navigate to="/login" />;
  };
};

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      {
        index: true,
        Component: IndexMain,
      },
    ],
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/admin",
    Component: requireAdmin(AdminLayout),
    children: [
      {
        index: true,
        Component: DashboardPage,
      },
      {
        path: "menu",
        Component: MenuPage,
      },
      {
        path: "dishes",
        Component: DishesPage,
      },
      {
        path: "orders",
        Component: OrdersPage,
      },
      {
        path: "customers",
        Component: CustomersPage,
      }
    ]
  }
]);
