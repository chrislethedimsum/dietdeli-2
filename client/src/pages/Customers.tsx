import { useMemo, useState } from "react";
import { Avatar, Button, Card, Input, Label, ListBox, Select, TextField } from "@heroui/react";

type CustomerStatus = "active" | "inactive";

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    subscription: string;
    orders: number;
    totalSpent: string;
    joinedAt: string;
    status: CustomerStatus;
}

const customers: Customer[] = [
    {
        id: "CUS-001",
        name: "Nguyễn Minh Anh",
        email: "minhanh@gmail.com",
        phone: "0901 234 567",
        subscription: "Healthy 7 ngày",
        orders: 12,
        totalSpent: "8.450.000 ₫",
        joinedAt: "12/09/2026",
        status: "active",
    },
    {
        id: "CUS-002",
        name: "Trần Quốc Bảo",
        email: "quocbao@gmail.com",
        phone: "0912 345 678",
        subscription: "Weight Loss",
        orders: 8,
        totalSpent: "6.280.000 ₫",
        joinedAt: "10/09/2026",
        status: "active",
    },
    {
        id: "CUS-003",
        name: "Lê Thu Hà",
        email: "thuha@gmail.com",
        phone: "0988 123 456",
        subscription: "Balanced 14 ngày",
        orders: 18,
        totalSpent: "12.650.000 ₫",
        joinedAt: "05/09/2026",
        status: "active",
    },
    {
        id: "CUS-004",
        name: "Phạm Đức Anh",
        email: "ducanh@gmail.com",
        phone: "0977 456 789",
        subscription: "Healthy 7 ngày",
        orders: 5,
        totalSpent: "3.750.000 ₫",
        joinedAt: "01/09/2026",
        status: "active",
    },
    {
        id: "CUS-005",
        name: "Nguyễn Hoàng Nam",
        email: "hoangnam@gmail.com",
        phone: "0966 234 567",
        subscription: "Muscle Gain",
        orders: 15,
        totalSpent: "11.200.000 ₫",
        joinedAt: "28/08/2026",
        status: "active",
    },
    {
        id: "CUS-006",
        name: "Vũ Ngọc Mai",
        email: "ngocmai@gmail.com",
        phone: "0934 567 890",
        subscription: "Healthy 14 ngày",
        orders: 3,
        totalSpent: "4.200.000 ₫",
        joinedAt: "25/08/2026",
        status: "inactive",
    },
    {
        id: "CUS-007",
        name: "Đỗ Minh Tuấn",
        email: "minhtuan@gmail.com",
        phone: "0923 456 789",
        subscription: "Weight Loss",
        orders: 9,
        totalSpent: "7.150.000 ₫",
        joinedAt: "20/08/2026",
        status: "active",
    },
    {
        id: "CUS-008",
        name: "Hoàng Lan Anh",
        email: "lananh@gmail.com",
        phone: "0908 765 432",
        subscription: "Balanced 7 ngày",
        orders: 2,
        totalSpent: "1.850.000 ₫",
        joinedAt: "18/08/2026",
        status: "inactive",
    },
];

function getInitials(name: string) {
    return name
        .split(" ")
        .map((item) => item[0])
        .join("")
        .slice(-2)
        .toUpperCase();
}

function getStatusLabel(status: CustomerStatus) {
    return status === "active" ? "Đang hoạt động" : "Không hoạt động";
}

function getStatusClass(status: CustomerStatus) {
    if (status === "active") {
        return "bg-emerald-50 text-emerald-700";
    }

    return "bg-gray-100 text-gray-600";
}

export default function Customers() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<string | null>("all");
    const [subscription, setSubscription] = useState<string | null>("all");

    const filteredCustomers = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return customers.filter((customer) => {
            const matchesSearch =
                !keyword ||
                customer.name.toLowerCase().includes(keyword) ||
                customer.email.toLowerCase().includes(keyword) ||
                customer.phone.includes(keyword) ||
                customer.id.toLowerCase().includes(keyword);

            const matchesStatus = status === "all" || status === customer.status;

            const matchesSubscription = subscription === "all" || subscription === customer.subscription;

            return matchesSearch && matchesStatus && matchesSubscription;
        });
    }, [search, status, subscription]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Khách hàng</h1>

                    <p className="mt-1 text-sm text-gray-500">Quản lý thông tin và hoạt động của khách hàng DietDeli.</p>
                </div>

                <Button className="w-full bg-emerald-500 text-white hover:bg-emerald-600 sm:w-auto">+ Thêm khách hàng</Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Tổng khách hàng" value="856" description="+5.4% so với tháng trước" />

                <StatCard title="Đang hoạt động" value="724" description="84.6% tổng khách hàng" />

                <StatCard title="Subscription" value="324" description="+10.8% tháng này" />

                <StatCard title="Khách hàng mới" value="68" description="Trong tháng 9" />
            </div>

            {/* Customer card */}
            <Card variant="default" className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                {/* Card Header */}
                <Card.Header className="border-b border-gray-100 p-5">
                    <Card.Title className="text-lg font-semibold">Danh sách khách hàng</Card.Title>

                    <Card.Description>Tìm kiếm và quản lý khách hàng DietDeli.</Card.Description>
                </Card.Header>

                {/* Filters */}
                <Card.Content className="border-b border-gray-100 p-5">
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_200px_220px] items-end">
                        {/* Search */}
                        <TextField className="w-full">
                            <Label>Tìm kiếm khách hàng</Label>

                            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên, email, SĐT..." className="w-full" />
                        </TextField>

                        {/* Status */}
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

                                    <ListBox.Item id="active" textValue="Đang hoạt động">
                                        Đang hoạt động
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>

                                    <ListBox.Item id="inactive" textValue="Không hoạt động">
                                        Không hoạt động
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                </ListBox>
                            </Select.Popover>
                        </Select>

                        {/* Subscription */}
                        <Select value={subscription} onChange={() => setSubscription} className="w-full">
                            <Label>Subscription</Label>

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

                                    <ListBox.Item id="Healthy 7 ngày" textValue="Healthy 7 ngày">
                                        Healthy 7 ngày
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>

                                    <ListBox.Item id="Healthy 14 ngày" textValue="Healthy 14 ngày">
                                        Healthy 14 ngày
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>

                                    <ListBox.Item id="Weight Loss" textValue="Weight Loss">
                                        Weight Loss
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>

                                    <ListBox.Item id="Muscle Gain" textValue="Muscle Gain">
                                        Muscle Gain
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>

                                    <ListBox.Item id="Balanced 7 ngày" textValue="Balanced 7 ngày">
                                        Balanced 7 ngày
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>

                                    <ListBox.Item id="Balanced 14 ngày" textValue="Balanced 14 ngày">
                                        Balanced 14 ngày
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                </ListBox>
                            </Select.Popover>
                        </Select>
                    </div>
                </Card.Content>

                {/* Result */}
                <div className="px-5 py-4">
                    <p className="text-sm text-gray-500">
                        Hiển thị <span className="font-semibold text-gray-900">{filteredCustomers.length}</span> khách hàng
                    </p>
                </div>

                {/* Desktop Table */}
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[950px]">
                        <thead>
                            <tr className="border-y border-gray-100 bg-gray-50">
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Khách hàng</th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Liên hệ</th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Subscription</th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Đơn hàng</th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Tổng chi tiêu</th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Trạng thái</th>

                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="border-b border-gray-100 transition hover:bg-gray-50">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <Avatar.Fallback className="bg-emerald-100 text-emerald-700">{getInitials(customer.name)}</Avatar.Fallback>
                                            </Avatar>

                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{customer.name}</p>

                                                <p className="text-xs text-gray-400">{customer.id}</p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <p className="text-sm text-gray-700">{customer.email}</p>

                                        <p className="mt-1 text-xs text-gray-400">{customer.phone}</p>
                                    </td>

                                    <td className="px-5 py-4 text-sm text-gray-700">{customer.subscription}</td>

                                    <td className="px-5 py-4 text-sm font-medium text-gray-700">{customer.orders}</td>

                                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">{customer.totalSpent}</td>

                                    <td className="px-5 py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(customer.status)}`}>{getStatusLabel(customer.status)}</span>
                                    </td>

                                    <td className="px-5 py-4 text-right">
                                        <Button variant="ghost" className="text-emerald-600 hover:bg-emerald-50">
                                            Chi tiết
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile */}
                <div className="space-y-3 px-5 pb-5 md:hidden">
                    {filteredCustomers.map((customer) => (
                        <div key={customer.id} className="rounded-xl border border-gray-100 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <Avatar>
                                        <Avatar.Fallback className="bg-emerald-100 text-emerald-700">{getInitials(customer.name)}</Avatar.Fallback>
                                    </Avatar>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-gray-900">{customer.name}</p>

                                        <p className="text-xs text-gray-400">{customer.id}</p>
                                    </div>
                                </div>

                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(customer.status)}`}>{getStatusLabel(customer.status)}</span>
                            </div>

                            <div className="mt-4 space-y-3 border-t border-gray-100 pt-3">
                                <InfoRow label="Email" value={customer.email} />

                                <InfoRow label="Số điện thoại" value={customer.phone} />

                                <InfoRow label="Subscription" value={customer.subscription} />

                                <InfoRow label="Đơn hàng" value={String(customer.orders)} />

                                <InfoRow label="Tổng chi tiêu" value={customer.totalSpent} />
                            </div>

                            <Button variant="ghost" className="mt-4 w-full text-emerald-600 hover:bg-emerald-50">
                                Xem chi tiết
                            </Button>
                        </div>
                    ))}

                    {filteredCustomers.length === 0 && (
                        <div className="py-12 text-center">
                            <p className="text-sm text-gray-500">Không tìm thấy khách hàng</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}

function StatCard({ title, value, description }: { title: string; value: string; description: string }) {
    return (
        <Card variant="default" className="rounded-xl border border-gray-200 shadow-sm">
            <Card.Content className="p-5">
                <p className="text-sm text-gray-500">{title}</p>

                <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>

                <p className="mt-2 text-xs text-emerald-600">{description}</p>
            </Card.Content>
        </Card>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-4">
            <span className="shrink-0 text-xs text-gray-400">{label}</span>

            <span className="truncate text-right text-sm text-gray-700">{value}</span>
        </div>
    );
}
