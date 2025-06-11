import { apiClient } from "../../client";
import type { Category } from "./categories.types";

const CATEGORIES_ENDPOINT = "/event/api/v1/categories";

export const categoriesApi = {
  // Получить все категории
  async getAll(): Promise<Category[]> {
    return apiClient.get<Category[]>(CATEGORIES_ENDPOINT);
  },

  // Получить категорию по ID
  async getById(id: string | number): Promise<Category> {
    return apiClient.get<Category>(`${CATEGORIES_ENDPOINT}/${id}`);
  },
};
