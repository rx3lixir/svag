import { apiClient } from "$lib/api/client";
import type { PaginationParams } from "$lib/api/types/common";
import type {
  Event,
  EventFilters,
  EventsListResponse,
  SearchFilters,
  SuggesionRequest,
  SuggestionsResponse,
} from "./events.types";

const EVENTS_ENDPOINT = "/event/api/v1/events";

export const eventsApi = {
  // ИСПРАВЛЕНО: Получить все события c правильной обработкой фильтров
  async getAll(filters?: EventFilters): Promise<EventsListResponse> {
    // ИСПРАВЛЕНО: Правильная очистка фильтров
    const cleanFilters: Record<string, any> = {};

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        // Проверяем на null, undefined, пустые строки и пустые массивы
        if (value !== undefined && value !== null && value !== "") {
          // Для массивов проверяем что они не пустые
          if (Array.isArray(value)) {
            if (value.length > 0) {
              cleanFilters[key] = value;
            }
          } else {
            cleanFilters[key] = value;
          }
        }
      });
    }

    console.log("API getAll called with filters:", cleanFilters);

    return apiClient.get<EventsListResponse>(EVENTS_ENDPOINT, cleanFilters);
  },

  // Получить конкретное по id
  async getById(id: string | number): Promise<Event> {
    return apiClient.get<Event>(`${EVENTS_ENDPOINT}/${id}`);
  },

  // ИСПРАВЛЕНО: Получить события по категории
  async getByCategory(
    categoryId: number,
    filters?: EventFilters,
  ): Promise<EventsListResponse> {
    const cleanFilters: Record<string, any> = {
      category_ids: [categoryId], // ИСПРАВЛЕНО: передаем как массив
    };

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          key !== "category_id" &&
          key !== "category_ids" // избегаем дублирования
        ) {
          // Для массивов проверяем что они не пустые
          if (Array.isArray(value)) {
            if (value.length > 0) {
              cleanFilters[key] = value;
            }
          } else {
            cleanFilters[key] = value;
          }
        }
      });
    }

    console.log("API getByCategory called with filters:", cleanFilters);

    return apiClient.get<EventsListResponse>(EVENTS_ENDPOINT, cleanFilters);
  },

  // Поиск событий
  async search(filters: SearchFilters): Promise<EventsListResponse> {
    // ИСПРАВЛЕНО: Очищаем фильтры перед отправкой
    const cleanFilters: SearchFilters = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            cleanFilters[key as keyof SearchFilters] = value as any;
          }
        } else {
          cleanFilters[key as keyof SearchFilters] = value as any;
        }
      }
    });

    console.log("API search called with filters:", cleanFilters);

    return apiClient.post<EventsListResponse>(
      `${EVENTS_ENDPOINT}/search`,
      cleanFilters,
    );
  },

  // Получить подсказки
  async getSuggestions(
    request: SuggesionRequest,
  ): Promise<SuggestionsResponse> {
    // ИСПРАВЛЕНО: Правильная передача параметров для suggestions
    const params: Record<string, any> = {
      q: request.query,
      max_results: request.max_results || 10,
    };

    if (request.fields && request.fields.length > 0) {
      params.fields = request.fields.join(",");
    }

    return apiClient.get<SuggestionsResponse>(
      `${EVENTS_ENDPOINT}/suggestions`,
      params,
    );
  },

  // Вспомогательные методы для удобства
  async getAllEvents(filters?: EventFilters): Promise<Event[]> {
    const response = await this.getAll(filters);
    return response.events;
  },

  async getEventsByCategory(
    categoryId: number,
    filters?: EventFilters & PaginationParams,
  ): Promise<Event[]> {
    const response = await this.getByCategory(categoryId, filters);
    return response.events;
  },
};
