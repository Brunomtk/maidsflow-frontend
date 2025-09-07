import type {
  CompanyRecurrence,
  CompanyRecurrenceFilters,
  CompanyRecurrenceResponse,
  CreateCompanyRecurrenceRequest,
  UpdateCompanyRecurrenceRequest,
} from "@/types/company-recurrence"
import { fetchApi } from "./utils"

// Helper function to convert time string to TimeSpan format
function timeToTimeSpan(timeString: string): { ticks: number } {
  if (!timeString) return { ticks: 324000000000 } // Default 09:00:00

  // Parse time string (HH:MM or HH:MM:SS)
  const timeParts = timeString.split(":")
  const hours = Number.parseInt(timeParts[0] || "9", 10)
  const minutes = Number.parseInt(timeParts[1] || "0", 10)
  const seconds = Number.parseInt(timeParts[2] || "0", 10)

  // Convert to ticks (1 tick = 100 nanoseconds)
  const totalMilliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000
  const ticks = totalMilliseconds * 10000

  return { ticks }
}

export const companyRecurrenceApi = {
  // Get all recurrences with filters
  async getAll(filters?: CompanyRecurrenceFilters): Promise<CompanyRecurrenceResponse> {
    try {
      const params = new URLSearchParams()

      if (filters?.status) params.append("Status", filters.status)
      if (filters?.type) params.append("Type", filters.type)
      if (filters?.search) params.append("Search", filters.search)
      if (filters?.companyId) params.append("CompanyId", filters.companyId.toString())
      if (filters?.teamId) params.append("TeamId", filters.teamId.toString())
      if (filters?.customerId) params.append("CustomerId", filters.customerId.toString())
      if (filters?.startDate) params.append("StartDate", filters.startDate)
      if (filters?.endDate) params.append("EndDate", filters.endDate)
      if (filters?.pageNumber) params.append("PageNumber", filters.pageNumber.toString())
      if (filters?.pageSize) params.append("PageSize", filters.pageSize.toString())

      const queryString = params.toString()
      const url = queryString ? `/Recurrence?${queryString}` : "/Recurrence"

      console.log("Fetching company recurrences from:", url)
      const response = await fetchApi(url)
      console.log("Company recurrences API response:", response)

      return {
        results: response.results || [],
        currentPage: response.currentPage || 1,
        pageCount: response.pageCount || 1,
        pageSize: response.pageSize || 10,
        totalItems: response.totalItems || 0,
        firstRowOnPage: response.firstRowOnPage || 1,
        lastRowOnPage: response.lastRowOnPage || 0,
      }
    } catch (error) {
      console.error("Failed to fetch company recurrences:", error)
      throw error
    }
  },

  // Get recurrence by ID
  async getById(id: number): Promise<CompanyRecurrence> {
    try {
      console.log("Fetching company recurrence by ID:", id)
      const response = await fetchApi(`/Recurrence/${id}`)
      console.log("Company recurrence by ID response:", response)
      return response
    } catch (error) {
      console.error(`Failed to fetch company recurrence with ID ${id}:`, error)
      throw error
    }
  },

  // Create new recurrence
  async create(
    data: Omit<CompanyRecurrence, "id" | "createdDate" | "updatedDate" | "customer" | "team" | "company">,
  ): Promise<CompanyRecurrence> {
    try {
      const requestData: CreateCompanyRecurrenceRequest = {
        title: data.title?.trim() || "",
        customerId: data.customerId || 0,
        address: data.address?.trim() || "",
        teamId: data.teamId || undefined,
        companyId: data.companyId || 0,
        frequency: data.frequency || 1,
        day: data.day || 1,
        time: timeToTimeSpan(data.time || "09:00"),
        duration: data.duration || 60,
        status: data.status || 1,
        type: data.type || 1,
        startDate: data.startDate || new Date().toISOString(),
        endDate: data.endDate || undefined,
        notes: data.notes?.trim() || undefined,
      }

      console.log("Creating company recurrence with data:", requestData)
      const response = await fetchApi("/Recurrence", {
        method: "POST",
        body: JSON.stringify(requestData),
      })
      console.log("Create company recurrence response:", response)
      return response
    } catch (error) {
      console.error("Failed to create company recurrence:", error)
      throw error
    }
  },

  // Update recurrence
  async update(id: number, data: Partial<CompanyRecurrence>): Promise<CompanyRecurrence> {
    try {
      const requestData: UpdateCompanyRecurrenceRequest = {
        title: data.title?.trim() || "",
        customerId: data.customerId || 0,
        address: data.address?.trim() || "",
        teamId: data.teamId || undefined,
        companyId: data.companyId || 0,
        frequency: data.frequency || 1,
        day: data.day || 1,
        time: timeToTimeSpan(data.time || "09:00"),
        duration: data.duration || 60,
        status: data.status || 1,
        type: data.type || 1,
        startDate: data.startDate || new Date().toISOString(),
        endDate: data.endDate || undefined,
        notes: data.notes?.trim() || undefined,
        lastExecution: data.lastExecution || undefined,
        nextExecution: data.nextExecution || undefined,
      }

      console.log("Updating company recurrence with data:", requestData)
      const response = await fetchApi(`/Recurrence/${id}`, {
        method: "PUT",
        body: JSON.stringify(requestData),
      })
      console.log("Update company recurrence response:", response)
      return response
    } catch (error) {
      console.error(`Failed to update company recurrence with ID ${id}:`, error)
      throw error
    }
  },

  // Delete recurrence
  async delete(id: number): Promise<void> {
    try {
      console.log("Deleting company recurrence with ID:", id)
      await fetchApi(`/Recurrence/${id}`, {
        method: "DELETE",
      })
      console.log("Company recurrence deleted successfully")
    } catch (error) {
      console.error(`Failed to delete company recurrence with ID ${id}:`, error)
      throw error
    }
  },

  // Get customers for dropdown
  async getCustomers(companyId?: number): Promise<any[]> {
    try {
      console.log("Fetching customers for company recurrence dropdown", { companyId })

      const params = new URLSearchParams()
      if (companyId) params.append("CompanyId", companyId.toString())
      params.append("PageSize", "100")

      const queryString = params.toString()
      const url = queryString ? `/Customer?${queryString}` : "/Customer?PageSize=100"

      const response = await fetchApi(url)
      console.log("Customers response:", response)

      if (response.results && Array.isArray(response.results)) {
        return response.results
      } else if (Array.isArray(response)) {
        return response
      }

      return []
    } catch (error) {
      console.error("Failed to fetch customers:", error)
      return []
    }
  },

  // Get teams for dropdown
  async getTeams(companyId?: number): Promise<any[]> {
    try {
      console.log("Fetching teams for company recurrence dropdown", { companyId })

      const params = new URLSearchParams()
      if (companyId) params.append("CompanyId", companyId.toString())
      params.append("PageSize", "100")

      const queryString = params.toString()
      const url = queryString ? `/Team?${queryString}` : "/Team?PageSize=100"

      const response = await fetchApi(url)
      console.log("Teams response:", response)

      if (response.results && Array.isArray(response.results)) {
        return response.results
      } else if (Array.isArray(response)) {
        return response
      }

      return []
    } catch (error) {
      console.error("Failed to fetch teams:", error)
      return []
    }
  },
}

// Legacy functions for backward compatibility
export async function getCompanyRecurrences(
  companyId: number,
  filters?: CompanyRecurrenceFilters,
): Promise<CompanyRecurrence[]> {
  const response = await companyRecurrenceApi.getAll({ ...filters, companyId })
  return response.results
}

export async function getCompanyRecurrenceById(id: string): Promise<CompanyRecurrence> {
  return await companyRecurrenceApi.getById(Number.parseInt(id))
}

export async function createCompanyRecurrence(
  data: Omit<CompanyRecurrence, "id" | "createdDate" | "updatedDate" | "customer" | "team" | "company">,
): Promise<CompanyRecurrence> {
  return await companyRecurrenceApi.create(data)
}

export async function updateCompanyRecurrence(
  id: string,
  data: Partial<CompanyRecurrence>,
): Promise<CompanyRecurrence> {
  return await companyRecurrenceApi.update(Number.parseInt(id), data)
}

export async function deleteCompanyRecurrence(id: string): Promise<void> {
  return await companyRecurrenceApi.delete(Number.parseInt(id))
}
