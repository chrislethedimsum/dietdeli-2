import { useLocation, Outlet } from "react-router";
import MainFooter from "./MainFooter";
import IndexHeader from "./IndexHeader";
import MainHeader from "./MainHeader";

export default function MainLayout() {
  const location = useLocation();
  // Kiểm tra nếu là trang chủ ("/")
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Trang chủ ("/") thì dùng MainHeader (không banner), các trang khác dùng IndexHeader (có banner ảnh nền) */}
      {isHomePage ? <MainHeader /> : <IndexHeader />}

      <main className="flex-1">
        <Outlet />
      </main>

      <MainFooter />
    </div>
  );
}
