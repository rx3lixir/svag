import type {
  BaseEntity,
  PaginationMeta,
  PaginationParams,
} from "$lib/api/types/common";

export interface Event extends BaseEntity {
  name: string;
  description: string;
  category_id: number;
  date: string;
  time: string;
  location: string;
  price: number;
  image: string;
  source: string;
}

export interface EventsListResponse {
  events: Event[];
  pagination?: PaginationMeta;
}

export interface EventFilters extends PaginationParams {
  category_id?: number;
  location?: string;
  date_from?: string;
  date_to?: string;
  price_min?: number;
  price_max?: number;
  search?: string;
}

export interface SearchFilters extends PaginationParams {
  search_text?: string;
  category_ids?: number[];
  min_price?: number;
  max_price?: number;
  date_from?: string;
  date_to?: string;
  location?: string;
  source?: string;
  include_count?: boolean;
}

export interface Suggestion {
  text: string;
  score: number;
  type: "event" | "location" | "category";
  category?: string;
  event_id?: number;
}

export interface SuggesionRequest {
  query: string;
  max_results?: number;
  fields?: string[];
}

export interface SuggestionsResponse {
  suggestions: Suggestion[];
  query: string;
  total: number;
}

export interface Image {
  id: string;
  url: string;
}
