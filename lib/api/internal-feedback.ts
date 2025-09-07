import { fetchApi } from "./utils"
import type {
  InternalFeedback,
  InternalFeedbackCreateRequest,
  InternalFeedbackUpdateRequest,
  InternalFeedbackFilters,
  InternalFeedbackPagedResponse,
} from "@/types/internal-feedback"

const API_BASE = "/InternalFeedback"

// Mock data for development
const mockInternalFeedback: InternalFeedback[] = [
  {
    id: "1",
    title: "Feedback sobre limpeza",
    description: "Feedback detalhado sobre o serviço de limpeza realizado",
    category: "service",
    priority: "high",
    status: "open",
    professionalId: "1",
    professionalName: "João Silva",
    teamId: "1",
    teamName: "Equipe Alpha",
    companyId: "1",
    companyName: "Empresa ABC",
    createdBy: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
  },
]

export const internalFeedbackApi = {
  // Get paginated internal feedback
  async getRecords(
    filters: InternalFeedbackFilters = {},
  ): Promise<{ data?: InternalFeedbackPagedResponse; error?: string }> {
    try {
      const params = new URLSearchParams()
      if (filters.status && filters.status !== "all") params.append("Status", filters.status.toString())
      if (filters.priority && filters.priority !== "all") params.append("Priority", filters.priority.toString())
      if (filters.category && filters.category !== "all") params.append("Category", filters.category)
      if (filters.professionalId) params.append("ProfessionalId", filters.professionalId.toString())
      if (filters.teamId) params.append("TeamId", filters.teamId.toString())
      if (filters.searchQuery) params.append("Search", filters.searchQuery)
      if (filters.pageNumber) params.append("PageNumber", filters.pageNumber.toString())
      if (filters.pageSize) params.append("PageSize", filters.pageSize.toString())

      const query = params.toString()
      const url = query ? `/InternalFeedback/paged?${query}` : "/InternalFeedback/paged"
      const response = await fetchApi(url)
      return { data: response }
    } catch (error) {
      console.error("Error fetching internal feedback:", error)
      return { error: error instanceof Error ? error.message : "Failed to fetch internal feedback" }
    }
  },

  // Get a feedback by ID
  async getById(id: number): Promise<{ data?: InternalFeedback; error?: string }> {
    try {
      const response = await fetchApi(`/InternalFeedback/${id}`)
      return { data: response }
    } catch (error) {
      console.error("Error fetching internal feedback:", error)
      return { error: error instanceof Error ? error.message : "Failed to fetch internal feedback" }
    }
  },

  // Create a new feedback
  async create(data: InternalFeedbackCreateRequest): Promise<{ data?: InternalFeedback; error?: string }> {
    try {
      const response = await fetchApi("/InternalFeedback", {
        method: "POST",
        body: JSON.stringify(data),
      })
      return { data: response }
    } catch (error) {
      console.error("Error creating internal feedback:", error)
      return { error: error instanceof Error ? error.message : "Failed to create internal feedback" }
    }
  },

  // Update a feedback
  async update(id: number, data: InternalFeedbackUpdateRequest): Promise<{ data?: InternalFeedback; error?: string }> {
    try {
      const response = await fetchApi(`/InternalFeedback/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
      return { data: response }
    } catch (error) {
      console.error("Error updating internal feedback:", error)
      return { error: error instanceof Error ? error.message : "Failed to update internal feedback" }
    }
  },

  // Delete a feedback
  async delete(id: number): Promise<{ success?: boolean; error?: string }> {
    try {
      await fetchApi(`/InternalFeedback/${id}`, {
        method: "DELETE",
      })
      return { success: true }
    } catch (error) {
      console.error("Error deleting internal feedback:", error)
      return { error: error instanceof Error ? error.message : "Failed to delete internal feedback" }
    }
  },

  // Add comment to feedback
  async addComment(
    id: number,
    comment: { authorId: number; author: string; text: string },
  ): Promise<{ data?: any; error?: string }> {
    try {
      const response = await fetchApi(`/InternalFeedback/${id}/comments`, {
        method: "POST",
        body: JSON.stringify(comment),
      })
      return { data: response }
    } catch (error) {
      console.error("Error adding comment:", error)
      return { error: error instanceof Error ? error.message : "Failed to add comment" }
    }
  },
}

// Legacy exports for backward compatibility
export const getInternalFeedback = internalFeedbackApi.getRecords
export const getInternalFeedbackById = internalFeedbackApi.getById
export const createInternalFeedback = internalFeedbackApi.create
export const updateInternalFeedback = internalFeedbackApi.update
export const deleteInternalFeedback = internalFeedbackApi.delete
export const addCommentToInternalFeedback = internalFeedbackApi.addComment

// Additional functions for backward compatibility
export const getInternalFeedbackByProfessional = async (professionalId: string) => {
  const { data } = await internalFeedbackApi.getRecords({ professionalId: Number(professionalId) })
  return data?.data || []
}

export const getInternalFeedbackByTeam = async (teamId: string) => {
  const { data } = await internalFeedbackApi.getRecords({ teamId: Number(teamId) })
  return data?.data || []
}

export const getInternalFeedbackByCategory = async (category: string) => {
  const { data } = await internalFeedbackApi.getRecords({ category })
  return data?.data || []
}

export const getInternalFeedbackByStatus = async (status: string) => {
  const { data } = await internalFeedbackApi.getRecords({ status: Number(status) })
  return data?.data || []
}

export const getInternalFeedbackByPriority = async (priority: string) => {
  const { data } = await internalFeedbackApi.getRecords({ priority: Number(priority) })
  return data?.data || []
}
