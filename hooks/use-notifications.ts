"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  markNotificationAsRead,
} from "@/lib/api/notifications"
import type {
  Notification,
  NotificationFormData,
  NotificationUpdateData,
  NotificationFilters,
} from "@/types/notification"

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<NotificationFilters>({})
  const { toast } = useToast()

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getNotifications(filters)
      setNotifications(data)
    } catch (err) {
      setError("Failed to fetch notifications")
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [filters, toast])

  const fetchNotificationById = useCallback(
    async (id: number) => {
      setLoading(true)
      setError(null)
      try {
        const data = await getNotificationById(id)
        setSelectedNotification(data)
        return data
      } catch (err) {
        setError(`Failed to fetch notification with ID ${id}`)
        toast({
          title: "Error",
          description: `Failed to fetch notification details`,
          variant: "destructive",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const addNotification = useCallback(
    async (data: NotificationFormData) => {
      setLoading(true)
      setError(null)
      try {
        const newNotification = await createNotification(data)
        setNotifications((prev) => [newNotification, ...prev])
        toast({
          title: "Success",
          description: "Notification created successfully",
        })
        return newNotification
      } catch (err) {
        setError("Failed to create notification")
        toast({
          title: "Error",
          description: "Failed to create notification",
          variant: "destructive",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const updateNotificationById = useCallback(
    async (id: number, data: NotificationUpdateData) => {
      setLoading(true)
      setError(null)
      try {
        const updatedNotification = await updateNotification(id, data)
        setNotifications((prev) =>
          prev.map((notification) => (notification.id === id ? updatedNotification : notification)),
        )
        setSelectedNotification(updatedNotification)
        toast({
          title: "Success",
          description: "Notification updated successfully",
        })
        return updatedNotification
      } catch (err) {
        setError(`Failed to update notification with ID ${id}`)
        toast({
          title: "Error",
          description: "Failed to update notification",
          variant: "destructive",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const removeNotification = useCallback(
    async (id: number) => {
      setLoading(true)
      setError(null)
      try {
        await deleteNotification(id)
        setNotifications((prev) => prev.filter((notification) => notification.id !== id))
        if (selectedNotification?.id === id) {
          setSelectedNotification(null)
        }
        toast({
          title: "Success",
          description: "Notification deleted successfully",
        })
      } catch (err) {
        setError(`Failed to delete notification with ID ${id}`)
        toast({
          title: "Error",
          description: "Failed to delete notification",
          variant: "destructive",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [selectedNotification, toast],
  )

  const markAsRead = useCallback(
    async (id: number) => {
      setLoading(true)
      setError(null)
      try {
        await markNotificationAsRead(id)
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id ? { ...notification, status: 1, readAt: new Date().toISOString() } : notification,
          ),
        )
        if (selectedNotification?.id === id) {
          setSelectedNotification({
            ...selectedNotification,
            status: 1,
            readAt: new Date().toISOString(),
          })
        }
        toast({
          title: "Success",
          description: "Notification marked as read",
        })
      } catch (err) {
        setError(`Failed to mark notification with ID ${id} as read`)
        toast({
          title: "Error",
          description: "Failed to mark notification as read",
          variant: "destructive",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [selectedNotification, toast],
  )

  const updateFilters = useCallback((newFilters: Partial<NotificationFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({})
  }, [])

  // Helper functions for displaying labels
  const getNotificationTypeLabel = useCallback((type: number): string => {
    switch (type) {
      case 1:
        return "System"
      case 2:
        return "Appointment"
      case 3:
        return "Message"
      case 4:
        return "Alert"
      default:
        return "Unknown"
    }
  }, [])

  const getRecipientRoleLabel = useCallback((role: number): string => {
    switch (role) {
      case 1:
        return "Admin"
      case 2:
        return "Company"
      case 3:
        return "Professional"
      default:
        return "Unknown"
    }
  }, [])

  const getStatusLabel = useCallback((status: number): string => {
    switch (status) {
      case 0:
        return "Unread"
      case 1:
        return "Read"
      default:
        return "Unknown"
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    selectedNotification,
    loading,
    error,
    filters,
    fetchNotifications,
    fetchNotificationById,
    addNotification,
    updateNotificationById,
    removeNotification,
    markAsRead,
    updateFilters,
    resetFilters,
    setSelectedNotification,
    getNotificationTypeLabel,
    getRecipientRoleLabel,
    getStatusLabel,
  }
}
