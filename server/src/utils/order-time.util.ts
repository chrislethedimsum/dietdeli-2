export class OrderTimeValidator {
  /**
   * Quy tắc ngày thường:
   * Muốn đặt/hủy món cho ngày DeliveryDate thì phải làm TRƯỚC 22:00 của ngày hôm trước (DeliveryDate - 1).
   */
  static validateDailyCutoff(deliveryDate: Date | string): boolean {
    const now = new Date();

    let year: number;
    let month: number;
    let day: number;

    if (typeof deliveryDate === 'string' && deliveryDate.length >= 10) {
      const parts = deliveryDate.slice(0, 10).split('-').map(Number);
      year = parts[0];
      month = parts[1] - 1;
      day = parts[2];
    } else {
      const d = new Date(deliveryDate);
      year = d.getUTCFullYear();
      month = d.getUTCMonth();
      day = d.getUTCDate();
    }

    // Mốc cutoff = 22:00 của ngày hôm trước ngày giao
    const cutoffTime = new Date(year, month, day - 1, 22, 0, 0, 0);

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
