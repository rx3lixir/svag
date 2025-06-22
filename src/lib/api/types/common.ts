export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginationMeta {
  total_count: number;
  limit: number;
  offset: number;
  has_more: number;
}

export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}
