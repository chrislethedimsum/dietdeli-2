import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Card, Button, Table } from "@heroui/react";
import { Plus, Pencil, Trash2, Package, CheckCircle2, Ban, Wallet, Power } from "lucide-react";

import { mealPackagesApi, type MealPackage, type CreateMealPackageDto } from "@/api/meal-package.api";
import PackageModal from "./components/PackageModal";
import { useAlertStore } from "@/store/useAlertStore";
import { formatCurrency, getErrorMessage } from "@/utils";
import ConfirmModal from "@/components/common/ConfirmModal";

/**
 * Chuẩn hóa dữ liệu trả về từ API.
 * Những trường số có thể được serialize thành string.
 */
function normalizePackage(item: MealPackage): MealPackage {
    return {
        ...item,
        id: Number(item.id),
        name: item.name ?? "",
        description: item.description ?? "",
        caloriesPerMeal: Number(item.caloriesPerMeal) || 0,
        durationDays: Number(item.durationDays) || 0,
        totalMeals: Number(item.totalMeals) || 0,
        price: Number(item.price) || 0,
        isActive: Boolean(item.isActive),
    };
}

/* =========================
   Skeleton components
========================= */

function Skeleton({ className = "" }: { className?: string }) {
    return <div aria-hidden="true" className={`animate-pulse rounded-md bg-gray-200 ${className}`} />;
}

function PackageStatsSkeleton() {
    return (
        <Card>
            <Card.Content className="flex flex-row items-center justify-between gap-4 p-5">
                <div className="min-w-0 flex-1 space-y-3">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-3 w-36 max-w-full" />
                </div>

                <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
            </Card.Content>
        </Card>
    );
}

function PackageTableSkeleton() {
    return (
        <div className="min-w-[950px]" role="status" aria-label="Đang tải danh sách gói ăn">
            {/* Header skeleton */}
            <div className="grid grid-cols-7 gap-4 border-b border-gray-100 px-5 py-3">
                {Array.from({ length: 7 }).map((_, index) => (
                    <Skeleton key={index} className="h-3 w-full max-w-24" />
                ))}
            </div>

            {/* Table rows skeleton */}
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="grid grid-cols-7 items-center gap-4 border-b border-gray-100 px-5 py-5">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-28 max-w-full" />
                        <Skeleton className="h-3 w-36 max-w-full" />
                    </div>

                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-24 rounded-full" />

                    <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function PackageMobileSkeleton() {
    return (
        <div className="space-y-3 px-4 pb-5 md:hidden" role="status" aria-label="Đang tải danh sách gói ăn">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-xl border border-gray-200 bg-white p-4">
                    {/* Tên và trạng thái */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-2">
                            <Skeleton className="h-4 w-36 max-w-full" />
                            <Skeleton className="h-3 w-full max-w-48" />
                            <Skeleton className="h-3 w-28" />
                        </div>

                        <Skeleton className="h-6 w-24 shrink-0 rounded-full" />
                    </div>

                    {/* Thông tin gói */}
                    <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                        {Array.from({ length: 4 }).map((_, itemIndex) => (
                            <div key={itemIndex} className="space-y-2">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-4 w-24 max-w-full" />
                            </div>
                        ))}
                    </div>

                    {/* Các nút thao tác */}
                    <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-3">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* =========================
   Shared components
========================= */

function StatCard({ title, value, description, icon, iconClass }: { title: string; value: string | number; description: string; icon: ReactNode; iconClass: string }) {
    return (
        <Card>
            <Card.Content className="flex flex-row items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
                    <p className="mt-1 text-xs text-gray-500">{description}</p>
                </div>

                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>{icon}</div>
            </Card.Content>
        </Card>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex min-w-0 flex-col gap-1">
            <span className="text-xs text-gray-400">{label}</span>
            <span className="break-words text-sm font-medium text-gray-700">{value}</span>
        </div>
    );
}

/* =========================
   Main page
========================= */

export default function MealPackagesAdminPage() {
    const [packages, setPackages] = useState<MealPackage[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<MealPackage | null>(null);

    const [pageError, setPageError] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmItem, setConfirmItem] = useState<MealPackage | null>(null);
    const [confirmAction, setConfirmAction] = useState<"toggle" | "delete">("toggle");

    const { showAlert } = useAlertStore();

    /* Fetch packages */

    const fetchPackages = async () => {
        setLoading(true);
        setPageError("");

        try {
            const response = await mealPackagesApi.getAll();
            const data = response.data;

            setPackages(Array.isArray(data) ? data.map((item) => normalizePackage(item)) : []);
        } catch (error) {
            setPageError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchPackages();
    }, []);

    /* Statistics */

    const stats = useMemo(() => {
        const activePackages = packages.filter((item) => item.isActive);
        const inactivePackages = packages.filter((item) => !item.isActive);

        return {
            total: packages.length,
            active: activePackages.length,
            inactive: inactivePackages.length,
            averagePrice: packages.length > 0 ? Math.round(packages.reduce((sum, item) => sum + Number(item.price), 0) / packages.length) : 0,
        };
    }, [packages]);

    /* Create / edit modal */

    const openCreateModal = () => {
        setEditingPackage(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item: MealPackage) => {
        setEditingPackage(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPackage(null);
    };

    const handleSavePackage = async (form: CreateMealPackageDto) => {
        try {
            if (editingPackage) {
                await mealPackagesApi.update(editingPackage.id, form);
                showAlert("success", "Cập nhật gói suất ăn thành công.");
            } else {
                await mealPackagesApi.create(form);
                showAlert("success", "Tạo gói suất ăn thành công.");
            }

            closeModal();
            await fetchPackages();
        } catch (error) {
            showAlert("error", getErrorMessage(error));
            throw error;
        }
    };

    /* Toggle status / delete confirmation */

    const handleToggleStatus = (item: MealPackage) => {
        setConfirmItem(item);
        setConfirmAction("toggle");
        setConfirmOpen(true);
    };

    const handleDeletePackage = (item: MealPackage) => {
        setConfirmItem(item);
        setConfirmAction("delete");
        setConfirmOpen(true);
    };

    const handleConfirmAction = async () => {
        if (!confirmItem) return;

        const item = confirmItem;

        setActionLoadingId(item.id);

        try {
            if (confirmAction === "toggle") {
                await mealPackagesApi.toggleStatus(item.id);

                showAlert("success", item.isActive ? "Đã ngừng hoạt động gói ăn." : "Đã kích hoạt gói ăn.");
            } else {
                await mealPackagesApi.delete(item.id);
                showAlert("success", "Đã xóa gói ăn thành công.");
            }

            setConfirmOpen(false);
            setConfirmItem(null);

            await fetchPackages();
        } catch (error) {
            showAlert("error", getErrorMessage(error));
        } finally {
            setActionLoadingId(null);
        }
    };

    /* Render */

    return (
        <div className="space-y-6 p-4 md:p-6">
            {/* Page header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý gói suất ăn</h1>
                    <p className="mt-1 text-sm text-gray-500">Quản lý các gói dinh dưỡng, thời hạn, số bữa và giá bán.</p>
                </div>

                <Button variant="primary" onPress={openCreateModal} className="w-full sm:w-auto">
                    <Plus size={18} />
                    Thêm gói mới
                </Button>
            </div>

            {/* API error */}
            {pageError && (
                <div role="alert" className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
                    <span>{pageError}</span>

                    <Button variant="secondary" onPress={() => void fetchPackages()}>
                        Thử lại
                    </Button>
                </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {loading ? (
                    <>
                        <PackageStatsSkeleton />
                        <PackageStatsSkeleton />
                        <PackageStatsSkeleton />
                        <PackageStatsSkeleton />
                    </>
                ) : (
                    <>
                        <StatCard title="Tổng số gói" value={stats.total} description="Tất cả gói suất ăn" icon={<Package size={23} />} iconClass="bg-blue-50 text-blue-600" />

                        <StatCard title="Đang hoạt động" value={stats.active} description="Gói đang được kinh doanh" icon={<CheckCircle2 size={23} />} iconClass="bg-emerald-50 text-emerald-600" />

                        <StatCard title="Ngừng hoạt động" value={stats.inactive} description="Gói đã tạm ngừng" icon={<Ban size={23} />} iconClass="bg-amber-50 text-amber-600" />

                        <StatCard
                            title="Giá trung bình"
                            value={formatCurrency(stats.averagePrice)}
                            description="Trung bình trên tất cả gói"
                            icon={<Wallet size={23} />}
                            iconClass="bg-violet-50 text-violet-600"
                        />
                    </>
                )}
            </div>

            {/* Package list */}
            <Card variant="default" className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <Card.Header className="border-b border-gray-100 p-5">
                    <Card.Title className="text-lg font-semibold">Danh sách gói ăn</Card.Title>

                    <Card.Description>Quản lý thông tin, giá và trạng thái các gói ăn DietDeli.</Card.Description>
                </Card.Header>

                {/* Result count */}
                <div className="px-5 py-4">
                    {loading ? (
                        <Skeleton className="h-4 w-36" />
                    ) : (
                        <p className="text-sm text-gray-500">
                            Hiển thị <span className="font-semibold text-gray-900">{packages.length}</span> gói ăn
                        </p>
                    )}
                </div>

                {/* Desktop table */}
                <div className="hidden overflow-x-auto md:block">
                    {loading ? (
                        <PackageTableSkeleton />
                    ) : (
                        <Table>
                            <Table.ScrollContainer>
                                <Table.Content aria-label="Danh sách gói ăn" className="min-w-[950px]">
                                    <Table.Header>
                                        <Table.Column isRowHeader id="package" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Gói ăn
                                        </Table.Column>

                                        <Table.Column id="calories" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Calories
                                        </Table.Column>

                                        <Table.Column id="duration" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Thời hạn
                                        </Table.Column>

                                        <Table.Column id="meals" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Số suất
                                        </Table.Column>

                                        <Table.Column id="price" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Giá
                                        </Table.Column>

                                        <Table.Column id="status" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Trạng thái
                                        </Table.Column>

                                        <Table.Column id="actions" className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Thao tác
                                        </Table.Column>
                                    </Table.Header>

                                    <Table.Body items={packages} renderEmptyState={() => <div className="py-10 text-center text-sm text-gray-500">Không tìm thấy gói ăn</div>}>
                                        {(item) => (
                                            <Table.Row id={String(item.id)} className="border-b border-gray-100 transition hover:bg-gray-50">
                                                {/* Package name */}
                                                <Table.Cell className="px-5 py-4">
                                                    <div className="min-w-[180px]">
                                                        <p className="text-sm font-semibold text-gray-900">{item.name}</p>

                                                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">{item.description || "Chưa có mô tả"}</p>
                                                    </div>
                                                </Table.Cell>

                                                {/* Calories */}
                                                <Table.Cell className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">{item.caloriesPerMeal.toLocaleString("vi-VN")} kcal</Table.Cell>

                                                {/* Duration */}
                                                <Table.Cell className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">{item.durationDays} ngày</Table.Cell>

                                                {/* Total meals */}
                                                <Table.Cell className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">{item.totalMeals} suất</Table.Cell>

                                                {/* Price */}
                                                <Table.Cell className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-900">{formatCurrency(item.price)}</Table.Cell>

                                                {/* Status */}
                                                <Table.Cell className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                                                            item.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                                                        }`}
                                                    >
                                                        {item.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                                                    </span>
                                                </Table.Cell>

                                                {/* Actions */}
                                                <Table.Cell className="px-5 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button isIconOnly size="sm" variant="ghost" aria-label="Chỉnh sửa gói ăn" onPress={() => openEditModal(item)}>
                                                            <Pencil size={16} />
                                                        </Button>

                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="ghost"
                                                            aria-label={item.isActive ? "Ngừng hoạt động" : "Kích hoạt"}
                                                            onPress={() => handleToggleStatus(item)}
                                                            isDisabled={actionLoadingId === item.id}
                                                        >
                                                            <Power size={16} />
                                                        </Button>

                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="ghost"
                                                            aria-label="Xóa gói ăn"
                                                            onPress={() => handleDeletePackage(item)}
                                                            isDisabled={actionLoadingId === item.id}
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </div>
                                                </Table.Cell>
                                            </Table.Row>
                                        )}
                                    </Table.Body>
                                </Table.Content>
                            </Table.ScrollContainer>
                        </Table>
                    )}
                </div>

                {/* Mobile cards */}
                {loading ? (
                    <PackageMobileSkeleton />
                ) : (
                    <div className="space-y-3 px-4 pb-5 md:hidden">
                        {packages.map((item) => (
                            <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4">
                                {/* Package name and status */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="break-words text-sm font-semibold text-gray-900">{item.name}</h3>

                                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">{item.description || "Chưa có mô tả"}</p>
                                    </div>

                                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${item.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                                        {item.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                                    </span>
                                </div>

                                {/* Package information */}
                                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-gray-100 pt-4">
                                    <InfoRow label="Calories" value={`${item.caloriesPerMeal.toLocaleString("vi-VN")} kcal`} />

                                    <InfoRow label="Thời hạn" value={`${item.durationDays} ngày`} />

                                    <InfoRow label="Số suất" value={`${item.totalMeals} suất`} />

                                    <InfoRow label="Giá" value={formatCurrency(item.price)} />
                                </div>

                                {/* Actions */}
                                <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                                    <Button isIconOnly size="sm" variant="ghost" aria-label="Chỉnh sửa gói ăn" onPress={() => openEditModal(item)}>
                                        <Pencil size={16} />
                                    </Button>

                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="ghost"
                                        aria-label={item.isActive ? "Ngừng hoạt động" : "Kích hoạt"}
                                        onPress={() => handleToggleStatus(item)}
                                        isDisabled={actionLoadingId === item.id}
                                    >
                                        <Power size={16} />
                                    </Button>

                                    <Button isIconOnly size="sm" variant="ghost" aria-label="Xóa gói ăn" onPress={() => handleDeletePackage(item)} isDisabled={actionLoadingId === item.id}>
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {packages.length === 0 && (
                            <div className="py-12 text-center">
                                <p className="text-sm text-gray-500">Không tìm thấy gói ăn</p>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Create / edit modal */}
            {isModalOpen && (
                <PackageModal
                    isOpen={isModalOpen}
                    initialData={editingPackage}
                    onOpenChange={(open) => {
                        setIsModalOpen(open);

                        if (!open) {
                            setEditingPackage(null);
                        }
                    }}
                    onSave={handleSavePackage}
                />
            )}

            {/* Confirmation modal */}
            <ConfirmModal
                isOpen={confirmOpen}
                onOpenChange={(open) => {
                    if (actionLoadingId !== null) return;

                    setConfirmOpen(open);

                    if (!open) {
                        setConfirmItem(null);
                    }
                }}
                title={confirmAction === "delete" ? "Xác nhận xóa gói ăn" : "Xác nhận thay đổi trạng thái"}
                description={
                    confirmItem
                        ? confirmAction === "delete"
                            ? `Bạn có chắc muốn xóa gói "${confirmItem.name}" không?`
                            : `Bạn có chắc muốn ${confirmItem.isActive ? "ngừng hoạt động" : "kích hoạt"} gói "${confirmItem.name}" không?`
                        : "Bạn có chắc chắn muốn thực hiện thao tác này?"
                }
                confirmText={confirmAction === "delete" ? "Xóa gói" : "Xác nhận"}
                cancelText="Hủy"
                onConfirm={handleConfirmAction}
                loading={actionLoadingId !== null}
            />
        </div>
    );
}
