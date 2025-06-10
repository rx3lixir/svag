import { categoriesApi, type LayoutServerLoad } from "$lib/api";

export const load: LayoutServerLoad = async () => {
  try {
    const categories = await categoriesApi.getAll();

    return { categories };
  } catch (error) {
    console.error("Failed to load categories:", error);

    return {
      categories: [],
    };
  }
};
