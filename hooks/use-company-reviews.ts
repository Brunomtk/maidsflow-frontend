"use client"

import { useCompanyReviewsContext } from "@/contexts/company-reviews-context"
import { Star, StarHalf } from "lucide-react"
import { useState, useEffect } from "react"

export function useCompanyReviews(companyId: string) {
  const {
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
    setFilters,
    resetFilters,
    getFilteredReviews,
  } = useCompanyReviewsContext()

  const [initialized, setInitialized] = useState(false)

  // Load initial data
  useEffect(() => {
    if (!initialized && companyId) {
      fetchReviews(companyId)
      fetchStatistics(companyId)
      setInitialized(true)
    }
  }, [companyId, initialized, fetchReviews, fetchStatistics])

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  // Helper function to get rating variant
  const getRatingVariant = (rating: number) => {
    if (rating >= 4) return "success"
    if (rating === 3) return "warning"
    return "destructive"
  }

  // Helper function to get rating color
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-500"
    if (rating === 3) return "text-yellow-500"
    return "text-red-500"
  }

  // Helper function to get rating text
  const getRatingText = (rating: number) => {
    if (rating >= 4.5) return "Excellent"
    if (rating >= 4) return "Very Good"
    if (rating >= 3) return "Good"
    if (rating >= 2) return "Fair"
    return "Poor"
  }

  // Helper function to render stars
  const renderStarRating = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-current text-yellow-500" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-current text-yellow-500" />)
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-muted" />)
    }

    return stars
  }

  // Helper function to calculate percentage for rating distribution
  const calculateRatingPercentage = (rating: number) => {
    if (!statistics || statistics.totalReviews === 0) return 0
    return ((statistics.ratingDistribution[rating] || 0) / statistics.totalReviews) * 100
  }

  // Helper function to get response template by ID
  const getResponseTemplateById = (templateId: string) => {
    return responseTemplates.find((template) => template.id === templateId)
  }

  // Helper function to check if a review has a response
  const hasResponse = (review: any) => {
    return review.response && review.response.trim() !== ""
  }

  // Helper function to get time since review
  const getTimeSinceReview = (dateString: string) => {
    const reviewDate = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return "Today"
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  // Helper function to get response time
  const getResponseTime = (reviewDate: string, responseDate: string) => {
    if (!responseDate) return null

    const review = new Date(reviewDate)
    const response = new Date(responseDate)
    const diffInHours = Math.floor((response.getTime() - review.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Less than an hour"
    if (diffInHours < 24) return `${diffInHours} hours`
    if (diffInHours < 48) return "1 day"
    return `${Math.floor(diffInHours / 24)} days`
  }

  return {
    reviews,
    filteredReviews: getFilteredReviews(),
    isLoading,
    error,
    statistics,
    filters,
    responseTemplates,
    // API methods
    fetchReviews: () => fetchReviews(companyId),
    fetchReviewById: (reviewId: string) => fetchReviewById(companyId, reviewId),
    respondToReview: (reviewId: string, response: string) => respondToReview(companyId, reviewId, response),
    updateResponse: (reviewId: string, response: string) => updateResponse(companyId, reviewId, response),
    fetchStatistics: () => fetchStatistics(companyId),
    fetchReviewsByRating: (rating: number) => fetchReviewsByRating(companyId, rating),
    fetchReviewsByResponseStatus: (hasResponse: boolean) => fetchReviewsByResponseStatus(companyId, hasResponse),
    searchReviews: (query: string) => searchReviews(companyId, query),
    fetchReviewsByDateRange: (startDate: string, endDate: string) =>
      fetchReviewsByDateRange(companyId, startDate, endDate),
    fetchReviewsByProfessional: (professionalId: string) => fetchReviewsByProfessional(companyId, professionalId),
    fetchReviewsByServiceType: (serviceType: string) => fetchReviewsByServiceType(companyId, serviceType),
    setFilters,
    resetFilters,
    // Helper functions
    formatDate,
    getRatingVariant,
    getRatingColor,
    getRatingText,
    renderStarRating,
    calculateRatingPercentage,
    getResponseTemplateById,
    hasResponse,
    getTimeSinceReview,
    getResponseTime,
  }
}
