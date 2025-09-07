import type {
  ApiResponse,
  Professional,
  CreateProfessionalRequest,
  UpdateProfessionalRequest,
  ProfessionalWithDetails,
  ProfessionalFilters,
  ProfessionalPagedResponse,
} from "@/types"
import { apiDelay, getApiUrl } from "./utils"

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("noah_token")
  }
  return null
}

// Helper function to create headers
const createHeaders = (): HeadersInit => {
  const token = getAuthToken()
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Individual API functions
export async function getProfessionals(
  page = 1,
  limit = 100,
  status?: string,
  teamId?: string,
  search?: string,
  companyId?: string,
): Promise<ApiResponse<Professional[]>> {
  try {
    await apiDelay(300)

    const url = new URL(`${getApiUrl()}/Professional`)

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // The API returns a direct array, not an object with results
    let data: Professional[] = await response.json()

    // Ensure data is an array
    if (!Array.isArray(data)) {
      console.error("Professional API returned non-array data:", data)
      data = []
    }

    // Apply filters on frontend since API doesn't support them
    if (status && status !== "all") {
      data = data.filter((professional) => professional.status === status)
    }

    if (teamId && teamId !== "all") {
      data = data.filter((professional) => professional.teamId === Number.parseInt(teamId))
    }

    if (companyId && companyId !== "all") {
      data = data.filter((professional) => professional.companyId === Number.parseInt(companyId))
    }

    if (search) {
      const searchLower = search.toLowerCase()
      data = data.filter(
        (professional) =>
          professional.name.toLowerCase().includes(searchLower) ||
          professional.cpf.includes(search) ||
          professional.email.toLowerCase().includes(searchLower),
      )
    }

    // Simulate pagination
    const totalItems = data.length
    const totalPages = Math.ceil(totalItems / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = data.slice(startIndex, endIndex)

    return {
      data: {
        data: paginatedData,
        meta: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
        },
      },
      status: response.status,
    }
  } catch (error) {
    console.error("Failed to fetch professionals:", error)
    return {
      error: error instanceof Error ? error.message : "Failed to fetch professionals",
      status: 500,
    }
  }
}

export async function getProfessionalById(id: string): Promise<ApiResponse<ProfessionalWithDetails>> {
  try {
    await apiDelay(300)

    const response = await fetch(`${getApiUrl()}/Professional/${id}`, {
      method: "GET",
      headers: createHeaders(),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return {
          error: "Professional not found",
          status: 404,
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: Professional = await response.json()

    // Estender com dados adicionais de mock para compatibilidade
    const professionalWithDetails: ProfessionalWithDetails = {
      ...data,
      shift: "morning",
      weeklyHours: 40,
      photo: "",
      observations: "",
      teamName: `Team ${data.teamId}`,
      companyName: `Company ${data.companyId}`,
    }

    return {
      data: professionalWithDetails,
      status: response.status,
    }
  } catch (error) {
    console.error("Failed to fetch professional:", error)
    return {
      error: error instanceof Error ? error.message : "Failed to fetch professional",
      status: 500,
    }
  }
}

export async function createProfessional(
  professionalData: CreateProfessionalRequest,
): Promise<ApiResponse<Professional>> {
  try {
    await apiDelay(800)

    const response = await fetch(`${getApiUrl()}/Professional`, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify(professionalData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: Professional = await response.json()

    return {
      data,
      status: response.status,
      message: "Professional created successfully",
    }
  } catch (error) {
    console.error("Failed to create professional:", error)
    return {
      error: error instanceof Error ? error.message : "Failed to create professional",
      status: 500,
    }
  }
}

export async function updateProfessional(
  id: string,
  professionalData: UpdateProfessionalRequest,
): Promise<ApiResponse<Professional>> {
  try {
    await apiDelay(600)

    const response = await fetch(`${getApiUrl()}/Professional/${id}`, {
      method: "PUT",
      headers: createHeaders(),
      body: JSON.stringify(professionalData),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return {
          error: "Professional not found",
          status: 404,
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: Professional = await response.json()

    return {
      data,
      status: response.status,
      message: "Professional updated successfully",
    }
  } catch (error) {
    console.error("Failed to update professional:", error)
    return {
      error: error instanceof Error ? error.message : "Failed to update professional",
      status: 500,
    }
  }
}

export async function deleteProfessional(id: string): Promise<ApiResponse<null>> {
  try {
    await apiDelay(400)

    const response = await fetch(`${getApiUrl()}/Professional/${id}`, {
      method: "DELETE",
      headers: createHeaders(),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return {
          error: "Professional not found",
          status: 404,
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return {
      status: response.status,
      message: "Professional deleted successfully",
    }
  } catch (error) {
    console.error("Failed to delete professional:", error)
    return {
      error: error instanceof Error ? error.message : "Failed to delete professional",
      status: 500,
    }
  }
}

export async function getTeams(): Promise<ApiResponse<{ id: number; name: string }[]>> {
  try {
    await apiDelay(300)

    const response = await fetch(`${getApiUrl()}/Team?page=1&pageSize=100&status=all`, {
      method: "GET",
      headers: createHeaders(),
    })

    if (!response.ok) {
      console.error(`Teams API error: ${response.status}`)
      return {
        data: [],
        status: response.status,
      }
    }

    const data = await response.json()
    console.log("Teams API response:", data)

    // The API returns { results: [...] }
    let teams: { id: number; name: string }[] = []

    if (data.results && Array.isArray(data.results)) {
      teams = data.results.map((team: any) => ({
        id: team.id,
        name: team.name,
      }))
    }

    return { data: teams, status: 200 }
  } catch (error) {
    console.error("Failed to fetch teams:", error)
    return {
      data: [],
      error: "Failed to fetch teams",
      status: 500,
    }
  }
}

export async function getCompanies(): Promise<ApiResponse<{ id: number; name: string }[]>> {
  try {
    await apiDelay(300)

    // Usar o endpoint correto: /Companies (plural)
    const response = await fetch(`${getApiUrl()}/Companies`, {
      method: "GET",
      headers: createHeaders(),
    })

    if (!response.ok) {
      console.error(`Companies API error: ${response.status}`)
      return {
        data: [],
        status: response.status,
      }
    }

    const data = await response.json()
    console.log("Companies API response:", data)

    // A API retorna um array direto de empresas
    let companies: { id: number; name: string }[] = []

    if (Array.isArray(data)) {
      // Mapear os dados da empresa para o formato esperado
      companies = data.map((company: any) => ({
        id: company.id,
        name: company.name,
      }))
    }

    console.log("Mapped companies:", companies)
    return { data: companies, status: 200 }
  } catch (error) {
    console.error("Failed to fetch companies:", error)
    return {
      data: [],
      error: "Failed to fetch companies",
      status: 500,
    }
  }
}

export async function getProfessionalSchedule(
  id: string,
  startDate: string,
  endDate: string,
): Promise<ApiResponse<{ date: string; appointments: any[] }[]>> {
  try {
    await apiDelay(700)

    // Simulação de agenda do profissional
    const schedule = [
      {
        date: "2023-06-05",
        appointments: [
          {
            id: "1",
            title: "House Cleaning",
            customer: "John Smith",
            address: "123 Main St",
            start: "09:00",
            end: "11:00",
            status: "completed",
          },
          {
            id: "2",
            title: "Office Cleaning",
            customer: "ABC Corp",
            address: "456 Business Ave",
            start: "13:00",
            end: "15:00",
            status: "completed",
          },
        ],
      },
      {
        date: "2023-06-06",
        appointments: [
          {
            id: "3",
            title: "Apartment Cleaning",
            customer: "Mary Johnson",
            address: "789 Residential Blvd",
            start: "10:00",
            end: "12:00",
            status: "scheduled",
          },
        ],
      },
      {
        date: "2023-06-07",
        appointments: [
          {
            id: "4",
            title: "Deep Cleaning",
            customer: "Robert Davis",
            address: "101 Clean St",
            start: "09:00",
            end: "13:00",
            status: "scheduled",
          },
          {
            id: "5",
            title: "Window Cleaning",
            customer: "Sarah Wilson",
            address: "202 Glass Ave",
            start: "14:30",
            end: "16:30",
            status: "scheduled",
          },
        ],
      },
    ]

    return { data: schedule, status: 200 }
  } catch (error) {
    console.error("Failed to fetch professional schedule:", error)
    return {
      error: "Failed to fetch professional schedule",
      status: 500,
    }
  }
}

// API de Profissionais (mantendo compatibilidade com o código existente)
export const professionalsApi = {
  // Get all professionals (for dropdowns)
  async getAll(): Promise<{ data?: ProfessionalPagedResponse; error?: string }> {
    try {
      const response = await fetch(`${getApiUrl()}/Professionals/paged?PageSize=1000`, {
        method: "GET",
        headers: createHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      console.error("Error fetching all professionals:", error)
      return { error: error instanceof Error ? error.message : "Failed to fetch professionals" }
    }
  },

  // Get paginated professionals
  async getRecords(filters: ProfessionalFilters = {}): Promise<{ data?: ProfessionalPagedResponse; error?: string }> {
    try {
      const params = new URLSearchParams()
      if (filters.status && filters.status !== "all") params.append("Status", filters.status.toString())
      if (filters.companyId) params.append("CompanyId", filters.companyId.toString())
      if (filters.searchQuery) params.append("SearchQuery", filters.searchQuery)
      if (filters.pageNumber) params.append("PageNumber", filters.pageNumber.toString())
      if (filters.pageSize) params.append("PageSize", filters.pageSize.toString())

      const query = params.toString()
      const url = query ? `${getApiUrl()}/Professionals/paged?${query}` : `${getApiUrl()}/Professionals/paged`

      const response = await fetch(url, {
        method: "GET",
        headers: createHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      console.error("Error fetching professionals:", error)
      return { error: error instanceof Error ? error.message : "Failed to fetch professionals" }
    }
  },

  // Get a professional by ID
  async getById(id: number): Promise<{ data?: Professional; error?: string }> {
    try {
      const response = await fetch(`${getApiUrl()}/Professionals/${id}`, {
        method: "GET",
        headers: createHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      console.error("Error fetching professional:", error)
      return { error: error instanceof Error ? error.message : "Failed to fetch professional" }
    }
  },

  // Create a new professional
  async create(data: CreateProfessionalRequest): Promise<{ data?: Professional; error?: string }> {
    try {
      const response = await fetch(`${getApiUrl()}/Professionals/create`, {
        method: "POST",
        headers: createHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      return { data: responseData }
    } catch (error) {
      console.error("Error creating professional:", error)
      return { error: error instanceof Error ? error.message : "Failed to create professional" }
    }
  },

  // Update a professional
  async update(id: number, data: UpdateProfessionalRequest): Promise<{ data?: Professional; error?: string }> {
    try {
      const response = await fetch(`${getApiUrl()}/Professionals/${id}`, {
        method: "PUT",
        headers: createHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      return { data: responseData }
    } catch (error) {
      console.error("Error updating professional:", error)
      return { error: error instanceof Error ? error.message : "Failed to update professional" }
    }
  },

  // Delete a professional
  async delete(id: number): Promise<{ success?: boolean; error?: string }> {
    try {
      const response = await fetch(`${getApiUrl()}/Professionals/${id}`, {
        method: "DELETE",
        headers: createHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return { success: true }
    } catch (error) {
      console.error("Error deleting professional:", error)
      return { error: error instanceof Error ? error.message : "Failed to delete professional" }
    }
  },

  // Update professional status
  async updateStatus(id: number, status: number): Promise<{ data?: Professional; error?: string }> {
    try {
      const { data: current } = await professionalsApi.getById(id)
      if (!current) throw new Error("Professional not found")

      const update: UpdateProfessionalRequest = {
        ...current,
        status,
      }
      return professionalsApi.update(id, update)
    } catch (error) {
      console.error("Error updating professional status:", error)
      return { error: error instanceof Error ? error.message : "Failed to update status" }
    }
  },

  getProfessionals,
  getProfessionalById,
  createProfessional,
  updateProfessional,
  deleteProfessional,
  getTeams,
  getCompanies,
  getProfessionalSchedule,
}

// Legacy exports for backward compatibility
export const getProfessional = professionalsApi.getById

export type { ProfessionalWithDetails }
