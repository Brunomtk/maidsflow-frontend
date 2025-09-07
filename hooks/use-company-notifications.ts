"use client"

import { useState, useCallback, useMemo } from "react"
import { toast } from "@/hooks/use-toast"
import {
  getCompanyNotifications,
  getCompanyNotificationById,
  markCompanyNotificationAsRead,
  deleteCompanyNotification,
  updateCompanyNotification,
  createCompanyNotification,
  getCompanyUnreadNotificationsCount,
} from "@/lib/api/company-notifications"
import type { Notification } from "@/types/notification"

interface CompanyNotificationFilters {
  type?: string
  status?: string
  search?: string
}

export function useCompanyNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CompanyNotificationFilters>({})
  const [unreadCount, setUnreadCount] = useState<number>(0)

  // Memoized filtered notifications to prevent infinite loops
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (notification) =>
          notification.title.toLowerCase().includes(searchLower) ||
          notification.message.toLowerCase().includes(searchLower),
      )
    }

    if (filters.type && filters.type !== "all") {
      const typeValue = Number.parseInt(filters.type)
      if (!isNaN(typeValue)) {
        filtered = filtered.filter((notification) => notification.type === typeValue)
      }
    }

    if (filters.status && filters.status !== "all") {
      const statusValue = filters.status === "read" ? 1 : 0
      filtered = filtered.filter((notification) => notification.status === statusValue)
    }

    return filtered
  }, [notifications, filters])

  // Memoized stats to prevent recalculation
  const stats = useMemo(() => {
    return {
      total: notifications.length,
      unread: notifications.filter((n) => n.status === 0).length,
      read: notifications.filter((n) => n.status === 1).length,
      sent: notifications.filter((n) => n.sentAt !== null).length,
      scheduled: 0,
      draft: 0,
    }
  }, [notifications])

  // Fetch notifications
  const fetchCompanyNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCompanyNotifications()
      setNotifications(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch notifications"
      setError(errorMessage)

      // Only show toast for non-authentication errors
      if (!errorMessage.includes("Authentication failed")) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch a specific notification by ID
  const fetchCompanyNotificationById = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCompanyNotificationById(id)
      setSelectedNotification(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to fetch notification with ID ${id}`
      setError(errorMessage)

      if (!errorMessage.includes("Authentication failed")) {
        toast({
          title: "Error",
          description: "Failed to fetch notification details",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Create a notification
  const createCompanyNotificationHandler = useCallback(
    async (data: {
      title: string
      message: string
      type: string
      recipientRole: string
      recipientIds: number[]
      isBroadcast: boolean
      companyId: number
    }) => {
      setLoading(true)
      setError(null)
      try {
        await createCompanyNotification(data)

        toast({
          title: "Success",
          description: "Notification created successfully",
        })

        // Refresh the notifications list
        await fetchCompanyNotifications()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create notification"
        setError(errorMessage)

        if (!errorMessage.includes("Authentication failed")) {
          toast({
            title: "Error",
            description: "Failed to create notification",
            variant: "destructive",
          })
        }
      } finally {
        setLoading(false)
      }
    },
    [fetchCompanyNotifications],
  )

  // Update an existing notification
  const updateCompanyNotificationHandler = useCallback(
    async (
      id: string,
      data: {
        title?: string
        message?: string
        type?: string
        status?: string
        readAt?: string
      },
    ) => {
      setLoading(true)
      setError(null)
      try {
        const updatedNotification = await updateCompanyNotification(id, data)

        // Update the notifications list
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id.toString() === id ? updatedNotification : notification,
          ),
        )

        // Update selected notification if it's the one being edited
        if (selectedNotification && selectedNotification.id.toString() === id) {
          setSelectedNotification(updatedNotification)
        }

        toast({
          title: "Success",
          description: "Notification updated successfully",
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : `Failed to update notification with ID ${id}`
        setError(errorMessage)

        if (!errorMessage.includes("Authentication failed")) {
          toast({
            title: "Error",
            description: "Failed to update notification",
            variant: "destructive",
          })
        }
      } finally {
        setLoading(false)
      }
    },
    [selectedNotification],
  )

  // Delete a notification
  const deleteCompanyNotificationHandler = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)
      try {
        await deleteCompanyNotification(id)

        // Remove from the notifications list
        setNotifications((prevNotifications) =>
          prevNotifications.filter((notification) => notification.id.toString() !== id),
        )

        // Clear selected notification if it's the one being deleted
        if (selectedNotification && selectedNotification.id.toString() === id) {
          setSelectedNotification(null)
        }

        toast({
          title: "Success",
          description: "Notification deleted successfully",
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : `Failed to delete notification with ID ${id}`
        setError(errorMessage)

        if (!errorMessage.includes("Authentication failed")) {
          toast({
            title: "Error",
            description: "Failed to delete notification",
            variant: "destructive",
          })
        }
      } finally {
        setLoading(false)
      }
    },
    [selectedNotification],
  )

  // Mark a notification as read
  const markCompanyNotificationAsReadHandler = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)
      try {
        const updatedNotification = await markCompanyNotificationAsRead(id)

        // Update the notifications list
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id.toString() === id ? updatedNotification : notification,
          ),
        )

        // Update selected notification if it's the one being marked as read
        if (selectedNotification && selectedNotification.id.toString() === id) {
          setSelectedNotification(updatedNotification)
        }

        // Update unread count
        setUnreadCount((prev) => Math.max(0, prev - 1))

        toast({
          title: "Success",
          description: "Notification marked as read",
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : `Failed to mark notification with ID ${id} as read`
        setError(errorMessage)

        if (!errorMessage.includes("Authentication failed")) {
          toast({
            title: "Error",
            description: "Failed to mark notification as read",
            variant: "destructive",
          })
        }
      } finally {
        setLoading(false)
      }
    },
    [selectedNotification],
  )

  // Fetch unread notifications count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getCompanyUnreadNotificationsCount()
      setUnreadCount(count)
    } catch (err) {
      console.error("Failed to fetch unread notifications count:", err)
    }
  }, [])

  return {
    notifications: filteredNotifications,
    selectedNotification,
    loading,
    error,
    filters,
    unreadCount,
    stats,

    fetchCompanyNotifications,
    fetchCompanyNotificationById,
    createCompanyNotification: createCompanyNotificationHandler,
    updateCompanyNotification: updateCompanyNotificationHandler,
    deleteCompanyNotification: deleteCompanyNotificationHandler,
    markCompanyNotificationAsRead: markCompanyNotificationAsReadHandler,

    setFilters,
    fetchUnreadCount,
  }
}
