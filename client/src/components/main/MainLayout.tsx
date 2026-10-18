import { Outlet } from "react-router";
import MainFooter from "./MainFooter";
import MainHeader from "./MainHeader";

export default function MainLayout() {

  return (
    <div className="min-h-screen flex flex-col bg-white w-full overflow-x-clip">
      {/* Trang chủ ("/") thì dùng MainHeader (không banner), các trang khác dùng IndexHeader (có banner ảnh nền) */}

      <MainHeader />
      <main className="flex-1 w-full overflow-x-clip">
        <Outlet />
      </main>

      <MainFooter />
    </div>
  );
}
