"use client"

import { useCompanyDashboardContext } from "@/contexts/company-dashboard-context"
import { useCallback, useMemo } from "react"

export function useCompanyDashboard() {
  const context = useCompanyDashboardContext()

  // Format currency for display
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }, [])

  // Format date for display
  const formatDate = useCallback((dateString: string): string => {
    if (!dateString) return "N/A"

    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }, [])

  // Format time for display
  const formatTime = useCallback((timeString: string): string => {
    if (!timeString) return "N/A"

    const [hours, minutes] = timeString.split(":")
    return `${hours}:${minutes}`
  }, [])

  // Format relative time (e.g., "2 hours ago")
  const formatRelativeTime = useCallback(
    (dateString: string): string => {
      if (!dateString) return "N/A"

      const date = new Date(dateString)
      const now = new Date()
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

      if (diffInMinutes < 1) return "Agora mesmo"
      if (diffInMinutes < 60) return `${diffInMinutes} min atrás`

      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) return `${diffInHours}h atrás`

      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) return `${diffInDays}d atrás`

      return formatDate(dateString)
    },
    [formatDate],
  )

  // Get alert priority color
  const getAlertPriorityColor = useCallback((priority: string): string => {
    switch (priority) {
      case "high":
        return "border-red-500 bg-red-50 text-red-700"
      case "medium":
        return "border-yellow-500 bg-yellow-50 text-yellow-700"
      case "low":
        return "border-blue-500 bg-blue-50 text-blue-700"
      default:
        return "border-gray-500 bg-gray-50 text-gray-700"
    }
  }, [])

  // Get alert type icon
  const getAlertTypeIcon = useCallback((type: string): string => {
    switch (type) {
      case "info":
        return "ℹ️"
      case "warning":
        return "⚠️"
      case "error":
        return "❌"
      case "success":
        return "✅"
      default:
        return "ℹ️"
    }
  }, [])

  // Get service status color
  const getServiceStatusColor = useCallback((status: string): string => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }, [])

  // Get activity type icon
  const getActivityTypeIcon = useCallback((type: string): string => {
    switch (type) {
      case "appointment_completed":
        return "✅"
      case "appointment_scheduled":
        return "📅"
      case "appointment_cancelled":
        return "❌"
      case "payment_received":
        return "💰"
      case "team_assigned":
        return "👥"
      case "review_received":
        return "⭐"
      default:
        return "📋"
    }
  }, [])

  // Calculate completion rate color
  const getCompletionRateColor = useCallback((rate: number): string => {
    if (rate >= 80) return "text-green-600"
    if (rate >= 60) return "text-yellow-600"
    return "text-red-600"
  }, [])

  // Calculate days until renewal
  const getDaysUntilRenewal = useCallback((): number => {
    if (!context.planInfo?.renewalDate) return 0

    const renewalDate = new Date(context.planInfo.renewalDate)
    const today = new Date()
    const diffTime = renewalDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return Math.max(0, diffDays)
  }, [context.planInfo])

  // Check if plan is expiring soon
  const isPlanExpiringSoon = useCallback((): boolean => {
    const daysUntilRenewal = getDaysUntilRenewal()
    return daysUntilRenewal <= 30 && daysUntilRenewal > 0
  }, [getDaysUntilRenewal])

  // Get usage percentage
  const getUsagePercentage = useCallback((used: number, max: number): number => {
    if (max === 0) return 0
    return Math.round((used / max) * 100)
  }, [])

  // Get usage color based on percentage
  const getUsageColor = useCallback((percentage: number): string => {
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 75) return "bg-yellow-500"
    return "bg-green-500"
  }, [])

  // Filter alerts by priority
  const getAlertsByPriority = useCallback(
    (priority: string) => {
      return context.alerts.filter((alert) => alert.priority === priority)
    },
    [context.alerts],
  )

  // Get high priority alerts count
  const highPriorityAlertsCount = useMemo(() => {
    return getAlertsByPriority("high").length
  }, [getAlertsByPriority])

  // Get today's services
  const getTodaysServices = useCallback(() => {
    const today = new Date().toISOString().split("T")[0]
    return context.upcomingServices.filter((service) => service.date === today)
  }, [context.upcomingServices])

  // Get tomorrow's services
  const getTomorrowsServices = useCallback(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split("T")[0]
    return context.upcomingServices.filter((service) => service.date === tomorrowStr)
  }, [context.upcomingServices])

  // Calculate growth trend
  const getGrowthTrend = useCallback(
    (
      current: number,
      previous: number,
    ): {
      percentage: number
      isPositive: boolean
      isNeutral: boolean
    } => {
      if (previous === 0) {
        return { percentage: 0, isPositive: false, isNeutral: true }
      }

      const percentage = ((current - previous) / previous) * 100
      return {
        percentage: Math.abs(percentage),
        isPositive: percentage > 0,
        isNeutral: percentage === 0,
      }
    },
    [],
  )

  // Format percentage
  const formatPercentage = useCallback((value: number): string => {
    return `${value.toFixed(1)}%`
  }, [])

  return {
    ...context,
    formatCurrency,
    formatDate,
    formatTime,
    formatRelativeTime,
    getAlertPriorityColor,
    getAlertTypeIcon,
    getServiceStatusColor,
    getActivityTypeIcon,
    getCompletionRateColor,
    getDaysUntilRenewal,
    isPlanExpiringSoon,
    getUsagePercentage,
    getUsageColor,
    getAlertsByPriority,
    highPriorityAlertsCount,
    getTodaysServices,
    getTomorrowsServices,
    getGrowthTrend,
    formatPercentage,
  }
}
