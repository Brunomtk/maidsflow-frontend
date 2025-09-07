import type {
  RescheduleRequest,
  RescheduleRequestFormData,
  RescheduleResponseData,
  RescheduleFilters,
} from "@/types/reschedule"
import { apiRequest } from "./utils"

// Get all reschedule requests
export async function getRescheduleRequests(filters?: RescheduleFilters): Promise<RescheduleRequest[]> {
  const queryParams = filters ? new URLSearchParams(filters as Record<string, string>).toString() : ""
  const url = `/reschedule-requests${queryParams ? `?${queryParams}` : ""}`
  return apiRequest<RescheduleRequest[]>({ url, method: "GET" })
}

// Get a single reschedule request by ID
export async function getRescheduleRequestById(id: string): Promise<RescheduleRequest> {
  return apiRequest<RescheduleRequest>({ url: `/reschedule-requests/${id}`, method: "GET" })
}

// Create a new reschedule request
export async function createRescheduleRequest(data: RescheduleRequestFormData): Promise<RescheduleRequest> {
  return apiRequest<RescheduleRequest>({ url: "/reschedule-requests", method: "POST", data })
}

// Update a reschedule request
export async function updateRescheduleRequest(
  id: string,
  data: Partial<RescheduleRequestFormData>,
): Promise<RescheduleRequest> {
  return apiRequest<RescheduleRequest>({ url: `/reschedule-requests/${id}`, method: "PUT", data })
}

// Delete a reschedule request
export async function deleteRescheduleRequest(id: string): Promise<void> {
  return apiRequest<void>({ url: `/reschedule-requests/${id}`, method: "DELETE" })
}

// Respond to a reschedule request (approve or reject)
export async function respondToRescheduleRequest(
  id: string,
  responseData: RescheduleResponseData,
): Promise<RescheduleRequest> {
  return apiRequest<RescheduleRequest>({
    url: `/reschedule-requests/${id}/respond`,
    method: "POST",
    data: responseData,
  })
}

// Cancel a reschedule request
export async function cancelRescheduleRequest(id: string, note?: string): Promise<RescheduleRequest> {
  return apiRequest<RescheduleRequest>({
    url: `/reschedule-requests/${id}/cancel`,
    method: "POST",
    data: { note },
  })
}

// Get reschedule requests by company ID
export async function getRescheduleRequestsByCompany(
  companyId: string,
  filters?: RescheduleFilters,
): Promise<RescheduleRequest[]> {
  const queryParams = new URLSearchParams((filters as Record<string, string>) || {})
  queryParams.append("companyId", companyId)
  return apiRequest<RescheduleRequest[]>({ url: `/reschedule-requests?${queryParams.toString()}`, method: "GET" })
}

// Get reschedule requests by customer ID
export async function getRescheduleRequestsByCustomer(
  customerId: string,
  filters?: RescheduleFilters,
): Promise<RescheduleRequest[]> {
  const queryParams = new URLSearchParams((filters as Record<string, string>) || {})
  queryParams.append("customerId", customerId)
  return apiRequest<RescheduleRequest[]>({ url: `/reschedule-requests?${queryParams.toString()}`, method: "GET" })
}

// Get reschedule requests by professional ID
export async function getRescheduleRequestsByProfessional(
  professionalId: string,
  filters?: RescheduleFilters,
): Promise<RescheduleRequest[]> {
  const queryParams = new URLSearchParams((filters as Record<string, string>) || {})
  queryParams.append("professionalId", professionalId)
  return apiRequest<RescheduleRequest[]>({ url: `/reschedule-requests?${queryParams.toString()}`, method: "GET" })
}

// Get reschedule requests by team ID
export async function getRescheduleRequestsByTeam(
  teamId: string,
  filters?: RescheduleFilters,
): Promise<RescheduleRequest[]> {
  const queryParams = new URLSearchParams((filters as Record<string, string>) || {})
  queryParams.append("teamId", teamId)
  return apiRequest<RescheduleRequest[]>({ url: `/reschedule-requests?${queryParams.toString()}`, method: "GET" })
}

// Get reschedule requests by status
export async function getRescheduleRequestsByStatus(
  status: RescheduleRequest["status"],
  filters?: RescheduleFilters,
): Promise<RescheduleRequest[]> {
  const queryParams = new URLSearchParams((filters as Record<string, string>) || {})
  queryParams.append("status", status)
  return apiRequest<RescheduleRequest[]>({ url: `/reschedule-requests?${queryParams.toString()}`, method: "GET" })
}

// Get reschedule requests by date range
export async function getRescheduleRequestsByDateRange(
  startDate: string,
  endDate: string,
  filters?: RescheduleFilters,
): Promise<RescheduleRequest[]> {
  const queryParams = new URLSearchParams((filters as Record<string, string>) || {})
  queryParams.append("startDate", startDate)
  queryParams.append("endDate", endDate)
  return apiRequest<RescheduleRequest[]>({ url: `/reschedule-requests?${queryParams.toString()}`, method: "GET" })
}

// Send notification for reschedule request
export async function sendRescheduleNotification(id: string): Promise<RescheduleRequest> {
  return apiRequest<RescheduleRequest>({ url: `/reschedule-requests/${id}/notify`, method: "POST" })
}
