import type {
  InternalFeedback,
  InternalFeedbackFormData,
  InternalFeedbackFilters,
  InternalFeedbackComment,
  InternalFeedbackPagedResponse,
} from "@/types/internal-feedback"
import { fetchApi } from "./utils"

// Company-specific feedback API functions that ensure company isolation
export async function getCompanyFeedback(
  companyId: string,
  filters?: InternalFeedbackFilters,
): Promise<InternalFeedback[]> {
  try {
    const params = new URLSearchParams()
    if (filters?.status && filters.status !== "all") params.append("Status", filters.status.toString())
    if (filters?.priority && filters.priority !== "all") params.append("Priority", filters.priority.toString())
    if (filters?.category) params.append("Category", filters.category)
    if (filters?.professionalId) params.append("ProfessionalId", filters.professionalId.toString())
    if (filters?.teamId) params.append("TeamId", filters.teamId.toString())
    if (filters?.search) params.append("Search", filters.search)
    params.append("PageNumber", (filters?.pageNumber || 1).toString())
    params.append("PageSize", (filters?.pageSize || 100).toString())

    const response = await fetchApi<InternalFeedbackPagedResponse>(`/InternalFeedback/paged?${params.toString()}`)
    return Array.isArray(response) ? response : response?.data || []
  } catch (error) {
    console.error("Error fetching company feedback:", error)
    throw error
  }
}

export async function getCompanyFeedbackById(companyId: string, feedbackId: string): Promise<InternalFeedback | null> {
  try {
    const feedback = await fetchApi<InternalFeedback>(`/InternalFeedback/${feedbackId}`)
    return feedback
  } catch (error) {
    console.error(`Error fetching company feedback with ID ${feedbackId}:`, error)
    throw error
  }
}

export async function createCompanyFeedback(
  companyId: string,
  data: InternalFeedbackFormData,
): Promise<InternalFeedback> {
  try {
    const feedbackData = {
      title: data.title,
      professionalId: Number.parseInt(data.professionalId.toString()),
      teamId: Number.parseInt(data.teamId.toString()),
      category: data.category,
      status: Number.parseInt(data.status.toString()),
      date: new Date().toISOString(),
      description: data.description,
      priority: Number.parseInt(data.priority.toString()),
      assignedToId: Number.parseInt(data.assignedToId.toString()),
    }

    return await fetchApi<InternalFeedback>("/InternalFeedback", {
      method: "POST",
      body: JSON.stringify(feedbackData),
    })
  } catch (error) {
    console.error("Error creating company feedback:", error)
    throw error
  }
}

export async function updateCompanyFeedback(
  companyId: string,
  feedbackId: string,
  data: Partial<InternalFeedbackFormData>,
): Promise<InternalFeedback> {
  try {
    const updateData = {
      ...(data.title && { title: data.title }),
      ...(data.professionalId && { professionalId: Number.parseInt(data.professionalId.toString()) }),
      ...(data.teamId && { teamId: Number.parseInt(data.teamId.toString()) }),
      ...(data.category && { category: data.category }),
      ...(data.status && { status: Number.parseInt(data.status.toString()) }),
      ...(data.description && { description: data.description }),
      ...(data.priority && { priority: Number.parseInt(data.priority.toString()) }),
      ...(data.assignedToId && { assignedToId: Number.parseInt(data.assignedToId.toString()) }),
    }

    return await fetchApi<InternalFeedback>(`/InternalFeedback/${feedbackId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    })
  } catch (error) {
    console.error(`Error updating company feedback with ID ${feedbackId}:`, error)
    throw error
  }
}

export async function deleteCompanyFeedback(companyId: string, feedbackId: string): Promise<void> {
  try {
    await fetchApi(`/InternalFeedback/${feedbackId}`, {
      method: "DELETE",
    })
  } catch (error) {
    console.error(`Error deleting company feedback with ID ${feedbackId}:`, error)
    throw error
  }
}

export async function addCommentToCompanyFeedback(
  companyId: string,
  feedbackId: string,
  comment: Omit<InternalFeedbackComment, "id" | "date">,
): Promise<InternalFeedbackComment> {
  try {
    const commentData = {
      authorId: comment.authorId,
      author: comment.author,
      text: comment.text,
    }

    return await fetchApi<InternalFeedbackComment>(`/InternalFeedback/${feedbackId}/comments`, {
      method: "POST",
      body: JSON.stringify(commentData),
    })
  } catch (error) {
    console.error(`Error adding comment to company feedback with ID ${feedbackId}:`, error)
    throw error
  }
}

// Company-specific statistics
export async function getCompanyFeedbackStats(companyId: string): Promise<{
  total: number
  pending: number
  resolved: number
  inProgress: number
  byType: Record<string, number>
  byPriority: Record<string, number>
}> {
  try {
    const feedback = await getCompanyFeedback(companyId)

    const stats = {
      total: feedback.length,
      pending: feedback.filter((f) => f.status === "pending").length,
      resolved: feedback.filter((f) => f.status === "resolved").length,
      inProgress: feedback.filter((f) => f.status === "in_progress").length,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
    }

    // Count by type
    feedback.forEach((f) => {
      stats.byType[f.category] = (stats.byType[f.category] || 0) + 1
      stats.byPriority[f.priority] = (stats.byPriority[f.priority] || 0) + 1
    })

    return stats
  } catch (error) {
    console.error("Error fetching company feedback statistics:", error)
    throw error
  }
}

// Get feedback by professional (filtered by company)
export async function getCompanyFeedbackByProfessional(
  companyId: string,
  professionalId: string,
): Promise<InternalFeedback[]> {
  try {
    const feedback = await getCompanyFeedback(companyId)
    return feedback.filter((f) => f.professionalId === professionalId)
  } catch (error) {
    console.error(`Error fetching company feedback for professional ${professionalId}:`, error)
    throw error
  }
}

// Get feedback by team (filtered by company)
export async function getCompanyFeedbackByTeam(companyId: string, teamId: string): Promise<InternalFeedback[]> {
  try {
    const feedback = await getCompanyFeedback(companyId)
    return feedback.filter((f) => f.teamId === teamId)
  } catch (error) {
    console.error(`Error fetching company feedback for team ${teamId}:`, error)
    throw error
  }
}

// Resolve feedback
export async function resolveCompanyFeedback(
  companyId: string,
  feedbackId: string,
  resolution: string,
): Promise<InternalFeedback> {
  try {
    return await updateCompanyFeedback(companyId, feedbackId, {
      status: "resolved",
      // In a real app, we would also store the resolution details
    })
  } catch (error) {
    console.error(`Error resolving company feedback with ID ${feedbackId}:`, error)
    throw error
  }
}

// Export feedback data
export async function exportCompanyFeedback(
  companyId: string,
  format: "csv" | "excel" | "pdf",
  filters?: InternalFeedbackFilters,
): Promise<Blob> {
  try {
    const feedback = await getCompanyFeedback(companyId, filters)

    // In a real app, this would call an API endpoint that generates the file
    // For now, we'll create a simple CSV
    if (format === "csv") {
      const headers = ["ID", "Title", "Professional", "Team", "Category", "Status", "Priority", "Date"]
      const rows = feedback.map((f) => [
        f.id,
        f.title,
        f.professional,
        f.team,
        f.category,
        f.status,
        f.priority,
        f.date,
      ])

      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
      return new Blob([csv], { type: "text/csv" })
    }

    throw new Error(`Export format ${format} not implemented`)
  } catch (error) {
    console.error("Error exporting company feedback:", error)
    throw error
  }
}
