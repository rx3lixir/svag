// Единая точка входа для всех API
export { eventsApi } from "./services/events/events.api";
export { categoriesApi } from "./services/categories/categories.api";
export { usersApi } from "./services/users/users.api";
export { authApi } from "./services/auth/auth.api";

// Экспорт типов
export * from "./services/events/events.types";
export * from "./services/categories/categories.types";
export * from "./services/users/users.types";
export * from "./services/auth/auth.types";
export * from "./types/common";
