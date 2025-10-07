import { apiRequest } from "./utils"
import { gpsTrackingApi } from "./gps-tracking"
import { geocodeAddress, geocodeAddressFallback } from "@/lib/geocoding"
import { updateCompanyAppointment } from "./company-appointments"

export interface CheckRecord {
  id: number
  professionalId: number
  professionalName: string
  companyId: number
  customerId: number
  customerName: string
  appointmentId: number
  address: string
  teamId: number | null
  teamName: string | null
  checkInTime: string | null
  checkOutTime: string | null
  status: number
  serviceType: string
  notes: string
  createdDate: string
  updatedDate: string
  gpsTrackingId?: number // Added for storing GPS tracking ID
}

export interface CreateCheckRecordData {
  professionalId: number
  professionalName: string
  companyId: number
  customerId: number
  customerName: string
  appointmentId: number
  address: string
  teamId: number | null
  teamName: string | null
  serviceType: string
  notes: string
}

export interface CheckInData {
  professionalId: number
  professionalName: string
  companyId: number
  customerId: number
  customerName: string
  appointmentId: number
  address: string
  teamId: number | null
  teamName: string | null
  serviceType: string
  notes: string
}

export interface CheckRecordFilters {
  professionalId?: number
  companyId?: number
  customerId?: number
  teamId?: number
  appointmentId?: number
  status?: number
  serviceType?: string
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  pageSize?: number
}

export interface CheckRecordResponse {
  results: CheckRecord[]
  currentPage: number
  pageCount: number
  pageSize: number
  totalItems: number
  firstRowOnPage: number
  lastRowOnPage: number
}

export async function getCheckRecords(filters: CheckRecordFilters = {}): Promise<CheckRecordResponse> {
  try {
    const params = new URLSearchParams()

    const defaultFilters = {
      page: 1,
      pageSize: 50,
      ...filters,
    }

    // Add filters as query parameters matching the API documentation
    if (defaultFilters.professionalId) params.append("ProfessionalId", defaultFilters.professionalId.toString())
    if (defaultFilters.companyId) params.append("CompanyId", defaultFilters.companyId.toString())
    if (defaultFilters.customerId) params.append("CustomerId", defaultFilters.customerId.toString())
    if (defaultFilters.teamId) params.append("TeamId", defaultFilters.teamId.toString())
    if (defaultFilters.appointmentId) params.append("AppointmentId", defaultFilters.appointmentId.toString())
    if (defaultFilters.status !== undefined) params.append("Status", defaultFilters.status.toString())
    if (defaultFilters.serviceType) params.append("ServiceType", defaultFilters.serviceType)
    if (defaultFilters.startDate) params.append("StartDate", defaultFilters.startDate)
    if (defaultFilters.endDate) params.append("EndDate", defaultFilters.endDate)
    if (defaultFilters.search) params.append("Search", defaultFilters.search)
    if (defaultFilters.page) params.append("PageNumber", defaultFilters.page.toString())
    if (defaultFilters.pageSize) params.append("PageSize", defaultFilters.pageSize.toString())

    const queryString = params.toString()
    const endpoint = `/CheckRecord?${queryString}`

    const data = await apiRequest(endpoint)

    // Return the response in the expected format
    return {
      results: data.results || [],
      currentPage: data.currentPage || 1,
      pageCount: data.pageCount || 1,
      pageSize: data.pageSize || 10,
      totalItems: data.totalItems || 0,
      firstRowOnPage: data.firstRowOnPage || 1,
      lastRowOnPage: data.lastRowOnPage || 0,
    }
  } catch (error) {
    console.error("Error fetching check records:", error)
    throw error
  }
}

// Buscar registro de check por ID
export async function getCheckRecordById(id: string): Promise<CheckRecord> {
  try {
    const response = await apiRequest(`/CheckRecord/${id}`)
    return response
  } catch (error) {
    console.error("Error fetching check record:", error)
    throw error
  }
}

export async function createCheckRecord(data: any): Promise<CheckRecord> {
  try {
    console.log("Creating check record with data:", data)

    // Structure matching the user's API documentation
    const payload = {
      professionalId: Number(data.professionalId),
      professionalName: data.professionalName || "",
      companyId: Number(data.companyId),
      customerId: Number(data.customerId),
      customerName: data.customerName || "",
      appointmentId: data.appointmentId ? Number(data.appointmentId) : 1,
      address: data.address || "",
      teamId: data.teamId ? Number(data.teamId) : null,
      teamName: data.teamName || null,
      serviceType: data.serviceType || "",
      notes: data.notes || "",
    }

    console.log("Sending payload to API:", payload)

    const response = await apiRequest("/CheckRecord", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    console.log("Check record created successfully:", response)
    return response
  } catch (error) {
    console.error("Error creating check record:", error)
    throw error
  }
}

// Atualizar registro de check
export async function updateCheckRecord(id: string, data: Partial<CheckRecord>): Promise<CheckRecord> {
  try {
    const response = await apiRequest(`/CheckRecord/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    return response
  } catch (error) {
    console.error("Error updating check record:", error)
    throw error
  }
}

// Deletar registro de check
export async function deleteCheckRecord(id: string): Promise<void> {
  try {
    await apiRequest(`/CheckRecord/${id}`, {
      method: "DELETE",
    })
  } catch (error) {
    console.error("Error deleting check record:", error)
    throw error
  }
}

export async function performCheckIn(data: CheckInData): Promise<CheckRecord> {
  try {
    console.log("Performing check-in with data:", data)

    // Structure matching the user's API documentation for check-in
    const payload = {
      professionalId: Number(data.professionalId),
      professionalName: data.professionalName || "",
      companyId: Number(data.companyId),
      companyName: "", // Will be filled by the API
      vehicle: "N/A", // Default value as requested
      address: data.address || "",
      teamId: data.teamId ? Number(data.teamId) : null,
      teamName: data.teamName || null,
      serviceType: data.serviceType || "",
      notes: data.notes || "",
    }

    console.log("Sending payload to API:", payload)

    const response = await apiRequest("/CheckRecord/check-in", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    console.log("Check-in performed successfully:", response)

    try {
      // Geocode the client's address to get coordinates
      let geocodeResult
      try {
        geocodeResult = await geocodeAddress(data.address || "")
      } catch (geocodeError) {
        console.warn("Geocoding failed, using fallback:", geocodeError)
        geocodeResult = geocodeAddressFallback(data.address || "")
      }

      // Create GPS tracking record
      const gpsTrackingData = {
        professionalId: Number(data.professionalId),
        professionalName: data.professionalName || "",
        companyId: Number(data.companyId),
        companyName: "", // Will be filled by the API
        vehicle: "N/A", // Default value as requested
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        address: geocodeResult.address || data.address || "",
        accuracy: geocodeResult.accuracy,
        speed: 0, // Default value as requested
        status: 1, // 1 = active
        battery: 0, // Default value as requested
        notes: `Check-in at ${data.customerName || "customer location"}`,
        timestamp: new Date().toISOString(),
      }

      const gpsResult = await gpsTrackingApi.create(gpsTrackingData)
      console.log("GPS tracking created:", gpsResult)

      // Store GPS tracking ID in the response for later deletion
      if (gpsResult.data) {
        response.gpsTrackingId = gpsResult.data.id
      }
    } catch (gpsError) {
      console.error("Failed to create GPS tracking, but check-in was successful:", gpsError)
      // Don't fail the check-in if GPS tracking fails
    }

    setTimeout(() => {
      window.location.reload()
    }, 500)

    return response
  } catch (error) {
    console.error("Error performing check-in:", error)
    throw error
  }
}

export async function performCheckOut(id: string): Promise<CheckRecord> {
  try {
    console.log("Performing check-out for record ID:", id)

    const response = await apiRequest(`/CheckRecord/check-out/${id}`, {
      method: "POST",
      body: "",
    })

    console.log("Check-out performed successfully:", response)

    try {
      // Find the GPS tracking record for this professional and delete it
      const checkRecord = response
      if (checkRecord.professionalId && checkRecord.companyId) {
        // Get active GPS tracking records for this professional
        const gpsRecords = await gpsTrackingApi.getRecords({
          professionalId: checkRecord.professionalId,
          companyId: checkRecord.companyId.toString(),
          status: 1, // Active status
        })

        if (gpsRecords.data && gpsRecords.data.data.length > 0) {
          // Delete the most recent active GPS tracking record
          const activeRecord = gpsRecords.data.data[0]
          const deleteResult = await gpsTrackingApi.delete(activeRecord.id)

          if (deleteResult.success) {
            console.log("GPS tracking deleted successfully:", activeRecord.id)
          } else {
            console.error("Failed to delete GPS tracking:", deleteResult.error)
          }
        } else {
          console.warn("No active GPS tracking record found for this professional")
        }
      }
    } catch (gpsError) {
      console.error("Failed to delete GPS tracking, but check-out was successful:", gpsError)
      // Don't fail the check-out if GPS tracking deletion fails
    }

    try {
      if (response.appointmentId) {
        // Fetch the appointment to get all required fields
        const appointmentResponse = await apiRequest(`/Appointment/${response.appointmentId}`)

        if (appointmentResponse) {
          await updateCompanyAppointment(response.appointmentId, {
            ...appointmentResponse,
            status: 2, // Completed
            start: new Date(appointmentResponse.start).toISOString(),
            end: new Date(appointmentResponse.end).toISOString(),
          })
          console.log("Appointment status updated to Completed")
        }
      }
    } catch (appointmentError) {
      console.error("Failed to update appointment status:", appointmentError)
      // Don't fail the check-out if appointment update fails
    }

    // The calling page will handle the reload after payment confirmation

    return response
  } catch (error) {
    console.error("Error performing check-out:", error)
    throw error
  }
}

// Helper functions for getting related data
export async function getProfessionals(companyId: string) {
  try {
    if (!companyId) {
      throw new Error("Company ID is required")
    }
    const endpoint = `/Professional?CompanyId=${companyId}`
    const data = await apiRequest(endpoint)
    return data.results || data || []
  } catch (error) {
    console.error("Error fetching professionals:", error)
    return []
  }
}

export async function getCompanies() {
  try {
    const data = await apiRequest("/Companies/paged")
    return data.result || data || []
  } catch (error) {
    console.error("Error fetching companies:", error)
    return []
  }
}

export async function getCustomers(companyId: string) {
  try {
    if (!companyId) {
      throw new Error("Company ID is required")
    }
    const endpoint = `/Customer?CompanyId=${companyId}`
    const data = await apiRequest(endpoint)
    return data.results || data || []
  } catch (error) {
    console.error("Error fetching customers:", error)
    return []
  }
}

export async function getTeams(companyId: string) {
  try {
    if (!companyId) {
      throw new Error("Company ID is required")
    }
    const endpoint = `/Team?CompanyId=${companyId}`
    const data = await apiRequest(endpoint)
    return data.results || data || []
  } catch (error) {
    console.error("Error fetching teams:", error)
    return []
  }
}

export async function getAppointments(filters: {
  companyId: string
  professionalId?: string
  customerId?: string
  startDate?: string
  endDate?: string
}) {
  try {
    if (!filters.companyId) {
      throw new Error("Company ID is required")
    }

    const params = new URLSearchParams()

    if (filters.companyId) params.append("CompanyId", filters.companyId)
    if (filters.professionalId) params.append("ProfessionalId", filters.professionalId)
    if (filters.customerId) params.append("CustomerId", filters.customerId)
    if (filters.startDate) params.append("StartDate", filters.startDate)
    if (filters.endDate) params.append("EndDate", filters.endDate)

    const queryString = params.toString()
    const endpoint = `/Appointment?${queryString}`

    const data = await apiRequest(endpoint)
    return data.results || data || []
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return []
  }
}

// Buscar registros por profissional
export async function getCheckRecordsByProfessional(professionalId: number): Promise<CheckRecord[]> {
  try {
    const response = await apiRequest(`/CheckRecord?ProfessionalId=${professionalId}`)
    return response.results || []
  } catch (error) {
    console.error("Error fetching check records by professional:", error)
    throw error
  }
}

// Buscar registros por empresa
export async function getCheckRecordsByCompany(companyId: number): Promise<CheckRecord[]> {
  try {
    const response = await apiRequest(`/CheckRecord?CompanyId=${companyId}`)
    return response.results || []
  } catch (error) {
    console.error("Error fetching check records by company:", error)
    throw error
  }
}

// Buscar registros por data
export async function getCheckRecordsByDate(date: string): Promise<CheckRecord[]> {
  try {
    const response = await apiRequest(`/CheckRecord?StartDate=${date}&EndDate=${date}`)
    return response.results || []
  } catch (error) {
    console.error("Error fetching check records by date:", error)
    throw error
  }
}

export async function createCheckRecordFromAppointment(appointment: any): Promise<CheckRecord> {
  try {
    console.log("[v0] Creating check record from appointment:", appointment)

    let geocodeResult
    try {
      geocodeResult = await geocodeAddress(appointment.address || "")
      console.log("[v0] Geocode result:", geocodeResult)
    } catch (geocodeError) {
      console.warn("[v0] Geocoding failed, using fallback:", geocodeError)
      geocodeResult = geocodeAddressFallback(appointment.address || "")
    }

    // Structure matching the check-in API endpoint
    const payload = {
      professionalId: Number(appointment.professionalId || appointment.professional?.id),
      professionalName: appointment.professional?.name || "",
      companyId: Number(appointment.companyId || appointment.company?.id),
      customerId: Number(appointment.customerId || appointment.customer?.id),
      customerName: appointment.customer?.name || "",
      appointmentId: Number(appointment.id),
      address: appointment.address || "",
      teamId: appointment.teamId ? Number(appointment.teamId) : null,
      teamName: appointment.team?.name || null,
      serviceType: getServiceTypeText(appointment.type),
      notes: appointment.notes || "",
    }

    console.log("[v0] Sending check-in payload:", payload)

    // Call the check-in endpoint to create the check record
    const response = await apiRequest("/CheckRecord/check-in", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    console.log("[v0] Check record created successfully:", response)

    try {
      const gpsTrackingData = {
        professionalId: Number(appointment.professionalId || appointment.professional?.id),
        professionalName: appointment.professional?.name || "",
        companyId: Number(appointment.companyId || appointment.company?.id),
        companyName: appointment.company?.name || "",
        vehicle: "N/A",
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        address: geocodeResult.address || appointment.address || "",
        accuracy: geocodeResult.accuracy,
        speed: 0,
        status: 1,
        battery: 0,
        notes: `Check-in at ${appointment.customer?.name || "customer location"}`,
        timestamp: new Date().toISOString(),
      }

      console.log("[v0] Creating GPS tracking with data:", gpsTrackingData)
      const gpsResult = await gpsTrackingApi.create(gpsTrackingData)
      console.log("[v0] GPS tracking created:", gpsResult)

      if (gpsResult.data) {
        response.gpsTrackingId = gpsResult.data.id
      }
    } catch (gpsError) {
      console.error("[v0] Failed to create GPS tracking, but check-in was successful:", gpsError)
    }

    try {
      console.log("[v0] Updating appointment status to InProgress for appointment ID:", appointment.id)

      const updatePayload = {
        title: appointment.title,
        address: appointment.address,
        start: new Date(appointment.start).toISOString(),
        end: new Date(appointment.end).toISOString(),
        companyId: Number(appointment.companyId || appointment.company?.id),
        customerId: Number(appointment.customerId || appointment.customer?.id),
        teamId: appointment.teamId ? Number(appointment.teamId) : null,
        professionalId: Number(appointment.professionalId || appointment.professional?.id),
        status: 1, // InProgress
        type: appointment.type,
        notes: appointment.notes || "",
      }

      console.log("[v0] Appointment update payload:", updatePayload)

      const updateResult = await updateCompanyAppointment(appointment.id, updatePayload)
      console.log("[v0] Appointment status updated successfully:", updateResult)
    } catch (appointmentError) {
      console.error("[v0] Failed to update appointment status:", appointmentError)
      if (appointmentError instanceof Error) {
        console.error("[v0] Error details:", appointmentError.message)
      }
    }

    return response
  } catch (error) {
    console.error("[v0] Error creating check record from appointment:", error)
    throw error
  }
}

function getServiceTypeText(type: number): string {
  switch (type) {
    case 0:
      return "Regular Cleaning"
    case 1:
      return "Deep Cleaning"
    case 2:
      return "Move-in/Move-out"
    default:
      return "Other"
  }
}
