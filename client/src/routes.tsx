import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import MainLayout from "./components/main/MainLayout";
import IndexMain from "./pages/IndexMain";
import BaoGia from "./pages/BaoGia";

export const router = createBrowserRouter([
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
]);
