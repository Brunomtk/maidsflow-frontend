import type { UserRole } from "./user"

export type RescheduleStatus = "pending" | "approved" | "rejected" | "cancelled"

export interface RescheduleRequest {
  id: string
  appointmentId: string
  originalStart: string | Date // ISO string in API, Date object in frontend
  originalEnd: string | Date // ISO string in API, Date object in frontend
  proposedStart: string | Date // ISO string in API, Date object in frontend
  proposedEnd: string | Date // ISO string in API, Date object in frontend
  actualStart?: string | Date // ISO string in API, Date object in frontend
  actualEnd?: string | Date // ISO string in API, Date object in frontend
  requestedById: string
  requestedByRole: UserRole
  requestedAt: string
  reason: string
  status: RescheduleStatus
  responseById?: string
  responseByRole?: UserRole
  responseAt?: string
  responseNote?: string
  companyId: string
  customerId: string
  customerName?: string
  professionalId?: string
  professionalName?: string
  teamId?: string
  teamName?: string
  notificationSent: boolean
  createdAt: string
  updatedAt: string
}

export interface RescheduleRequestFormData {
  appointmentId: string
  originalStart: string | Date
  originalEnd: string | Date
  proposedStart: string | Date
  proposedEnd: string | Date
  requestedById: string
  requestedByRole: UserRole
  reason: string
  companyId: string
  customerId: string
  professionalId?: string
  teamId?: string
}

export interface RescheduleResponseData {
  status: "approved" | "rejected"
  responseById: string
  responseByRole: UserRole
  responseNote?: string
  actualStart?: string | Date // Only required if approved
  actualEnd?: string | Date // Only required if approved
}

export interface RescheduleFilters {
  status?: RescheduleStatus | "all"
  startDate?: string
  endDate?: string
  customerId?: string
  professionalId?: string
  teamId?: string
  search?: string
}
