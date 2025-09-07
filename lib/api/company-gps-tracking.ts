import type {
  GPSTracking,
  GPSTrackingCreateRequest,
  GPSTrackingUpdateRequest,
  GPSTrackingPagedResponse,
  CompanyGPSTrackingFilters,
} from "@/types/gps-tracking"
import { fetchApi } from "./utils"

// Get GPS tracking records for a specific company
export async function getCompanyGpsTrackingRecords(
  companyId: string,
  filters?: CompanyGPSTrackingFilters,
): Promise<GPSTrackingPagedResponse> {
  try {
    const params = new URLSearchParams()
    params.append("CompanyId", companyId)

    if (filters?.status && filters.status !== "all") {
      params.append("Status", filters.status.toString())
    }
    if (filters?.professionalId) {
      params.append("ProfessionalId", filters.professionalId.toString())
    }
    if (filters?.searchQuery) {
      params.append("SearchQuery", filters.searchQuery)
    }
    if (filters?.dateFrom) {
      params.append("DateFrom", filters.dateFrom)
    }
    if (filters?.dateTo) {
      params.append("DateTo", filters.dateTo)
    }
    if (filters?.pageNumber) {
      params.append("PageNumber", filters.pageNumber.toString())
    }
    if (filters?.pageSize) {
      params.append("PageSize", filters.pageSize.toString())
    }

    return await fetchApi<GPSTrackingPagedResponse>(`/GpsTracking/paged?${params.toString()}`)
  } catch (error) {
    console.error(`Error fetching GPS tracking records for company ${companyId}:`, error)
    throw error
  }
}

// Get a specific GPS tracking record for a company
export async function getCompanyGpsTrackingRecord(
  companyId: string,
  id: string,
): Promise<GPSTracking> {
  try {
    const data = await fetchApi<GPSTracking>(`/GpsTracking/${id}`)
    if (data.companyId !== Number(companyId)) {
      throw new Error("GPS tracking record does not belong to this company")
    }
    return data
  } catch (error) {
    console.error(`Error fetching GPS tracking record ${id} for company ${companyId}:`, error)
    throw error
  }
}

// Create GPS tracking record for a company
export async function createCompanyGpsTrackingRecord(
  companyId: string,
  bodyData: Omit<GPSTrackingCreateRequest, "companyId">,
): Promise<GPSTracking> {
  try {
    return await fetchApi<GPSTracking>(`/GpsTracking/create`, {
      method: "POST",
      body: JSON.stringify({ ...bodyData, companyId: Number(companyId) }),
    })
  } catch (error) {
    console.error(`Error creating GPS tracking record for company ${companyId}:`, error)
    throw error
  }
}

// Update GPS tracking record for a company
export async function updateCompanyGpsTrackingRecord(
  companyId: string,
  id: string,
  bodyData: Omit<GPSTrackingUpdateRequest, "companyId">,
): Promise<GPSTracking> {
  try {
    return await fetchApi<GPSTracking>(`/GpsTracking/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...bodyData, companyId: Number(companyId) }),
    })
  } catch (error) {
    console.error(`Error updating GPS tracking record ${id} for company ${companyId}:`, error)
    throw error
  }
}

// Delete GPS tracking record for a company
export async function deleteCompanyGpsTrackingRecord(
  companyId: string,
  id: string,
): Promise<void> {
  try {
    // verify ownership
    await getCompanyGpsTrackingRecord(companyId, id)
    await fetchApi<void>(`/GpsTracking/${id}`, { method: "DELETE" })
  } catch (error) {
    console.error(`Error deleting GPS tracking record ${id} for company ${companyId}:`, error)
    throw error
  }
}

// Get GPS tracking records for a specific team in a company
export function getCompanyTeamGpsTrackingRecords(
  companyId: string,
  teamId: string,
): Promise<GPSTrackingPagedResponse> {
  return getCompanyGpsTrackingRecords(companyId, { teamId })
}

// Get GPS tracking records for a specific professional in a company
export function getCompanyProfessionalGpsTrackingRecords(
  companyId: string,
  professionalId: string,
): Promise<GPSTrackingPagedResponse> {
  return getCompanyGpsTrackingRecords(companyId, { professionalId: Number(professionalId) })
}

// Get active GPS tracking records for a company
export function getCompanyActiveGpsTracking(
  companyId: string,
): Promise<GPSTrackingPagedResponse> {
  return getCompanyGpsTrackingRecords(companyId, { status: 1 })
}

// Get inactive GPS tracking records for a company
export function getCompanyInactiveGpsTracking(
  companyId: string,
): Promise<GPSTrackingPagedResponse> {
  return getCompanyGpsTrackingRecords(companyId, { status: 2 })
}

// Update GPS tracking status for a company's professional
export async function updateCompanyGpsTrackingStatus(
  companyId: string,
  id: string,
  status: number,
): Promise<GPSTracking> {
  try {
    const current = await getCompanyGpsTrackingRecord(companyId, id)
    const updateData: Omit<GPSTrackingUpdateRequest, "companyId"> = {
      professionalId: current.professionalId,
      professionalName: current.professionalName,
      companyName: current.companyName,
      vehicle: current.vehicle,
      latitude: current.location.latitude,
      longitude: current.location.longitude,
      address: current.location.address,
      accuracy: current.location.accuracy,
      speed: current.speed,
      status,
      battery: current.battery,
      notes: current.notes,
      timestamp: new Date().toISOString(),
    }
    return await updateCompanyGpsTrackingRecord(companyId, id, updateData)
  } catch (error) {
    console.error(`Error updating GPS tracking status for ${id} in company ${companyId}:`, error)
    throw error
  }
}

// Get GPS tracking records by status for a company
export function getCompanyGpsTrackingByStatus(
  companyId: string,
  status: number | "all",
): Promise<GPSTrackingPagedResponse> {
  return getCompanyGpsTrackingRecords(companyId, {
    status: status === "all" ? undefined : status,
  })
}

// Search GPS tracking records for a company
export function searchCompanyGpsTracking(
  companyId: string,
  query: string,
): Promise<GPSTrackingPagedResponse> {
  return getCompanyGpsTrackingRecords(companyId, { searchQuery: query })
}
