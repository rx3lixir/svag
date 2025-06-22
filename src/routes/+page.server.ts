// src/routes/+page.server.ts
import { eventsApi } from "$lib";

export const load = async () => {
  try {
    // Загружаем первые события с пагинацией для начального состояния
    const eventsResponse = await eventsApi.getAll({
      limit: 3, // Для тестирования используем по 3 события
      offset: 0,
      include_count: true, // Получаем общее количество
    });

    return {
      events: eventsResponse.events || [],
      pagination: eventsResponse.pagination || null,
    };
  } catch (error) {
    console.error("Failed to load events:", error);
    return {
      events: [],
      pagination: {
        total_count: 0,
        limit: 3,
        offset: 0,
        has_more: false,
      },
    };
  }
};
