import type { Recurrence, RecurrenceFilters, RecurrenceResponse } from "@/types/recurrence"
import { fetchApi } from "./utils"

// Helper function to convert time string to TimeSpan format
function timeToTimeSpan(timeString: string): string {
  if (!timeString) return "09:00:00"

  // If it's already in HH:MM format, add seconds
  if (timeString.match(/^\d{2}:\d{2}$/)) {
    return `${timeString}:00`
  }

  // If it's already in HH:MM:SS format, return as is
  if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
    return timeString
  }

  // Default fallback
  return "09:00:00"
}

export const recurrencesApi = {
  // Get all recurrences with filters
  async getAll(filters?: RecurrenceFilters): Promise<RecurrenceResponse> {
    try {
      const params = new URLSearchParams()

      if (filters?.name) params.append("Name", filters.name)
      if (filters?.description) params.append("Description", filters.description)
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

      console.log("Fetching recurrences from:", url)
      const response = await fetchApi(url)
      console.log("Recurrences API response:", response)

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
      console.error("Failed to fetch recurrences:", error)
      throw error
    }
  },

  // Get recurrence by ID
  async getById(id: number): Promise<Recurrence> {
    try {
      console.log("Fetching recurrence by ID:", id)
      const response = await fetchApi(`/Recurrence/${id}`)
      console.log("Recurrence by ID response:", response)
      return response
    } catch (error) {
      console.error(`Failed to fetch recurrence with ID ${id}:`, error)
      throw error
    }
  },

  // Create new recurrence
  async create(
    data: Omit<Recurrence, "id" | "createdDate" | "updatedDate" | "customer" | "team" | "company">,
  ): Promise<Recurrence> {
    try {
      // Create the DTO object with correct capitalized field names
      const dto = {
        Title: data.title?.trim() || "",
        CustomerId: data.customerId || 0,
        Address: data.address?.trim() || "",
        TeamId: data.teamId || null,
        CompanyId: data.companyId || 0,
        Frequency: data.frequency || 1,
        Day: data.day || 1,
        Time: timeToTimeSpan(data.time || "09:00"),
        Duration: data.duration || 60,
        Status: data.status || 1,
        Type: data.type || 1,
        StartDate: data.startDate || new Date().toISOString(),
        EndDate: data.endDate || null,
        Notes: data.notes?.trim() || null,
      }

      const requestData = { dto }

      console.log("Creating recurrence with DTO:", requestData)
      const response = await fetchApi("/Recurrence", {
        method: "POST",
        body: JSON.stringify(requestData),
      })
      console.log("Create recurrence response:", response)
      return response
    } catch (error) {
      console.error("Failed to create recurrence:", error)
      throw error
    }
  },

  // Update recurrence
  async update(id: number, data: Partial<Recurrence>): Promise<Recurrence> {
    try {
      // Create the DTO object with correct capitalized field names
      const dto = {
        Title: data.title?.trim() || "",
        CustomerId: data.customerId || 0,
        Address: data.address?.trim() || "",
        TeamId: data.teamId || null,
        CompanyId: data.companyId || 0,
        Frequency: data.frequency || 1,
        Day: data.day || 1,
        Time: timeToTimeSpan(data.time || "09:00"),
        Duration: data.duration || 60,
        Status: data.status || 1,
        Type: data.type || 1,
        StartDate: data.startDate || new Date().toISOString(),
        EndDate: data.endDate || null,
        Notes: data.notes?.trim() || null,
        LastExecution: data.lastExecution || null,
        NextExecution: data.nextExecution || null,
      }

      const requestData = { dto }

      console.log("Updating recurrence with DTO:", requestData)
      const response = await fetchApi(`/Recurrence/${id}`, {
        method: "PUT",
        body: JSON.stringify(requestData),
      })
      console.log("Update recurrence response:", response)
      return response
    } catch (error) {
      console.error(`Failed to update recurrence with ID ${id}:`, error)
      throw error
    }
  },

  // Delete recurrence
  async delete(id: number): Promise<void> {
    try {
      console.log("Deleting recurrence with ID:", id)
      await fetchApi(`/Recurrence/${id}`, {
        method: "DELETE",
      })
      console.log("Recurrence deleted successfully")
    } catch (error) {
      console.error(`Failed to delete recurrence with ID ${id}:`, error)
      throw error
    }
  },

  // Get companies for dropdown
  async getCompanies(): Promise<any[]> {
    try {
      console.log("Fetching companies for recurrence dropdown")

      // Try different endpoints
      const endpoints = ["/Companies", "/Company"]

      for (const endpoint of endpoints) {
        try {
          const response = await fetchApi(`${endpoint}?pageSize=100`)
          console.log(`Companies from ${endpoint}:`, response)

          if (response.results && Array.isArray(response.results)) {
            return response.results
          } else if (Array.isArray(response)) {
            return response
          }
        } catch (error) {
          console.log(`Failed to fetch from ${endpoint}, trying next...`)
          continue
        }
      }

      return []
    } catch (error) {
      console.error("Failed to fetch companies:", error)
      return []
    }
  },

  // Get customers for dropdown
  async getCustomers(companyId?: number): Promise<any[]> {
    try {
      console.log("Fetching customers for recurrence dropdown", { companyId })

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
      console.log("Fetching teams for recurrence dropdown", { companyId })

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
export async function getRecurrences(): Promise<Recurrence[]> {
  const response = await recurrencesApi.getAll()
  return response.results
}

export async function getRecurrenceById(id: string): Promise<Recurrence> {
  return await recurrencesApi.getById(Number.parseInt(id))
}

export async function createRecurrence(
  data: Omit<Recurrence, "id" | "createdDate" | "updatedDate" | "customer" | "team" | "company">,
): Promise<Recurrence> {
  return await recurrencesApi.create(data)
}

export async function updateRecurrence(id: string, data: Partial<Recurrence>): Promise<Recurrence> {
  return await recurrencesApi.update(Number.parseInt(id), data)
}

export async function deleteRecurrence(id: string): Promise<void> {
  return await recurrencesApi.delete(Number.parseInt(id))
}

export async function getRecurrencesByCompany(companyId: string): Promise<Recurrence[]> {
  const response = await recurrencesApi.getAll({ companyId: Number.parseInt(companyId) })
  return response.results
}

export async function getRecurrencesByCustomer(customerId: string): Promise<Recurrence[]> {
  const response = await recurrencesApi.getAll({ customerId: Number.parseInt(customerId) })
  return response.results
}

export async function getRecurrencesByTeam(teamId: string): Promise<Recurrence[]> {
  const response = await recurrencesApi.getAll({ teamId: Number.parseInt(teamId) })
  return response.results
}

export async function getRecurrencesByStatus(status: string): Promise<Recurrence[]> {
  const response = await recurrencesApi.getAll({ status })
  return response.results
}

export async function getRecurrencesByType(type: string): Promise<Recurrence[]> {
  const response = await recurrencesApi.getAll({ type })
  return response.results
}

export async function searchRecurrences(query: string): Promise<Recurrence[]> {
  const response = await recurrencesApi.getAll({ search: query })
  return response.results
}
