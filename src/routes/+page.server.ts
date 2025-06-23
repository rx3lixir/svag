import { eventsApi } from "$lib";

export const load = async () => {
  try {
    // ИСПРАВЛЕНО: Загружаем первые события с правильной пагинацией
    const eventsResponse = await eventsApi.getAll({
      limit: 3, // ИСПРАВЛЕНО: Используем 3 для тестирования пагинации
      offset: 0,
      include_count: true, // Получаем общее количество
    });

    console.log("Server loaded events:", {
      eventsCount: eventsResponse.events?.length || 0,
      pagination: eventsResponse.pagination,
    });

    return {
      events: eventsResponse.events || [],
      pagination: eventsResponse.pagination || {
        total_count: eventsResponse.events?.length || 0,
        limit: 3, // ИСПРАВЛЕНО: Используем 3
        offset: 0,
        has_more: false,
      },
    };
  } catch (error) {
    console.error("Failed to load events:", error);
    return {
      events: [],
      pagination: {
        total_count: 0,
        limit: 3, // ИСПРАВЛЕНО: Используем 3
        offset: 0,
        has_more: false,
      },
    };
  }
};
