"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { reviewsApi } from "@/lib/api/reviews"
import type { Review, ReviewFilters } from "@/types/review"

interface ReviewsContextType {
  reviews: Review[]
  filteredReviews: Review[]
  filters: ReviewFilters
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  isLoading: boolean
  error: string | null
  selectedReview: Review | null

  // Actions
  setFilters: (filters: Partial<ReviewFilters>) => void
  setCurrentPage: (page: number) => void
  fetchReviews: () => Promise<void>
  createReview: (data: any) => Promise<void>
  updateReview: (id: number, data: any) => Promise<void>
  deleteReview: (id: number) => Promise<void>
  addResponse: (id: number, response: string) => Promise<void>
  setSelectedReview: (review: Review | null) => void
  clearError: () => void
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined)

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [filters, setFiltersState] = useState<ReviewFilters>({
    status: "all",
    rating: "all",
    searchQuery: "",
    pageNumber: 1,
    pageSize: 10,
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  const fetchReviews = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: apiError } = await reviewsApi.getReviews(filters)

      if (apiError) {
        setError(apiError)
        setReviews([])
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
        })
      } else if (data) {
        setReviews(data.data || [])
        setPagination(
          data.meta || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 10,
          },
        )
      }
    } catch (err) {
      console.error("Error fetching reviews:", err)
      setError("Failed to fetch reviews")
      setReviews([])
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  const setFilters = useCallback((newFilters: Partial<ReviewFilters>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
      pageNumber: newFilters.pageNumber || 1, // Reset to first page when filters change
    }))
  }, [])

  const setCurrentPage = useCallback(
    (page: number) => {
      setFilters({ pageNumber: page })
    },
    [setFilters],
  )

  const createReview = useCallback(
    async (data: any) => {
      setIsLoading(true)
      setError(null)

      try {
        const { data: newReview, error: apiError } = await reviewsApi.create(data)

        if (apiError) {
          setError(apiError)
          throw new Error(apiError)
        } else if (newReview) {
          await fetchReviews() // Refresh the list
        }
      } catch (err) {
        console.error("Error creating review:", err)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [fetchReviews],
  )

  const updateReview = useCallback(
    async (id: number, data: any) => {
      setIsLoading(true)
      setError(null)

      try {
        const { data: updatedReview, error: apiError } = await reviewsApi.update(id, data)

        if (apiError) {
          setError(apiError)
          throw new Error(apiError)
        } else if (updatedReview) {
          await fetchReviews() // Refresh the list
        }
      } catch (err) {
        console.error("Error updating review:", err)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [fetchReviews],
  )

  const deleteReview = useCallback(
    async (id: number) => {
      setIsLoading(true)
      setError(null)

      try {
        const { error: apiError } = await reviewsApi.delete(id)

        if (apiError) {
          setError(apiError)
          throw new Error(apiError)
        } else {
          await fetchReviews() // Refresh the list
        }
      } catch (err) {
        console.error("Error deleting review:", err)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [fetchReviews],
  )

  const addResponse = useCallback(
    async (id: number, response: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const { data: updatedReview, error: apiError } = await reviewsApi.addResponse(id, response)

        if (apiError) {
          setError(apiError)
          throw new Error(apiError)
        } else if (updatedReview) {
          await fetchReviews() // Refresh the list
        }
      } catch (err) {
        console.error("Error adding response:", err)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [fetchReviews],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Apply filters to reviews
  const getFilteredReviews = () => {
    if (!Array.isArray(reviews)) return []

    return reviews.filter((review) => {
      // Filter by status
      if (filters.status !== "all" && review.status.toString() !== filters.status) {
        return false
      }

      // Filter by rating
      if (filters.rating !== "all" && review.rating.toString() !== filters.rating) {
        return false
      }

      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        return (
          review.customerName?.toLowerCase().includes(query) ||
          review.professionalName?.toLowerCase().includes(query) ||
          review.companyName?.toLowerCase().includes(query) ||
          review.comment?.toLowerCase().includes(query) ||
          review.serviceType?.toLowerCase().includes(query)
        )
      }

      return true
    })
  }

  const filteredReviews = getFilteredReviews()

  // Fetch reviews when filters change
  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const value: ReviewsContextType = {
    reviews,
    filteredReviews,
    filters,
    pagination,
    isLoading,
    error,
    selectedReview,
    setFilters,
    setCurrentPage,
    fetchReviews,
    createReview,
    updateReview,
    deleteReview,
    addResponse,
    setSelectedReview,
    clearError,
  }

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>
}

export function useReviews() {
  const context = useContext(ReviewsContext)
  if (context === undefined) {
    throw new Error("useReviews must be used within a ReviewsProvider")
  }
  return context
}

export function useReviewsContext() {
  return useReviews()
}
