import { useState, useEffect, useCallback, useMemo } from "react";
import type { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Card from "./Card";
import { MEAL_PACKAGES, type MealCardData } from "@/data/mealPackages";

type PropType = {
  slides?: MealCardData[] | number[];
  options?: EmblaOptionsType;
};

export default function EmblaCarousel(props: PropType) {
  const { slides = MEAL_PACKAGES, options } = props;

  const originalCount = slides.length;
  const isLoop = options?.loop ?? true;

  // Embla Carousel yêu cầu tổng chiều dài các slide phải đủ lớn hơn viewport (+ buffer)
  // để tạo vòng lặp vô tận (đặc biệt khi hiển thị 3 card cùng lúc trên màn hình desktop).
  // Nếu số slide < 8 (ví dụ chỉ có 4 gói ăn), Embla sẽ tự động fallback tắt loop (loop: false).
  // Vì vậy, khi bật loop, ta nhân bản slide (clone) để carousel luôn có đủ ít nhất 8 slide.
  const loopSlides = useMemo(() => {
    if (isLoop && originalCount > 0 && originalCount < 8) {
      const multiplier = Math.ceil(8 / originalCount);
      return Array.from({ length: multiplier }, () => slides).flat();
    }
    return slides;
  }, [slides, originalCount, isLoop]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    ...options,
    loop: isLoop,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(false);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      if (originalCount > 0 && loopSlides.length > originalCount) {
        const current = emblaApi.selectedScrollSnap();
        const baseIndex = current - (current % originalCount);
        const targetIndex = baseIndex + index;
        emblaApi.scrollTo(targetIndex);
      } else {
        emblaApi.scrollTo(index);
      }
    },
    [emblaApi, originalCount, loopSlides.length],
  );

  const onSelect = useCallback((api: any) => {
    setSelectedIndex(api.selectedScrollSnap());
    setPrevBtnDisabled(!api.canScrollPrev());
    setNextBtnDisabled(!api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect).on("select", onSelect);
  }, [emblaApi, onSelect]);

  // Vị trí chấm chỉ số active tương ứng với gói ăn thực tế
  const activeDotIndex = originalCount > 0 ? selectedIndex % originalCount : selectedIndex;

  return (
    <div className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-hidden">
      {/* 1. Viewport: Trên desktop bật hiệu ứng mờ 2 mép, trên mobile tắt mask để không làm mờ/cụt viền card */}
      <div className="overflow-hidden md:[mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]" ref={emblaRef}>
        {/* Container */}
        <div className="flex -ml-4 sm:-ml-6 touch-pan-y">
          {loopSlides.map((item, index) => {
            const cardData = typeof item === "object" ? item : MEAL_PACKAGES[item % MEAL_PACKAGES.length];
            return (
              <div key={index} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4 sm:pl-6 py-4">
                <Card data={cardData} index={index % originalCount} />
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Controls: Nút Prev / Next & Dots chỉ số */}
      <div className="flex items-center justify-between mt-4 sm:mt-6 px-1 sm:px-2">
        {/* Nút Previous & Next */}
        <div className="flex gap-2 sm:gap-3">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={prevBtnDisabled}
            title="Slide trước"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={nextBtnDisabled}
            title="Slide tiếp"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Dots chỉ số (Hiển thị đúng 4 chấm tương ứng 4 gói ăn) */}
        <div className="flex gap-1.5 sm:gap-2 items-center">
          {Array.from({ length: originalCount }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
              title={`Đến gói ${index + 1}`}
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === activeDotIndex ? "w-6 sm:w-8 bg-orange-500" : "w-2 sm:w-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
