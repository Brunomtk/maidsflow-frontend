// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

export interface PaginationMeta {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
