import { fetchApi } from "./utils"
import type {
  GPSTracking,
  GPSTrackingCreateRequest,
  GPSTrackingUpdateRequest,
  GPSTrackingFilters,
  GPSTrackingPagedResponse,
} from "@/types/gps-tracking"

export const gpsTrackingApi = {
  // Get paginated GPS tracking records
  async getRecords(filters: GPSTrackingFilters = {}): Promise<{ data?: GPSTrackingPagedResponse; error?: string }> {
    try {
      const params = new URLSearchParams()
      if (filters.status && filters.status !== "all") params.append("Status", filters.status.toString())
      if (filters.companyId) params.append("CompanyId", filters.companyId.toString())
      if (filters.professionalId) params.append("ProfessionalId", filters.professionalId.toString())
      if (filters.searchQuery) params.append("SearchQuery", filters.searchQuery)
      if (filters.dateFrom) params.append("DateFrom", filters.dateFrom)
      if (filters.dateTo) params.append("DateTo", filters.dateTo)
      if (filters.pageNumber) params.append("PageNumber", filters.pageNumber.toString())
      if (filters.pageSize) params.append("PageSize", filters.pageSize.toString())

      const query = params.toString()
      const url = query ? `/GpsTracking/paged?${query}` : "/GpsTracking/paged"
      const response = await fetchApi(url)
      return { data: response }
    } catch (error) {
      console.error("Error fetching GPS tracking records:", error)
      return { error: error instanceof Error ? error.message : "Failed to fetch records" }
    }
  },

  // Get a record by ID
  async getById(id: number): Promise<{ data?: GPSTracking; error?: string }> {
    try {
      const response = await fetchApi(`/GpsTracking/${id}`)
      return { data: response }
    } catch (error) {
      console.error("Error fetching GPS tracking record:", error)
      return { error: error instanceof Error ? error.message : "Failed to fetch record" }
    }
  },

  // Create a new record
  async create(data: GPSTrackingCreateRequest): Promise<{ data?: GPSTracking; error?: string }> {
    try {
      const response = await fetchApi("/GpsTracking/create", {
        method: "POST",
        body: JSON.stringify(data),
      })
      return { data: response }
    } catch (error) {
      console.error("Error creating GPS tracking record:", error)
      return { error: error instanceof Error ? error.message : "Failed to create record" }
    }
  },

  // Update a record
  async update(id: number, data: GPSTrackingUpdateRequest): Promise<{ data?: GPSTracking; error?: string }> {
    try {
      const response = await fetchApi(`/GpsTracking/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
      return { data: response }
    } catch (error) {
      console.error("Error updating GPS tracking record:", error)
      return { error: error instanceof Error ? error.message : "Failed to update record" }
    }
  },

  // Delete a record
  async delete(id: number): Promise<{ success?: boolean; error?: string }> {
    try {
      await fetchApi(`/GpsTracking/${id}`, {
        method: "DELETE",
      })
      return { success: true }
    } catch (error) {
      console.error("Error deleting GPS tracking record:", error)
      return { error: error instanceof Error ? error.message : "Failed to delete record" }
    }
  },

  // Update status only
  async updateStatus(id: number, status: number): Promise<{ data?: GPSTracking; error?: string }> {
    try {
      const { data: current } = await gpsTrackingApi.getById(id)
      if (!current) throw new Error("Record not found")

      const update: GPSTrackingUpdateRequest = {
        professionalId: current.professionalId,
        professionalName: current.professionalName,
        companyId: current.companyId,
        companyName: current.companyName,
        vehicle: current.vehicle,
        latitude: current.location.latitude,
        longitude: current.location.longitude,
        address: current.location.address,
        accuracy: current.location.accuracy,
        speed: current.speed,
        battery: current.battery,
        notes: current.notes,
        status,
        timestamp: new Date().toISOString(),
      }
      return gpsTrackingApi.update(id, update)
    } catch (error) {
      console.error("Error updating GPS tracking status:", error)
      return { error: error instanceof Error ? error.message : "Failed to update status" }
    }
  },

  // Update location only
  async updateLocation(
    id: number,
    location: { latitude: number; longitude: number; address: string; accuracy: number },
  ): Promise<{ data?: GPSTracking; error?: string }> {
    try {
      const { data: current } = await gpsTrackingApi.getById(id)
      if (!current) throw new Error("Record not found")

      const update: GPSTrackingUpdateRequest = {
        professionalId: current.professionalId,
        professionalName: current.professionalName,
        companyId: current.companyId,
        companyName: current.companyName,
        vehicle: current.vehicle,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        accuracy: location.accuracy,
        speed: current.speed,
        battery: current.battery,
        notes: current.notes,
        status: current.status,
        timestamp: new Date().toISOString(),
      }
      return gpsTrackingApi.update(id, update)
    } catch (error) {
      console.error("Error updating GPS tracking location:", error)
      return { error: error instanceof Error ? error.message : "Failed to update location" }
    }
  },
}

// Legacy exports for backward compatibility (deprecated)
export const getGpsTrackingRecords = gpsTrackingApi.getRecords
export const getGpsTrackingRecord = gpsTrackingApi.getById
export const createGpsTrackingRecord = gpsTrackingApi.create
export const updateGpsTrackingRecord = gpsTrackingApi.update
export const deleteGpsTrackingRecord = gpsTrackingApi.delete
export const updateGpsTrackingStatus = gpsTrackingApi.updateStatus
export const updateGpsTrackingLocation = gpsTrackingApi.updateLocation
