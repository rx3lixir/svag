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
  // Получить все события c обработкой фильтров
  async getAll(filters?: EventFilters): Promise<EventsListResponse> {
    const cleanFilters: Record<string, any> = {};

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          cleanFilters[key] = value;
        }
      });
    }

    console.log("API getAll called with filters:", cleanFilters);

    return apiClient.get<EventsListResponse>(EVENTS_ENDPOINT, filters);
  },

  // Получить конкретное по id
  async getById(id: string | number): Promise<Event> {
    return apiClient.get<Event>(`${EVENTS_ENDPOINT}/${id}`);
  },

  // Получить события по категории
  async getByCategory(
    categoryId: number,
    filters?: EventFilters,
  ): Promise<EventsListResponse> {
    const cleanFilters: Record<string, any> = {
      category_id: categoryId,
    };

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          key !== "category_id"
        ) {
          cleanFilters[key] = value;
        }
      });
    }

    console.log("API getByCategory called with filters:", cleanFilters);

    return apiClient.get<EventsListResponse>(EVENTS_ENDPOINT, cleanFilters);
  },

  // Поиск событий
  async search(filters: SearchFilters): Promise<EventsListResponse> {
    return apiClient.post<EventsListResponse>(
      `${EVENTS_ENDPOINT}/search`,
      filters,
    );
  },

  // Получить подсказки
  async getSuggestions(
    request: SuggesionRequest,
  ): Promise<SuggestionsResponse> {
    return apiClient.get<SuggestionsResponse>(
      `${EVENTS_ENDPOINT}/suggestions`,
      {
        q: request.query,
        max_results: request.max_results || 10,
        fields: request.fields?.join(",") || `name, location`,
      },
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
