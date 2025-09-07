"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  getCompanyReviews,
  getCompanyReviewById,
  addCompanyReviewResponse,
  updateCompanyReviewResponse,
  getCompanyReviewsStatistics,
  getCompanyReviewsByRating,
  getCompanyReviewsByResponseStatus,
  searchCompanyReviews,
  getCompanyReviewsByDateRange,
  getCompanyReviewsByProfessional,
  getCompanyReviewsByServiceType,
  getReviewResponseTemplates,
} from "@/lib/api/company-reviews"
import type { Review, ReviewResponse } from "@/types/review"

interface CompanyReviewsContextType {
  reviews: Review[]
  isLoading: boolean
  error: string | null
  statistics: {
    averageRating: number
    totalReviews: number
    ratingDistribution: { [key: number]: number }
    responseRate: number
    pendingResponses: number
  } | null
  filters: {
    rating: string
    responseStatus: string
    searchQuery: string
    dateRange: { startDate: string; endDate: string } | null
    professionalId: string
    serviceType: string
  }
  responseTemplates: ReviewResponse[]
  fetchReviews: (companyId: string) => Promise<void>
  fetchReviewById: (companyId: string, reviewId: string) => Promise<Review | null>
  respondToReview: (companyId: string, reviewId: string, response: string) => Promise<Review>
  updateResponse: (companyId: string, reviewId: string, response: string) => Promise<Review>
  fetchStatistics: (companyId: string) => Promise<void>
  fetchReviewsByRating: (companyId: string, rating: number) => Promise<void>
  fetchReviewsByResponseStatus: (companyId: string, hasResponse: boolean) => Promise<void>
  searchReviews: (companyId: string, query: string) => Promise<void>
  fetchReviewsByDateRange: (companyId: string, startDate: string, endDate: string) => Promise<void>
  fetchReviewsByProfessional: (companyId: string, professionalId: string) => Promise<void>
  fetchReviewsByServiceType: (companyId: string, serviceType: string) => Promise<void>
  setFilters: (newFilters: Partial<CompanyReviewsContextType["filters"]>) => void
  resetFilters: () => void
  getFilteredReviews: () => Review[]
}

const defaultFilters = {
  rating: "all",
  responseStatus: "all",
  searchQuery: "",
  dateRange: null,
  professionalId: "",
  serviceType: "",
}

const defaultStatistics = {
  averageRating: 0,
  totalReviews: 0,
  ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  responseRate: 0,
  pendingResponses: 0,
}

const CompanyReviewsContext = createContext<CompanyReviewsContextType | undefined>(undefined)

export function CompanyReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [statistics, setStatistics] = useState<CompanyReviewsContextType["statistics"]>(null)
  const [filters, setFilters] = useState(defaultFilters)
  const [responseTemplates, setResponseTemplates] = useState<ReviewResponse[]>([])
  const { toast } = useToast()

  // Load response templates on mount
  useEffect(() => {
    setResponseTemplates(getReviewResponseTemplates())
  }, [])

  const fetchReviews = async (companyId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCompanyReviews(companyId)
      setReviews(data)
    } catch (err) {
      setError("Failed to fetch reviews")
      toast({
        title: "Error",
        description: "Failed to fetch reviews. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReviewById = async (companyId: string, reviewId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const review = await getCompanyReviewById(companyId, reviewId)
      return review
    } catch (err) {
      setError(`Failed to fetch review with ID ${reviewId}`)
      toast({
        title: "Error",
        description: `Failed to fetch review details. Please try again.`,
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const respondToReview = async (companyId: string, reviewId: string, response: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedReview = await addCompanyReviewResponse(companyId, reviewId, response)
      setReviews((prev) => prev.map((review) => (review.id === reviewId ? updatedReview : review)))
      toast({
        title: "Success",
        description: "Response added successfully.",
      })
      return updatedReview
    } catch (err) {
      setError(`Failed to add response to review with ID ${reviewId}`)
      toast({
        title: "Error",
        description: "Failed to add response. Please try again.",
        variant: "destructive",
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateResponse = async (companyId: string, reviewId: string, response: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedReview = await updateCompanyReviewResponse(companyId, reviewId, response)
      setReviews((prev) => prev.map((review) => (review.id === reviewId ? updatedReview : review)))
      toast({
        title: "Success",
        description: "Response updated successfully.",
      })
      return updatedReview
    } catch (err) {
      setError(`Failed to update response for review with ID ${reviewId}`)
      toast({
        title: "Error",
        description: "Failed to update response. Please try again.",
        variant: "destructive",
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStatistics = async (companyId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const stats = await getCompanyReviewsStatistics(companyId)
      setStatistics(stats)
    } catch (err) {
      setError("Failed to fetch review statistics")
      toast({
        title: "Error",
        description: "Failed to fetch review statistics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReviewsByRating = async (companyId: string, rating: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCompanyReviewsByRating(companyId, rating)
      setReviews(data)
    } catch (err) {
      setError(`Failed to fetch reviews with rating ${rating}`)
      toast({
        title: "Error",
        description: "Failed to fetch reviews by rating. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReviewsByResponseStatus = async (companyId: string, hasResponse: boolean) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCompanyReviewsByResponseStatus(companyId, hasResponse)
      setReviews(data)
    } catch (err) {
      setError(`Failed to fetch reviews by response status`)
      toast({
        title: "Error",
        description: "Failed to fetch reviews by response status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const searchReviews = async (companyId: string, query: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await searchCompanyReviews(companyId, query)
      setReviews(data)
    } catch (err) {
      setError(`Failed to search reviews with query ${query}`)
      toast({
        title: "Error",
        description: "Failed to search reviews. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReviewsByDateRange = async (companyId: string, startDate: string, endDate: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCompanyReviewsByDateRange(companyId, startDate, endDate)
      setReviews(data)
    } catch (err) {
      setError(`Failed to fetch reviews by date range`)
      toast({
        title: "Error",
        description: "Failed to fetch reviews by date range. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReviewsByProfessional = async (companyId: string, professionalId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCompanyReviewsByProfessional(companyId, professionalId)
      setReviews(data)
    } catch (err) {
      setError(`Failed to fetch reviews for professional ${professionalId}`)
      toast({
        title: "Error",
        description: "Failed to fetch reviews by professional. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReviewsByServiceType = async (companyId: string, serviceType: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCompanyReviewsByServiceType(companyId, serviceType)
      setReviews(data)
    } catch (err) {
      setError(`Failed to fetch reviews for service type ${serviceType}`)
      toast({
        title: "Error",
        description: "Failed to fetch reviews by service type. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateFilters = (newFilters: Partial<CompanyReviewsContextType["filters"]>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const resetFilters = () => {
    setFilters(defaultFilters)
  }

  // Apply filters to reviews
  const getFilteredReviews = () => {
    return reviews.filter((review) => {
      // Filter by rating
      if (filters.rating !== "all" && review.rating !== Number(filters.rating)) {
        return false
      }

      // Filter by response status
      if (filters.responseStatus !== "all") {
        const hasResponse = review.response && review.response.trim() !== ""
        if (filters.responseStatus === "responded" && !hasResponse) {
          return false
        }
        if (filters.responseStatus === "pending" && hasResponse) {
          return false
        }
      }

      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const matchesQuery =
          review.customerName?.toLowerCase().includes(query) ||
          review.professionalName?.toLowerCase().includes(query) ||
          review.comment?.toLowerCase().includes(query) ||
          review.response?.toLowerCase().includes(query) ||
          review.serviceType?.toLowerCase().includes(query)

        if (!matchesQuery) {
          return false
        }
      }

      // Filter by date range
      if (filters.dateRange) {
        const reviewDate = new Date(review.date)
        const startDate = new Date(filters.dateRange.startDate)
        const endDate = new Date(filters.dateRange.endDate)

        if (reviewDate < startDate || reviewDate > endDate) {
          return false
        }
      }

      // Filter by professional
      if (filters.professionalId && review.professionalId !== filters.professionalId) {
        return false
      }

      // Filter by service type
      if (filters.serviceType && review.serviceType !== filters.serviceType) {
        return false
      }

      return true
    })
  }

  return (
    <CompanyReviewsContext.Provider
      value={{
        reviews,
        isLoading,
        error,
        statistics,
        filters,
        responseTemplates,
        fetchReviews,
        fetchReviewById,
        respondToReview,
        updateResponse,
        fetchStatistics,
        fetchReviewsByRating,
        fetchReviewsByResponseStatus,
        searchReviews,
        fetchReviewsByDateRange,
        fetchReviewsByProfessional,
        fetchReviewsByServiceType,
        setFilters: updateFilters,
        resetFilters,
        getFilteredReviews,
      }}
    >
      {children}
    </CompanyReviewsContext.Provider>
  )
}

export function useCompanyReviewsContext() {
  const context = useContext(CompanyReviewsContext)
  if (context === undefined) {
    throw new Error("useCompanyReviewsContext must be used within a CompanyReviewsProvider")
  }
  return context
}
