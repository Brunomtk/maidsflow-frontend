"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { toast } from "@/components/ui/use-toast"
import {
  getCompanyNotifications,
  getCompanyNotificationById,
  markCompanyNotificationAsRead,
  sendCompanyNotificationToProfessionals,
  broadcastCompanyNotification,
  getCompanyUnreadNotificationsCount,
  getCompanyNotificationStats,
  deleteCompanyNotification,
  updateCompanyNotification,
} from "@/lib/api/company-notifications"
import type { Notification, NotificationUpdateData } from "@/types/notification"

interface CompanyNotificationFilters {
  type: string
  status: string
  search: string
  startDate?: string
  endDate?: string
}

interface CompanyNotificationFormData {
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  isBroadcast: boolean
  professionalIds?: string[]
  requiresConfirmation: boolean
  isScheduled: boolean
  scheduledFor?: string
  attachments?: File[]
}

interface CompanyNotificationStats {
  total: number
  unread: number
  read: number
  sent: number
  scheduled: number
  draft: number
}

interface CompanyNotificationsContextType {
  notifications: Notification[]
  selectedNotification: Notification | null
  loading: boolean
  error: string | null
  filters: CompanyNotificationFilters
  unreadCount: number
  stats: CompanyNotificationStats

  // CRUD operations
  fetchNotifications: (companyId: string) => Promise<void>
  fetchNotificationById: (companyId: string, id: string) => Promise<void>
  sendNotification: (companyId: string, data: CompanyNotificationFormData) => Promise<void>
  updateNotification: (companyId: string, id: string, data: Partial<NotificationUpdateData>) => Promise<void>
  deleteNotification: (companyId: string, id: string) => Promise<void>

  // Notification actions
  markAsRead: (companyId: string, id: string) => Promise<void>

  // Filter operations
  setFilters: (filters: Partial<CompanyNotificationFilters>) => void
  resetFilters: () => void

  // Stats
  fetchStats: (companyId: string) => Promise<void>
  fetchUnreadCount: (userId: string) => Promise<void>
}

const defaultFilters: CompanyNotificationFilters = {
  type: "all",
  status: "all",
  search: "",
}

const defaultStats: CompanyNotificationStats = {
  total: 0,
  unread: 0,
  read: 0,
  sent: 0,
  scheduled: 0,
  draft: 0,
}

const CompanyNotificationsContext = createContext<CompanyNotificationsContextType | undefined>(undefined)

export function CompanyNotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CompanyNotificationFilters>(defaultFilters)
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [stats, setStats] = useState<CompanyNotificationStats>(defaultStats)

  // Fetch notifications based on current filters
  const fetchNotifications = async (companyId: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCompanyNotifications(
        companyId,
        filters.type,
        filters.status,
        filters.search,
        filters.startDate,
        filters.endDate,
      )
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
  const fetchNotificationById = async (companyId: string, id: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCompanyNotificationById(companyId, id)
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

  // Send a notification
  const sendNotification = async (companyId: string, data: CompanyNotificationFormData) => {
    setLoading(true)
    setError(null)
    try {
      if (data.isBroadcast) {
        await broadcastCompanyNotification(
          companyId,
          data.title,
          data.message,
          data.type,
          data.requiresConfirmation,
          data.isScheduled ? data.scheduledFor : undefined,
          data.attachments
            ? Array.from(data.attachments).map((file) => ({ name: file.name, url: URL.createObjectURL(file) }))
            : undefined,
        )
      } else if (data.professionalIds && data.professionalIds.length > 0) {
        await sendCompanyNotificationToProfessionals(
          companyId,
          data.title,
          data.message,
          data.type,
          data.professionalIds,
          data.requiresConfirmation,
          data.isScheduled ? data.scheduledFor : undefined,
          data.attachments
            ? Array.from(data.attachments).map((file) => ({ name: file.name, url: URL.createObjectURL(file) }))
            : undefined,
        )
      } else {
        throw new Error("No recipients specified")
      }

      toast({
        title: "Success",
        description: data.isScheduled ? "Notification scheduled successfully" : "Notification sent successfully",
      })

      // Refresh the notifications list and stats
      await fetchNotifications(companyId)
      await fetchStats(companyId)
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
  const updateNotification = async (companyId: string, id: string, data: Partial<NotificationUpdateData>) => {
    setLoading(true)
    setError(null)
    try {
      const updatedNotification = await updateCompanyNotification(companyId, id, data as NotificationUpdateData)

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

      // Refresh stats
      await fetchStats(companyId)
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
  const deleteNotification = async (companyId: string, id: string) => {
    setLoading(true)
    setError(null)
    try {
      await deleteCompanyNotification(companyId, id)

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

      // Refresh stats
      await fetchStats(companyId)
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
  const markAsRead = async (companyId: string, id: string) => {
    setLoading(true)
    setError(null)
    try {
      const updatedNotification = await markCompanyNotificationAsRead(companyId, id)

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

  // Update filters
  const updateFilters = (newFilters: Partial<CompanyNotificationFilters>) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }))
  }

  // Reset filters to default
  const resetFilters = () => {
    setFilters(defaultFilters)
  }

  // Fetch notification stats for a company
  const fetchStats = async (companyId: string) => {
    try {
      const stats = await getCompanyNotificationStats(companyId)
      setStats(stats)
    } catch (err) {
      console.error("Failed to fetch notification stats:", err)
    }
  }

  // Fetch unread notifications count for a user
  const fetchUnreadCount = async (userId: string) => {
    try {
      const count = await getCompanyUnreadNotificationsCount(userId)
      setUnreadCount(count)
    } catch (err) {
      console.error("Failed to fetch unread notifications count:", err)
    }
  }

  const value = {
    notifications,
    selectedNotification,
    loading,
    error,
    filters,
    unreadCount,
    stats,

    fetchNotifications,
    fetchNotificationById,
    sendNotification,
    updateNotification,
    deleteNotification,

    markAsRead,

    setFilters: updateFilters,
    resetFilters,

    fetchStats,
    fetchUnreadCount,
  }

  return <CompanyNotificationsContext.Provider value={value}>{children}</CompanyNotificationsContext.Provider>
}

export function useCompanyNotificationsContext() {
  const context = useContext(CompanyNotificationsContext)
  if (context === undefined) {
    throw new Error("useCompanyNotificationsContext must be used within a CompanyNotificationsProvider")
  }
  return context
}
