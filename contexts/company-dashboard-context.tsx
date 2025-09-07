"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { toast } from "@/components/ui/use-toast"
import { companyDashboardApi } from "@/lib/api/company-dashboard"

interface DashboardAlert {
  id: string
  type: "info" | "warning" | "error" | "success"
  title: string
  message: string
  priority: "low" | "medium" | "high"
  createdAt: string
}

interface WeekSummary {
  scheduled: number
  completed: number
  pending: number
  cancelled: number
  completionRate: number
}

interface PlanInfo {
  name: string
  status: string
  renewalDate: string
  daysLeft: number
  paymentStatus: string
  lastPayment: string
  nextPayment: string
  features: string[]
  usage: {
    teamMembers: { used: number; max: number }
    storage: { used: number; max: number }
    appointments: { used: number; max: number }
  }
}

interface ServiceStatus {
  completed: number
  scheduled: number
  cancelled: number
}

interface RecentActivity {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  professional?: string
  client?: string
  amount?: number
}

interface UpcomingService {
  id: string
  date: string
  time: string
  client: string
  address: string
  team: string
  status: string
}

interface DashboardMetrics {
  totalRevenue: number
  totalServices: number
  averageRating: number
  customerSatisfaction: number
  teamEfficiency: number
  growthRate: number
}

interface CompanyDashboardContextType {
  // State
  loading: boolean
  error: string | null
  weekSummary: WeekSummary | null
  planInfo: PlanInfo | null
  alerts: DashboardAlert[]
  serviceStatus: ServiceStatus | null
  recentActivity: RecentActivity[]
  upcomingServices: UpcomingService[]
  dashboardMetrics: DashboardMetrics | null

  // Actions
  fetchDashboardOverview: (companyId: string) => Promise<void>
  fetchWeekSummary: (companyId: string) => Promise<void>
  fetchPlanInfo: (companyId: string) => Promise<void>
  fetchAlerts: (companyId: string) => Promise<void>
  fetchServiceStatus: (companyId: string) => Promise<void>
  fetchRecentActivity: (companyId: string, limit?: number) => Promise<void>
  fetchUpcomingServices: (companyId: string, days?: number) => Promise<void>
  fetchDashboardMetrics: (companyId: string, startDate: string, endDate: string) => Promise<void>
  dismissAlert: (companyId: string, alertId: string) => Promise<void>
  markAlertAsRead: (companyId: string, alertId: string) => Promise<void>
  refreshDashboard: (companyId: string) => Promise<void>
}

const CompanyDashboardContext = createContext<CompanyDashboardContextType | undefined>(undefined)

export function CompanyDashboardProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [weekSummary, setWeekSummary] = useState<WeekSummary | null>(null)
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [alerts, setAlerts] = useState<DashboardAlert[]>([])
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [upcomingServices, setUpcomingServices] = useState<UpcomingService[]>([])
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null)

  const fetchDashboardOverview = async (companyId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await companyDashboardApi.getDashboardOverview(companyId)

      if (response.success && response.data) {
        setWeekSummary(response.data.weekSummary)
        setPlanInfo(response.data.planInfo)
        setAlerts(response.data.alerts)
        setServiceStatus(response.data.serviceStatus)
        setRecentActivity(response.data.recentActivity)
        setUpcomingServices(response.data.upcomingServices)
      } else {
        setError(response.error || "Failed to fetch dashboard overview")
        toast({
          title: "Error",
          description: response.error || "Failed to fetch dashboard overview",
          variant: "destructive",
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchWeekSummary = async (companyId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await companyDashboardApi.getWeekSummary(companyId)

      if (response.success && response.data) {
        setWeekSummary(response.data)
      } else {
        setError(response.error || "Failed to fetch week summary")
        toast({
          title: "Error",
          description: response.error || "Failed to fetch week summary",
          variant: "destructive",
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPlanInfo = async (companyId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await companyDashboardApi.getPlanInfo(companyId)

      if (response.success && response.data) {
        setPlanInfo(response.data)
      } else {
        setError(response.error || "Failed to fetch plan information")
        toast({
          title: "Error",
          description: response.error || "Failed to fetch plan information",
          variant: "destructive",
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAlerts = async (companyId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await companyDashboardApi.getDashboardAlerts(companyId)

      if (response.success && response.data) {
        setAlerts(response.data)
      } else {
        setError(response.error || "Failed to fetch alerts")
        toast({
          title: "Error",
          description: response.error || "Failed to fetch alerts",
          variant: "destructive",
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchServiceStatus = async (companyId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await companyDashboardApi.getServiceStatus(companyId)

      if (response.success && response.data) {
        setServiceStatus(response.data)
      } else {
        setError(response.error || "Failed to fetch service status")
        toast({
          title: "Error",
          description: response.error || "Failed to fetch service status",
          variant: "destructive",
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivity = async (companyId: string, limit = 10) => {
    setLoading(true)
    setError(null)

    try {
      const response = await companyDashboardApi.getRecentActivity(companyId, limit)

      if (response.success && response.data) {
        setRecentActivity(response.data)
      } else {
        setError(response.error || "Failed to fetch recent activity")
        toast({
          title: "Error",
          description: response.error || "Failed to fetch recent activity",
          variant: "destructive",
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUpcomingServices = async (companyId: string, days = 7) => {
    setLoading(true)
    setError(null)

    try {
      const response = await companyDashboardApi.getUpcomingServices(companyId, days)

      if (response.success && response.data) {
        setUpcomingServices(response.data)
      } else {
        setError(response.error || "Failed to fetch upcoming services")
        toast({
          title: "Error",
          description: response.error || "Failed to fetch upcoming services",
          variant: "destructive",
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardMetrics = async (companyId: string, startDate: string, endDate: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await companyDashboardApi.getDashboardMetrics(companyId, startDate, endDate)

      if (response.success && response.data) {
        setDashboardMetrics(response.data)
      } else {
        setError(response.error || "Failed to fetch dashboard metrics")
        toast({
          title: "Error",
          description: response.error || "Failed to fetch dashboard metrics",
          variant: "destructive",
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const dismissAlert = async (companyId: string, alertId: string) => {
    try {
      const response = await companyDashboardApi.dismissAlert(companyId, alertId)

      if (response.success) {
        setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
        toast({
          title: "Success",
          description: "Alert dismissed successfully",
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to dismiss alert",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to dismiss alert",
        variant: "destructive",
      })
    }
  }

  const markAlertAsRead = async (companyId: string, alertId: string) => {
    try {
      const response = await companyDashboardApi.markAlertAsRead(companyId, alertId)

      if (response.success) {
        // Update alert as read in local state if needed
        toast({
          title: "Success",
          description: "Alert marked as read",
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to mark alert as read",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to mark alert as read",
        variant: "destructive",
      })
    }
  }

  const refreshDashboard = async (companyId: string) => {
    await fetchDashboardOverview(companyId)
  }

  const value = {
    loading,
    error,
    weekSummary,
    planInfo,
    alerts,
    serviceStatus,
    recentActivity,
    upcomingServices,
    dashboardMetrics,
    fetchDashboardOverview,
    fetchWeekSummary,
    fetchPlanInfo,
    fetchAlerts,
    fetchServiceStatus,
    fetchRecentActivity,
    fetchUpcomingServices,
    fetchDashboardMetrics,
    dismissAlert,
    markAlertAsRead,
    refreshDashboard,
  }

  return <CompanyDashboardContext.Provider value={value}>{children}</CompanyDashboardContext.Provider>
}

export function useCompanyDashboardContext() {
  const context = useContext(CompanyDashboardContext)

  if (context === undefined) {
    throw new Error("useCompanyDashboardContext must be used within a CompanyDashboardProvider")
  }

  return context
}
