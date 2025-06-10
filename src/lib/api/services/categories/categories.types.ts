import type { BaseEntity } from "$lib/api/types/common";

export interface Category extends BaseEntity {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  parent_id?: number;
  events_count?: number;
}
