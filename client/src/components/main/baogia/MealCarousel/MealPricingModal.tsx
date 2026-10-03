import {
  Button,
  Modal,
  Form,
  Label,
  Input,
  FieldGroup,
  Fieldset,
  Description,
  ListBox,
  Select,
  Radio,
  RadioGroup,
  TextField,
  FieldError,
} from "@heroui/react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Calculator, FaceSlightlySmiling, AlertCircle } from "lucide-react";
import { type MealCardData } from "../../../../data/mealPackages";
import { useConsultationStore } from "../../../../store/useConsultationStore";

interface MealPricingModalProps {
  data?: MealCardData;
}

interface RecommendationResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  portion: string; // "Suất 400 kcal" | "Suất 600 kcal" | "Suất 800 kcal"
  pricing: {
    oneMeal: string;
    twoMeals: string;
  };
  goalText: string;
  customerStats: {
    age: number;
    height: number;
    weight: number;
    gender: string;
    goal: string;
  };
}

export default function MealPricingModal(props: MealPricingModalProps & Partial<MealCardData>) {
  const setConsultationData = useConsultationStore((state) => state.setConsultationData);
  const [selectedMealOption, setSelectedMealOption] = useState<"1_meal" | "2_meals">("2_meals");
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  // Hỗ trợ cả 2 cách truyền props: <MealPricingModal data={cardData} /> hoặc <MealPricingModal {...cardData} />
  const cardData = props.data || (props as MealCardData);
  const shell =
    "w-full min-w-0 rounded-xl border border-border/70 border-purple-200 bg-linear-to-b from-neutral-50/90 to-white p-4 ring-1 ring-black/5 dark:from-neutral-900/80 dark:to-neutral-900 dark:ring-white/10";
  if (!cardData || !cardData.title) return null;
  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Lấy giá trị, nếu người dùng xóa trống thì tự lấy giá trị mặc định hợp lý
    const age = Number(formData.get("age")) || 20;
    const height = Number(formData.get("height")) || 160;
    const weight = Number(formData.get("weight")) || 55;
    const gender = (formData.get("gender") as string) || "male";
    const activityMultiplier = Number(formData.get("activity")) || 1.2;
    const goal = (formData.get("goal") as string) || "loseweight";

    // Tính chỉ số BMR (Mifflin-St Jeor)
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr += gender === "male" ? 5 : -161;

    // 2. Tính TDEE (Năng lượng tiêu hao mỗi ngày)
    const tdee = Math.round(bmr * activityMultiplier);

    // 3. Tính Calo mục tiêu theo nhu cầu
    let targetCalories = tdee;
    let goalText = "Ăn uống lành mạnh";
    if (goal === "loseweight") {
      targetCalories = tdee - 300; // thâm hụt calo an toàn
      goalText = "Giảm cân / Giảm mỡ";
    } else if (goal === "gainweight") {
      targetCalories = tdee + 350; // thặng dư calo
      goalText = "Tăng cân / Tăng cơ";
    }

    // 4. Xác định khẩu phần và Bảng giá theo gói ăn hiện tại (Ngày / Tuần / Tháng)
    let portion = "Suất 600 kcal (Tiêu chuẩn)";
    let prices = { oneMeal: "77.000đ", twoMeals: "150.000đ" };
    const packageId = cardData.id; // 'ngay', 'tuan', 'thang'
    if (targetCalories < 1200) {
      portion = "Suất 400 kcal (Nhẹ nhàng)";
      if (packageId === "tuan") {
        prices = { oneMeal: "408.000đ/tuần", twoMeals: "816.000đ/tuần" };
      } else if (packageId === "thang") {
        prices = { oneMeal: "1.512.000đ/tháng", twoMeals: "3.024.000đ/tháng" };
      } else {
        prices = { oneMeal: "73.000đ/bữa", twoMeals: "140.000đ/ngày" };
      }
    } else if (targetCalories <= 1800) {
      portion = "Suất 600 kcal (Cân đối)";
      if (packageId === "tuan") {
        prices = { oneMeal: "438.000đ/tuần", twoMeals: "876.000đ/tuần" };
      } else if (packageId === "thang") {
        prices = { oneMeal: "1.584.000đ/tháng", twoMeals: "3.168.000đ/tháng" };
      } else {
        prices = { oneMeal: "77.000đ/bữa", twoMeals: "150.000đ/ngày" };
      }
    } else {
      portion = "Suất 800 kcal (Vận động nhiều)";
      if (packageId === "tuan") {
        prices = { oneMeal: "450.000đ/tuần", twoMeals: "900.000đ/tuần" };
      } else if (packageId === "thang") {
        prices = { oneMeal: "1.680.000đ/tháng", twoMeals: "3.360.000đ/tháng" };
      } else {
        prices = { oneMeal: "80.000đ/bữa", twoMeals: "155.000đ/ngày" };
      }
    }

    // 5. Cập nhật state để chuyển sang view kết quả
    setRecommendation({
      bmr: Math.round(bmr),
      tdee,
      targetCalories,
      portion,
      pricing: prices,
      goalText,
      customerStats: {
        age,
        height,
        weight,
        gender: gender === "male" ? "Nam" : "Nữ",
        goal: goalText,
      },
    });
  };

  const handleGoToRegister = () => {
    if (!recommendation) return;

    // Lấy giá tiền tương ứng với số bữa khách đã chọn
    const selectedPrice = selectedMealOption === "1_meal" ? recommendation.pricing.oneMeal : recommendation.pricing.twoMeals;

    const orderDraft = {
      // 1. Thông tin gói ăn
      packageId: cardData.id,
      packageName: cardData.title,
      packageImage: cardData.image,

      // 2. Lựa chọn của khách
      mealOption: selectedMealOption, // "1_meal" hoặc "2_meals"
      price: selectedPrice, // Giá tiền cụ thể (ví dụ: "876.000đ/tuần")

      // 3. Khẩu phần dinh dưỡng
      portion: recommendation.portion,
      targetCalories: recommendation.targetCalories,
      goalText: recommendation.goalText,
      pricing: recommendation.pricing, // Giữ cả 2 mức giá dự phòng nếu sang Register khách muốn đổi

      // 4. Chỉ số cơ thể đã nhập
      customerStats: recommendation.customerStats,
    };

    setConsultationData(orderDraft);
    // Chuyển trang kèm toàn bộ gói dữ liệu
    navigate("/register", { state: orderDraft });
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

              <Modal.Body className="py-4 space-y-4 text-sm text-gray-700 min-w-0 overflow-visible! overscroll-auto">
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
                {!recommendation ? (
                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                    <Fieldset className={shell}>
                      <Fieldset.Legend className="font-medium text-neutral-800 dark:text-neutral-100">
                        Bảng tính toán gói ăn phù hợp
                      </Fieldset.Legend>
                      <Description className="text-neutral-600 dark:text-neutral-400">Xin mời cung cấp thông tin cá nhân</Description>
                      <FieldGroup>
                        {/* 1. TUỔI */}
                        <TextField
                          name="age"
                          defaultValue="20"
                          isRequired
                          validate={(val) => {
                            const n = Number(val);
                            if (!val) return "Vui lòng nhập tuổi";
                            if (isNaN(n) || n < 15 || n > 80) return "Tuổi hợp lệ từ 15 đến 80";
                            return null;
                          }}
                          className="flex flex-col gap-1"
                        >
                          <div className="flex flex-row items-center gap-3">
                            <Label isRequired className="w-24 shrink-0 font-medium text-sm">
                              Tuổi
                            </Label>
                            <Input
                              type="number"
                              placeholder="20"
                              className="flex-1"
                              onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            />
                          </div>
                          <FieldError className="text-xs text-red-500 pl-27" />
                        </TextField>

                        {/* 2. GIỚI TÍNH */}
                        <Select
                          name="gender"
                          isRequired
                          defaultSelectedKey="male"
                          validate={(val) => (!val ? "Vui lòng chọn giới tính" : null)}
                          className="flex flex-col gap-1"
                        >
                          <div className="flex flex-row items-center gap-3">
                            <Label isRequired className="w-24 shrink-0 font-medium text-sm">
                              Giới tính
                            </Label>
                            <Select.Trigger className="flex-1">
                              <Select.Value />
                              <Select.Indicator />
                            </Select.Trigger>
                          </div>
                          <Select.Popover>
                            <ListBox>
                              <ListBox.Item id="male" textValue="Nam">
                                Nam
                              </ListBox.Item>
                              <ListBox.Item id="female" textValue="Nữ">
                                Nữ
                              </ListBox.Item>
                            </ListBox>
                          </Select.Popover>
                          <FieldError className="text-xs text-red-500 pl-27" />
                        </Select>

                        {/* 3. CHIỀU CAO */}
                        <TextField
                          name="height"
                          defaultValue="160"
                          isRequired
                          validate={(val) => {
                            const n = Number(val);
                            if (!val) return "Vui lòng nhập chiều cao";
                            if (isNaN(n) || n < 120 || n > 220) return "Chiều cao hợp lệ từ 120cm - 220cm";
                            return null;
                          }}
                          className="flex flex-col gap-1"
                        >
                          <div className="flex flex-row items-center gap-3">
                            <Label isRequired className="w-24 shrink-0 font-medium text-sm">
                              Chiều cao (cm)
                            </Label>
                            <Input
                              type="number"
                              placeholder="160"
                              className="flex-1"
                              onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            />
                          </div>
                          <FieldError className="text-xs text-red-500 pl-27" />
                        </TextField>

                        {/* 4. CÂN NẶNG */}
                        <TextField
                          name="weight"
                          defaultValue="55"
                          isRequired
                          validate={(val) => {
                            const n = Number(val);
                            if (!val) return "Vui lòng nhập cân nặng";
                            if (isNaN(n) || n < 30 || n > 200) return "Cân nặng hợp lệ từ 30kg - 200kg";
                            return null;
                          }}
                          className="flex flex-col gap-1"
                        >
                          <div className="flex flex-row items-center gap-3">
                            <Label isRequired className="w-24 shrink-0 font-medium text-sm">
                              Cân nặng (kg)
                            </Label>
                            <Input
                              type="number"
                              placeholder="55"
                              className="flex-1"
                              onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            />
                          </div>
                          <FieldError className="text-xs text-red-500 pl-27" />
                        </TextField>

                        {/* 5. TÍNH CHẤT CÔNG VIỆC */}
                        <Select
                          name="activity"
                          isRequired
                          defaultSelectedKey="1.2"
                          validate={(val) => (!val ? "Vui lòng chọn tính chất công việc" : null)}
                          className="flex flex-col gap-1"
                        >
                          <div className="flex flex-row items-center gap-3">
                            <Label isRequired className="w-24 shrink-0 font-medium text-sm">
                              Tính chất <br className="hidden sm:inline" /> công việc
                            </Label>
                            <Select.Trigger className="flex-1">
                              <Select.Value />
                              <Select.Indicator />
                            </Select.Trigger>
                          </div>
                          <Select.Popover>
                            <ListBox>
                              <ListBox.Item id="1.2" textValue="Ngồi là chủ yếu">
                                Ngồi là chủ yếu (nhân viên văn phòng, sinh viên, tài xế ...)
                              </ListBox.Item>
                              <ListBox.Item id="1.3" textValue="Đứng là chủ yếu">
                                Đứng là chủ yếu (giáo viên, bartender, đầu bếp, ...)
                              </ListBox.Item>
                              <ListBox.Item id="1.5" textValue="Đứng và di chuyển nhẹ nhàng">
                                Đứng và di chuyển nhẹ nhàng (tiếp viên, HLV cá nhân, ...)
                              </ListBox.Item>
                              <ListBox.Item id="1.7" textValue="Vận động thường xuyên">
                                Vận động thường xuyên (công trường, giáo viên nhảy, ...)
                              </ListBox.Item>
                            </ListBox>
                          </Select.Popover>
                          <FieldError className="text-xs text-red-500 pl-27" />
                        </Select>

                        {/* 6. MỤC TIÊU */}
                        <RadioGroup defaultValue="loseweight" name="goal" orientation="horizontal" isRequired>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <Label isRequired className="w-24 shrink-0 font-medium text-sm">
                              Mục tiêu
                            </Label>
                            <div className="flex flex-wrap gap-4">
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
                                  Ăn lành mạnh
                                </Radio.Content>
                              </Radio>
                            </div>
                          </div>
                        </RadioGroup>
                      </FieldGroup>
                    </Fieldset>
                  </div>
                ) : (
                  /* GIAO DIỆN 2: KẾT QUẢ GỢI Ý & BÁO GIÁ */
                  <div className="space-y-4 animate-in fade-in duration-300">
                    {/* Tóm tắt chỉ số thể trạng */}
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center">
                      <span className="text-xs uppercase tracking-wider font-bold text-orange-600">Khẩu phần đề xuất cho bạn</span>
                      <h3 className="text-xl font-extrabold text-orange-950 mt-1">{recommendation.portion}</h3>
                      <p className="text-xs text-orange-800 mt-1">
                        Mục tiêu: <b>{recommendation.goalText}</b> • Năng lượng khuyến nghị:{" "}
                        <b>{recommendation.targetCalories} kcal/ngày</b>
                      </p>
                    </div>

                    {/* Box lựa chọn 1 bữa vs 2 bữa */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Lựa chọn 1 bữa */}
                      <div
                        onClick={() => setSelectedMealOption("1_meal")}
                        className={`rounded-2xl p-4 transition cursor-pointer flex flex-col justify-between ${
                          selectedMealOption === "1_meal"
                            ? "border-2 border-orange-500 bg-orange-50/50 shadow-sm"
                            : "border border-gray-200 hover:border-orange-300 bg-white"
                        }`}
                      >
                        <div>
                          <div className="font-bold text-gray-800">1 Bữa / ngày</div>
                          <div className="text-xs text-gray-500 mt-0.5">Phù hợp ăn trưa tại văn phòng</div>
                        </div>
                        <div className="mt-3">
                          <span className="text-lg font-extrabold text-orange-600">{recommendation.pricing.oneMeal}</span>
                        </div>
                      </div>

                      {/* Lựa chọn 2 bữa */}
                      <div
                        onClick={() => setSelectedMealOption("2_meals")}
                        className={`rounded-2xl p-4 relative transition cursor-pointer flex flex-col justify-between ${
                          selectedMealOption === "2_meals"
                            ? "border-2 border-orange-500 bg-orange-50/50 shadow-sm"
                            : "border border-gray-200 hover:border-orange-300 bg-white"
                        }`}
                      >
                        <span className="absolute -top-2.5 right-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Tối ưu nhất
                        </span>
                        <div>
                          <div className="font-bold text-purple-950">2 Bữa / ngày</div>
                          <div className="text-xs text-gray-600 mt-0.5">Trưa + Tối trọn vẹn dinh dưỡng</div>
                        </div>
                        <div className="mt-3">
                          <span className="text-lg font-extrabold text-orange-600">{recommendation.pricing.twoMeals}</span>
                        </div>
                      </div>
                    </div>

                    {/* Thông tin hỗ trợ */}
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl">
                      💡 Bạn có thể đăng ký trực tuyến ngay bây giờ hoặc liên hệ hotline để nhận thêm quà tặng đồ uống detox kèm theo gói
                      ăn.
                    </div>
                  </div>
                )}

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
                {!recommendation ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      onPress={() => setRecommendation(null)}
                      className="px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition cursor-pointer"
                    >
                      ← Tính lại
                    </Button>
                    <Button
                      type="button"
                      onPress={handleGoToRegister}
                      className="px-6 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition cursor-pointer shadow-sm hover:shadow"
                    >
                      Đăng ký gói này ngay
                    </Button>
                  </>
                )}
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
