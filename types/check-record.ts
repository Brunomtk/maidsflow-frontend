// CheckIn/CheckOut Types
export interface CheckRecord {
  id: string | number
  professionalId: number
  professionalName?: string
  companyId: number
  customerId: number
  customerName?: string
  appointmentId: number
  address: string
  teamId?: number
  teamName?: string
  checkInTime?: string | null
  checkOutTime?: string | null
  status: number | string
  serviceType: string
  notes?: string
  createdDate?: string
  updatedDate?: string
}

export interface CheckRecordFormData {
  professionalId: number
  professionalName?: string
  companyId: number
  customerId: number
  customerName?: string
  appointmentId: number
  address: string
  teamId?: number
  teamName?: string
  checkInTime?: string | null
  checkOutTime?: string | null
  status?: number | string
  serviceType: string
  notes?: string
}

// Status mapping
export const CHECK_RECORD_STATUS = {
  PENDING: 0,
  CHECKED_IN: 1,
  CHECKED_OUT: 2,
} as const

export type CheckRecordStatus = (typeof CHECK_RECORD_STATUS)[keyof typeof CHECK_RECORD_STATUS]
