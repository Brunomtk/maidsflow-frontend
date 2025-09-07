"use client"

import { useCallback, useEffect } from "react"
import { useProfessionalNotificationsContext } from "@/contexts/professional-notifications-context"
import {
  getProfessionalNotifications,
  getProfessionalNotificationById,
  markProfessionalNotificationAsRead,
  getProfessionalUnreadNotificationsCount,
  sendProfessionalNotificationResponse,
  getProfessionalNotificationStats,
  markAllProfessionalNotificationsAsRead,
  getProfessionalNotificationsByPriority,
  getProfessionalRecentNotifications,
} from "@/lib/api/professional-notifications"

export function useProfessionalNotifications(professionalId?: string) {
  const {
    state,
    setLoading,
    setError,
    setNotifications,
    setSelectedNotification,
    updateNotification,
    markAsRead,
    markAllAsRead,
    setFilters,
    setStats,
    resetState,
  } = useProfessionalNotificationsContext()

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (type?: string, status?: string, search?: string, startDate?: string, endDate?: string) => {
      if (!professionalId) return

      try {
        setLoading(true)
        setError(null)
        const notifications = await getProfessionalNotifications(
          professionalId,
          type,
          status,
          search,
          startDate,
          endDate,
        )
        setNotifications(notifications)
      } catch (error) {
        console.error("Error fetching professional notifications:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch notifications")
      }
    },
    [professionalId, setLoading, setError, setNotifications],
  )

  // Fetch notification by ID
  const fetchNotificationById = useCallback(
    async (notificationId: string) => {
      if (!professionalId) return null

      try {
        setLoading(true)
        setError(null)
        const notification = await getProfessionalNotificationById(professionalId, notificationId)
        setSelectedNotification(notification)
        return notification
      } catch (error) {
        console.error("Error fetching professional notification:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch notification")
        return null
      } finally {
        setLoading(false)
      }
    },
    [professionalId, setLoading, setError, setSelectedNotification],
  )

  // Mark notification as read
  const markNotificationAsRead = useCallback(
    async (notificationId: string) => {
      if (!professionalId) return

      try {
        const updatedNotification = await markProfessionalNotificationAsRead(professionalId, notificationId)
        updateNotification(updatedNotification)
        markAsRead(notificationId)
        return updatedNotification
      } catch (error) {
        console.error("Error marking notification as read:", error)
        setError(error instanceof Error ? error.message : "Failed to mark notification as read")
      }
    },
    [professionalId, updateNotification, markAsRead, setError],
  )

  // Get unread notifications count
  const fetchUnreadCount = useCallback(async () => {
    if (!professionalId) return 0

    try {
      const count = await getProfessionalUnreadNotificationsCount(professionalId)
      return count
    } catch (error) {
      console.error("Error fetching unread notifications count:", error)
      return 0
    }
  }, [professionalId])

  // Send notification response
  const sendNotificationResponse = useCallback(
    async (
      notificationId: string,
      response: string,
      responseType: "confirmation" | "feedback" | "question" = "feedback",
    ) => {
      if (!professionalId) return

      try {
        setLoading(true)
        setError(null)
        const responseNotification = await sendProfessionalNotificationResponse(
          professionalId,
          notificationId,
          response,
          responseType,
        )
        return responseNotification
      } catch (error) {
        console.error("Error sending notification response:", error)
        setError(error instanceof Error ? error.message : "Failed to send response")
      } finally {
        setLoading(false)
      }
    },
    [professionalId, setLoading, setError],
  )

  // Fetch notification statistics
  const fetchNotificationStats = useCallback(async () => {
    if (!professionalId) return

    try {
      const stats = await getProfessionalNotificationStats(professionalId)
      setStats(stats)
      return stats
    } catch (error) {
      console.error("Error fetching notification stats:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch notification stats")
    }
  }, [professionalId, setStats, setError])

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(async () => {
    if (!professionalId) return

    try {
      setLoading(true)
      setError(null)
      await markAllProfessionalNotificationsAsRead(professionalId)
      markAllAsRead()
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      setError(error instanceof Error ? error.message : "Failed to mark all notifications as read")
    } finally {
      setLoading(false)
    }
  }, [professionalId, setLoading, setError, markAllAsRead])

  // Fetch notifications by priority
  const fetchNotificationsByPriority = useCallback(
    async (priority: "high" | "medium" | "low" = "high") => {
      if (!professionalId) return []

      try {
        setLoading(true)
        setError(null)
        const notifications = await getProfessionalNotificationsByPriority(professionalId, priority)
        return notifications
      } catch (error) {
        console.error("Error fetching notifications by priority:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch notifications by priority")
        return []
      } finally {
        setLoading(false)
      }
    },
    [professionalId, setLoading, setError],
  )

  // Fetch recent notifications
  const fetchRecentNotifications = useCallback(async () => {
    if (!professionalId) return []

    try {
      setLoading(true)
      setError(null)
      const notifications = await getProfessionalRecentNotifications(professionalId)
      return notifications
    } catch (error) {
      console.error("Error fetching recent notifications:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch recent notifications")
      return []
    } finally {
      setLoading(false)
    }
  }, [professionalId, setLoading, setError])

  // Update filters
  const updateFilters = useCallback(
    (newFilters: Partial<typeof state.filters>) => {
      setFilters(newFilters)
    },
    [setFilters],
  )

  // Reset state
  const reset = useCallback(() => {
    resetState()
  }, [resetState])

  // Auto-fetch notifications when professionalId changes
  useEffect(() => {
    if (professionalId) {
      fetchNotifications()
      fetchNotificationStats()
    }
  }, [professionalId, fetchNotifications, fetchNotificationStats])

  return {
    // State
    notifications: state.notifications,
    selectedNotification: state.selectedNotification,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    stats: state.stats,

    // Actions
    fetchNotifications,
    fetchNotificationById,
    markNotificationAsRead,
    fetchUnreadCount,
    sendNotificationResponse,
    fetchNotificationStats,
    markAllNotificationsAsRead,
    fetchNotificationsByPriority,
    fetchRecentNotifications,
    updateFilters,
    reset,

    // Utilities
    setSelectedNotification,
  }
}

// Hook for real-time notifications (can be extended with WebSocket)
export function useProfessionalNotificationsRealTime(professionalId?: string) {
  const { fetchNotifications, fetchUnreadCount } = useProfessionalNotifications(professionalId)

  // This could be extended to use WebSocket for real-time updates
  useEffect(() => {
    if (!professionalId) return

    // Set up polling for new notifications (in a real app, use WebSocket)
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [professionalId, fetchUnreadCount])

  return {
    fetchNotifications,
    fetchUnreadCount,
  }
}

// Hook for notification filters
export function useProfessionalNotificationFilters(professionalId?: string) {
  const { filters, updateFilters, fetchNotifications } = useProfessionalNotifications(professionalId)

  const applyFilters = useCallback(() => {
    fetchNotifications(
      filters.type !== "all" ? filters.type : undefined,
      filters.status !== "all" ? filters.status : undefined,
      filters.search || undefined,
      filters.startDate || undefined,
      filters.endDate || undefined,
    )
  }, [fetchNotifications, filters])

  const clearFilters = useCallback(() => {
    updateFilters({
      type: "all",
      status: "all",
      search: "",
      startDate: "",
      endDate: "",
    })
  }, [updateFilters])

  return {
    filters,
    updateFilters,
    applyFilters,
    clearFilters,
  }
}
