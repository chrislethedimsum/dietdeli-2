import { Button, Modal } from "@heroui/react";
import { Calculator, FaceSlightlySmiling, AlertCircle } from "lucide-react";
import { type MealCardData } from "../../../../data/mealPackages";

interface MealPricingModalProps {
  data?: MealCardData;
}

export default function MealPricingModal(props: MealPricingModalProps & Partial<MealCardData>) {
  // Hỗ trợ cả 2 cách truyền props: <MealPricingModal data={cardData} /> hoặc <MealPricingModal {...cardData} />
  const cardData = props.data || (props as MealCardData);

  if (!cardData || !cardData.title) return null;

  return (
    <Modal>
      <Button className="flex flex-row items-center justify-center flex-1 py-2.5 sm:py-3 px-2 sm:px-3 rounded-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-medium text-xs sm:text-sm transition cursor-pointer shadow-xs hover:shadow-md">
        <Calculator size={16} />
        <span className="px-1">Báo giá</span>
      </Button>

      <Modal.Backdrop variant="blur" className="overflow-x-hidden p-3 sm:p-6 flex items-center justify-center">
        <Modal.Container size="lg" className="w-full max-w-full p-2 sm:p-4">
          <Modal.Dialog className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto border border-gray-100 min-w-0 mx-auto">
            <Modal.CloseTrigger />
            <Modal.Header className="flex items-start sm:items-center gap-3 pb-4 border-b border-gray-100 pr-8 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                <Calculator size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <Modal.Heading className="text-lg sm:text-xl font-bold text-purple-950 wrap-break-words">
                  Báo giá {cardData.title}
                </Modal.Heading>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                  <span>Điền thông tin hoặc liên hệ để chúng mình tư vấn nhanh nhé</span>
                  <FaceSlightlySmiling size={15} className="text-orange-500 shrink-0" />
                </div>
              </div>
            </Modal.Header>

            <Modal.Body className="py-4 space-y-4 text-sm text-gray-700 min-w-0">
              {/* Hotline hỗ trợ Zalo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs gap-2">
                <span className="font-semibold text-gray-700">Tư vấn nhanh qua Zalo:</span>
                <a href="https://zalo.me/0389150399" target="_blank" rel="noreferrer" className="text-orange-600 font-bold hover:underline">
                  0389150399
                </a>
              </div>

              {/* Bảng giá theo số bữa */}
              {cardData.pricing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border border-orange-200 rounded-2xl p-4 bg-orange-50/50 flex flex-col justify-between">
                    <div>
                      <div className="inline-block px-2.5 py-1 rounded-full bg-orange-500 text-white text-[11px] font-bold uppercase mb-2">
                        1 Bữa / Ngày
                      </div>
                      <p className="text-xs text-gray-500">Phù hợp ăn Trưa hoặc Tối</p>
                    </div>
                    <div className="mt-3">
                      <p className="text-base sm:text-lg font-extrabold text-purple-950">{cardData.pricing.oneMeal}</p>
                    </div>
                  </div>

                  <div className="border border-purple-200 rounded-2xl p-4 bg-purple-50/40 flex flex-col justify-between">
                    <div>
                      <div className="inline-block px-2.5 py-1 rounded-full bg-purple-950 text-white text-[11px] font-bold uppercase mb-2">
                        2 Bữa / Ngày
                      </div>
                      <p className="text-xs text-gray-500">Trọn vẹn bữa Trưa + Bữa Tối</p>
                    </div>
                    <div className="mt-3">
                      <p className="text-base sm:text-lg font-extrabold text-orange-600">{cardData.pricing.twoMeals}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Lưu ý phí ship */}
              <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-3 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span>
                    *Giá trên chưa bao gồm phí vận chuyển. Phí ship được tính theo khoảng cách thực tế từ bếp tới địa chỉ nhận của bạn.
                  </span>
                </div>
              </div>
            </Modal.Body>

            <Modal.Footer className="flex justify-between gap-2 pt-4 border-t border-gray-100">
              <Button
                slot="close"
                className="px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition cursor-pointer"
              >
                Đóng
              </Button>
              <Button
                slot="close"
                className="px-6 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition cursor-pointer shadow-sm hover:shadow"
              >
                Chọn Gói Này
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
