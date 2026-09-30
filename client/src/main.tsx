import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router"; // 👈 1. Import RouterProvider
import { router } from "./routes.tsx"; // 👈 2. Import router bạn đã tạo
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* 👈 3. Dùng RouterProvider thay vì <App /> */}
    <RouterProvider router={router} />
  </StrictMode>,
);
