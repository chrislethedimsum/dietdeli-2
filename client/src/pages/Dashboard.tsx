import { Card, CardHeader, Chip, Button, Avatar } from "@heroui/react";

const statistics = [
    {
        title: "Tổng doanh thu",
        value: "128.450.000 ₫",
        change: "+12.5%",
        description: "so với tháng trước",
        type: "revenue",
    },
    {
        title: "Đơn hàng",
        value: "1,284",
        change: "+8.2%",
        description: "so với tháng trước",
        type: "order",
    },
    {
        title: "Khách hàng",
        value: "856",
        change: "+5.4%",
        description: "so với tháng trước",
        type: "customer",
    },
    {
        title: "Subscription",
        value: "324",
        change: "+10.8%",
        description: "đang hoạt động",
        type: "subscription",
    },
];

const recentOrders = [
    {
        id: "#DD-10284",
        customer: "Nguyễn Minh Anh",
        plan: "Healthy 7 ngày",
        amount: "1.250.000 ₫",
        status: "Đang giao",
    },
    {
        id: "#DD-10283",
        customer: "Trần Quốc Bảo",
        plan: "Weight Loss",
        amount: "980.000 ₫",
        status: "Đã giao",
    },
    {
        id: "#DD-10282",
        customer: "Lê Thu Hà",
        plan: "Balanced 14 ngày",
        amount: "2.100.000 ₫",
        status: "Đang chuẩn bị",
    },
    {
        id: "#DD-10281",
        customer: "Phạm Đức Anh",
        plan: "Healthy 7 ngày",
        amount: "1.250.000 ₫",
        status: "Đã giao",
    },
    {
        id: "#DD-10280",
        customer: "Nguyễn Hoàng Nam",
        plan: "Muscle Gain",
        amount: "1.850.000 ₫",
        status: "Đang giao",
    },
];

const todayMenu = [
    {
        name: "Ức gà áp chảo",
        category: "Protein",
        calories: "320 kcal",
        image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=300&q=80",
    },
    {
        name: "Cơm gạo lứt",
        category: "Carbs",
        calories: "210 kcal",
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=300&q=80",
    },
    {
        name: "Salad rau củ",
        category: "Vegetable",
        calories: "140 kcal",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80",
    },
];

const chartData = [45, 58, 42, 75, 68, 82, 65, 88, 72, 92, 80, 95];

function StatisticIcon({ type }: { type: string }) {
    const commonClass = "h-6 w-6";

    switch (type) {
        case "revenue":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={commonClass}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.5c0 1.1 1.34 2 3 2s3-.9 3-2-1.34-2-3-2-3-.9-3-2 1.34-2 3-2 3 .9 3 2" />
                </svg>
            );

        case "order":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={commonClass}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 2h12v20H6zM9 6h6M9 10h6M9 14h4" />
                </svg>
            );

        case "customer":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={commonClass}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19a6 6 0 0 0-12 0m6-8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm6-3a3 3 0 1 1 0-6m0 10a5 5 0 0 1 4 2" />
                </svg>
            );

        case "subscription":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={commonClass}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 1 12.73-5.36L20 9m0 0V4m0 5h-5.5M19.5 12a7.5 7.5 0 0 1-12.73 5.36L4 15m0 0v5m0-5h5.5" />
                </svg>
            );

        default:
            return null;
    }
}

function getStatusColor(status: string) {
    switch (status) {
        case "Đã giao":
            return "success";

        case "Đang giao":
            return "primary";

        case "Đang chuẩn bị":
            return "warning";

        default:
            return "default";
    }
}

export default function Dashboard() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>

                    <p className="mt-1 text-sm text-gray-500">Tổng quan hoạt động của DietDeli hôm nay.</p>
                </div>
                <Button size="sm" variant="tertiary" className="text-success hover:bg-success/10">
                    + Tạo đơn hàng
                </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statistics.map((item) => (
                    <Card key={item.title} className="border border-gray-100">
                        <Card.Content className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{item.title}</p>

                                    <p className="mt-2 text-2xl font-bold text-gray-900">{item.value}</p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <StatisticIcon type={item.type} />
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-sm font-medium text-emerald-600">{item.change}</span>

                                <span className="text-xs text-gray-400">{item.description}</span>
                            </div>
                        </Card.Content>
                    </Card>
                ))}
            </div>

            {/* Revenue + Menu */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Revenue Chart */}
                <Card className="border border-gray-100 xl:col-span-2 shadow-sm">
                    <CardHeader className="px-5 pt-5">
                        <div className="flex w-full items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">Doanh thu</h2>
                                <p className="text-sm text-gray-500">Doanh thu trong 12 ngày gần nhất</p>
                            </div>

                            <select className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 outline-none">
                                <option>12 ngày</option>
                                <option>30 ngày</option>
                                <option>3 tháng</option>
                            </select>
                        </div>
                    </CardHeader>

                    <Card.Content className="px-5 pb-5">
                        <div className="relative h-64">
                            {/* Y axis */}
                            <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-xs text-gray-400">
                                <span>10M</span>
                                <span>8M</span>
                                <span>6M</span>
                                <span>4M</span>
                                <span>2M</span>
                                <span>0</span>
                            </div>

                            {/* Chart */}
                            <div className="ml-10 flex h-full items-end gap-2 border-b border-l border-gray-200 px-2 sm:gap-4">
                                {chartData.map((value, index) => (
                                    <div key={index} className="group relative flex h-full flex-1 items-end">
                                        <div
                                            className="w-full rounded-t-md bg-emerald-400 transition-all hover:bg-emerald-500"
                                            style={{
                                                height: `${value}%`,
                                            }}
                                        />

                                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">{index + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card.Content>
                </Card>

                {/* Today Menu */}
                <Card className="border border-gray-100 shadow-sm">
                    <CardHeader className="px-5 pt-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">Menu hôm nay</h2>

                                <p className="text-sm text-gray-500">30/09/2026</p>
                            </div>

                            <Button size="sm" variant="tertiary" className="text-success hover:bg-success/10">
                                Nội dung
                            </Button>
                        </div>
                    </CardHeader>

                    <Card.Content className="gap-3 px-5">
                        {todayMenu.map((dish) => (
                            <div key={dish.name} className="flex items-center gap-3 rounded-xl border border-gray-100 p-2">
                                <img src={dish.image} alt={dish.name} className="h-14 w-14 rounded-lg object-cover" />

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-900">{dish.name}</p>

                                    <p className="mt-1 text-xs text-gray-400">{dish.category}</p>

                                    <p className="mt-1 text-xs font-medium text-emerald-600">{dish.calories}</p>
                                </div>
                            </div>
                        ))}
                    </Card.Content>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card className="border border-gray-100 shadow-sm">
                <CardHeader className="px-5 pt-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">Đơn hàng gần đây</h2>

                            <p className="text-sm text-gray-500">Các đơn hàng mới nhất</p>
                        </div>

                        <Button size="sm" variant="tertiary" className="text-success hover:bg-success/10">
                            Xem tất cả
                        </Button>
                    </div>
                </CardHeader>

                <Card.Content className="px-5">
                    {/* Desktop table */}
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="pb-3 text-xs font-medium uppercase text-gray-400">Mã đơn</th>

                                    <th className="pb-3 text-xs font-medium uppercase text-gray-400">Khách hàng</th>

                                    <th className="pb-3 text-xs font-medium uppercase text-gray-400">Gói ăn</th>

                                    <th className="pb-3 text-xs font-medium uppercase text-gray-400">Giá trị</th>

                                    <th className="pb-3 text-xs font-medium uppercase text-gray-400">Trạng thái</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-gray-50 last:border-0">
                                        <td className="py-4 text-sm font-medium text-gray-900">{order.id}</td>

                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <Avatar.Fallback className="bg-emerald-100 text-emerald-700">
                                                        {order.customer
                                                            .split(" ")
                                                            .map((x) => x[0])
                                                            .join("")
                                                            .slice(-2)}
                                                    </Avatar.Fallback>
                                                </Avatar>

                                                <span className="text-sm text-gray-700">{order.customer}</span>
                                            </div>
                                        </td>

                                        <td className="py-4 text-sm text-gray-600">{order.plan}</td>

                                        <td className="py-4 text-sm font-medium text-gray-900">{order.amount}</td>

                                        <td className="py-4">
                                            <Chip size="sm" variant="soft" color={getStatusColor(order.status) as "success" | "accent" | "warning" | "default"}>
                                                {order.status}
                                            </Chip>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="space-y-3 md:hidden">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="rounded-xl border border-gray-100 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar size="sm">
                                            <Avatar.Fallback className="bg-emerald-100 text-emerald-700">
                                                {order.customer
                                                    .split(" ")
                                                    .map((x) => x[0])
                                                    .join("")
                                                    .slice(-2)}
                                            </Avatar.Fallback>
                                        </Avatar>

                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{order.customer}</p>

                                            <p className="text-xs text-gray-400">{order.id}</p>
                                        </div>
                                    </div>

                                    <Chip size="sm" variant="soft" color={getStatusColor(order.status) as "success" | "accent" | "warning" | "default"}>
                                        {order.status}
                                    </Chip>
                                </div>

                                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                                    <span className="text-xs text-gray-500">{order.plan}</span>

                                    <span className="text-sm font-semibold text-gray-900">{order.amount}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card.Content>
            </Card>
        </div>
    );
}
