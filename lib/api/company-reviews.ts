import type { Review, ReviewResponse } from "@/types/review"
import { getReviewsByCompany, getReviewById, updateReview, addReviewResponse } from "@/lib/api/reviews"

// Get all reviews for a specific company
export async function getCompanyReviews(companyId: string): Promise<Review[]> {
  try {
    return await getReviewsByCompany(companyId)
  } catch (error) {
    console.error(`Error fetching reviews for company ${companyId}:`, error)
    throw error
  }
}

// Get a specific review by ID (with company validation)
export async function getCompanyReviewById(companyId: string, reviewId: string): Promise<Review | null> {
  try {
    const review = await getReviewById(reviewId)

    // Security check: ensure the review belongs to the company
    if (review && review.companyId === companyId) {
      return review
    }

    return null
  } catch (error) {
    console.error(`Error fetching review with ID ${reviewId} for company ${companyId}:`, error)
    throw error
  }
}

// Add a response to a review
export async function addCompanyReviewResponse(companyId: string, reviewId: string, response: string): Promise<Review> {
  try {
    // First, verify the review belongs to the company
    const review = await getReviewById(reviewId)

    if (!review) {
      throw new Error(`Review with ID ${reviewId} not found`)
    }

    if (review.companyId !== companyId) {
      throw new Error(`Review with ID ${reviewId} does not belong to company ${companyId}`)
    }

    return await addReviewResponse(reviewId, response)
  } catch (error) {
    console.error(`Error adding response to review with ID ${reviewId}:`, error)
    throw error
  }
}

// Update a review response
export async function updateCompanyReviewResponse(
  companyId: string,
  reviewId: string,
  response: string,
): Promise<Review> {
  try {
    // First, verify the review belongs to the company
    const review = await getReviewById(reviewId)

    if (!review) {
      throw new Error(`Review with ID ${reviewId} not found`)
    }

    if (review.companyId !== companyId) {
      throw new Error(`Review with ID ${reviewId} does not belong to company ${companyId}`)
    }

    return await updateReview(reviewId, { response, responseDate: new Date().toISOString() })
  } catch (error) {
    console.error(`Error updating response for review with ID ${reviewId}:`, error)
    throw error
  }
}

// Get reviews statistics for a company
export async function getCompanyReviewsStatistics(companyId: string): Promise<{
  averageRating: number
  totalReviews: number
  ratingDistribution: { [key: number]: number }
  responseRate: number
  pendingResponses: number
}> {
  try {
    const reviews = await getReviewsByCompany(companyId)

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

    // Calculate rating distribution
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    }

    reviews.forEach((review) => {
      ratingDistribution[review.rating] += 1
    })

    // Calculate response rate
    const respondedReviews = reviews.filter((review) => review.response && review.response.trim() !== "")
    const responseRate = reviews.length > 0 ? (respondedReviews.length / reviews.length) * 100 : 0

    // Calculate pending responses
    const pendingResponses = reviews.length - respondedReviews.length

    return {
      averageRating,
      totalReviews: reviews.length,
      ratingDistribution,
      responseRate,
      pendingResponses,
    }
  } catch (error) {
    console.error(`Error fetching review statistics for company ${companyId}:`, error)
    throw error
  }
}

// Get reviews by rating for a company
export async function getCompanyReviewsByRating(companyId: string, rating: number): Promise<Review[]> {
  try {
    const reviews = await getReviewsByCompany(companyId)
    return reviews.filter((review) => review.rating === rating)
  } catch (error) {
    console.error(`Error fetching reviews with rating ${rating} for company ${companyId}:`, error)
    throw error
  }
}

// Get reviews by response status for a company
export async function getCompanyReviewsByResponseStatus(companyId: string, hasResponse: boolean): Promise<Review[]> {
  try {
    const reviews = await getReviewsByCompany(companyId)
    return reviews.filter((review) => {
      const hasReviewResponse = review.response && review.response.trim() !== ""
      return hasResponse ? hasReviewResponse : !hasReviewResponse
    })
  } catch (error) {
    console.error(`Error fetching reviews by response status for company ${companyId}:`, error)
    throw error
  }
}

// Search company reviews
export async function searchCompanyReviews(companyId: string, query: string): Promise<Review[]> {
  try {
    const reviews = await getReviewsByCompany(companyId)
    const lowerCaseQuery = query.toLowerCase()

    return reviews.filter(
      (review) =>
        review.customerName?.toLowerCase().includes(lowerCaseQuery) ||
        review.professionalName?.toLowerCase().includes(lowerCaseQuery) ||
        review.comment?.toLowerCase().includes(lowerCaseQuery) ||
        review.response?.toLowerCase().includes(lowerCaseQuery) ||
        review.serviceType?.toLowerCase().includes(lowerCaseQuery),
    )
  } catch (error) {
    console.error(`Error searching reviews for company ${companyId} with query ${query}:`, error)
    throw error
  }
}

// Get reviews by date range for a company
export async function getCompanyReviewsByDateRange(
  companyId: string,
  startDate: string,
  endDate: string,
): Promise<Review[]> {
  try {
    const reviews = await getReviewsByCompany(companyId)

    return reviews.filter((review) => {
      const reviewDate = new Date(review.date)
      const start = new Date(startDate)
      const end = new Date(endDate)

      return reviewDate >= start && reviewDate <= end
    })
  } catch (error) {
    console.error(`Error fetching reviews by date range for company ${companyId}:`, error)
    throw error
  }
}

// Get reviews by professional for a company
export async function getCompanyReviewsByProfessional(companyId: string, professionalId: string): Promise<Review[]> {
  try {
    const reviews = await getReviewsByCompany(companyId)
    return reviews.filter((review) => review.professionalId === professionalId)
  } catch (error) {
    console.error(`Error fetching reviews for professional ${professionalId} in company ${companyId}:`, error)
    throw error
  }
}

// Get reviews by service type for a company
export async function getCompanyReviewsByServiceType(companyId: string, serviceType: string): Promise<Review[]> {
  try {
    const reviews = await getReviewsByCompany(companyId)
    return reviews.filter((review) => review.serviceType === serviceType)
  } catch (error) {
    console.error(`Error fetching reviews for service type ${serviceType} in company ${companyId}:`, error)
    throw error
  }
}

// Get template responses for reviews
export function getReviewResponseTemplates(): ReviewResponse[] {
  return [
    {
      id: "thank",
      name: "Thank You Response",
      template:
        "Thank you for your positive feedback! We're delighted to hear you enjoyed our service. Your satisfaction is our top priority, and we look forward to serving you again soon.",
    },
    {
      id: "apology",
      name: "Apology Response",
      template:
        "We sincerely apologize for your experience. This falls short of our standards, and we'd like to make it right. Please contact our customer service team so we can address your concerns personally.",
    },
    {
      id: "clarification",
      name: "Clarification Response",
      template:
        "Thank you for your feedback. We'd like to clarify that our standard procedure includes [explanation]. We appreciate your understanding and would be happy to discuss this further if you have any questions.",
    },
    {
      id: "improvement",
      name: "Improvement Response",
      template:
        "Thank you for bringing this to our attention. We're always looking to improve, and your feedback helps us do that. We've already taken steps to address the issues you mentioned and appreciate your patience.",
    },
    {
      id: "followup",
      name: "Follow-up Response",
      template:
        "Thank you for your review. We'd like to follow up with you directly to learn more about your experience. Please contact us at your convenience so we can address any concerns and ensure your complete satisfaction.",
    },
  ]
}
