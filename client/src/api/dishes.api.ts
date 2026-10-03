import axiosClient from "./axiosClient";

export interface AddDishData {
    nameVi: string;
    nameEn: string;
    descriptionVi: string;
    descriptionEn: string;
    image: File | null;
}

export const getDishes = async () => {
    const result = await axiosClient.get("/dish");

    return result.data;
};

export const getDishById = async (id: number) => {
    const result = await axiosClient.get(`/dish/${id}`);

    return result.data;
}

export const addDish = async (data: AddDishData) => {
    const formData = new FormData();
    formData.append("nameVi", data.nameVi);
    formData.append("nameEn", data.nameEn);
    formData.append("descriptionVi", data.descriptionVi);
    formData.append("descriptionEn", data.descriptionEn);
    if (data.image) {
        formData.append("image", data.image);
    }

    const result = await axiosClient.post("/dish", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return result.data;
};

export const updateDish = async (id: number, data: AddDishData) => {
    const formData = new FormData();
    formData.append("nameVi", data.nameVi);
    formData.append("nameEn", data.nameEn);
    formData.append("descriptionVi", data.descriptionVi);
    formData.append("descriptionEn", data.descriptionEn);
    if (data.image) {
        formData.append("image", data.image);
    }

    const result = await axiosClient.patch(`/dish/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return result.data;
};

export const deleteDish = async (id: number) => {
    const result = await axiosClient.patch(`/dish/${id}/delete`);

    return result.data;
}