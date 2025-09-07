"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "@/components/ui/use-toast"
import {
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  markNotificationAsRead,
  sendNotification,
  broadcastNotification,
  getUnreadNotificationsCount,
  getUserNotifications,
} from "@/lib/api/notifications"
import type { Notification, NotificationFormData, NotificationFilters } from "@/types/notification"

interface NotificationsContextType {
  notifications: Notification[]
  selectedNotification: Notification | null
  loading: boolean
  error: string | null
  filters: NotificationFilters
  unreadCount: number

  // CRUD operations
  fetchNotifications: () => Promise<void>
  fetchNotificationById: (id: string) => Promise<void>
  addNotification: (data: NotificationFormData) => Promise<void>
  updateNotificationById: (id: string, data: Partial<Notification>) => Promise<void>
  removeNotification: (id: string) => Promise<void>

  // Notification actions
  markAsRead: (id: string) => Promise<void>
  sendToRecipients: (data: NotificationFormData) => Promise<void>
  broadcastToRole: (data: NotificationFormData) => Promise<void>

  // Filter operations
  setFilters: (filters: Partial<NotificationFilters>) => void
  resetFilters: () => void

  // User notifications
  fetchUserNotifications: (userId: string) => Promise<void>
  fetchUnreadCount: (userId: string) => Promise<void>
}

const defaultFilters: NotificationFilters = {
  type: "all",
  recipientRole: "all",
  search: "",
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<NotificationFilters>(defaultFilters)
  const [unreadCount, setUnreadCount] = useState<number>(0)

  // Fetch notifications based on current filters
  const fetchNotifications = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getNotifications(filters.type, filters.recipientRole, filters.search)
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
  }

  // Fetch a specific notification by ID
  const fetchNotificationById = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getNotificationById(id)
      setSelectedNotification(data)
    } catch (err) {
      setError(`Failed to fetch notification with ID ${id}`)
      toast({
        title: "Error",
        description: `Failed to fetch notification details`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Add a new notification
  const addNotification = async (data: NotificationFormData) => {
    setLoading(true)
    setError(null)
    try {
      if (data.isBroadcast) {
        await broadcastToRole(data)
      } else if (data.recipientIds && data.recipientIds.length > 0) {
        await sendToRecipients(data)
      } else {
        throw new Error("No recipients specified")
      }

      toast({
        title: "Success",
        description: "Notification sent successfully",
      })

      // Refresh the notifications list
      await fetchNotifications()
    } catch (err) {
      setError("Failed to send notification")
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Update an existing notification
  const updateNotificationById = async (id: string, data: Partial<Notification>) => {
    setLoading(true)
    setError(null)
    try {
      const updatedNotification = await updateNotification(id, data)

      // Update the notifications list
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => (notification.id === id ? updatedNotification : notification)),
      )

      // Update selected notification if it's the one being edited
      if (selectedNotification && selectedNotification.id === id) {
        setSelectedNotification(updatedNotification)
      }

      toast({
        title: "Success",
        description: "Notification updated successfully",
      })
    } catch (err) {
      setError(`Failed to update notification with ID ${id}`)
      toast({
        title: "Error",
        description: "Failed to update notification",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Delete a notification
  const removeNotification = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await deleteNotification(id)

      // Remove from the notifications list
      setNotifications((prevNotifications) => prevNotifications.filter((notification) => notification.id !== id))

      // Clear selected notification if it's the one being deleted
      if (selectedNotification && selectedNotification.id === id) {
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
    } finally {
      setLoading(false)
    }
  }

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const updatedNotification = await markNotificationAsRead(id)

      // Update the notifications list
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => (notification.id === id ? updatedNotification : notification)),
      )

      // Update selected notification if it's the one being marked as read
      if (selectedNotification && selectedNotification.id === id) {
        setSelectedNotification(updatedNotification)
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
    } finally {
      setLoading(false)
    }
  }

  // Send a notification to specific recipients
  const sendToRecipients = async (data: NotificationFormData) => {
    if (!data.recipientIds || data.recipientIds.length === 0) {
      throw new Error("No recipients specified")
    }

    await sendNotification(data.title, data.message, data.type, data.recipientIds, data.recipientRole, data.companyId)
  }

  // Broadcast a notification to all users of a certain role
  const broadcastToRole = async (data: NotificationFormData) => {
    await broadcastNotification(data.title, data.message, data.type, data.recipientRole, data.companyId)
  }

  // Update filters
  const updateFilters = (newFilters: Partial<NotificationFilters>) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }))
  }

  // Reset filters to default
  const resetFilters = () => {
    setFilters(defaultFilters)
  }

  // Fetch notifications for a specific user
  const fetchUserNotifications = async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getUserNotifications(userId)
      setNotifications(data)
    } catch (err) {
      setError(`Failed to fetch notifications for user ${userId}`)
      toast({
        title: "Error",
        description: "Failed to fetch your notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch unread notifications count for a user
  const fetchUnreadCount = async (userId: string) => {
    try {
      const count = await getUnreadNotificationsCount(userId)
      setUnreadCount(count)
    } catch (err) {
      console.error("Failed to fetch unread notifications count:", err)
    }
  }

  // Effect to fetch notifications when filters change
  useEffect(() => {
    fetchNotifications()
  }, [filters])

  const value = {
    notifications,
    selectedNotification,
    loading,
    error,
    filters,
    unreadCount,

    fetchNotifications,
    fetchNotificationById,
    addNotification,
    updateNotificationById,
    removeNotification,

    markAsRead,
    sendToRecipients,
    broadcastToRole,

    setFilters: updateFilters,
    resetFilters,

    fetchUserNotifications,
    fetchUnreadCount,
  }

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotificationsContext() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotificationsContext must be used within a NotificationsProvider")
  }
  return context
}
