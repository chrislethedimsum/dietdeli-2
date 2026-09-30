import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import MainLayout from "./components/main/MainLayout";
import IndexMain from "./pages/IndexMain";
import BaoGia from "./pages/BaoGia";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/Dashboard";
import GuestRoute from "./components/auth/GuestRoute";

export const router = createBrowserRouter([
  // 1. Nhóm bọc bởi GuestRoute (bao gồm "/" và "/login")
  {
    Component: GuestRoute,
    children: [
      {
        path: "/",
        Component: MainLayout,
        children: [
          { index: true, Component: IndexMain },
          { path: "baogia", Component: BaoGia },
        ],
      },
      {
        path: "/login",
        Component: Login,
      },
    ],
  },

  // 2. Nhóm Admin (Nằm riêng biệt ngoài GuestRoute)
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: "menu",
        Component: () => <div>Menu Page</div>,
      },
      {
        path: "dishes",
        Component: () => <div>Dishes Page</div>,
      },
      {
        path: "orders",
        Component: () => <div>Orders Page</div>,
      },
      {
        path: "customers",
        Component: () => <div>Customers Page</div>,
      },
    ],
  },
]);
