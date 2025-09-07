import { fetchApi } from "./utils"
import type {
  Company,
  CompanyCreateRequest,
  CompanyUpdateRequest,
  CompanyFilters,
  CompanyPagedResponse,
} from "@/types/company"

export const companiesApi = {
  // Get all companies (for dropdowns, etc.)
  async getAll(): Promise<{ data?: Company[]; error?: string }> {
    try {
      const response = await fetchApi("/Companies")
      return { data: response }
    } catch (error) {
      console.error("Error fetching all companies:", error)
      return { error: error instanceof Error ? error.message : "Failed to fetch companies" }
    }
  },

  // Get paginated companies
  async getRecords(filters: CompanyFilters = {}): Promise<{ data?: CompanyPagedResponse; error?: string }> {
    try {
      const params = new URLSearchParams()
      if (filters.status && filters.status !== "all") {
        const statusValue = filters.status === "active" ? 1 : 0
        params.append("Status", statusValue.toString())
      }
      if (filters.searchQuery) params.append("Name", filters.searchQuery)
      if (filters.planId) params.append("PlanId", filters.planId.toString())
      if (filters.pageNumber) params.append("Page", filters.pageNumber.toString())
      if (filters.pageSize) params.append("PageSize", filters.pageSize.toString())

      const query = params.toString()
      const url = query ? `/Companies/paged?${query}` : "/Companies/paged"
      const response = await fetchApi(url)
      return { data: response }
    } catch (error) {
      console.error("Error fetching companies:", error)
      return { error: error instanceof Error ? error.message : "Failed to fetch companies" }
    }
  },

  // Get a company by ID
  async getById(id: number): Promise<{ data?: Company; error?: string }> {
    try {
      const response = await fetchApi(`/Companies/${id}`)
      return { data: response }
    } catch (error) {
      console.error("Error fetching company:", error)
      return { error: error instanceof Error ? error.message : "Failed to fetch company" }
    }
  },

  // Create a new company
  async create(data: CompanyCreateRequest): Promise<{ data?: Company; error?: string }> {
    try {
      await fetchApi("/Companies", {
        method: "POST",
        body: JSON.stringify(data),
      })
      return { data: data as Company }
    } catch (error) {
      console.error("Error creating company:", error)
      return { error: error instanceof Error ? error.message : "Failed to create company" }
    }
  },

  // Update a company
  async update(id: number, data: CompanyUpdateRequest): Promise<{ data?: Company; error?: string }> {
    try {
      await fetchApi(`/Companies/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
      return { data: { id, ...data } as Company }
    } catch (error) {
      console.error("Error updating company:", error)
      return { error: error instanceof Error ? error.message : "Failed to update company" }
    }
  },

  // Delete a company
  async delete(id: number): Promise<{ success?: boolean; error?: string }> {
    try {
      await fetchApi(`/Companies/${id}`, {
        method: "DELETE",
      })
      return { success: true }
    } catch (error) {
      console.error("Error deleting company:", error)
      return { error: error instanceof Error ? error.message : "Failed to delete company" }
    }
  },

  // Update company status
  async updateStatus(id: number, status: number): Promise<{ data?: Company; error?: string }> {
    try {
      const updateData: CompanyUpdateRequest = { status }
      return companiesApi.update(id, updateData)
    } catch (error) {
      console.error("Error updating company status:", error)
      return { error: error instanceof Error ? error.message : "Failed to update status" }
    }
  },
}

// Legacy exports for backward compatibility
export const getCompanies = companiesApi.getRecords
export const getCompany = companiesApi.getById
export const createCompany = companiesApi.create
export const updateCompany = companiesApi.update
export const deleteCompany = companiesApi.delete
