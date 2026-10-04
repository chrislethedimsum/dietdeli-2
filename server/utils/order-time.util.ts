export class OrderTimeValidator {
  /**
   * Quy tắc ngày thường:
   * Muốn đặt/hủy món cho ngày DeliveryDate thì phải làm TRƯỚC 22:00 của ngày hôm trước (DeliveryDate - 1).
   */
  static validateDailyCutoff(deliveryDate: Date): boolean {
    const now = new Date();

    // Mốc cutoff = 22:00 của ngày hôm trước ngày giao
    const cutoffTime = new Date(deliveryDate);
    cutoffTime.setDate(cutoffTime.getDate() - 1);
    cutoffTime.setHours(22, 0, 0, 0); // 22h00 tối hôm trước

    // Nếu thời gian hiện tại đã vượt quá cutoffTime -> Từ chối
    return now <= cutoffTime;
  }

  /**
   * Quy tắc đặt cả tuần mới (Thứ 2 đến Thứ 7/CN):
   * Khung giờ mở: Từ 23h00 tối Thứ 6 đến trước 22h00 tối Chủ Nhật.
   */
  static isWeeklyBookingWindowOpen(): boolean {
    const now = new Date();
    const day = now.getDay(); // 0: Chủ Nhật, 5: Thứ 6, 6: Thứ 7
    const hour = now.getHours();

    // Tối Thứ 6 từ 23:00 trở đi
    if (day === 5 && hour >= 23) return true;
    // Cả ngày Thứ 7
    if (day === 6) return true;
    // Chủ nhật trước 22:00
    if (day === 0 && (hour < 22 || (hour === 22 && now.getMinutes() === 0)))
      return true;

    return false;
  }
}
