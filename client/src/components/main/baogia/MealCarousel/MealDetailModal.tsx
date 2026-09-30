import { Button, Modal } from "@heroui/react";
import { Info, Utensils, CheckCircle2, Clock } from "lucide-react";
import { type MealCardData } from "../../../../data/mealPackages";

interface MealDetailModalProps {
  data?: MealCardData;
}

export default function MealDetailModal(props: MealDetailModalProps & Partial<MealCardData>) {
  // Hỗ trợ cả 2 cách truyền props: <MealDetailModal data={cardData} /> hoặc <MealDetailModal {...cardData} />
  const cardData = props.data || (props as MealCardData);

  if (!cardData || !cardData.title) return null;

  return (
    <Modal>
      <Button className="flex flex-row items-center justify-center flex-1 py-2.5 sm:py-3 px-2 sm:px-3 rounded-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-medium text-xs sm:text-sm transition cursor-pointer shadow-xs hover:shadow-md">
        <Info size={16} />
        <span className="px-1">Xem thêm</span>
      </Button>

      <Modal.Backdrop variant="blur" className="overflow-x-hidden p-3 sm:p-6 flex items-center justify-center">
        <Modal.Container size="lg" className="w-full max-w-full p-2 sm:p-4">
          <Modal.Dialog className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto border border-gray-100 min-w-0 mx-auto">
            <Modal.CloseTrigger />
            <Modal.Header className="flex items-start sm:items-center gap-3 pb-4 border-b border-gray-100 pr-8 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                <Utensils size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <Modal.Heading className="text-lg sm:text-xl font-bold text-purple-950 wrap-break-words">
                  Chi tiết {cardData.title}
                </Modal.Heading>
                {cardData.tagline && <p className="text-xs text-orange-600 font-semibold mt-0.5">{cardData.tagline}</p>}
              </div>
            </Modal.Header>

            <Modal.Body className="py-4 space-y-4 text-sm text-gray-700 min-w-0">
              {/* Phù hợp cho ai */}
              {cardData.suitableFor && (
                <div className="bg-orange-50/70 border border-orange-200/60 rounded-2xl p-3.5">
                  <p className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-1">🎯 Đối tượng phù hợp:</p>
                  <p className="text-gray-700 leading-relaxed text-xs sm:text-sm">{cardData.suitableFor}</p>
                </div>
              )}

              {/* Đặc điểm gói ăn */}
              {cardData.features && (
                <div>
                  <p className="font-bold text-purple-950 mb-2.5 text-sm flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-green-600" />
                    Đặc điểm nổi bật của gói:
                  </p>
                  <ul className="space-y-2">
                    {cardData.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start text-xs sm:text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 mr-2 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Lưu ý vận hành */}
              {cardData.note && (
                <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200/70 text-xs text-gray-600 flex gap-2.5 items-start">
                  <Clock size={16} className="text-purple-900 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-gray-800">Lưu ý đặt hàng: </strong>
                    {cardData.note}
                  </p>
                </div>
              )}
            </Modal.Body>

            <Modal.Footer className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <Button
                slot="close"
                className="px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition cursor-pointer"
              >
                Đóng
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
