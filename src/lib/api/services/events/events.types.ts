import type { BaseEntity } from "$lib/api/types/common";

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

export interface PaginationMeta {
  total_count: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface SearchFilters {
  search_text?: string;
  category_ids?: number[];
  min_price?: number;
  max_price?: number;
  date_from?: string;
  date_to?: string;
  location?: string;
  source?: string;
  limit?: number;
  offset?: number;
  include_count?: boolean;
}

export interface SuggesionRequest {
  query: string;
  max_results?: number;
  fields?: string[];
}

export interface Suggestion {
  text: string;
  score: number;
  type: "event" | "location" | "category";
  category?: string;
  event_id?: number;
}

export interface SuggestionsResponse {
  suggestions: Suggestion[];
  query: string;
  total: number;
}

export interface EventFilters {
  category_id?: number;
  location?: string;
  date_from?: string;
  date_to?: string;
  price_min?: number;
  price_max?: number;
  search?: string;
}

export interface Image {
  id: string;
  url: string;
}
