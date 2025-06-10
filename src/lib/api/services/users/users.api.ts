import { apiClient } from "../../client";
import type { Event } from "../events/events.types";
import type { UserProfile, UpdateProfileDto } from "./users.types";

const USERS_ENDPOINT = "/user/api/v1/users";

export const usersApi = {
  // Получить профиль текущего пользователя
  async getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>(`${USERS_ENDPOINT}/me`);
  },

  // Обновить профиль
  async updateProfile(data: UpdateProfileDto): Promise<UserProfile> {
    return apiClient.put<UserProfile>(`${USERS_ENDPOINT}/me`, data);
  },

  // Получить избранные события
  async getFavorites(): Promise<Event[]> {
    return apiClient.get<Event[]>(`${USERS_ENDPOINT}/me/favorites`);
  },

  // Добавить в избранное
  async addFavorite(eventId: number): Promise<void> {
    return apiClient.post<void>(`${USERS_ENDPOINT}/me/favorites/${eventId}`);
  },

  // Удалить из избранного
  async removeFavorite(eventId: number): Promise<void> {
    return apiClient.delete<void>(`${USERS_ENDPOINT}/me/favorites/${eventId}`);
  },
};
