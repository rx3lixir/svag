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

export interface CreateEventDto {
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

export interface UpdateEventDto extends Partial<CreateEventDto> {}

export interface EventFilters {
  category_id?: number;
  location?: string;
  date_from?: string;
  date_to?: string;
  price_min?: number;
  price_max?: number;
  search?: string;
}
