export interface Payment {
  id: number
  companyId: number
  companyName?: string | null
  amount: number
  dueDate: string
  paymentDate?: string | null
  status: 0 | 1 | 2 | 3 // 0=Pending, 1=Paid, 2=Overdue, 3=Cancelled
  method: 0 | 1 | 2 | 3 // 0=CreditCard, 1=DebitCard, 2=BankTransfer, 3=Pix
  reference: string
  planId: number
  planName?: string | null
  createdDate: string
  updatedDate: string
}

export interface PaymentFormData {
  companyId: number
  amount: number
  dueDate: string
  paymentDate?: string
  status: 0 | 1 | 2 | 3
  method: 0 | 1 | 2 | 3
  reference: string
  planId: number
}

export interface PaymentFilters {
  companyId?: number
  status?: 0 | 1 | 2 | 3
  search?: string
  startDate?: string
  endDate?: string
  planId?: number
  page?: number
  pageSize?: number
}

export interface PaymentStatusUpdate {
  status: 0 | 1 | 2 | 3
  paymentDate?: string
}

export interface PaymentsResponse {
  results: Payment[]
  currentPage: number
  pageCount: number
  pageSize: number
  totalItems: number
  firstRowOnPage: number
  lastRowOnPage: number
}
