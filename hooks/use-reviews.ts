import { useReviewsContext } from "@/contexts/reviews-context"

export function useReviews() {
  const {
    reviews,
    isLoading,
    error,
    filters,
    fetchReviews,
    fetchReviewById,
    addReview,
    editReview,
    removeReview,
    fetchReviewsByCompany,
    fetchReviewsByProfessional,
    fetchReviewsByCustomer,
    fetchReviewsByStatus,
    fetchReviewsByRating,
    searchReviewsQuery,
    respondToReview,
    setFilters,
    resetFilters,
    filteredReviews,
  } = useReviewsContext()

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "border-green-500 text-green-500"
      case "pending":
        return "border-yellow-500 text-yellow-500"
      case "rejected":
        return "border-red-500 text-red-500"
      default:
        return "border-gray-500 text-gray-500"
    }
  }

  // Helper function to render stars
  const renderStarRating = (rating: number) => {
    return {
      filled: rating,
      empty: 5 - rating,
    }
  }

  return {
    reviews,
    isLoading,
    error,
    filters,
    fetchReviews,
    fetchReviewById,
    addReview,
    editReview,
    removeReview,
    fetchReviewsByCompany,
    fetchReviewsByProfessional,
    fetchReviewsByCustomer,
    fetchReviewsByStatus,
    fetchReviewsByRating,
    searchReviewsQuery,
    respondToReview,
    setFilters,
    resetFilters,
    filteredReviews,
    // Helper functions
    formatDate,
    getStatusColor,
    renderStarRating,
  }
}
