import EmblaCarousel from "../components/main/carousel/EmblaCarousel";
import type { EmblaOptionsType } from "embla-carousel";

const OPTIONS: EmblaOptionsType = { loop: true };
const SLIDE_COUNT = 5;
const SLIDES = Array.from(Array(SLIDE_COUNT).keys());

export default function Baogia() {
  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col w-full h-screen">
        <div className=" text-gray-600 items-start p-4 text-sm italic">
          *Giá được áp dụng cho các đơn hàng đăng ký hoặc hẹn giao hàng từ 1/1/2025 đến 31/12/2025.
        </div>
        <div className="self-center">
          <div className="text-purple-950 text-3xl font-bold text-center">CÁC GÓI ĂN</div>
          <EmblaCarousel slides={SLIDES} options={OPTIONS} />
        </div>
      </div>
    </>
  );
}
