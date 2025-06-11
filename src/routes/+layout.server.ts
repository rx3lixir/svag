import { categoriesApi } from "$lib/api";

export const load = async () => {
  try {
    const categories = await categoriesApi.getAll();
    return { categories };
  } catch (error) {
    console.error("Failed to load categories:", error);
    return { categories: [] };
  }
};
