import axiosClient from "./axiosClient";

export type AddMenuFormData = {
    dishId: number;
    date: string;
};

export type Menu = {
    id: number;
    dishId: number;
    date: string;
    dish: {
        id: number;
        nameVi: string;
        nameEn: string;
        image?: string | null;
        calories?: number | null;
        isDeleted: boolean;
    };
};

/**
 * POST /api/menus
 *
 * Thêm món vào menu
 */
export const createMenu = async (data: AddMenuFormData) => {
    const response = await axiosClient.post("/menus", data);

    return response.data;
};

/**
 * GET /api/menus
 *
 * Lấy tất cả menu
 */
export const getMenus = async () => {
    const response = await axiosClient.get("/menus");

    return response.data;
};

/**
 * GET /api/menus?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 *
 * Lấy menu theo khoảng ngày
 */
export const getMenusByDateRange = async (startDate: string, endDate: string) => {
    const response = await axiosClient.get("/menus", {
        params: {
            startDate,
            endDate,
        },
    });

    return response.data;
};

/**
 * GET /api/menus/:id
 *
 * Lấy menu theo ID
 */
export const getMenuById = async (id: number) => {
    const response = await axiosClient.get(`/menus/${id}`);

    return response.data;
};

/**
 * PATCH /api/menus/:id
 *
 * Cập nhật menu
 */
export const updateMenu = async (id: number, data: AddMenuFormData) => {
    const response = await axiosClient.patch(`/menus/${id}`, data);

    return response.data;
};

/**
 * DELETE /api/menus/:id
 *
 * Xoá menu
 */
export const deleteMenu = async (id: number) => {
    const response = await axiosClient.delete(`/menus/${id}`);

    return response.data;
};
