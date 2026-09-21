export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  object?: T;
  errors?: Record<string, string[]>;
}

export interface PageList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
