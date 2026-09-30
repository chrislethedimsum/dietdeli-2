import { Link } from "react-router";
import { Phone, Mail } from "lucide-react";

export default function MainFooter() {
  const galleryImages = [
    "/images/gallery/01.jpg",
    "/images/gallery/02.jpg",
    "/images/gallery/03.jpg",
    "/images/gallery/04.jpg",
    "/images/gallery/05.jpg",
    "/images/gallery/06.jpg",
  ];

  return (
    <footer className="relative bg-[#282932] text-gray-300 overflow-hidden">
      {/* Decorative leaf backgrounds from original template */}
      <div
        className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none bg-no-repeat bg-bottom bg-left opacity-30 sm:opacity-50"
        style={{ backgroundImage: "url('/images/f-loc-left.png')" }}
      />
      <div
        className="absolute -top-10 right-0 w-72 h-72 pointer-events-none bg-no-repeat bg-top bg-right opacity-30 sm:opacity-50"
        style={{ backgroundImage: "url('/images/f-loc-right.png')" }}
      />

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* CỘT 1: LOGO & MẠNG XÃ HỘI (col-span-3) */}
          <div className="lg:col-span-3 flex flex-col items-center sm:items-start text-center sm:text-left">
            <Link to="/" className="inline-block mb-4">
              <img src="/images/C-through.PNG" alt="Diet Deli Logo" className="h-24 w-auto object-contain" />
            </Link>
            <p className="text-sm text-gray-300 font-medium mb-3">Theo dõi chúng tôi tại</p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/DietDeliVN"
                target="_blank"
                rel="noreferrer"
                title="Facebook"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-orange-500 hover:text-white flex items-center justify-center text-gray-300 transition duration-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@dietdeli.vn"
                target="_blank"
                rel="noreferrer"
                title="TikTok"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-orange-500 hover:text-white flex items-center justify-center text-gray-300 transition duration-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/dietdeli.vn/"
                target="_blank"
                rel="noreferrer"
                title="Instagram"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-orange-500 hover:text-white flex items-center justify-center text-gray-300 transition duration-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* Threads */}
              <a
                href="https://www.threads.net/@dietdeli.vn"
                target="_blank"
                rel="noreferrer"
                title="Threads"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-orange-500 hover:text-white flex items-center justify-center text-gray-300 transition duration-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.001 0C5.372 0 0 5.372 0 12.001c0 6.627 5.372 12 12.001 12 6.628 0 12-5.373 12-12C24.001 5.372 18.629 0 12.001 0zm4.872 13.513c-.15 1.94-1.352 3.193-3.153 3.27-1.437.062-2.65-.632-3.176-1.761 1.096-.134 2.29-.46 3.197-.993.425-.25.807-.557 1.134-.91.56-.606.843-1.348.814-2.148-.044-1.228-.79-2.023-2.046-2.185-1.637-.212-3.238.653-3.87 2.094-.403.92-.472 2.05-.205 3.32-1.42-.516-2.34-1.716-2.34-3.32 0-2.378 1.986-4.325 4.43-4.325 2.502 0 4.464 2.042 4.385 4.558-.04 1.34-.52 2.57-1.37 3.513l.87.653c1.03-1.144 1.614-2.643 1.66-4.266.096-3.08-2.316-5.59-5.545-5.59-3.076 0-5.57 2.45-5.57 5.462 0 2.045 1.155 3.593 2.955 4.254-.15.827-.12 1.635.105 2.39.697 2.346 2.695 3.364 4.887 3.268 2.576-.112 4.335-1.928 4.544-4.667l-1.33-.298z" />
                </svg>
              </a>
            </div>
          </div>

          {/* CỘT 2: ĐIỀU KHOẢN CHUNG (col-span-3) */}
          <div className="lg:col-span-3">
            <h3 className="text-white text-base font-bold uppercase tracking-wider mb-4 pb-2 border-b border-orange-500/60 inline-block">
              Điều khoản chung
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/chinhsachchung" className="hover:text-orange-400 hover:translate-x-1 inline-block transition duration-200">
                  Chính sách và Quy định chung
                </Link>
              </li>
              <li>
                <Link to="/quydinhthanhtoan" className="hover:text-orange-400 hover:translate-x-1 inline-block transition duration-200">
                  Quy định hình thức thanh toán
                </Link>
              </li>
              <li>
                <Link to="/chinhsachgiaohang" className="hover:text-orange-400 hover:translate-x-1 inline-block transition duration-200">
                  Chính sách vận chuyển và giao hàng
                </Link>
              </li>
              <li>
                <Link to="/baomatthongtin" className="hover:text-orange-400 hover:translate-x-1 inline-block transition duration-200">
                  Chính sách bảo mật thông tin
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: THƯ VIỆN INSTAGRAM (col-span-3) */}
          <div className="lg:col-span-3">
            <h3 className="text-white text-base font-bold uppercase tracking-wider mb-4 pb-2 border-b border-orange-500/60 inline-block">
              Thư viện Instagram
            </h3>
            <div className="grid grid-cols-3 gap-2.5 max-w-xs">
              {galleryImages.map((src, index) => (
                <a
                  key={index}
                  href="https://www.instagram.com/dietdeli.vn/"
                  target="_blank"
                  rel="noreferrer"
                  className="group relative aspect-square overflow-hidden rounded-lg bg-gray-800 shadow-xs"
                >
                  <img
                    src={src}
                    alt={`Diet Deli Instagram ${index + 1}`}
                    className="h-full w-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Xem</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* CỘT 4: LIÊN HỆ VỚI CHÚNG TÔI (col-span-3) */}
          <div className="lg:col-span-3">
            <h3 className="text-white text-base font-bold uppercase tracking-wider mb-4 pb-2 border-b border-orange-500/60 inline-block">
              Liên hệ với chúng tôi
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="p-2 rounded-lg bg-white/5 text-orange-400 shrink-0">
                  <Phone size={18} />
                </span>
                <div>
                  <span className="text-xs text-gray-400 block">Hotline / Zalo:</span>
                  <a
                    href="https://zalo.me/0822714588"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-white hover:text-orange-400 transition"
                  >
                    082 271 4588 (Vân Anh)
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="p-2 rounded-lg bg-white/5 text-orange-400 shrink-0">
                  <Mail size={18} />
                </span>
                <div>
                  <span className="text-xs text-gray-400 block">Email hỗ trợ:</span>
                  <a href="mailto:info@dietdeli.vn" className="font-medium text-white hover:text-orange-400 transition">
                    info@dietdeli.vn
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom / Copyright */}
      <div className="bg-[#1e1f25] py-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-400">
          <p>
            Copyright © {new Date().getFullYear()}{" "}
            <Link to="/" className="text-white font-semibold hover:text-orange-400 transition">
              DietDeli
            </Link>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
