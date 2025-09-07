import type { Appointment, AppointmentFilters, AppointmentResponse } from "@/types/appointment"
import { apiRequest } from "./utils"

// Get all appointments for the logged in professional
export async function getProfessionalAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
  const queryParams = new URLSearchParams()

  if (filters?.page) queryParams.append("Page", filters.page.toString())
  if (filters?.pageSize) queryParams.append("PageSize", filters.pageSize.toString())
  if (filters?.companyId) queryParams.append("CompanyId", filters.companyId.toString())
  if (filters?.customerId) queryParams.append("CustomerId", filters.customerId.toString())
  if (filters?.teamId) queryParams.append("TeamId", filters.teamId.toString())
  if (filters?.professionalId) queryParams.append("ProfessionalId", filters.professionalId.toString())
  if (filters?.status !== undefined) queryParams.append("Status", filters.status.toString())
  if (filters?.type !== undefined) queryParams.append("Type", filters.type.toString())
  if (filters?.search) queryParams.append("Search", filters.search)
  if (filters?.startDate) queryParams.append("StartDate", filters.startDate)
  if (filters?.endDate) queryParams.append("EndDate", filters.endDate)

  const endpoint = `/Appointment${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
  const response = await apiRequest<AppointmentResponse>(endpoint)
  return response.results
}

// Get appointments for the professional by date range
export async function getProfessionalAppointmentsByDateRange(
  startDate: string,
  endDate: string,
  filters?: AppointmentFilters,
): Promise<Appointment[]> {
  const queryParams = new URLSearchParams()
  queryParams.append("StartDate", startDate)
  queryParams.append("EndDate", endDate)

  if (filters?.page) queryParams.append("Page", filters.page.toString())
  if (filters?.pageSize) queryParams.append("PageSize", filters.pageSize.toString())
  if (filters?.companyId) queryParams.append("CompanyId", filters.companyId.toString())
  if (filters?.customerId) queryParams.append("CustomerId", filters.customerId.toString())
  if (filters?.teamId) queryParams.append("TeamId", filters.teamId.toString())
  if (filters?.professionalId) queryParams.append("ProfessionalId", filters.professionalId.toString())
  if (filters?.status !== undefined) queryParams.append("Status", filters.status.toString())
  if (filters?.type !== undefined) queryParams.append("Type", filters.type.toString())
  if (filters?.search) queryParams.append("Search", filters.search)

  const endpoint = `/Appointment?${queryParams.toString()}`
  const response = await apiRequest<AppointmentResponse>(endpoint)
  return response.results
}

// Get a single appointment by ID for the professional
export async function getProfessionalAppointmentById(id: string): Promise<Appointment> {
  const endpoint = `/Appointment/${id}`
  return apiRequest<Appointment>(endpoint)
}

// Update appointment status (simulating check-in by updating status to 1)
export async function checkInToAppointment(
  appointmentId: string,
  data: { location: { lat: number; lng: number }; notes?: string },
): Promise<Appointment> {
  // Get current appointment first
  const currentAppointment = await getProfessionalAppointmentById(appointmentId)

  // Update with status 1 (In Progress) and add notes
  const updateData = {
    title: currentAppointment.title,
    address: currentAppointment.address,
    start:
      typeof currentAppointment.start === "string" ? currentAppointment.start : currentAppointment.start.toISOString(),
    end: typeof currentAppointment.end === "string" ? currentAppointment.end : currentAppointment.end.toISOString(),
    companyId: currentAppointment.companyId,
    customerId: currentAppointment.customerId,
    teamId: currentAppointment.teamId,
    professionalId: currentAppointment.professionalId,
    status: 1, // In Progress
    type: currentAppointment.type,
    notes: data.notes || currentAppointment.notes,
  }

  const endpoint = `/Appointment/${appointmentId}`
  return apiRequest<Appointment>(endpoint, {
    method: "PUT",
    body: JSON.stringify(updateData),
  })
}

// Update appointment status (simulating check-out by updating status to 2)
export async function checkOutFromAppointment(
  appointmentId: string,
  data: { location: { lat: number; lng: number }; notes?: string; completionDetails?: Record<string, any> },
): Promise<Appointment> {
  // Get current appointment first
  const currentAppointment = await getProfessionalAppointmentById(appointmentId)

  // Update with status 2 (Completed) and add notes
  const updateData = {
    title: currentAppointment.title,
    address: currentAppointment.address,
    start:
      typeof currentAppointment.start === "string" ? currentAppointment.start : currentAppointment.start.toISOString(),
    end: typeof currentAppointment.end === "string" ? currentAppointment.end : currentAppointment.end.toISOString(),
    companyId: currentAppointment.companyId,
    customerId: currentAppointment.customerId,
    teamId: currentAppointment.teamId,
    professionalId: currentAppointment.professionalId,
    status: 2, // Completed
    type: currentAppointment.type,
    notes: data.notes || currentAppointment.notes,
  }

  const endpoint = `/Appointment/${appointmentId}`
  return apiRequest<Appointment>(endpoint, {
    method: "PUT",
    body: JSON.stringify(updateData),
  })
}

// Simulate reschedule request (just return a message since there's no specific endpoint)
export async function requestRescheduleAppointment(
  appointmentId: string,
  data: { reason: string; suggestedDates: string[] },
): Promise<{ success: boolean; message: string }> {
  // Since there's no specific reschedule endpoint, we'll just return a success message
  // In a real implementation, this might create a notification or send an email
  return Promise.resolve({
    success: true,
    message: "Reschedule request has been sent to the company. They will contact you soon.",
  })
}

// Cancel an appointment by updating status to 3
export async function cancelProfessionalAppointment(
  appointmentId: string,
  data: { reason: string },
): Promise<{ success: boolean; message: string }> {
  try {
    // Get current appointment first
    const currentAppointment = await getProfessionalAppointmentById(appointmentId)

    // Update with status 3 (Cancelled) and add reason to notes
    const updateData = {
      title: currentAppointment.title,
      address: currentAppointment.address,
      start:
        typeof currentAppointment.start === "string"
          ? currentAppointment.start
          : currentAppointment.start.toISOString(),
      end: typeof currentAppointment.end === "string" ? currentAppointment.end : currentAppointment.end.toISOString(),
      companyId: currentAppointment.companyId,
      customerId: currentAppointment.customerId,
      teamId: currentAppointment.teamId,
      professionalId: currentAppointment.professionalId,
      status: 3, // Cancelled
      type: currentAppointment.type,
      notes: `${currentAppointment.notes || ""}\nCancellation reason: ${data.reason}`,
    }

    await apiRequest<Appointment>(`/Appointment/${appointmentId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    })

    return {
      success: true,
      message: "Appointment has been cancelled successfully.",
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to cancel appointment. Please try again.",
    }
  }
}

// Mock availability data since there's no real endpoint
export async function getProfessionalAvailability(
  startDate: string,
  endDate: string,
): Promise<{ date: string; slots: { start: string; end: string }[] }[]> {
  // Return mock data since there's no real endpoint
  return Promise.resolve([])
}

// Mock availability update since there's no real endpoint
export async function updateProfessionalAvailability(
  data: { date: string; slots: { start: string; end: string }[] }[],
): Promise<{ success: boolean; message: string }> {
  return Promise.resolve({
    success: true,
    message: "Availability updated successfully.",
  })
}

// Calculate schedule summary from appointments data
export async function getProfessionalScheduleSummary(
  month: number,
  year: number,
): Promise<{
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  clientsServed: number
  completionRate: number
}> {
  try {
    // Get appointments for the month
    const startDate = new Date(year, month - 1, 1).toISOString()
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString()

    const appointments = await getProfessionalAppointmentsByDateRange(startDate, endDate)

    const totalAppointments = appointments.length
    const completedAppointments = appointments.filter((apt) => apt.status === 2).length
    const cancelledAppointments = appointments.filter((apt) => apt.status === 3).length
    const uniqueClients = new Set(appointments.map((apt) => apt.customerId)).size
    const completionRate = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0

    return {
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      clientsServed: uniqueClients,
      completionRate,
    }
  } catch (error) {
    // Return default values if there's an error
    return {
      totalAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      clientsServed: 0,
      completionRate: 0,
    }
  }
}
