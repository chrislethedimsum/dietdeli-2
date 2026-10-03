import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { Check, Copy, CreditCard } from "lucide-react";

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Lấy dữ liệu thanh toán từ state (truyền qua navigate) hoặc từ sessionStorage (F5 không mất)
  const [paymentInfo] = useState(() => {
    if (location.state?.paymentInfo) {
      return location.state.paymentInfo;
    }
    const saved = sessionStorage.getItem("dietdeli_payment");
    return saved ? JSON.parse(saved) : null;
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Nếu không có thông tin đơn hàng (ví dụ: khách tự gõ URL /payment)
  if (!paymentInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center">
          <CreditCard className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Không tìm thấy thông tin đơn hàng</h2>
          <p className="text-xs text-gray-500 mt-2">Vui lòng chọn gói ăn từ trang báo giá để tiến hành thanh toán.</p>
          <Link
            to="/baogia"
            className="inline-block mt-6 px-6 py-2.5 rounded-full bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 transition"
          >
            Về trang Báo giá
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100 text-center animate-in fade-in zoom-in-95">
        {/* Header icon */}
        <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
          ✓
        </div>
        <h2 className="text-2xl font-extrabold text-purple-950">Đặt gói ăn thành công!</h2>
        <p className="text-xs text-gray-500 mt-1">
          Mã đơn của bạn: <span className="font-bold text-orange-600">#{paymentInfo.subscriptionId}</span>
        </p>

        {/* Mã VietQR */}
        <div className="mt-5 p-4 bg-orange-50/40 rounded-2xl border border-orange-200 inline-block shadow-inner">
          <img
            src={paymentInfo.qrUrl}
            alt="Mã QR thanh toán VietQR"
            className="w-56 h-56 mx-auto rounded-xl shadow-sm object-contain bg-white p-2"
          />
          <p className="text-[11px] text-gray-500 mt-2">Mở app ngân hàng bất kỳ để quét mã (Số tiền & nội dung tự điền)</p>
        </div>

        {/* Bảng chi tiết thông tin chuyển khoản */}
        <div className="mt-5 text-left bg-gray-50 p-4 rounded-2xl text-xs space-y-2.5 text-gray-700 border border-gray-200/70">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Gói ăn đã chọn:</span>
            <span className="font-semibold text-gray-900">
              {paymentInfo.packageName} ({paymentInfo.calories} kcal)
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Tổng số tiền:</span>
            <span className="font-extrabold text-orange-600 text-base">{paymentInfo.amount?.toLocaleString("vi-VN")} đ</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Ngân hàng:</span>
            <span className="font-semibold">{paymentInfo.bankCode} (Quân Đội - MBBank)</span>
          </div>

          {/* Số tài khoản kèm nút Copy */}
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Số tài khoản:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-gray-900 text-sm">{paymentInfo.bankAccount}</span>
              <button
                type="button"
                onClick={() => handleCopy(paymentInfo.bankAccount, "account")}
                className="text-orange-600 hover:text-orange-700 p-1 rounded"
                title="Sao chép"
              >
                {copiedField === "account" ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Chủ tài khoản:</span>
            <span className="font-semibold">{paymentInfo.accountName}</span>
          </div>

          {/* Cú pháp chuyển khoản kèm nút Copy */}
          <div className="flex justify-between items-center border-t border-gray-200 pt-2.5">
            <span className="text-gray-500">Nội dung chuyển khoản:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">{paymentInfo.transferContent}</span>
              <button
                type="button"
                onClick={() => handleCopy(paymentInfo.transferContent, "content")}
                className="text-orange-600 hover:text-orange-700 p-1 rounded"
                title="Sao chép"
              >
                {copiedField === "content" ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <button
          onClick={() => {
            sessionStorage.removeItem("dietdeli_payment");
            navigate("/");
          }}
          className="w-full mt-6 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Tôi đã chuyển khoản • Về trang chủ</span>
        </button>
      </div>
    </div>
  );
}
