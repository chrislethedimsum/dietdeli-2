import MainFooter from "./MainFooter";
import MainHeader from "./MainHeader";
import { Outlet } from "react-router";

export default function MainLayout() {
  return (
    <>
      <MainHeader />
      <main>
        <Outlet />
      </main>
      <MainFooter />
    </>
  );
}
