import type { ApiResponse } from "@/types/api"
import { apiDelay } from "./utils"

// Mock data for company dashboard
const mockDashboardStats = {
  weekSummary: {
    scheduled: 8,
    completed: 5,
    pending: 3,
    cancelled: 0,
    completionRate: 62.5,
  },
  planInfo: {
    name: "Professional Plan",
    status: "active",
    renewalDate: "2025-06-10",
    daysLeft: 15,
    paymentStatus: "paid",
    lastPayment: "2025-05-10",
    nextPayment: "2025-06-10",
    features: ["Unlimited Appointments", "10 Team Members", "GPS Tracking", "Client Portal", "Email Notifications"],
    usage: {
      teamMembers: { used: 7, max: 10 },
      storage: { used: 5.2, max: 10 },
      appointments: { used: 350, max: 500 },
    },
  },
  alerts: [
    {
      id: "alert-001",
      type: "info",
      title: "Next Cleaning Service",
      message: "Tomorrow at 9:00 AM - Team Alpha",
      priority: "medium",
      createdAt: new Date().toISOString(),
    },
    {
      id: "alert-002",
      type: "warning",
      title: "Plan Renewal Upcoming",
      message: "Your Professional Plan renews in 15 days",
      priority: "high",
      createdAt: new Date().toISOString(),
    },
  ],
  serviceStatus: {
    completed: 62.5,
    scheduled: 37.5,
    cancelled: 0,
  },
  recentActivity: [
    {
      id: "activity-001",
      type: "appointment_completed",
      title: "Service completed",
      description: "Cleaning service at Downtown Office",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      professional: "Maria Silva",
    },
    {
      id: "activity-002",
      type: "appointment_scheduled",
      title: "New appointment scheduled",
      description: "Office cleaning for Tech Corp",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      client: "Tech Corp",
    },
    {
      id: "activity-003",
      type: "payment_received",
      title: "Payment received",
      description: "Monthly subscription payment",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      amount: 299.99,
    },
  ],
  upcomingServices: [
    {
      id: "service-001",
      date: "2025-01-30",
      time: "09:00",
      client: "Tech Solutions Inc",
      address: "Av. Paulista, 1000",
      team: "Team Alpha",
      status: "confirmed",
    },
    {
      id: "service-002",
      date: "2025-01-30",
      time: "14:00",
      client: "Creative Agency",
      address: "Rua Augusta, 500",
      team: "Team Beta",
      status: "pending",
    },
    {
      id: "service-003",
      date: "2025-01-31",
      time: "10:00",
      client: "Law Firm Partners",
      address: "Av. Faria Lima, 2000",
      team: "Team Alpha",
      status: "confirmed",
    },
  ],
}

export const companyDashboardApi = {
  // Get dashboard overview data
  async getDashboardOverview(companyId: string): Promise<ApiResponse<typeof mockDashboardStats>> {
    try {
      await apiDelay(800)

      return {
        success: true,
        data: mockDashboardStats,
      }
    } catch (error) {
      console.error("Error fetching company dashboard overview:", error)
      return {
        success: false,
        error: "Failed to fetch dashboard overview",
      }
    }
  },

  // Get week summary statistics
  async getWeekSummary(companyId: string): Promise<ApiResponse<typeof mockDashboardStats.weekSummary>> {
    try {
      await apiDelay(500)

      return {
        success: true,
        data: mockDashboardStats.weekSummary,
      }
    } catch (error) {
      console.error("Error fetching week summary:", error)
      return {
        success: false,
        error: "Failed to fetch week summary",
      }
    }
  },

  // Get plan information
  async getPlanInfo(companyId: string): Promise<ApiResponse<typeof mockDashboardStats.planInfo>> {
    try {
      await apiDelay(600)

      return {
        success: true,
        data: mockDashboardStats.planInfo,
      }
    } catch (error) {
      console.error("Error fetching plan info:", error)
      return {
        success: false,
        error: "Failed to fetch plan information",
      }
    }
  },

  // Get dashboard alerts
  async getDashboardAlerts(companyId: string): Promise<ApiResponse<typeof mockDashboardStats.alerts>> {
    try {
      await apiDelay(400)

      return {
        success: true,
        data: mockDashboardStats.alerts,
      }
    } catch (error) {
      console.error("Error fetching dashboard alerts:", error)
      return {
        success: false,
        error: "Failed to fetch dashboard alerts",
      }
    }
  },

  // Get service status overview
  async getServiceStatus(companyId: string): Promise<ApiResponse<typeof mockDashboardStats.serviceStatus>> {
    try {
      await apiDelay(500)

      return {
        success: true,
        data: mockDashboardStats.serviceStatus,
      }
    } catch (error) {
      console.error("Error fetching service status:", error)
      return {
        success: false,
        error: "Failed to fetch service status",
      }
    }
  },

  // Get recent activity
  async getRecentActivity(
    companyId: string,
    limit = 10,
  ): Promise<ApiResponse<typeof mockDashboardStats.recentActivity>> {
    try {
      await apiDelay(600)

      const limitedActivity = mockDashboardStats.recentActivity.slice(0, limit)

      return {
        success: true,
        data: limitedActivity,
      }
    } catch (error) {
      console.error("Error fetching recent activity:", error)
      return {
        success: false,
        error: "Failed to fetch recent activity",
      }
    }
  },

  // Get upcoming services
  async getUpcomingServices(
    companyId: string,
    days = 7,
  ): Promise<ApiResponse<typeof mockDashboardStats.upcomingServices>> {
    try {
      await apiDelay(700)

      // Filter services for the next X days
      const today = new Date()
      const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)

      const filteredServices = mockDashboardStats.upcomingServices.filter((service) => {
        const serviceDate = new Date(service.date)
        return serviceDate >= today && serviceDate <= futureDate
      })

      return {
        success: true,
        data: filteredServices,
      }
    } catch (error) {
      console.error("Error fetching upcoming services:", error)
      return {
        success: false,
        error: "Failed to fetch upcoming services",
      }
    }
  },

  // Dismiss alert
  async dismissAlert(companyId: string, alertId: string): Promise<ApiResponse<null>> {
    try {
      await apiDelay(300)

      // In a real implementation, this would remove the alert from the database
      return {
        success: true,
        data: null,
      }
    } catch (error) {
      console.error("Error dismissing alert:", error)
      return {
        success: false,
        error: "Failed to dismiss alert",
      }
    }
  },

  // Mark alert as read
  async markAlertAsRead(companyId: string, alertId: string): Promise<ApiResponse<null>> {
    try {
      await apiDelay(200)

      // In a real implementation, this would mark the alert as read in the database
      return {
        success: true,
        data: null,
      }
    } catch (error) {
      console.error("Error marking alert as read:", error)
      return {
        success: false,
        error: "Failed to mark alert as read",
      }
    }
  },

  // Get dashboard metrics for a specific date range
  async getDashboardMetrics(
    companyId: string,
    startDate: string,
    endDate: string,
  ): Promise<
    ApiResponse<{
      totalRevenue: number
      totalServices: number
      averageRating: number
      customerSatisfaction: number
      teamEfficiency: number
      growthRate: number
    }>
  > {
    try {
      await apiDelay(900)

      const metrics = {
        totalRevenue: 15750.0,
        totalServices: 42,
        averageRating: 4.8,
        customerSatisfaction: 96.5,
        teamEfficiency: 87.3,
        growthRate: 12.5,
      }

      return {
        success: true,
        data: metrics,
      }
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error)
      return {
        success: false,
        error: "Failed to fetch dashboard metrics",
      }
    }
  },
}
