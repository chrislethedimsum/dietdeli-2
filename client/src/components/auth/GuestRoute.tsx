import { Outlet, Navigate } from "react-router";
import { useAuthStore } from "../../store/useAuthStore";

export default function GuestRoute() {
  const { isAuthenticated, isAdmin } = useAuthStore();

  // Đã đăng nhập rồi thì không cho ở lại trang /login nữa:
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin" : "/"} replace />;
  }

  // Chưa đăng nhập thì cho xem trang login
  return <Outlet />;
}
