import { env } from "$env/dynamic/private";
import { browser } from "$app/environment";
import type { ApiError } from "./types/common";

class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    // В браузере - относительные пути, на сервере - полный URL
    this.baseUrl = browser
      ? "/api/gateway"
      : env.GATEWAY_URL || "http://localhost:8080";

    this.headers = {
      "Content-type": "application/json",
    };

    // Отладочная информация
    if (!browser) {
      console.log(`🔗 API Client initialized with baseUrl: ${this.baseUrl}`);
      console.log(`🔗 Environment GATEWAY_URL: ${env.GATEWAY_URL}`);
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "Неизвестная ошибка",
        code: "UNKNOWN_ERROR",
      }));

      // Логируем ошибку для отладки
      console.error(`❌ API Error [${response.status}]:`, {
        url: response.url,
        status: response.status,
        error: error,
      });

      throw {
        status: response.status,
        code: error.code || "API_ERROR",
        message: error.message || response.statusText,
        details: error.details,
      } as ApiError;
    }
    return response.json();
  }

  async request<T>(
    endpoint: string,
    options: RequestInit & { params?: Record<string, any> } = {},
  ): Promise<T> {
    const { params, ...fetchOptions } = options;

    // Строим URL с query параметрами
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Логика присвоения токена
    const token = this.getAuthToken();
    if (token) {
      this.headers["Authorization"] = `Bearer ${token}`;
    }

    // Отладочная информация
    console.log(
      `🚀 Making ${fetchOptions.method || "GET"} request to: ${url.toString()}`,
    );

    try {
      const response = await fetch(url.toString(), {
        ...fetchOptions,
        headers: {
          ...this.headers,
          ...fetchOptions.headers,
        },
      });

      console.log(`✅ Response status: ${response.status}`);
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`🔥 Network error:`, error);

      if (error instanceof Error) {
        throw {
          status: 0,
          code: "NETWORK_ERROR",
          message: "Ошибка сети. Проверьте подключение к API Gateway.",
          details: { originalError: error.message },
        } as ApiError;
      }
      throw error;
    }
  }

  // Методы запросов остаются теми же
  get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", params });
  }

  post<T>(
    endpoint: string,
    data?: any,
    params?: Record<string, any>,
  ): Promise<T> {
    return this.request(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      params,
    });
  }

  put<T>(
    endpoint: string,
    data?: any,
    params?: Record<string, any>,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      params,
    });
  }

  patch<T>(
    endpoint: string,
    data?: any,
    params?: Record<string, any>,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      params,
    });
  }

  delete<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", params });
  }

  // Заглушка для получения токена
  private getAuthToken(): string | null {
    if (browser) {
      return localStorage.getItem("auth_token");
    }
    // На сервере токен из cookies
    return null;
  }
}

export const apiClient = new ApiClient();
