import type { Appointment } from "@/types/appointment"
import { apiRequest } from "./utils"

// Get all completed appointments for the professional
export async function getProfessionalHistory(filters?: Record<string, any>): Promise<Appointment[]> {
  const queryParams = new URLSearchParams((filters as Record<string, string>) || {})
  // Default to completed appointments
  if (!queryParams.has("status")) {
    queryParams.append("status", "completed")
  }
  return apiRequest<Appointment[]>({ url: `/professional/history?${queryParams.toString()}`, method: "GET" })
}

// Get history by date range
export async function getProfessionalHistoryByDateRange(
  startDate: string,
  endDate: string,
  filters?: Record<string, any>,
): Promise<Appointment[]> {
  const queryParams = new URLSearchParams((filters as Record<string, string>) || {})
  queryParams.append("startDate", startDate)
  queryParams.append("endDate", endDate)
  // Default to completed appointments
  if (!queryParams.has("status")) {
    queryParams.append("status", "completed")
  }
  return apiRequest<Appointment[]>({ url: `/professional/history?${queryParams.toString()}`, method: "GET" })
}

// Get history by service type
export async function getProfessionalHistoryByServiceType(
  serviceType: string,
  filters?: Record<string, any>,
): Promise<Appointment[]> {
  const queryParams = new URLSearchParams((filters as Record<string, string>) || {})
  queryParams.append("type", serviceType)
  // Default to completed appointments
  if (!queryParams.has("status")) {
    queryParams.append("status", "completed")
  }
  return apiRequest<Appointment[]>({ url: `/professional/history?${queryParams.toString()}`, method: "GET" })
}

// Get history details by appointment ID
export async function getProfessionalHistoryDetails(id: string): Promise<Appointment> {
  return apiRequest<Appointment>({ url: `/professional/history/${id}`, method: "GET" })
}

// Get history statistics
export interface HistoryStatistics {
  totalServices: number
  completedServices: number
  cancelledServices: number
  averageRating: number
  servicesByType: Record<string, number>
  servicesByMonth: Record<string, number>
  totalHours: number
  totalClients: number
}

export async function getProfessionalHistoryStatistics(
  startDate?: string,
  endDate?: string,
): Promise<HistoryStatistics> {
  const queryParams = new URLSearchParams()
  if (startDate) queryParams.append("startDate", startDate)
  if (endDate) queryParams.append("endDate", endDate)

  return apiRequest<HistoryStatistics>({
    url: `/professional/history/statistics?${queryParams.toString()}`,
    method: "GET",
  })
}

// Export history to CSV/PDF
export async function exportProfessionalHistory(format: "csv" | "pdf", filters?: Record<string, any>): Promise<Blob> {
  const queryParams = new URLSearchParams((filters as Record<string, string>) || {})
  queryParams.append("format", format)

  return apiRequest<Blob>({
    url: `/professional/history/export?${queryParams.toString()}`,
    method: "GET",
    responseType: "blob",
  })
}

// Get monthly summary
export interface MonthlySummary {
  month: string // Format: "YYYY-MM"
  totalServices: number
  completedServices: number
  cancelledServices: number
  averageRating: number
  totalHours: number
  servicesByType: Record<string, number>
}

export async function getProfessionalMonthlySummary(year: number): Promise<MonthlySummary[]> {
  return apiRequest<MonthlySummary[]>({
    url: `/professional/history/monthly-summary?year=${year}`,
    method: "GET",
  })
}
