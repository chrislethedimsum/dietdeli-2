import { useMemo, useState } from "react";
import { Card, Input, Label, ListBox, Select, Table, TextField } from "@heroui/react";

type OrderStatus = "pending" | "confirmed" | "preparing" | "shipping" | "completed" | "cancelled";

type Order = {
    id: string;
    customerName: string;
    customerPhone: string;
    items: number;
    total: number;
    status: OrderStatus;
    orderDate: string;
    deliveryDate: string;
    paymentMethod: string;
};

const orders: Order[] = [
    {
        id: "ORD-20260930-001",
        customerName: "Nguyễn Văn An",
        customerPhone: "0901234567",
        items: 6,
        total: 1250000,
        status: "completed",
        orderDate: "30/09/2026 08:30",
        deliveryDate: "30/09/2026",
        paymentMethod: "Chuyển khoản",
    },
    {
        id: "ORD-20260930-002",
        customerName: "Trần Thị Mai",
        customerPhone: "0912345678",
        items: 3,
        total: 680000,
        status: "shipping",
        orderDate: "30/09/2026 09:15",
        deliveryDate: "30/09/2026",
        paymentMethod: "COD",
    },
    {
        id: "ORD-20260930-003",
        customerName: "Lê Minh Tuấn",
        customerPhone: "0987654321",
        items: 10,
        total: 2150000,
        status: "preparing",
        orderDate: "30/09/2026 10:20",
        deliveryDate: "01/10/2026",
        paymentMethod: "Chuyển khoản",
    },
    {
        id: "ORD-20260930-004",
        customerName: "Phạm Thu Hà",
        customerPhone: "0934567890",
        items: 4,
        total: 890000,
        status: "confirmed",
        orderDate: "30/09/2026 11:05",
        deliveryDate: "01/10/2026",
        paymentMethod: "Ví điện tử",
    },
    {
        id: "ORD-20260930-005",
        customerName: "Đỗ Hoàng Nam",
        customerPhone: "0961234567",
        items: 2,
        total: 450000,
        status: "pending",
        orderDate: "30/09/2026 11:45",
        deliveryDate: "01/10/2026",
        paymentMethod: "COD",
    },
    {
        id: "ORD-20260929-006",
        customerName: "Nguyễn Thị Lan",
        customerPhone: "0978123456",
        items: 8,
        total: 1680000,
        status: "completed",
        orderDate: "29/09/2026 14:20",
        deliveryDate: "30/09/2026",
        paymentMethod: "Chuyển khoản",
    },
    {
        id: "ORD-20260929-007",
        customerName: "Hoàng Đức Anh",
        customerPhone: "0945678901",
        items: 5,
        total: 1020000,
        status: "cancelled",
        orderDate: "29/09/2026 15:40",
        deliveryDate: "30/09/2026",
        paymentMethod: "COD",
    },
];

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
    pending: {
        label: "Chờ xử lý",
        className: "bg-yellow-50 text-yellow-700",
    },
    confirmed: {
        label: "Đã xác nhận",
        className: "bg-blue-50 text-blue-700",
    },
    preparing: {
        label: "Đang chuẩn bị",
        className: "bg-purple-50 text-purple-700",
    },
    shipping: {
        label: "Đang giao",
        className: "bg-orange-50 text-orange-700",
    },
    completed: {
        label: "Hoàn thành",
        className: "bg-emerald-50 text-emerald-700",
    },
    cancelled: {
        label: "Đã hủy",
        className: "bg-red-50 text-red-700",
    },
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);
};

function StatusBadge({ status }: { status: OrderStatus }) {
    const config = statusConfig[status];

    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>{config.label}</span>;
}

function StatCard({ title, value, description, icon }: { title: string; value: string; description: string; icon: React.ReactNode }) {
    return (
        <Card className="rounded-xl border border-gray-200 shadow-sm">
            <Card.Content className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-gray-500">{title}</p>

                        <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>

                        <p className="mt-1 text-xs text-gray-500">{description}</p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">{icon}</div>
                </div>
            </Card.Content>
        </Card>
    );
}

export default function OrderPage() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<string>("all");

    const filteredOrders = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        return orders.filter((order) => {
            const matchesSearch = !keyword || order.id.toLowerCase().includes(keyword) || order.customerName.toLowerCase().includes(keyword) || order.customerPhone.includes(keyword);

            const matchesStatus = status === "all" || order.status === status;

            return matchesSearch && matchesStatus;
        });
    }, [search, status]);

    const totalRevenue = orders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + order.total, 0);

    const completedOrders = orders.filter((order) => order.status === "completed").length;

    const pendingOrders = orders.filter((order) => order.status === "pending" || order.status === "confirmed" || order.status === "preparing").length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>

                    <p className="mt-1 text-sm text-gray-500">Quản lý và theo dõi tất cả đơn hàng</p>
                </div>

                <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700">
                    <span className="text-lg">+</span>
                    Tạo đơn hàng
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Tổng đơn hàng"
                    value={orders.length.toString()}
                    description="Tất cả đơn hàng"
                    icon={
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a3 3 0 006 0M9 5h6" />
                        </svg>
                    }
                />

                <StatCard
                    title="Doanh thu"
                    value={formatCurrency(totalRevenue)}
                    description="Không tính đơn đã hủy"
                    icon={
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 12v-2m0 2c-1.11 0-2.08-.402-2.599-1M12 18c1.657 0 3-.895 3-2s-1.343-2-3-2-3-.895-3-2 1.343-2 3-2"
                            />
                        </svg>
                    }
                />

                <StatCard
                    title="Đang xử lý"
                    value={pendingOrders.toString()}
                    description="Chờ xác nhận / chuẩn bị"
                    icon={
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />

                <StatCard
                    title="Đã hoàn thành"
                    value={completedOrders.toString()}
                    description="Đơn hàng hoàn tất"
                    icon={
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    }
                />
            </div>

            {/* Order list */}
            <Card className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <Card.Header className="border-b border-gray-100 p-5">
                    <Card.Title className="text-lg font-semibold text-gray-900">Danh sách đơn hàng</Card.Title>

                    <Card.Description>Xem và quản lý các đơn hàng của khách hàng</Card.Description>
                </Card.Header>

                <Card.Content className="p-0">
                    {/* Filters */}
                    <div className="grid grid-cols-1 gap-4 border-b border-gray-100 p-5 md:grid-cols-[1fr_220px]">
                        <TextField>
                            <Label>Tìm kiếm đơn hàng</Label>

                            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo mã đơn, tên khách hàng, SĐT..." className="w-full" />
                        </TextField>

                        <Select value={status} onChange={() => setStatus} className="w-full">
                            <Label>Trạng thái</Label>

                            <Select.Trigger>
                                <Select.Value />
                                <Select.Indicator />
                            </Select.Trigger>

                            <Select.Popover>
                                <ListBox>
                                    <ListBox.Item id="all" textValue="Tất cả">
                                        Tất cả
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>

                                    <ListBox.Item id="pending" textValue="Chờ xử lý">
                                        Chờ xử lý
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>

                                    <ListBox.Item id="confirmed" textValue="Đã xác nhận">
                                        Đã xác nhận
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>

                                    <ListBox.Item id="preparing" textValue="Đang chuẩn bị">
                                        Đang chuẩn bị
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>

                                    <ListBox.Item id="shipping" textValue="Đang giao">
                                        Đang giao
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>

                                    <ListBox.Item id="completed" textValue="Hoàn thành">
                                        Hoàn thành
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>

                                    <ListBox.Item id="cancelled" textValue="Đã hủy">
                                        Đã hủy
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                </ListBox>
                            </Select.Popover>
                        </Select>
                    </div>

                    {/* Desktop table */}
                    <div className="hidden md:block">
                        <Table>
                            <Table.ScrollContainer>
                                <Table.Content aria-label="Danh sách đơn hàng">
                                    <Table.Header>
                                        <Table.Column>Mã đơn</Table.Column>

                                        <Table.Column>Khách hàng</Table.Column>

                                        <Table.Column>Số món</Table.Column>

                                        <Table.Column>Tổng tiền</Table.Column>

                                        <Table.Column>Trạng thái</Table.Column>

                                        <Table.Column>Ngày đặt</Table.Column>

                                        <Table.Column>Thao tác</Table.Column>
                                    </Table.Header>

                                    <Table.Body items={filteredOrders} renderEmptyState={() => <div className="py-10 text-center text-sm text-gray-500">Không tìm thấy đơn hàng</div>}>
                                        {(order) => (
                                            <Table.Row id={order.id}>
                                                <Table.Cell>
                                                    <span className="font-medium text-gray-900">{order.id}</span>
                                                </Table.Cell>

                                                <Table.Cell>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{order.customerName}</p>

                                                        <p className="text-xs text-gray-500">{order.customerPhone}</p>
                                                    </div>
                                                </Table.Cell>

                                                <Table.Cell>
                                                    <span className="text-gray-700">{order.items} món</span>
                                                </Table.Cell>

                                                <Table.Cell>
                                                    <span className="font-semibold text-gray-900">{formatCurrency(order.total)}</span>
                                                </Table.Cell>

                                                <Table.Cell>
                                                    <StatusBadge status={order.status} />
                                                </Table.Cell>

                                                <Table.Cell>
                                                    <span className="text-sm text-gray-600">{order.orderDate}</span>
                                                </Table.Cell>

                                                <Table.Cell>
                                                    <button type="button" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                                                        Chi tiết
                                                    </button>
                                                </Table.Cell>
                                            </Table.Row>
                                        )}
                                    </Table.Body>
                                </Table.Content>
                            </Table.ScrollContainer>
                        </Table>
                    </div>

                    {/* Mobile list */}
                    <div className="divide-y divide-gray-100 md:hidden">
                        {filteredOrders.length === 0 ? (
                            <div className="py-10 text-center text-sm text-gray-500">Không tìm thấy đơn hàng</div>
                        ) : (
                            filteredOrders.map((order) => (
                                <div key={order.id} className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-gray-900">{order.id}</p>

                                            <p className="mt-1 text-sm text-gray-600">{order.customerName}</p>

                                            <p className="text-xs text-gray-400">{order.customerPhone}</p>
                                        </div>

                                        <StatusBadge status={order.status} />
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Số món</p>

                                            <p className="mt-1 text-sm font-medium text-gray-900">{order.items} món</p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">Tổng tiền</p>

                                            <p className="mt-1 text-sm font-semibold text-emerald-600">{formatCurrency(order.total)}</p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">Ngày đặt</p>

                                            <p className="mt-1 text-sm text-gray-900">{order.orderDate}</p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">Giao hàng</p>

                                            <p className="mt-1 text-sm text-gray-900">{order.deliveryDate}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 border-t border-gray-100 pt-3">
                                        <button type="button" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                                            Xem chi tiết →
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 px-5 py-4">
                        <p className="text-sm text-gray-500">
                            Hiển thị <span className="font-medium text-gray-900">{filteredOrders.length}</span> / {orders.length} đơn hàng
                        </p>
                    </div>
                </Card.Content>
            </Card>
        </div>
    );
}
