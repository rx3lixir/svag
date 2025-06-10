import { apiClient } from "$lib/api/client";
import type { PaginationParams } from "$lib/api/types/common";
import type { Event, EventFilters } from "./events.types.ts";

const EVENTS_ENDPOINT = "/event/api/v1/events";

export const eventsApi = {
  // Получить все события
  async getAll(filters?: EventFilters & PaginationParams): Promise<Event[]> {
    return apiClient.get<Event[]>(EVENTS_ENDPOINT, filters);
  },

  // Получить конкретное по id
  async getById(id: string | number): Promise<Event> {
    return apiClient.get<Event>(`${EVENTS_ENDPOINT}/${id}`);
  },

  // Получить события по категории
  async getByCategory(
    categoryId: number,
    filters?: EventFilters & PaginationParams,
  ): Promise<Event[]> {
    return apiClient.get<Event[]>(EVENTS_ENDPOINT, {
      ...filters,
      category_id: categoryId,
    });
  },
};
