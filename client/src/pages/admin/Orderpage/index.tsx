import { useEffect, useMemo, useState } from "react";
import { Card, Table } from "@heroui/react";
import { orderApi, type Order } from "@/api/order.api";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils";
import ChangeOrderStatusModal from "./components/ChangeOrderStatusModal";
import { useAlertStore } from "@/store/useAlertStore";

type OrderStatus = "ORDERED" | "COOKING" | "REJECTED" | "SHIPPING" | "COMPLETED" | "CANCELLED";

const statusConfig: Record<
    OrderStatus,
    {
        label: string;
        className: string;
    }
> = {
    ORDERED: {
        label: "Đã đặt hàng",
        className: "bg-yellow-50 text-yellow-700",
    },
    COOKING: {
        label: "Đang chuẩn bị",
        className: "bg-purple-50 text-purple-700",
    },
    REJECTED: {
        label: "Bị từ chối",
        className: "bg-red-50 text-red-700",
    },
    SHIPPING: {
        label: "Đang giao",
        className: "bg-orange-50 text-orange-700",
    },
    COMPLETED: {
        label: "Hoàn thành",
        className: "bg-emerald-50 text-emerald-700",
    },
    CANCELLED: {
        label: "Đã hủy",
        className: "bg-red-50 text-red-700",
    },
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

function OrderTableSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    {/* Date header */}
                    <div className="flex animate-pulse items-center justify-between border-b border-gray-100 px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className="h-5 w-28 rounded bg-gray-200" />
                            <div className="h-5 w-20 rounded-full bg-gray-200" />
                        </div>

                        <div className="h-4 w-20 rounded bg-gray-200" />
                    </div>

                    {/* Orders */}
                    <div className="divide-y divide-gray-100">
                        {Array.from({ length: 2 }).map((_, orderIndex) => (
                            <div key={orderIndex} className="flex animate-pulse items-center gap-4 px-5 py-4">
                                {/* Order ID */}
                                <div className="w-28">
                                    <div className="h-4 w-24 rounded bg-gray-200" />
                                </div>

                                {/* Customer */}
                                <div className="flex-1">
                                    <div className="h-4 w-32 rounded bg-gray-200" />
                                    <div className="mt-2 h-3 w-40 rounded bg-gray-200" />
                                </div>

                                {/* Package */}
                                <div className="w-32">
                                    <div className="h-4 w-24 rounded bg-gray-200" />
                                </div>

                                {/* Quantity */}
                                <div className="w-20">
                                    <div className="h-4 w-12 rounded bg-gray-200" />
                                </div>

                                {/* Status */}
                                <div className="w-28">
                                    <div className="h-6 w-24 rounded-full bg-gray-200" />
                                </div>

                                {/* Action */}
                                <div className="w-20">
                                    <div className="h-8 w-16 rounded bg-gray-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

type GroupedDish = {
    id: string;
    name: string;
    quantity: number;
};

const getGroupedDishes = (orders: Order[]): GroupedDish[] => {
    const dishMap = new Map<string, GroupedDish>();

    orders.forEach((order) => {
        // Không tính món của đơn hàng đã hủy
        if (order.status === "CANCELLED") return;

        order.orderItems?.forEach((item) => {
            const rawItem = item as typeof item & {
                dish?: {
                    id?: string | number;
                    nameVi?: string;
                    nameEn?: string;
                    name?: string;
                };
                dishId?: string | number;
            };

            const dishId = String(rawItem.dish?.id ?? rawItem.dishId ?? item.id);

            const dishName = rawItem.dish?.nameVi ?? rawItem.dish?.nameEn ?? rawItem.dish?.name ?? `Món #${dishId}`;

            const existing = dishMap.get(dishId);

            if (existing) {
                existing.quantity += item.quantity;
            } else {
                dishMap.set(dishId, {
                    id: dishId,
                    name: dishName,
                    quantity: item.quantity,
                });
            }
        });
    });

    return Array.from(dishMap.values()).sort((a, b) => a.name.localeCompare(b.name, "vi"));
};

export default function OrderPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDates, setOpenDates] = useState<string[]>([]);
    const [statusModal, setStatusModal] = useState<{
        open: boolean;
        order: Order | null;
    }>({
        open: false,
        order: null,
    });

    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const { showAlert } = useAlertStore();

    const openStatusModal = (order: Order) => {
        setStatusModal({
            open: true,
            order,
        });
    };

    const closeStatusModal = () => {
        if (isUpdatingStatus) return;

        setStatusModal({
            open: false,
            order: null,
        });
    };

    const handleChangeStatus = async (id: number, status: OrderStatus) => {
        try {
            setIsUpdatingStatus(true);

            await orderApi.updateStatus(id, status);

            await fetchOrders();

            showAlert("success", "Cập nhật trạng thái đơn hàng thành công.");
        } catch (error) {
            console.error("Failed to update order status:", error);

            showAlert("error", "Cập nhật trạng thái đơn hàng thất bại.");
        } finally {
            setIsUpdatingStatus(false);

            setStatusModal({
                open: false,
                order: null,
            });
        }
    };

    const toggleDate = (date: string) => {
        setOpenDates((prev) => (prev.includes(date) ? prev.filter((item) => item !== date) : [...prev, date]));
    };

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await orderApi.getAllOrders();
            setOrders(data);

            if (data.length > 0) {
                const sortedOrders = [...data].sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());

                const firstDate = formatDate(sortedOrders[0].deliveryDate);

                setOpenDates([firstDate]);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            setError("Không thể tải danh sách đơn hàng.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        const result = orders;

        return result.sort((a, b) => {
            const dateA = new Date(a.deliveryDate).getTime();
            const dateB = new Date(b.deliveryDate).getTime();

            return dateA - dateB;
        });
    }, [orders]);

    const completedOrders = useMemo(() => {
        return orders.filter((order) => order.status === "COMPLETED").length;
    }, [orders]);

    const cancelledOrders = useMemo(() => {
        return orders.filter((order) => order.status === "CANCELLED").length;
    }, [orders]);

    const pendingOrders = useMemo(() => {
        return orders.filter((order) => ["ORDERED", "COOKING"].includes(order.status)).length;
    }, [orders]);

    const groupedOrders = useMemo(() => {
        const groups = new Map<string, Order[]>();

        filteredOrders.forEach((order) => {
            const date = formatDate(order.deliveryDate);

            if (!groups.has(date)) {
                groups.set(date, []);
            }

            groups.get(date)!.push(order);
        });

        return Array.from(groups.entries()).map(([date, orders]) => ({
            date,
            orders,
        }));
    }, [filteredOrders]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
                    <p className="mt-1 text-sm text-gray-500">Quản lý và theo dõi tất cả đơn hàng</p>
                </div>
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
                <StatCard
                    title="Đơn hàng bị hủy"
                    value={cancelledOrders.toString()}
                    description="Đơn hàng bị hủy"
                    icon={
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    }
                />
            </div>

            {/* Orders grouped by delivery date */}
            {isLoading ? (
                <OrderTableSkeleton />
            ) : error ? (
                <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">{error}</div>
            ) : groupedOrders.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
                    <p className="font-medium text-gray-900">Không có đơn hàng</p>
                    <p className="mt-1 text-sm text-gray-500">Chưa có đơn hàng phù hợp.</p>
                </div>
            ) : (
                groupedOrders.map((group) => {
                    const isOpen = openDates.includes(group.date);
                    const groupedDishes = getGroupedDishes(group.orders);
                    const totalDishQuantity = groupedDishes.reduce((total, dish) => total + dish.quantity, 0);

                    return (
                        <div key={group.date} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                            {/* Date header */}
                            <button type="button" onClick={() => toggleDate(group.date)} className="w-full border-b border-gray-100 bg-gray-50 px-5 py-3 text-left transition-colors hover:bg-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900">{group.date}</p>

                                        <p className="mt-0.5 text-xs text-gray-500">{group.orders.length} đơn hàng</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">{totalDishQuantity} phần</span>

                                        {isOpen ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                                    </div>
                                </div>
                            </button>

                            {isOpen && (
                                <>
                                    {/* Kitchen preparation summary */}
                                    <div className="border-b border-gray-100 bg-white px-5 py-5">
                                        <div className="mb-4 flex items-end justify-between gap-3">
                                            <div>
                                                <h2 className="font-semibold text-gray-900">Món cần chuẩn bị</h2>
                                                <p className="mt-1 text-xs text-gray-500">Các món giống nhau đã được gộp và cộng tổng số lượng.</p>
                                            </div>

                                            <span className="whitespace-nowrap rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{groupedDishes.length} món</span>
                                        </div>

                                        {groupedDishes.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                {groupedDishes.map((dish) => (
                                                    <div key={dish.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium text-gray-900">{dish.name}</p>

                                                            <p className="mt-0.5 text-xs text-gray-500">Mã món: {dish.id}</p>
                                                        </div>

                                                        <div className="ml-4 flex shrink-0 items-baseline gap-1">
                                                            <span className="text-xl font-bold text-emerald-600">{dish.quantity}</span>
                                                            <span className="text-xs text-gray-500">phần</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">Không có món trong các đơn hàng này.</p>
                                        )}
                                    </div>

                                    {/* Orders */}
                                    <Table>
                                        <Table.ScrollContainer>
                                            <Table.Content aria-label={`Đơn hàng ngày ${group.date}`}>
                                                <Table.Header>
                                                    <Table.Column isRowHeader>Mã đơn</Table.Column>
                                                    <Table.Column>Khách hàng</Table.Column>
                                                    <Table.Column>Tên món</Table.Column>
                                                    <Table.Column>Trạng thái</Table.Column>
                                                    <Table.Column>Địa chỉ</Table.Column>
                                                    <Table.Column>Ngày đặt</Table.Column>
                                                </Table.Header>

                                                <Table.Body items={group.orders}>
                                                    {(order) => (
                                                        <Table.Row id={String(order.id)}>
                                                            <Table.Cell>
                                                                <span className="font-medium text-gray-900">#{order.id}</span>
                                                            </Table.Cell>

                                                            <Table.Cell>
                                                                <div>
                                                                    <p className="font-medium text-gray-900">{order.user?.name ?? "-"}</p>
                                                                    <p className="text-xs text-gray-500">{order.user?.phone ?? "-"}</p>
                                                                </div>
                                                            </Table.Cell>

                                                            <Table.Cell>
                                                                <span className="text-gray-700">{order.orderItems[0].dish.nameVi}</span>
                                                            </Table.Cell>

                                                            <Table.Cell>
                                                                <button type="button" onClick={() => openStatusModal(order)} className="cursor-pointer">
                                                                    <StatusBadge status={order.status as OrderStatus} />
                                                                </button>
                                                            </Table.Cell>

                                                            <Table.Cell>
                                                                <span className="text-sm text-gray-600">{order.shippingAddress}</span>
                                                            </Table.Cell>
                                                            <Table.Cell>
                                                                <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
                                                            </Table.Cell>
                                                        </Table.Row>
                                                    )}
                                                </Table.Body>
                                            </Table.Content>
                                        </Table.ScrollContainer>
                                    </Table>
                                </>
                            )}

                            <ChangeOrderStatusModal
                                open={statusModal.open}
                                orderId={statusModal.order?.id}
                                currentStatus={statusModal.order?.status as OrderStatus | undefined}
                                loading={isUpdatingStatus}
                                onClose={closeStatusModal}
                                onConfirm={(newStatus) => handleChangeStatus(statusModal.order?.id ?? 0, newStatus)}
                            />
                        </div>
                    );
                })
            )}
        </div>
    );
}
