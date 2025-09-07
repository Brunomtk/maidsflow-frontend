// Recurrence Types
export interface Recurrence {
  id: number
  title: string
  description?: string
  customerId: number
  customer?: {
    id: number
    name: string
    document: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    observations?: string
    status: number
    companyId: number
    company?: any
    createdDate: string
    updatedDate: string
  }
  address: string
  teamId?: number
  team?: {
    id: number
    name: string
    region: string
    description: string
    rating: number
    completedServices: number
    status: number
    companyId: number
    company?: any
    leaderId?: number
    leader?: any
    createdDate: string
    updatedDate: string
  }
  companyId: number
  company?: {
    id: number
    name: string
    cnpj: string
    responsible: string
    email: string
    phone: string
    planId: number
    status: number
    plan?: any
    users?: any
    createdDate: string
    updatedDate: string
  }
  frequency: number // 1=weekly, 2=biweekly, 3=monthly, etc.
  day: number
  time: string
  duration: number // in minutes
  status: number // 1=active, 0=inactive
  type: number // 1=regular, 2=deep, 3=specialized
  startDate: string
  endDate?: string
  notes?: string
  lastExecution?: string | null
  nextExecution?: string | null
  createdDate: string
  updatedDate: string
}

export interface CreateRecurrenceRequest {
  title: string
  customerId: number
  address: string
  teamId?: number
  companyId: number
  frequency: number
  day: number
  time: {
    ticks: number
  }
  duration: number
  status: number
  type: number
  startDate: string
  endDate?: string
  notes?: string
}

export interface UpdateRecurrenceRequest {
  title: string
  customerId: number
  address: string
  teamId?: number
  companyId: number
  frequency: number
  day: number
  time: {
    ticks: number
  }
  duration: number
  status: number
  type: number
  startDate: string
  endDate?: string
  notes?: string
  lastExecution?: string
  nextExecution?: string
}

export interface RecurrenceFilters {
  name?: string
  description?: string
  status?: string
  type?: string
  search?: string
  companyId?: number
  teamId?: number
  customerId?: number
  startDate?: string
  endDate?: string
  pageNumber?: number
  pageSize?: number
}

export interface RecurrenceResponse {
  results: Recurrence[]
  currentPage: number
  pageCount: number
  pageSize: number
  totalItems: number
  firstRowOnPage: number
  lastRowOnPage: number
}

export interface RecurrenceFormData {
  title: string
  customerId: number
  address: string
  teamId?: number
  companyId: number
  frequency: number
  day: number
  time: string
  duration: number
  status: number
  type: number
  startDate: string
  endDate?: string
  notes?: string
}
