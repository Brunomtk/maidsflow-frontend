import { apiRequest } from "./utils"
import type { Appointment, AppointmentFilters, AppointmentResponse } from "@/types/appointment"

export const appointmentsApi = {
  // Get appointments with filters
  getAppointments: async (filters: AppointmentFilters = {}): Promise<AppointmentResponse> => {
    const params = new URLSearchParams()

    if (filters.page) params.append("Page", filters.page.toString())
    if (filters.pageSize) params.append("PageSize", filters.pageSize.toString())
    if (filters.companyId) params.append("CompanyId", filters.companyId.toString())
    if (filters.customerId) params.append("CustomerId", filters.customerId.toString())
    if (filters.teamId) params.append("TeamId", filters.teamId.toString())
    if (filters.professionalId) params.append("ProfessionalId", filters.professionalId.toString())
    if (filters.status !== undefined) params.append("Status", filters.status.toString())
    if (filters.type !== undefined) params.append("Type", filters.type.toString())
    if (filters.search) params.append("Search", filters.search)
    if (filters.startDate) params.append("StartDate", filters.startDate)
    if (filters.endDate) params.append("EndDate", filters.endDate)

    const queryString = params.toString()
    const endpoint = queryString ? `Appointment?${queryString}` : "Appointment"

    return apiRequest(endpoint)
  },

  // Get appointment by ID
  getAppointment: async (id: number): Promise<Appointment> => {
    return apiRequest(`Appointment/${id}`)
  },

  // Create appointment
  createAppointment: async (
    appointment: Omit<Appointment, "id" | "createdDate" | "updatedDate">,
  ): Promise<Appointment> => {
    return apiRequest("Appointment", {
      method: "POST",
      body: JSON.stringify(appointment),
    })
  },

  // Update appointment
  updateAppointment: async (id: number, appointment: Partial<Appointment>): Promise<Appointment> => {
    return apiRequest(`Appointment/${id}`, {
      method: "PUT",
      body: JSON.stringify(appointment),
    })
  },

  // Delete appointment
  deleteAppointment: async (id: number): Promise<void> => {
    return apiRequest(`Appointment/${id}`, {
      method: "DELETE",
    })
  },
}

export const getAppointments = appointmentsApi.getAppointments
export const createAppointment = appointmentsApi.createAppointment
export const updateAppointment = appointmentsApi.updateAppointment
export const deleteAppointment = appointmentsApi.deleteAppointment
export const getAppointmentById = appointmentsApi.getAppointment
export const getAppointmentsByCompany = async (companyId: number): Promise<AppointmentResponse> => {
  return appointmentsApi.getAppointments({ companyId })
}
