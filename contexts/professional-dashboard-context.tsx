"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import * as api from "@/lib/api/professional-dashboard"
import type {
  DashboardSummary,
  DashboardStats,
  Activity,
  WeeklySchedule,
  MonthlyTrend,
} from "@/lib/api/professional-dashboard"
import type { Appointment, Notification } from "@/types"

interface ProfessionalDashboardContextType {
  // State
  dashboardSummary: DashboardSummary | null
  dashboardStats: DashboardStats | null
  upcomingAppointments: Appointment[]
  todayAppointments: Appointment[]
  pendingCheckIns: Appointment[]
  recentActivities: Activity[]
  weeklySchedule: WeeklySchedule[]
  monthlyTrend: MonthlyTrend | null
  notifications: Notification[]
  earningsSummary: {
    total: number
    pending: number
    paid: number
    average: number
    transactions: Array<{
      id: string
      date: Date
      amount: number
      status: "pending" | "paid" | "processing"
      description: string
    }>
  } | null
  quickStats: {
    rating: number
    totalReviews: number
    completionRate: number
    punctualityRate: number
    monthlyAppointments: number
    weeklyGrowth: number
  } | null

  // Loading states
  isLoadingDashboard: boolean
  isLoadingStats: boolean
  isLoadingAppointments: boolean
  isLoadingActivities: boolean
  isLoadingEarnings: boolean

  // Error states
  error: string | null

  // Actions
  loadDashboard: () => Promise<void>
  loadDashboardStats: () => Promise<void>
  loadUpcomingAppointments: (limit?: number) => Promise<void>
  loadTodayAppointments: () => Promise<void>
  loadPendingCheckIns: () => Promise<void>
  loadRecentActivities: (limit?: number) => Promise<void>
  loadWeeklySchedule: () => Promise<void>
  loadMonthlyTrend: () => Promise<void>
  loadEarningsSummary: (period?: "daily" | "weekly" | "monthly") => Promise<void>
  loadQuickStats: () => Promise<void>
  loadDashboardNotifications: (limit?: number) => Promise<void>
  refreshDashboard: () => Promise<void>
  markDashboardViewed: () => Promise<void>
}

const ProfessionalDashboardContext = createContext<ProfessionalDashboardContextType | undefined>(undefined)

export function ProfessionalDashboardProvider({ children }: { children: ReactNode }) {
  // State
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [pendingCheckIns, setPendingCheckIns] = useState<Appointment[]>([])
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule[]>([])
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [earningsSummary, setEarningsSummary] = useState<any>(null)
  const [quickStats, setQuickStats] = useState<any>(null)

  // Loading states
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false)
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)
  const [isLoadingEarnings, setIsLoadingEarnings] = useState(false)

  // Error state
  const [error, setError] = useState<string | null>(null)

  // Load complete dashboard
  const loadDashboard = useCallback(async () => {
    setIsLoadingDashboard(true)
    setError(null)
    try {
      const summary = await api.getProfessionalDashboard()
      setDashboardSummary(summary)
      setDashboardStats(summary.stats)
      setUpcomingAppointments(summary.upcomingAppointments)
      setRecentActivities(summary.recentActivities)
      setNotifications(summary.notifications)
      setWeeklySchedule(summary.weeklySchedule)
      setMonthlyTrend(summary.monthlyTrend)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard")
      console.error("Error loading dashboard:", err)
    } finally {
      setIsLoadingDashboard(false)
    }
  }, [])

  // Load dashboard statistics only
  const loadDashboardStats = useCallback(async () => {
    setIsLoadingStats(true)
    setError(null)
    try {
      const stats = await api.getProfessionalDashboardStats()
      setDashboardStats(stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load statistics")
      console.error("Error loading stats:", err)
    } finally {
      setIsLoadingStats(false)
    }
  }, [])

  // Load upcoming appointments
  const loadUpcomingAppointments = useCallback(async (limit?: number) => {
    setIsLoadingAppointments(true)
    setError(null)
    try {
      const appointments = await api.getProfessionalUpcomingAppointments(limit)
      setUpcomingAppointments(appointments)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load appointments")
      console.error("Error loading appointments:", err)
    } finally {
      setIsLoadingAppointments(false)
    }
  }, [])

  // Load today's appointments
  const loadTodayAppointments = useCallback(async () => {
    setIsLoadingAppointments(true)
    setError(null)
    try {
      const appointments = await api.getProfessionalTodayAppointments()
      setTodayAppointments(appointments)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load today appointments")
      console.error("Error loading today appointments:", err)
    } finally {
      setIsLoadingAppointments(false)
    }
  }, [])

  // Load pending check-ins
  const loadPendingCheckIns = useCallback(async () => {
    setIsLoadingAppointments(true)
    setError(null)
    try {
      const appointments = await api.getProfessionalPendingCheckIns()
      setPendingCheckIns(appointments)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pending check-ins")
      console.error("Error loading pending check-ins:", err)
    } finally {
      setIsLoadingAppointments(false)
    }
  }, [])

  // Load recent activities
  const loadRecentActivities = useCallback(async (limit?: number) => {
    setIsLoadingActivities(true)
    setError(null)
    try {
      const activities = await api.getProfessionalRecentActivities(limit)
      setRecentActivities(activities)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activities")
      console.error("Error loading activities:", err)
    } finally {
      setIsLoadingActivities(false)
    }
  }, [])

  // Load weekly schedule
  const loadWeeklySchedule = useCallback(async () => {
    setError(null)
    try {
      const schedule = await api.getProfessionalWeeklySchedule()
      setWeeklySchedule(schedule)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load weekly schedule")
      console.error("Error loading weekly schedule:", err)
    }
  }, [])

  // Load monthly trend
  const loadMonthlyTrend = useCallback(async () => {
    setError(null)
    try {
      const trend = await api.getProfessionalMonthlyTrend()
      setMonthlyTrend(trend)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load monthly trend")
      console.error("Error loading monthly trend:", err)
    }
  }, [])

  // Load earnings summary
  const loadEarningsSummary = useCallback(async (period: "daily" | "weekly" | "monthly" = "monthly") => {
    setIsLoadingEarnings(true)
    setError(null)
    try {
      const earnings = await api.getProfessionalEarningsSummary(period)
      setEarningsSummary(earnings)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load earnings")
      console.error("Error loading earnings:", err)
    } finally {
      setIsLoadingEarnings(false)
    }
  }, [])

  // Load quick stats
  const loadQuickStats = useCallback(async () => {
    setError(null)
    try {
      const stats = await api.getProfessionalQuickStats()
      setQuickStats(stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quick stats")
      console.error("Error loading quick stats:", err)
    }
  }, [])

  // Load dashboard notifications
  const loadDashboardNotifications = useCallback(async (limit?: number) => {
    setError(null)
    try {
      const notifs = await api.getProfessionalDashboardNotifications(limit)
      setNotifications(notifs)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications")
      console.error("Error loading notifications:", err)
    }
  }, [])

  // Refresh entire dashboard
  const refreshDashboard = useCallback(async () => {
    await Promise.all([loadDashboard(), loadQuickStats(), loadEarningsSummary()])
  }, [loadDashboard, loadQuickStats, loadEarningsSummary])

  // Mark dashboard as viewed
  const markDashboardViewed = useCallback(async () => {
    try {
      await api.markDashboardViewed()
    } catch (err) {
      console.error("Error marking dashboard as viewed:", err)
    }
  }, [])

  const value: ProfessionalDashboardContextType = {
    // State
    dashboardSummary,
    dashboardStats,
    upcomingAppointments,
    todayAppointments,
    pendingCheckIns,
    recentActivities,
    weeklySchedule,
    monthlyTrend,
    notifications,
    earningsSummary,
    quickStats,

    // Loading states
    isLoadingDashboard,
    isLoadingStats,
    isLoadingAppointments,
    isLoadingActivities,
    isLoadingEarnings,

    // Error state
    error,

    // Actions
    loadDashboard,
    loadDashboardStats,
    loadUpcomingAppointments,
    loadTodayAppointments,
    loadPendingCheckIns,
    loadRecentActivities,
    loadWeeklySchedule,
    loadMonthlyTrend,
    loadEarningsSummary,
    loadQuickStats,
    loadDashboardNotifications,
    refreshDashboard,
    markDashboardViewed,
  }

  return <ProfessionalDashboardContext.Provider value={value}>{children}</ProfessionalDashboardContext.Provider>
}

export function useProfessionalDashboardContext() {
  const context = useContext(ProfessionalDashboardContext)
  if (!context) {
    throw new Error("useProfessionalDashboardContext must be used within ProfessionalDashboardProvider")
  }
  return context
}
