export interface Customer {
  id: number
  name: string
  ssn?: string
  ticket?: number
  frequency?: string
  paymentMethod?: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  observations?: string
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
  status: number
  createdDate: string
  updatedDate: string
}

export interface CreateCustomerRequest {
  name: string
  ssn?: string
  ticket?: number
  frequency?: string
  paymentMethod?: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  observations?: string
  companyId: number
}

export interface UpdateCustomerRequest {
  id: number
  name: string
  ssn?: string
  ticket?: number
  frequency?: string
  paymentMethod?: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  observations?: string
  status: number
  companyId?: number
}

export interface CustomerFilters {
  search?: string
  name?: string
  ssn?: string
  companyId?: number
  status?: number | string
  pageNumber?: number
  pageSize?: number
}

export interface CustomerResponse {
  results: Customer[]
  currentPage: number
  pageCount: number
  pageSize: number
  totalItems: number
  firstRowOnPage: number
  lastRowOnPage: number
}
