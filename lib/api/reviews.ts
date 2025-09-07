import { fetchApi } from "./utils"
import type {
  Review,
  ReviewCreateRequest,
  ReviewUpdateRequest,
  ReviewFilters,
  ReviewPagedResponse,
} from "@/types/review"

export const reviewsApi = {
  // Get paginated reviews
  async getReviews(filters: ReviewFilters = {}): Promise<{ data?: ReviewPagedResponse; error?: string }> {
    try {
      const params = new URLSearchParams()
      if (filters.status && filters.status !== "all") params.append("Status", filters.status.toString())
      if (filters.rating && filters.rating !== "all") params.append("Rating", filters.rating.toString())
      if (filters.searchQuery) params.append("SearchQuery", filters.searchQuery)
      if (filters.pageNumber) params.append("PageNumber", filters.pageNumber.toString())
      if (filters.pageSize) params.append("PageSize", filters.pageSize.toString())

      const query = params.toString()
      const url = query ? `/Reviews/paged?${query}` : "/Reviews/paged"
      const response = await fetchApi(url)
      return { data: response }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      return { error: error instanceof Error ? error.message : "Failed to fetch reviews" }
    }
  },

  // Get a review by ID
  async getById(id: number): Promise<{ data?: Review; error?: string }> {
    try {
      const response = await fetchApi(`/Reviews/${id}`)
      return { data: response }
    } catch (error) {
      console.error("Error fetching review:", error)
      return { error: error instanceof Error ? error.message : "Failed to fetch review" }
    }
  },

  // Create a new review
  async create(data: ReviewCreateRequest): Promise<{ data?: Review; error?: string }> {
    try {
      const response = await fetchApi("/Reviews/create", {
        method: "POST",
        body: JSON.stringify(data),
      })
      return { data: response }
    } catch (error) {
      console.error("Error creating review:", error)
      return { error: error instanceof Error ? error.message : "Failed to create review" }
    }
  },

  // Update a review
  async update(id: number, data: ReviewUpdateRequest): Promise<{ data?: Review; error?: string }> {
    try {
      const response = await fetchApi(`/Reviews/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
      return { data: response }
    } catch (error) {
      console.error("Error updating review:", error)
      return { error: error instanceof Error ? error.message : "Failed to update review" }
    }
  },

  // Delete a review
  async delete(id: number): Promise<{ success?: boolean; error?: string }> {
    try {
      await fetchApi(`/Reviews/${id}`, {
        method: "DELETE",
      })
      return { success: true }
    } catch (error) {
      console.error("Error deleting review:", error)
      return { error: error instanceof Error ? error.message : "Failed to delete review" }
    }
  },

  // Add response to review
  async addResponse(id: number, response: string): Promise<{ data?: Review; error?: string }> {
    try {
      const result = await fetchApi(`/Reviews/${id}/response`, {
        method: "POST",
        body: JSON.stringify(response),
      })
      return { data: result }
    } catch (error) {
      console.error("Error adding response:", error)
      return { error: error instanceof Error ? error.message : "Failed to add response" }
    }
  },
}

// Legacy exports for compatibility
export const getReviews = reviewsApi.getReviews
export const getReviewById = reviewsApi.getById
export const createReview = reviewsApi.create
export const updateReview = reviewsApi.update
export const deleteReview = reviewsApi.delete
export const addReviewResponse = reviewsApi.addResponse
export const getReviewsByCompany = reviewsApi.getReviews
export const getReviewsByProfessional = reviewsApi.getReviews
export const getReviewsByCustomer = reviewsApi.getReviews
export const getReviewsByStatus = reviewsApi.getReviews
export const getReviewsByRating = reviewsApi.getReviews
export const searchReviews = reviewsApi.getReviews
