import { apiRequest } from "./utils"

interface ReviewsResponse {
  data: Review[]
  meta: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

interface Review {
  id: number
  customerId: string
  customerName: string
  professionalId: string
  professionalName: string
  teamId: string
  teamName: string
  companyId: string
  companyName: string
  appointmentId: string
  rating: number
  comment: string
  date: string
  serviceType: string
  status: number
  response?: string
  responseDate?: string
  createdDate: string
  updatedDate: string
}

interface PerformanceMetrics {
  totalReviews: number
  averageRating: number
  weeklyReviews: number
  monthlyReviews: number
  recentReviews: Review[]
}

// Get user ID from token
function getUserIdFromToken(): string {
  const token = localStorage.getItem("noah_token")
  if (!token) {
    throw new Error("No authentication token found")
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const userId = payload.UserId || payload.userId
    if (!userId) {
      throw new Error("User ID not found in token")
    }
    return userId
  } catch (error) {
    throw new Error("Invalid token format")
  }
}

export async function getProfessionalReviews(params: {
  page?: number
  pageSize?: number
}): Promise<ReviewsResponse> {
  try {
    const userId = getUserIdFromToken()
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      pageSize: (params.pageSize || 10).toString(),
      professionalId: userId,
    })

    const response = await apiRequest(`/Reviews/paged?${queryParams}`)
    return response
  } catch (error) {
    console.error("Error fetching professional reviews:", error)
    return {
      data: [],
      meta: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
      },
    }
  }
}

export async function respondToReview(reviewId: number, response: string): Promise<Review> {
  try {
    const result = await apiRequest(`/Reviews/${reviewId}/response`, {
      method: "POST",
      body: JSON.stringify(response),
    })
    return result
  } catch (error) {
    console.error("Error responding to review:", error)
    throw error
  }
}

export async function getCurrentPerformanceMetrics(professionalId: string): Promise<PerformanceMetrics> {
  try {
    const reviewsData = await getProfessionalReviews({ pageSize: 100 })
    const reviews = reviewsData.data

    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const weeklyReviews = reviews.filter((review) => new Date(review.date) >= oneWeekAgo).length
    const monthlyReviews = reviews.filter((review) => new Date(review.date) >= oneMonthAgo).length

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = reviews.length > 0 ? Number((totalRating / reviews.length).toFixed(1)) : 0

    return {
      totalReviews: reviews.length,
      averageRating,
      weeklyReviews,
      monthlyReviews,
      recentReviews: reviews.slice(0, 5),
    }
  } catch (error) {
    console.error("Error calculating performance metrics:", error)
    return {
      totalReviews: 0,
      averageRating: 0,
      weeklyReviews: 0,
      monthlyReviews: 0,
      recentReviews: [],
    }
  }
}
