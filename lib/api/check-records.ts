import { apiRequest } from "./utils"

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
      customerId: Number(data.customerId),
      customerName: data.customerName || "",
      appointmentId: Number(data.appointmentId),
      address: data.address || "",
      teamId: data.teamId ? Number(data.teamId) : null,
      teamName: data.teamName || null,
      serviceType: data.serviceType || "",
      notes: data.notes || "",
    }

    const response = await apiRequest("/CheckRecord/check-in", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    console.log("Check-in performed successfully:", response)
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
