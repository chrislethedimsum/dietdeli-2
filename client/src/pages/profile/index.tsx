import { useEffect, useState } from "react";
import { Button, Card, Input, Label, ListBox, Select, TextField } from "@heroui/react";
import { Activity, Edit3, Save, ShieldCheck, User, X } from "lucide-react";
import { userApi, type UserProfile, type UpdateMyProfilePayload } from "@/api/user.api";
import { useAlertStore } from "@/store/useAlertStore";
import ChangePasswordModal from "./components/ChangePasswordModal";

type ProfileFormData = {
    name: string;
    phone: string;
    dob: string;
    address: string;
    gender: string;
    height: string;
    weight: string;
    goal: string;
    activityLevel: string;
};

const EMPTY_PROFILE_FORM: ProfileFormData = {
    name: "",
    phone: "",
    dob: "",
    address: "",
    gender: "",
    height: "",
    weight: "",
    goal: "",
    activityLevel: "",
};

const createFormData = (profile: UserProfile): ProfileFormData => ({
    name: profile.name ?? "",
    phone: profile.phone ?? "",
    dob: profile.dob?.slice(0, 10) ?? "",
    address: profile.address ?? "",
    gender: profile.gender ?? "",
    height: profile.height != null ? String(profile.height) : "",
    weight: profile.weight != null ? String(profile.weight) : "",
    goal: profile.goal ?? "",
    activityLevel: profile.activityLevel ?? "",
});

/**
 * HeroUI Input onChange can provide a React change event, while Select can
 * provide a selected key/selection. Never call String(object), which yields
 * "[object Object]".
 */
const getFieldValue = (value: unknown): string => {
    if (typeof value === "string" || typeof value === "number") {
        return String(value);
    }

    if (value instanceof Set) {
        const first = value.values().next();
        return first.done ? "" : getFieldValue(first.value);
    }

    if (value && typeof value === "object") {
        const item = value as Record<string, unknown>;

        if (item.target && typeof item.target === "object") {
            const target = item.target as Record<string, unknown>;
            if ("value" in target) return getFieldValue(target.value);
        }

        if ("currentKey" in item) return getFieldValue(item.currentKey);
        if ("id" in item) return getFieldValue(item.id);
        if ("value" in item) return getFieldValue(item.value);
    }

    return "";
};

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [formData, setFormData] = useState<ProfileFormData>(EMPTY_PROFILE_FORM);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [formError, setFormError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState("");

    const { showAlert } = useAlertStore();

    useEffect(() => {
        let ignore = false;

        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                setLoadError(null);
                const data = await userApi.getMyProfile();
                if (ignore) return;
                setProfile(data);
                setFormData(createFormData(data));
            } catch (err) {
                if (ignore) return;
                console.error("Lỗi lấy thông tin cá nhân:", err);
                setLoadError("Không thể tải thông tin cá nhân. Vui lòng thử lại.");
            } finally {
                if (!ignore) setIsLoading(false);
            }
        };

        void fetchProfile();
        return () => {
            ignore = true;
        };
    }, []);

    const getInitials = (name: string) => {
        if (!name.trim()) return "U";
        return name
            .trim()
            .split(/\s+/)
            .slice(-2)
            .map((item) => item.charAt(0).toUpperCase())
            .join("");
    };

    const getGenderLabel = (gender: string | null) => {
        switch (gender) {
            case "MALE":
                return "Nam";
            case "FEMALE":
                return "Nữ";
            case "OTHER":
                return "Khác";
            default:
                return "Chưa cập nhật";
        }
    };

    const getGoalLabel = (goal: string | null) => {
        switch (goal) {
            case "LOSE_WEIGHT":
                return "Giảm cân";
            case "GAIN_WEIGHT":
                return "Tăng cân";
            case "MAINTAIN_WEIGHT":
                return "Duy trì cân nặng";
            case "BUILD_MUSCLE":
                return "Tăng cơ";
            default:
                return "Chưa cập nhật";
        }
    };

    const getActivityLabel = (activity: string | null) => {
        switch (activity) {
            case "LOW":
                return "Ít vận động";
            case "LIGHT":
                return "Vận động nhẹ";
            case "MODERATE":
                return "Vận động vừa";
            case "HIGH":
                return "Vận động nhiều";
            case "VERY_HIGH":
                return "Vận động rất nhiều";
            default:
                return "Chưa cập nhật";
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return "Chưa cập nhật";
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) return "Chưa cập nhật";
        return parsedDate.toLocaleDateString("vi-VN");
    };

    const updateFormField = (field: keyof ProfileFormData, value: unknown) => {
        setFormData((current) => ({
            ...current,
            [field]: getFieldValue(value),
        }));
        setFormError("");
    };

    const resetForm = () => {
        if (profile) setFormData(createFormData(profile));
        setFormError("");
    };

    const handleEdit = () => {
        resetForm();
        setIsEditing(true);
    };

    const handleCancel = () => {
        resetForm();
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!profile) return;

        const name = formData.name.trim();
        const phone = formData.phone.trim();
        const height = formData.height.trim() ? Number(formData.height) : null;
        const weight = formData.weight.trim() ? Number(formData.weight) : null;

        if (!name) {
            setFormError("Vui lòng nhập họ và tên.");
            return;
        }
        if (!phone) {
            setFormError("Vui lòng nhập số điện thoại.");
            return;
        }
        if (height !== null && (!Number.isFinite(height) || height <= 0)) {
            setFormError("Chiều cao phải là số lớn hơn 0.");
            return;
        }
        if (weight !== null && (!Number.isFinite(weight) || weight <= 0)) {
            setFormError("Cân nặng phải là số lớn hơn 0.");
            return;
        }

        const payload: UpdateMyProfilePayload = {
            name,
            phone,
            dob: formData.dob || null,
            address: formData.address.trim() || null,
            gender: (formData.gender || null) as UpdateMyProfilePayload["gender"],
            height,
            weight,
            goal: (formData.goal || null) as UpdateMyProfilePayload["goal"],
            activityLevel: (formData.activityLevel || null) as UpdateMyProfilePayload["activityLevel"],
        };

        try {
            setSaving(true);
            setFormError("");
            const updatedProfile = await userApi.updateMyProfile(payload);
            setProfile(updatedProfile);
            setFormData(createFormData(updatedProfile));
            setIsEditing(false);
            showAlert("success", "Cập nhật thông tin cá nhân thành công.");
        } catch (err) {
            console.error("Không thể cập nhật thông tin cá nhân:", err);
            showAlert("error", "Cập nhật thông tin thất bại. Vui lòng kiểm tra dữ liệu và thử lại.");
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full min-h-0 items-center justify-center">
                <p className="text-sm text-gray-500">Đang tải thông tin cá nhân...</p>
            </div>
        );
    }

    if (loadError || !profile) {
        return (
            <div className="flex h-full min-h-0 flex-col items-center justify-center gap-4">
                <p className="text-sm text-red-500">{loadError ?? "Không tìm thấy thông tin cá nhân."}</p>
                <Button variant="secondary" onPress={() => window.location.reload()}>
                    Thử lại
                </Button>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="mb-6 shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
                <p className="mt-1 text-sm text-gray-500">Quản lý thông tin tài khoản và thông tin cá nhân</p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-2">
                <div className="space-y-5 pb-6">
                    <Card className="rounded-xl border border-gray-200 shadow-sm">
                        <Card.Content className="p-6">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-2xl font-bold text-emerald-600">{getInitials(profile.name)}</div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">{profile.isAdmin ? "Quản trị viên" : "Người dùng"}</span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">{profile.email}</p>
                                </div>
                                {!isEditing && (
                                    <Button variant="secondary" onPress={handleEdit}>
                                        <Edit3 size={16} />
                                        Chỉnh sửa
                                    </Button>
                                )}
                            </div>
                        </Card.Content>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 shadow-sm">
                        <Card.Header className="border-b border-gray-100 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <User size={18} className="text-emerald-600" />
                                <div>
                                    <Card.Title>Thông tin cơ bản</Card.Title>
                                    <Card.Description>Thông tin liên hệ và thông tin cá nhân</Card.Description>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Content className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                            <TextField className="w-full">
                                <Label>Họ và tên</Label>
                                <Input
                                    value={isEditing ? formData.name : profile.name}
                                    onChange={(value) => updateFormField("name", value)}
                                    readOnly={!isEditing}
                                    placeholder="Nhập họ và tên"
                                    variant="secondary"
                                />
                            </TextField>
                            <TextField className="w-full">
                                <Label>Email</Label>
                                <Input value={profile.email} readOnly variant="secondary" />
                            </TextField>
                            <TextField className="w-full">
                                <Label>Số điện thoại</Label>
                                <Input
                                    value={isEditing ? formData.phone : profile.phone || "Chưa cập nhật"}
                                    onChange={(value) => updateFormField("phone", value)}
                                    readOnly={!isEditing}
                                    placeholder="Nhập số điện thoại"
                                    variant="secondary"
                                />
                            </TextField>
                            <TextField className="w-full">
                                <Label>Ngày sinh</Label>
                                {isEditing ? (
                                    <Input type="date" value={formData.dob} onChange={(value) => updateFormField("dob", value)} variant="secondary" />
                                ) : (
                                    <Input value={formatDate(profile.dob)} readOnly variant="secondary" />
                                )}
                            </TextField>

                            <div className="w-full">
                                {isEditing ? (
                                    <Select className="w-full" value={formData.gender} onChange={(value) => updateFormField("gender", value)} variant="primary">
                                        <Label>Giới tính</Label>
                                        <Select.Trigger>
                                            <Select.Value />
                                            <Select.Indicator />
                                        </Select.Trigger>
                                        <Select.Popover>
                                            <ListBox>
                                                <ListBox.Item id="MALE" textValue="Nam">
                                                    Nam
                                                    <ListBox.ItemIndicator />
                                                </ListBox.Item>
                                                <ListBox.Item id="FEMALE" textValue="Nữ">
                                                    Nữ
                                                    <ListBox.ItemIndicator />
                                                </ListBox.Item>
                                                <ListBox.Item id="OTHER" textValue="Khác">
                                                    Khác
                                                    <ListBox.ItemIndicator />
                                                </ListBox.Item>
                                            </ListBox>
                                        </Select.Popover>
                                    </Select>
                                ) : (
                                    <TextField className="w-full">
                                        <Label>Giới tính</Label>
                                        <Input value={getGenderLabel(profile.gender)} readOnly variant="secondary" />
                                    </TextField>
                                )}
                            </div>

                            <TextField className="w-full">
                                <Label>Địa chỉ</Label>
                                <Input
                                    value={isEditing ? formData.address : profile.address || "Chưa cập nhật"}
                                    onChange={(value) => updateFormField("address", value)}
                                    readOnly={!isEditing}
                                    placeholder="Nhập địa chỉ"
                                    variant="secondary"
                                />
                            </TextField>
                        </Card.Content>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 shadow-sm">
                        <Card.Header className="border-b border-gray-100 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <Activity size={18} className="text-emerald-600" />
                                <div>
                                    <Card.Title>Chỉ số cơ thể</Card.Title>
                                    <Card.Description>Chiều cao và cân nặng hiện tại</Card.Description>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Content className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                            <TextField className="w-full">
                                <Label>Chiều cao (cm)</Label>
                                <Input
                                    type={isEditing ? "number" : "text"}
                                    min={1}
                                    value={isEditing ? formData.height : profile.height != null ? `${profile.height} cm` : "Chưa cập nhật"}
                                    onChange={(value) => updateFormField("height", value)}
                                    readOnly={!isEditing}
                                    placeholder="Ví dụ: 170"
                                    variant="secondary"
                                />
                            </TextField>
                            <TextField className="w-full">
                                <Label>Cân nặng (kg)</Label>
                                <Input
                                    type={isEditing ? "number" : "text"}
                                    min={1}
                                    value={isEditing ? formData.weight : profile.weight != null ? `${profile.weight} kg` : "Chưa cập nhật"}
                                    onChange={(value) => updateFormField("weight", value)}
                                    readOnly={!isEditing}
                                    placeholder="Ví dụ: 65"
                                    variant="secondary"
                                />
                            </TextField>
                        </Card.Content>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 shadow-sm">
                        <Card.Header className="border-b border-gray-100 px-6 py-4">
                            <Card.Title>Mục tiêu dinh dưỡng</Card.Title>
                            <Card.Description>Mục tiêu và mức độ vận động</Card.Description>
                        </Card.Header>
                        <Card.Content className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                            <div className="w-full">
                                {isEditing ? (
                                    <Select className="w-full" value={formData.goal} onChange={(value) => updateFormField("goal", value)} variant="primary">
                                        <Label>Mục tiêu</Label>
                                        <Select.Trigger>
                                            <Select.Value />
                                            <Select.Indicator />
                                        </Select.Trigger>
                                        <Select.Popover>
                                            <ListBox>
                                                <ListBox.Item id="LOSE_WEIGHT" textValue="Giảm cân">
                                                    Giảm cân
                                                    <ListBox.ItemIndicator />
                                                </ListBox.Item>
                                                <ListBox.Item id="GAIN_WEIGHT" textValue="Tăng cân">
                                                    Tăng cân
                                                    <ListBox.ItemIndicator />
                                                </ListBox.Item>
                                                <ListBox.Item id="MAINTAIN_WEIGHT" textValue="Duy trì cân nặng">
                                                    Duy trì cân nặng
                                                    <ListBox.ItemIndicator />
                                                </ListBox.Item>
                                                <ListBox.Item id="BUILD_MUSCLE" textValue="Tăng cơ">
                                                    Tăng cơ
                                                    <ListBox.ItemIndicator />
                                                </ListBox.Item>
                                            </ListBox>
                                        </Select.Popover>
                                    </Select>
                                ) : (
                                    <TextField className="w-full">
                                        <Label>Mục tiêu</Label>
                                        <Input value={getGoalLabel(profile.goal)} readOnly variant="secondary" />
                                    </TextField>
                                )}
                            </div>
                            <div className="w-full">
                                {isEditing ? (
                                    <Select className="w-full" value={formData.activityLevel} onChange={(value) => updateFormField("activityLevel", value)} variant="primary">
                                        <Label>Mức độ vận động</Label>
                                        <Select.Trigger>
                                            <Select.Value />
                                            <Select.Indicator />
                                        </Select.Trigger>
                                        <Select.Popover>
                                            <ListBox>
                                                <ListBox.Item id="LOW" textValue="Ít vận động">
                                                    Ít vận động
                                                    <ListBox.ItemIndicator />
                                                </ListBox.Item>
                                                <ListBox.Item id="LIGHT" textValue="Vận động nhẹ">
                                                    Vận động nhẹ
                                                    <ListBox.ItemIndicator />
                                                </ListBox.Item>
                                                <ListBox.Item id="MODERATE" textValue="Vận động vừa">
                                                    Vận động vừa
                                                    <ListBox.ItemIndicator />
                                                </ListBox.Item>
                                                <ListBox.Item id="HIGH" textValue="Vận động nhiều">
                                                    Vận động nhiều
                                                    <ListBox.ItemIndicator />
                                                </ListBox.Item>
                                                <ListBox.Item id="VERY_HIGH" textValue="Vận động rất nhiều">
                                                    Vận động rất nhiều
                                                    <ListBox.ItemIndicator />
                                                </ListBox.Item>
                                            </ListBox>
                                        </Select.Popover>
                                    </Select>
                                ) : (
                                    <TextField className="w-full">
                                        <Label>Mức độ vận động</Label>
                                        <Input value={getActivityLabel(profile.activityLevel)} readOnly variant="secondary" />
                                    </TextField>
                                )}
                            </div>
                        </Card.Content>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 shadow-sm">
                        <Card.Header className="border-b border-gray-100 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={18} className="text-emerald-600" />
                                <div>
                                    <Card.Title>Bảo mật tài khoản</Card.Title>
                                    <Card.Description>Quản lý mật khẩu và bảo mật tài khoản</Card.Description>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Content className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Mật khẩu</p>
                                <p className="mt-1 text-sm text-gray-500">Nên thay đổi mật khẩu định kỳ để bảo vệ tài khoản.</p>
                            </div>
                            <Button
                                onPress={() => {
                                    setIsChangingPassword(true);
                                }}
                            >
                                Đổi mật khẩu
                            </Button>
                        </Card.Content>
                    </Card>

                    {formError && <p className="text-sm text-red-600">{formError}</p>}
                </div>
            </div>

            {isEditing && (
                <div className="sticky bottom-0 z-20 mt-4 shrink-0 border-t border-gray-200 bg-white/95 px-6 py-4 backdrop-blur">
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onPress={handleCancel} isDisabled={saving}>
                            <X size={16} />
                            Hủy
                        </Button>
                        <Button variant="primary" onPress={handleSave} isDisabled={saving}>
                            <Save size={16} />
                            {saving ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                    </div>
                </div>
            )}

            <ChangePasswordModal isOpen={isChangingPassword} onClose={() => setIsChangingPassword(false)} onSuccess={() => showAlert("success", "Đổi mật khẩu thành công")} />
        </div>
    );
}
