export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);
};

export const formatDate = (date: string, options?: Intl.DateTimeFormatOptions) => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    };
    const formatOptions = { ...defaultOptions, ...options };
    return new Date(date).toLocaleDateString("vi-VN", formatOptions);
};

export const getDayOfWeek = (date: string) => {
    const daysOfWeek = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const dayIndex = new Date(date).getDay();
    return daysOfWeek[dayIndex];
};

export const removeVietnameseTones = (value: string) => {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim();
};

export const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

export const getCurrentWeekDates = () => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const day = today.getDay();

    // Chủ nhật = 0
    const diff = day === 0 ? -6 : 1 - day;

    const monday = new Date(today);

    monday.setDate(today.getDate() + diff);

    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(monday);

        date.setDate(monday.getDate() + index);

        return formatLocalDate(date);
    });
};
