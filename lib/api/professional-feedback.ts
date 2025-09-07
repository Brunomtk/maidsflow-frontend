import type { ApiResponse } from "@/types/api"
import type {
  InternalFeedback,
  InternalFeedbackFilters,
  InternalFeedbackPagedResponse,
} from "@/types/internal-feedback"
import { fetchApi } from "./utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export interface ProfessionalFeedbackFilters {
  type?: "positive" | "negative" | "neutral"
  dateFrom?: string
  dateTo?: string
  clientId?: string
  status?: "read" | "unread"
  search?: string
}

export interface FeedbackResponse {
  content: string
  respondedAt: string
}

interface CreateFeedbackData {
  title: string
  category: string
  description: string
  priority: number
  status: number
}

interface AddCommentData {
  authorId: number
  author: string
  text: string
}

export const professionalFeedbackApi = {
  // Get professional's own feedbacks
  async getMyFeedbacks(
    filters: InternalFeedbackFilters = {},
    professionalId?: number,
  ): Promise<{ data?: InternalFeedbackPagedResponse; error?: string }> {
    try {
      const params = new URLSearchParams()

      if (professionalId) {
        params.append("ProfessionalId", professionalId.toString())
      }

      // Add filters to params
      if (filters.status && filters.status !== "all") {
        params.append("Status", filters.status.toString())
      }
      if (filters.priority && filters.priority !== "all") {
        params.append("Priority", filters.priority.toString())
      }
      if (filters.category && filters.category !== "all") {
        params.append("Category", filters.category)
      }
      if (filters.search) {
        params.append("Search", filters.search)
      }
      if (filters.pageNumber) {
        params.append("PageNumber", filters.pageNumber.toString())
      }
      if (filters.pageSize) {
        params.append("PageSize", filters.pageSize.toString())
      }

      const query = params.toString()
      const url = query ? `/InternalFeedback/paged?${query}` : "/InternalFeedback/paged"

      const response = await fetchApi<InternalFeedbackPagedResponse>(url)
      return { data: response }
    } catch (error) {
      console.error("Error fetching professional feedbacks:", error)
      return { error: error instanceof Error ? error.message : "Failed to fetch feedbacks" }
    }
  },

  // Get feedback by ID
  async getById(id: number): Promise<{ data?: InternalFeedback; error?: string }> {
    try {
      const response = await fetchApi<InternalFeedback>(`/InternalFeedback/${id}`)
      return { data: response }
    } catch (error) {
      console.error("Error fetching feedback:", error)
      return { error: error instanceof Error ? error.message : "Failed to fetch feedback" }
    }
  },

  // Create new feedback
  async create(
    data: CreateFeedbackData,
    professionalId?: number,
    teamId?: number,
    userName?: string,
  ): Promise<{ data?: InternalFeedback; error?: string }> {
    try {
      const feedbackData = {
        title: data.title,
        professionalId: professionalId || 1,
        teamId: teamId || 1,
        category: data.category,
        status: data.status,
        date: new Date().toISOString(),
        description: data.description,
        priority: data.priority,
        assignedToId: 1, // Default admin assignment
      }

      const response = await fetchApi<InternalFeedback>("/InternalFeedback", {
        method: "POST",
        body: JSON.stringify(feedbackData),
      })

      return { data: response }
    } catch (error) {
      console.error("Error creating feedback:", error)
      return { error: error instanceof Error ? error.message : "Failed to create feedback" }
    }
  },

  // Add comment to feedback
  async addComment(
    feedbackId: number,
    commentText: string,
    userId?: number,
    userName?: string,
  ): Promise<{ data?: InternalFeedback; error?: string }> {
    try {
      const commentData: AddCommentData = {
        authorId: userId || 1,
        author: userName || "Professional",
        text: commentText,
      }

      const response = await fetchApi<InternalFeedback>(`/InternalFeedback/${feedbackId}/comments`, {
        method: "POST",
        body: JSON.stringify(commentData),
      })

      return { data: response }
    } catch (error) {
      console.error("Error adding comment:", error)
      return { error: error instanceof Error ? error.message : "Failed to add comment" }
    }
  },
}

// Legacy exports for backward compatibility
export const getProfessionalFeedbacks = professionalFeedbackApi.getMyFeedbacks
export const createProfessionalFeedback = professionalFeedbackApi.create
export const addProfessionalFeedbackComment = professionalFeedbackApi.addComment

// Buscar feedbacks do profissional
export async function getProfessionalFeedbacksLegacy(
  professionalId: string,
  filters?: ProfessionalFeedbackFilters,
): Promise<ApiResponse<InternalFeedback[]>> {
  try {
    const params = new URLSearchParams()
    if (filters?.type) params.append("type", filters.type)
    if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom)
    if (filters?.dateTo) params.append("dateTo", filters.dateTo)
    if (filters?.clientId) params.append("clientId", filters.clientId)
    if (filters?.status) params.append("status", filters.status)
    if (filters?.search) params.append("search", filters.search)

    const response = await fetch(`${API_URL}/api/professionals/${professionalId}/feedbacks?${params}`)

    if (!response.ok) {
      throw new Error("Erro ao buscar feedbacks")
    }

    const data = await response.json()

    // Converter strings de data para objetos Date
    const feedbacks = data.data.map((feedback: any) => ({
      ...feedback,
      createdAt: new Date(feedback.createdAt),
      updatedAt: new Date(feedback.updatedAt),
      respondedAt: feedback.respondedAt ? new Date(feedback.respondedAt) : undefined,
    }))

    return {
      success: true,
      data: feedbacks,
      message: "Feedbacks carregados com sucesso",
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

// Buscar feedback específico
export async function getProfessionalFeedbackLegacy(
  professionalId: string,
  feedbackId: string,
): Promise<ApiResponse<InternalFeedback>> {
  try {
    const response = await fetch(`${API_URL}/api/professionals/${professionalId}/feedbacks/${feedbackId}`)

    if (!response.ok) {
      throw new Error("Erro ao buscar feedback")
    }

    const data = await response.json()

    // Converter strings de data para objetos Date
    const feedback = {
      ...data.data,
      createdAt: new Date(data.data.createdAt),
      updatedAt: new Date(data.data.updatedAt),
      respondedAt: data.data.respondedAt ? new Date(data.data.respondedAt) : undefined,
    }

    return {
      success: true,
      data: feedback,
      message: "Feedback carregado com sucesso",
    }
  } catch (error) {
    return {
      success: false,
      data: {} as InternalFeedback,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

// Responder a um feedback
export async function respondToProfessionalFeedbackLegacy(
  professionalId: string,
  feedbackId: string,
  response: string,
): Promise<ApiResponse<InternalFeedback>> {
  try {
    const res = await fetch(`${API_URL}/api/professionals/${professionalId}/feedbacks/${feedbackId}/respond`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ response }),
    })

    if (!res.ok) {
      throw new Error("Erro ao responder feedback")
    }

    const data = await res.json()

    // Converter strings de data para objetos Date
    const feedback = {
      ...data.data,
      createdAt: new Date(data.data.createdAt),
      updatedAt: new Date(data.data.updatedAt),
      respondedAt: data.data.respondedAt ? new Date(data.data.respondedAt) : undefined,
    }

    return {
      success: true,
      data: feedback,
      message: "Resposta enviada com sucesso",
    }
  } catch (error) {
    return {
      success: false,
      data: {} as InternalFeedback,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

// Marcar feedback como lido
export async function markProfessionalFeedbackAsReadLegacy(
  professionalId: string,
  feedbackId: string,
): Promise<ApiResponse<InternalFeedback>> {
  try {
    const response = await fetch(`${API_URL}/api/professionals/${professionalId}/feedbacks/${feedbackId}/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Erro ao marcar feedback como lido")
    }

    const data = await response.json()

    // Converter strings de data para objetos Date
    const feedback = {
      ...data.data,
      createdAt: new Date(data.data.createdAt),
      updatedAt: new Date(data.data.updatedAt),
      respondedAt: data.data.respondedAt ? new Date(data.data.respondedAt) : undefined,
    }

    return {
      success: true,
      data: feedback,
      message: "Feedback marcado como lido",
    }
  } catch (error) {
    return {
      success: false,
      data: {} as InternalFeedback,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

// Buscar estatísticas de feedback do profissional
export async function getProfessionalFeedbackStatsLegacy(
  professionalId: string,
  period?: "week" | "month" | "quarter" | "year",
): Promise<
  ApiResponse<{
    total: number
    positive: number
    negative: number
    neutral: number
    averageRating: number
    responseRate: number
    unreadCount: number
  }>
> {
  try {
    const params = new URLSearchParams()
    if (period) params.append("period", period)

    const response = await fetch(`${API_URL}/api/professionals/${professionalId}/feedbacks/stats?${params}`)

    if (!response.ok) {
      throw new Error("Erro ao buscar estatísticas de feedback")
    }

    const data = await response.json()

    return {
      success: true,
      data: data.data,
      message: "Estatísticas carregadas com sucesso",
    }
  } catch (error) {
    return {
      success: false,
      data: {
        total: 0,
        positive: 0,
        negative: 0,
        neutral: 0,
        averageRating: 0,
        responseRate: 0,
        unreadCount: 0,
      },
      message: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

// Marcar todos os feedbacks como lidos
export async function markAllProfessionalFeedbacksAsReadLegacy(
  professionalId: string,
): Promise<ApiResponse<{ updatedCount: number }>> {
  try {
    const response = await fetch(`${API_URL}/api/professionals/${professionalId}/feedbacks/read-all`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Erro ao marcar todos os feedbacks como lidos")
    }

    const data = await response.json()

    return {
      success: true,
      data: data.data,
      message: "Todos os feedbacks foram marcados como lidos",
    }
  } catch (error) {
    return {
      success: false,
      data: { updatedCount: 0 },
      message: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}
