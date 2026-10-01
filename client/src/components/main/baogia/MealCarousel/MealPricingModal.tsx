import { Button, Modal, Form, Label, Input, FieldGroup, Fieldset, Description, ListBox, Select, Radio, RadioGroup } from "@heroui/react";
import { Calculator, FaceSlightlySmiling, AlertCircle } from "lucide-react";
import { type MealCardData } from "../../../../data/mealPackages";

interface MealPricingModalProps {
  data?: MealCardData;
}

export default function MealPricingModal(props: MealPricingModalProps & Partial<MealCardData>) {
  // Hỗ trợ cả 2 cách truyền props: <MealPricingModal data={cardData} /> hoặc <MealPricingModal {...cardData} />
  const cardData = props.data || (props as MealCardData);
  const shell =
    "w-full min-w-0 rounded-xl border border-border/70 border-purple-200 bg-linear-to-b from-neutral-50/90 to-white p-4 ring-1 ring-black/5 dark:from-neutral-900/80 dark:to-neutral-900 dark:ring-white/10";

  if (!cardData || !cardData.title) return null;
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Lấy toàn bộ dữ liệu từ form
    const formData = new FormData(e.currentTarget);

    const data = {
      age: Number(formData.get("age")),
      gender: formData.get("gender"), // "male" hoặc "female"
      height: Number(formData.get("height")),
      weight: Number(formData.get("weight")),
      activity: formData.get("acitivity"), // tính chất công việc
      goal: formData.get("goal"), // mục tiêu: "gainweight", "loseweight"...
      packageTitle: cardData.title, // gói ăn đang xem
    };

    console.log("Dữ liệu thu được:", data);

    // 2. Ví dụ: Tính chỉ số BMR & TDEE cơ bản (Công thức Mifflin-St Jeor)
    let bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age;
    bmr += data.gender === "male" ? 5 : -161;

    alert(
      `Đã nhận thông tin:\n` +
        `- Tuổi: ${data.age}, Cao: ${data.height}cm, Nặng: ${data.weight}kg\n` +
        `- Chỉ số BMR dự tính: ${Math.round(bmr)} kcal/ngày`,
    );

    // 3. Gửi lên Backend (nếu có API) hoặc điều hướng sang Zalo tư vấn:
    // axiosClient.post("/api/tdee-consultation", data);
  };

  return (
    <Modal>
      <Button className="flex flex-row items-center justify-center flex-1 py-2.5 sm:py-3 px-2 sm:px-3 rounded-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-medium text-xs sm:text-sm transition cursor-pointer shadow-xs hover:shadow-md">
        <Calculator size={16} />
        <span className="px-1">Báo giá</span>
      </Button>

      <Modal.Backdrop variant="blur" className="overflow-x-hidden p-3 sm:p-6 flex items-center justify-center">
        <Modal.Container size="lg" className="w-full max-w-full p-2 sm:p-4">
          <Modal.Dialog className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl max-w-lg max-h-[90vh] sm:max-w-160 w-full overflow-y-auto border border-gray-100 min-w-0 mx-auto">
            <Modal.CloseTrigger />
            <Form onSubmit={onSubmit} className="w-full min-w-0">
              <Modal.Header className="flex items-start sm:items-center gap-3 pb-4 border-b border-gray-100 pr-8 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                  <Calculator size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <Modal.Heading className="text-lg sm:text-xl font-bold text-purple-950 wrap-break-words text-center">
                    Báo giá {cardData.title}
                  </Modal.Heading>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                    <span>Điền thông tin hoặc liên hệ để chúng mình tư vấn nhanh nhé</span>
                    <FaceSlightlySmiling size={15} className="text-orange-500 shrink-0" />
                  </div>
                </div>
              </Modal.Header>

              <Modal.Body className="py-4 space-y-4 text-sm text-gray-700 min-w-0 !overflow-visible !overscroll-auto">
                {/* Hotline hỗ trợ Zalo */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs gap-2">
                  <span className="font-semibold text-gray-700">Tư vấn nhanh qua Zalo:</span>
                  <a
                    href="https://zalo.me/0389150399"
                    target="_blank"
                    rel="noreferrer"
                    className="text-orange-600 font-bold hover:underline"
                  >
                    0389150399
                  </a>
                </div>

                {/* Bảng tính TDEE để tính tiền */}
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                  <Fieldset className={shell}>
                    <Fieldset.Legend className="font-medium text-neutral-800 dark:text-neutral-100">
                      Bảng tính toán gói ăn phù hợp
                    </Fieldset.Legend>
                    <Description className="text-neutral-600 dark:text-neutral-400">Xin mời cung cấp thông tin cá nhân</Description>
                    <FieldGroup>
                      <div className="flex flex-row items-center gap-3">
                        <Label htmlFor="input-type-number" isRequired>
                          Tuổi
                        </Label>
                        <Input
                          name="age"
                          className="flex-1"
                          id="tuoi"
                          min={15}
                          max={70}
                          placeholder="20"
                          type="number"
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        />
                      </div>
                      <Select name="gender" className="flex flex-row items-center gap-3" placeholder="Vui lòng chọn giới tính">
                        <Label isRequired>Giới tính</Label>
                        <Select.Trigger className="flex-1">
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            <ListBox.Item id="male" textValue="Male">
                              Nam
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                            <ListBox.Item id="female" textValue="Female">
                              Nữ
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          </ListBox>
                        </Select.Popover>
                      </Select>
                      <div className="flex flex-row items-center gap-3">
                        <Label htmlFor="input-type-number" isRequired>
                          Chiều cao
                        </Label>
                        <Input
                          name="height"
                          className="flex-1"
                          id="height"
                          min={140}
                          max={220}
                          placeholder="140"
                          type="number"
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        />
                      </div>
                      <div className="flex flex-row items-center gap-3">
                        <Label htmlFor="input-type-number" isRequired>
                          Cân nặng
                        </Label>
                        <Input
                          name="weight"
                          className="flex-1"
                          id="weight"
                          min={30}
                          max={200}
                          placeholder="50"
                          type="number"
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        />
                      </div>
                      <Select
                        className="flex flex-row items-center gap-3"
                        name="acitivity"
                        placeholder="Tính chất công việc của bạn bạn gần nhất với ví dụ nào dưới đây"
                      >
                        <Label className="wrap-break-words" isRequired>
                          Tính chất
                          <br className="md:hidden" /> công việc
                        </Label>
                        <Select.Trigger className="flex-1">
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            <ListBox.Item id="act" textValue="act-1">
                              Ngồi là chủ yếu (nhân viên văn phòng, sinh viên, tài xế ...)
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                            <ListBox.Item id="act1" textValue="act-2">
                              Đứng là chủ yếu (giáo viên, bartender, đầu bếp, ...)
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                            <ListBox.Item id="act2" textValue="act-3">
                              Đứng và di chuyển nhẹ nhàng là chủ yếu (tiếp viên hàng không, HLV cá nhân, giám sát công trình, ...)
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                            <ListBox.Item id="act3" textValue="act-4">
                              Vận động thường xuyên trong công việc (nhân viên công trường, giáo viên dạy nhảy, ...)
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          </ListBox>
                        </Select.Popover>
                      </Select>
                      <div className="flex flex-row gap-4">
                        <Label isRequired>Mục tiêu của bạn</Label>
                        <RadioGroup defaultValue="pro" name="goal" orientation="horizontal">
                          <Radio value="gainweight">
                            <Radio.Content>
                              <Radio.Control>
                                <Radio.Indicator />
                              </Radio.Control>
                              Tăng cân
                            </Radio.Content>
                          </Radio>
                          <Radio value="loseweight">
                            <Radio.Content>
                              <Radio.Control>
                                <Radio.Indicator />
                              </Radio.Control>
                              Giảm cân
                            </Radio.Content>
                          </Radio>
                          <Radio value="maintainweight">
                            <Radio.Content>
                              <Radio.Control>
                                <Radio.Indicator />
                              </Radio.Control>
                              Ăn uống lành mạnh
                            </Radio.Content>
                          </Radio>
                        </RadioGroup>
                      </div>
                    </FieldGroup>
                  </Fieldset>
                </div>

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
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition cursor-pointer shadow-sm hover:shadow"
                >
                  Tư vấn
                </Button>
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
