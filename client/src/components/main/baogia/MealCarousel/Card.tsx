"use client";
import { ShoppingBag } from "lucide-react";
import { type MealCardData, MEAL_PACKAGES } from "../../../../data/mealPackages";
import MealDetailModal from "./MealDetailModal";
import MealPricingModal from "./MealPricingModal";

interface CardProps {
  data?: MealCardData;
  index?: number;
}

export default function Card({ data, index = 0 }: CardProps) {
  // Lấy dữ liệu theo props hoặc tự động lấy theo index trong mảng MEAL_PACKAGES
  const cardData = data || MEAL_PACKAGES[index % MEAL_PACKAGES.length];

  return (
    <div className="flex flex-col rounded-3xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow duration-300 w-full max-w-sm mx-auto h-full border border-gray-100 min-w-0">
      {/* Ảnh món ăn */}
      <div className="relative overflow-hidden group/img">
        <img
          src={cardData.image}
          alt={cardData.title}
          className="w-full h-52 sm:h-56 object-cover group-hover/img:scale-105 transition duration-500"
        />
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      </div>

      {/* Nút hành động với 2 Modal riêng biệt từ HeroUI */}
      <div className="flex justify-around p-3.5 sm:p-4 gap-2.5 sm:gap-3">
        {/* MODAL 1: XEM THÊM */}
        <MealDetailModal data={cardData} />

        {/* MODAL 2: BÁO GIÁ */}
        <MealPricingModal data={cardData} />
      </div>

      {/* Tiêu đề gói ăn */}
      <div className="px-5 text-purple-950 text-xl sm:text-2xl font-bold tracking-tight">
        {cardData.title}
      </div>

      {/* Mô tả chi tiết */}
      <div className="px-5 py-3 text-gray-600 text-sm text-justify leading-relaxed flex-1">
        {cardData.description}
      </div>

      {/* Thống kê số gói đã bán */}
      <div className="flex flex-row items-center px-5 py-4 font-bold text-gray-700 border-t border-gray-100 mt-auto bg-gray-50/50">
        <ShoppingBag size={18} className="text-orange-500 mr-2" />
        <span className="text-sm font-semibold">Số gói đã bán:</span>
        <span className="px-2 text-purple-950 font-extrabold text-base">{cardData.soldCount}</span>
      </div>
    </div>
  );
}
