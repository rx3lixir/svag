import { apiClient } from "$lib/api/client";
import type {
  LoginDto,
  RegisterDto,
  AuthResponse,
  RefreshTokenDto,
} from "./auth.types";

const AUTH_ENDPOINT = "/auth/api/v1/auth";

export const authApi = {
  // Вход
  async login(data: LoginDto): Promise<AuthResponse> {
    return apiClient.post(`${AUTH_ENDPOINT}/login`, data);
  },

  // Регистрация
  async register(data: RegisterDto): Promise<AuthResponse> {
    return apiClient.post(`${AUTH_ENDPOINT}/register`, data);
  },

  // Выход
  async logout(): Promise<AuthResponse> {
    return apiClient.post(`${AUTH_ENDPOINT}/logout`);
  },

  // Обновить токен
  async refreshToken(data: RefreshTokenDto): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${AUTH_ENDPOINT}/refresh`, data);
  },
};
