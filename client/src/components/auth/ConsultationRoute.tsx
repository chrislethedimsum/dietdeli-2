import { Navigate, Outlet } from "react-router";
import { useConsultationStore } from "../../store/useConsultationStore";

export default function ConsultationRoute() {
  const consultationData = useConsultationStore((state) => state.consultationData);

  // Nếu chưa có thông tin báo giá -> Chặn tuyệt đối, đá về /baogia
  if (!consultationData) {
    return <Navigate to="/baogia" replace />;
  }

  // Nếu hợp lệ -> Cho phép render các route con (trang Register)
  return <Outlet />;
}
