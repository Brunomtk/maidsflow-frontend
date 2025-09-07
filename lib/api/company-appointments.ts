import { fetchApi } from "./utils"
import type {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
  AppointmentFilters,
  AppointmentResponse,
} from "@/types/appointment"
import type { Customer } from "@/types/customer"
import type { Team } from "@/types/team"

export async function getCompanyAppointments(filters: AppointmentFilters): Promise<AppointmentResponse> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString())
    }
  })
  const response = await fetchApi(`/Appointment?${params.toString()}`)
  return response
}

export async function getCompanyAppointmentById(id: number): Promise<Appointment> {
  return fetchApi(`/Appointment/${id}`)
}

export async function createCompanyAppointment(appointmentData: CreateAppointmentData): Promise<Appointment> {
  return fetchApi("/Appointment", {
    method: "POST",
    body: JSON.stringify(appointmentData),
  })
}

export async function updateCompanyAppointment(
  id: number,
  appointmentData: UpdateAppointmentData,
): Promise<Appointment> {
  return fetchApi(`/Appointment/${id}`, {
    method: "PUT",
    body: JSON.stringify(appointmentData),
  })
}

export async function deleteCompanyAppointment(id: number): Promise<void> {
  await fetchApi(`/Appointment/${id}`, {
    method: "DELETE",
  })
}

// Funções para buscar dados relacionados para o modal
export async function getCompanyCustomers(companyId: number): Promise<Customer[]> {
  const response = await fetchApi(`/Customer?companyId=${companyId}&pageSize=1000`) // Assumindo que o endpoint suporta isso
  return response.results || []
}

export async function getCompanyTeams(companyId: number): Promise<Team[]> {
  const response = await fetchApi(`/Team?companyId=${companyId}&pageSize=1000`) // Assumindo que o endpoint suporta isso
  return response.results || []
}
