export interface Appointment {
  id: number
  title: string
  address: string
  start: string | Date
  end: string | Date
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
    plan: any
    users: any
    createdDate: string
    updatedDate: string
  }
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
  teamId: number
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
    leaderId: number
    leader?: any
    createdDate: string
    updatedDate: string
  }
  professionalId: number
  professional?: {
    id: number
    name: string
    cpf: string
    email: string
    phone: string
    teamId: number
    companyId: number
    status: number
    rating?: number
    completedServices?: number
    createdDate: string
    updatedDate: string
    company?: any
    team?: any
  }
  status: number // 0: Scheduled, 1: In Progress, 2: Completed, 3: Cancelled
  type: number // 0: Residential, 1: Commercial, 2: Industrial
  notes?: string
  createdDate: string
  updatedDate: string
}

export interface AppointmentResponse {
  results: Appointment[]
  currentPage: number
  pageCount: number
  pageSize: number
  totalItems: number
  firstRowOnPage: number
  lastRowOnPage: number
}

export interface AppointmentFilters {
  page?: number
  pageSize?: number
  companyId?: number
  customerId?: number
  teamId?: number
  professionalId?: number
  status?: number
  type?: number
  search?: string
  startDate?: string
  endDate?: string
}

export interface CreateAppointmentData {
  title: string
  address: string
  start: string
  end: string
  companyId: number
  customerId: number
  teamId: number
  professionalId: number
  status: number
  type: number
  notes?: string
}

export interface UpdateAppointmentData {
  title: string
  address: string
  start: string
  end: string
  companyId: number
  customerId: number
  teamId: number
  professionalId: number
  status: number
  type: number
  notes?: string
}
