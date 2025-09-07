"use client"

import { useEffect, useCallback, useMemo } from "react"
import { useProfessionalDashboardContext } from "@/contexts/professional-dashboard-context"

// Hook principal para o dashboard
export function useProfessionalDashboard() {
  const context = useProfessionalDashboardContext()

  // Load initial dashboard data
  useEffect(() => {
    context.loadDashboard()
    context.markDashboardViewed()
  }, [])

  // Auto-refresh dashboard every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        context.refreshDashboard()
      },
      5 * 60 * 1000,
    ) // 5 minutes

    return () => clearInterval(interval)
  }, [context.refreshDashboard])

  return {
    ...context,
    isLoading: context.isLoadingDashboard || context.isLoadingStats,
    hasData: !!context.dashboardSummary,
  }
}

// Hook para estatísticas rápidas
export function useProfessionalQuickStats() {
  const { dashboardStats, quickStats, loadDashboardStats, loadQuickStats, isLoadingStats } =
    useProfessionalDashboardContext()

  useEffect(() => {
    if (!dashboardStats) {
      loadDashboardStats()
    }
    if (!quickStats) {
      loadQuickStats()
    }
  }, [dashboardStats, quickStats, loadDashboardStats, loadQuickStats])

  const stats = useMemo(() => {
    if (!dashboardStats && !quickStats) return null

    return {
      todayAppointments: dashboardStats?.todayAppointments || 0,
      weekAppointments: dashboardStats?.weekAppointments || 0,
      monthAppointments: dashboardStats?.monthAppointments || 0,
      completedToday: dashboardStats?.completedToday || 0,
      pendingCheckIns: dashboardStats?.pendingCheckIns || 0,
      averageRating: dashboardStats?.averageRating || quickStats?.rating || 0,
      totalReviews: dashboardStats?.totalReviews || quickStats?.totalReviews || 0,
      monthlyEarnings: dashboardStats?.monthlyEarnings || 0,
      completionRate: dashboardStats?.completionRate || quickStats?.completionRate || 0,
      punctualityRate: dashboardStats?.punctualityRate || quickStats?.punctualityRate || 0,
      weeklyGrowth: quickStats?.weeklyGrowth || 0,
    }
  }, [dashboardStats, quickStats])

  return {
    stats,
    isLoading: isLoadingStats,
    refresh: useCallback(async () => {
      await Promise.all([loadDashboardStats(), loadQuickStats()])
    }, [loadDashboardStats, loadQuickStats]),
  }
}

// Hook para próximos compromissos
export function useProfessionalUpcomingAppointments(limit = 5) {
  const { upcomingAppointments, loadUpcomingAppointments, isLoadingAppointments } = useProfessionalDashboardContext()

  useEffect(() => {
    loadUpcomingAppointments(limit)
  }, [limit, loadUpcomingAppointments])

  return {
    appointments: upcomingAppointments,
    isLoading: isLoadingAppointments,
    refresh: () => loadUpcomingAppointments(limit),
  }
}

// Hook para atividades recentes
export function useProfessionalRecentActivities(limit = 10) {
  const { recentActivities, loadRecentActivities, isLoadingActivities } = useProfessionalDashboardContext()

  useEffect(() => {
    loadRecentActivities(limit)
  }, [limit, loadRecentActivities])

  const groupedActivities = useMemo(() => {
    const groups: Record<string, typeof recentActivities> = {}

    recentActivities.forEach((activity) => {
      const date = new Date(activity.timestamp).toLocaleDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(activity)
    })

    return groups
  }, [recentActivities])

  return {
    activities: recentActivities,
    groupedActivities,
    isLoading: isLoadingActivities,
    refresh: () => loadRecentActivities(limit),
  }
}

// Hook para resumo de ganhos
export function useProfessionalEarnings(period: "daily" | "weekly" | "monthly" = "monthly") {
  const { earningsSummary, loadEarningsSummary, isLoadingEarnings } = useProfessionalDashboardContext()

  useEffect(() => {
    loadEarningsSummary(period)
  }, [period, loadEarningsSummary])

  const formattedEarnings = useMemo(() => {
    if (!earningsSummary) return null

    return {
      ...earningsSummary,
      formattedTotal: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(earningsSummary.total),
      formattedPending: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(earningsSummary.pending),
      formattedPaid: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(earningsSummary.paid),
      formattedAverage: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(earningsSummary.average),
    }
  }, [earningsSummary])

  return {
    earnings: formattedEarnings,
    isLoading: isLoadingEarnings,
    refresh: () => loadEarningsSummary(period),
  }
}

// Hook para agenda semanal
export function useProfessionalWeeklySchedule() {
  const { weeklySchedule, loadWeeklySchedule } = useProfessionalDashboardContext()

  useEffect(() => {
    if (weeklySchedule.length === 0) {
      loadWeeklySchedule()
    }
  }, [weeklySchedule, loadWeeklySchedule])

  const scheduleStats = useMemo(() => {
    const totalAppointments = weeklySchedule.reduce((sum, day) => sum + day.appointments, 0)
    const totalCompleted = weeklySchedule.reduce((sum, day) => sum + day.completed, 0)
    const totalCancelled = weeklySchedule.reduce((sum, day) => sum + day.cancelled, 0)

    return {
      totalAppointments,
      totalCompleted,
      totalCancelled,
      completionRate: totalAppointments > 0 ? (totalCompleted / totalAppointments) * 100 : 0,
    }
  }, [weeklySchedule])

  return {
    schedule: weeklySchedule,
    stats: scheduleStats,
    refresh: loadWeeklySchedule,
  }
}

// Hook para tendências mensais
export function useProfessionalMonthlyTrends() {
  const { monthlyTrend, loadMonthlyTrend } = useProfessionalDashboardContext()

  useEffect(() => {
    if (!monthlyTrend) {
      loadMonthlyTrend()
    }
  }, [monthlyTrend, loadMonthlyTrend])

  return {
    trends: monthlyTrend,
    refresh: loadMonthlyTrend,
  }
}

// Hook para notificações do dashboard
export function useProfessionalDashboardNotifications(limit = 5) {
  const { notifications, loadDashboardNotifications } = useProfessionalDashboardContext()

  useEffect(() => {
    loadDashboardNotifications(limit)
  }, [limit, loadDashboardNotifications])

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => n.status === "unread").length
  }, [notifications])

  return {
    notifications,
    unreadCount,
    refresh: () => loadDashboardNotifications(limit),
  }
}
