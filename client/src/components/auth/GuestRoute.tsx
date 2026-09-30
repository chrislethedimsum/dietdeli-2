import { Outlet, Navigate } from "react-router";

export default function GuestRoute() {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  console.log(storedUser);
  let user: { role?: string } | null = null;

  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch {
      user = null;
    }
  }

  // Nếu đã đăng nhập với vai trò ADMIN, tự động chuyển hướng về trang /admin
  if (token && user?.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
