import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import MainLayout from "./components/main/MainLayout";
import IndexMain from "./pages/IndexMain";

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
]);
