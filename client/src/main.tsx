import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router"; // 👈 1. Import RouterProvider
import { router } from "./routes.tsx"; // 👈 2. Import router bạn đã tạo
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppAlert from "./components/common/AppAlert.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <AppAlert />
    </QueryClientProvider>,
);
