export interface Plan {
  id: number
  name: string
  price: number
  features: string[]
  professionalsLimit: number
  teamsLimit: number
  customersLimit: number
  appointmentsLimit: number
  duration: number
  status: number // 1 = active, 0 = inactive
  subscriptions: any[] | null
  createdDate: string
  updatedDate: string
}

export interface PlanFormData {
  name: string
  price: number
  features: string[]
  professionalsLimit: number
  teamsLimit: number
  customersLimit: number
  appointmentsLimit: number
  duration: number
  status: number
}

export interface PlanFilters {
  status?: number
  search?: string
}

export interface PaginatedResponse<T> {
  results: T[]
  currentPage: number
  pageCount: number
  pageSize: number
  totalItems: number
  firstRowOnPage: number
  lastRowOnPage: number
}
