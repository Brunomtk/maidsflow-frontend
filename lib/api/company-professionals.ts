import type { ApiResponse, Professional, PaginatedResponse } from "@/types"
import { fetchApi } from "./utils"

export interface ProfessionalWithDetails extends Professional {
  // Extend with any real additional fields if available
}

// Base endpoint
const API_BASE = "/Professional"

export const companyProfessionalsApi = {
  // List professionals with pagination and optional filtering
  async getCompanyProfessionals(
    companyId: string,
    page = 1,
    limit = 10,
    status?: string,
    teamId?: string,
    search?: string,
  ): Promise<ApiResponse<PaginatedResponse<Professional>>> {
    try {
      const params = new URLSearchParams({
        CompanyId: companyId,
        Page: String(page),
        PageSize: String(limit),
      })
      if (teamId && teamId !== "all") params.append("TeamId", teamId)

      const res = await fetchApi<PaginatedResponse<Professional>>(
        `${API_BASE}/paged?${params}`,
      )
      let results = res.results || []

      if (status && status !== "all") {
        results = results.filter(
          (p) => p.status.toLowerCase() === status.toLowerCase(),
        )
      }
      if (search) {
        const q = search.toLowerCase()
        results = results.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.cpf.includes(search) ||
            p.email.toLowerCase().includes(q) ||
            p.phone.includes(search),
        )
      }

      return {
        data: {
          data: results,
          meta: {
            currentPage: res.currentPage,
            totalPages: res.pageCount,
            totalItems: res.totalItems,
            itemsPerPage: res.pageSize,
          },
        },
      }
    } catch (err) {
      console.error("getCompanyProfessionals error:", err)
      return { error: "Failed to fetch professionals", status: 500 }
    }
  },

  // Get one professional by ID
  async getCompanyProfessionalById(
    companyId: string,
    id: string,
  ): Promise<ApiResponse<ProfessionalWithDetails>> {
    try {
      const p = await fetchApi<ProfessionalWithDetails>(`${API_BASE}/${id}`)
      if (String(p.companyId) !== companyId) {
        return { error: "Professional not found in this company", status: 404 }
      }
      return { data: p }
    } catch (err) {
      console.error("getCompanyProfessionalById error:", err)
      return { error: "Failed to fetch professional", status: 500 }
    }
  },

  // Create professional
  async createCompanyProfessional(
    companyId: string,
    pd: Omit<Professional, "id" | "createdAt" | "updatedAt" | "rating" | "completedServices">,
  ): Promise<ApiResponse<Professional>> {
    try {
      const req = {
        ...pd,
        companyId: Number(companyId),
      }
      const p = await fetchApi<Professional>(API_BASE, {
        method: "POST",
        body: JSON.stringify(req),
      })
      return { data: p }
    } catch (err) {
      console.error("createCompanyProfessional error:", err)
      return { error: "Failed to create professional", status: 500 }
    }
  },

  // Update professional
  async updateCompanyProfessional(
    companyId: string,
    id: string,
    pd: Partial<Professional>,
  ): Promise<ApiResponse<Professional>> {
    // ensure belongs
    const check = await this.getCompanyProfessionalById(companyId, id)
    if (check.error) return check as any

    try {
      const req: Partial<Professional> = { ...pd }
      const p = await fetchApi<Professional>(`${API_BASE}/${id}`, {
        method: "PUT",
        body: JSON.stringify(req),
      })
      return { data: p }
    } catch (err) {
      console.error("updateCompanyProfessional error:", err)
      return { error: "Failed to update professional", status: 500 }
    }
  },

  // Delete professional
  async deleteCompanyProfessional(companyId: string, id: string): Promise<ApiResponse<null>> {
    const check = await this.getCompanyProfessionalById(companyId, id)
    if (check.error) return check as any

    try {
      await fetchApi<void>(`${API_BASE}/${id}`, { method: "DELETE" })
      return { data: null }
    } catch (err) {
      console.error("deleteCompanyProfessional error:", err)
      return { error: "Failed to delete professional", status: 500 }
    }
  },

  // Professional's schedule (calls real endpoint)
  async getCompanyProfessionalSchedule(
    companyId: string,
    id: string,
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<{ date: string; appointments: any[] }[]>> {
    const check = await this.getCompanyProfessionalById(companyId, id)
    if (check.error) return check as any

    try {
      const params = new URLSearchParams({ startDate, endDate })
      const schedule = await fetchApi<{ date: string; appointments: any[] }[]>(
        `${API_BASE}/${id}/schedule?${params}`,
      )
      return { data: schedule }
    } catch (err) {
      console.error("getCompanyProfessionalSchedule error:", err)
      return { error: "Failed to fetch professional schedule", status: 500 }
    }
  },

  // Fetch teams for the company
  async getCompanyTeams(companyId: string): Promise<ApiResponse<{ id: string; name: string }[]>> {
    try {
      const teams = await fetchApi<{ id: string; name: string }[]>(
        `/Team?CompanyId=${companyId}`,
      )
      return { data: teams }
    } catch (err) {
      console.error("getCompanyTeams error:", err)
      return { error: "Failed to fetch teams", status: 500 }
    }
  },
}
