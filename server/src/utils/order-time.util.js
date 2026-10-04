export class OrderTimeValidator {
    static validateDailyCutoff(deliveryDate) {
        const now = new Date();
        const cutoffTime = new Date(deliveryDate);
        cutoffTime.setDate(cutoffTime.getDate() - 1);
        cutoffTime.setHours(22, 0, 0, 0);
        return now <= cutoffTime;
    }
    static isWeeklyBookingWindowOpen() {
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();
        if (day === 5 && hour >= 23)
            return true;
        if (day === 6)
            return true;
        if (day === 0 && (hour < 22 || (hour === 22 && now.getMinutes() === 0)))
            return true;
        return false;
    }
}
//# sourceMappingURL=order-time.util.js.map