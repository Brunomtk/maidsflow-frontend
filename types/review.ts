export interface Review {
  id: number
  customerId: string
  customerName: string
  professionalId: string
  professionalName: string
  teamId: string
  teamName: string
  companyId: string
  companyName: string
  appointmentId: string
  rating: number
  comment: string
  date: string
  serviceType: string
  status: number // 0=Pending, 1=Published, 2=Rejected
  response?: string
  responseDate?: string
  createdDate: string
  updatedDate: string
}

export interface ReviewCreateRequest {
  customerId: string
  customerName: string
  professionalId: string
  professionalName: string
  teamId: string
  teamName: string
  companyId: string
  companyName: string
  appointmentId: string
  rating: number
  comment: string
  date: string
  serviceType: string
  status: number
  response?: string
}

export interface ReviewUpdateRequest {
  customerId: string
  customerName: string
  professionalId: string
  professionalName: string
  teamId: string
  teamName: string
  companyId: string
  companyName: string
  appointmentId: string
  rating: number
  comment: string
  date: string
  serviceType: string
  status: number
  response?: string
  responseDate?: string
}

export interface ReviewFilters {
  status?: string | number
  rating?: string | number
  searchQuery?: string
  pageNumber?: number
  pageSize?: number
}

export interface ReviewPagedResponse {
  data: Review[]
  meta: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

export interface ReviewFormData {
  customerId: string
  customerName: string
  professionalId: string
  professionalName: string
  teamId: string
  teamName: string
  companyId: string
  companyName: string
  appointmentId: string
  rating: number
  comment: string
  date: string
  serviceType: string
  status: number
  response?: string
}

export interface ReviewResponse {
  data: Review[]
  meta: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  status: number
  message?: string
}

// Entities for dropdowns
export interface Customer {
  id: number
  name: string
  email: string
  phone: string
  cpf: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface Professional {
  id: number
  name: string
  email: string
  phone: string
  cpf: string
  teamId: number
  companyId: number
  status: string
  rating?: number
  completedServices?: number
  createdAt: string
  updatedAt: string
}

export interface Company {
  id: number
  name: string
  cnpj: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  status: string
  planId: number
  createdAt: string
  updatedAt: string
}

export interface Team {
  id: number
  name: string
  description: string
  companyId: number
  leaderId: number
  status: string
  createdAt: string
  updatedAt: string
}

export interface Appointment {
  id: number
  customerId: number
  customerName: string
  professionalId: number
  professionalName: string
  companyId: number
  companyName: string
  teamId: number
  teamName: string
  serviceType: string
  date: string
  time: string
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
}
