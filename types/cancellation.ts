// Enums based on real API
export enum RefundStatus {
  Pending = 0,
  Processed = 1,
  Rejected = 2,
  NotApplicable = 3,
}

export enum CancelledByRole {
  Customer = 1,
  Professional = 2,
  Company = 3,
  Admin = 4,
}

// Main interface based on API response
export interface Cancellation {
  id: number
  appointmentId: number
  customerId: number
  customerName?: string | null
  companyId: number
  reason: string
  cancelledById: number
  cancelledByRole: CancelledByRole
  cancelledAt: string
  refundStatus: RefundStatus
  notes?: string
  createdDate: string
  updatedDate: string
}

// Interface for creating cancellation
export interface CancellationFormData {
  appointmentId: number
  customerId: number
  companyId: number
  reason: string
  cancelledById: number
  cancelledByRole: CancelledByRole
  refundStatus: RefundStatus
  notes?: string
}

// Interface for updating cancellation
export interface CancellationUpdateData {
  reason?: string
  refundStatus?: RefundStatus
  notes?: string
}

// Interface for filters
export interface CancellationFilters {
  search?: string
  companyId?: number
  customerId?: number
  startDate?: string
  endDate?: string
  refundStatus?: RefundStatus | string
}

// Interface for refund processing
export interface RefundProcessData {
  status: RefundStatus
  notes?: string
}

// Extended interface for display (with related data)
export interface CancellationWithDetails extends Cancellation {
  customer?: {
    id: number
    name: string
    email: string
    phone: string
  }
  professional?: {
    id: number
    name: string
    specialty: string
  }
  company?: {
    id: number
    name: string
  }
  service?: string
  originalDate?: string
  originalTime?: string
  price?: number
}

// Interface for statistics
export interface CancellationStats {
  total: number
  pending: number
  processed: number
  rejected: number
  totalRefunded: number
  averageRefundTime: number
  topReasons: Array<{ reason: string; count: number }>
}
