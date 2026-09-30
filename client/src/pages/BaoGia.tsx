import EmblaCarousel from "../components/main/baogia/MealCarousel/EmblaCarousel";
import { MEAL_PACKAGES } from "../data/mealPackages";
import type { EmblaOptionsType } from "embla-carousel";

const OPTIONS: EmblaOptionsType = { loop: true };

export default function Baogia() {
  return (
    <>
      <div className="bg-gray-50 flex flex-col w-full overflow-hidden">
        <div className="text-gray-600 items-start p-4 text-xs sm:text-sm italic">
          *Giá được áp dụng cho các đơn hàng đăng ký hoặc hẹn giao hàng từ 1/1/2025 đến 31/12/2025.
        </div>
        <EmblaCarousel slides={MEAL_PACKAGES} options={OPTIONS} />
      </div>
    </>
  );
}
