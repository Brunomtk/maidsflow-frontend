import type { Notification } from "@/types/notification"
import { fetchApi } from "./utils"

// Helper to parse JWT from localStorage
function getToken(): string {
  const t = localStorage.getItem("noah_token") || localStorage.getItem("authToken") || localStorage.getItem("token")
  if (!t) throw new Error("No authentication token found")
  return t
}

// Extract CompanyId or UserId from JWT payload
function parseJwtField(field: string): string {
  try {
    const token = getToken()
    const payload = JSON.parse(atob(token.split(".")[1]))
    return String(payload[field] ?? payload[field.toLowerCase()] ?? payload[field.toUpperCase()] ?? "")
  } catch {
    return ""
  }
}

// Get companyId from token
function getCompanyIdFromToken(): string {
  return parseJwtField("CompanyId") || "1"
}

// Get userId from token
function getUserIdFromToken(): string {
  return parseJwtField("UserId") || "1"
}

// Get all notifications for the company
export async function getCompanyNotifications(): Promise<Notification[]> {
  try {
    const companyId = getCompanyIdFromToken()
    const data = await fetchApi<Notification[]>(`/Notifications?CompanyId=${companyId}`)
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.error("Error fetching company notifications:", err)
    // Fallback mock data
    return [
      {
        id: 1,
        title: "Welcome to Noah Platform",
        message: "Welcome to the Noah platform. This is a sample notification.",
        type: 1,
        status: 0,
        createdDate: new Date().toISOString(),
        sentAt: new Date().toISOString(),
        readAt: null,
        companyId: 1,
        userId: 1,
      },
      {
        id: 2,
        title: "System Update",
        message: "The system has been updated with new features.",
        type: 2,
        status: 1,
        createdDate: new Date(Date.now() - 86400000).toISOString(),
        sentAt: new Date(Date.now() - 86400000).toISOString(),
        readAt: new Date().toISOString(),
        companyId: 1,
        userId: 1,
      },
    ]
  }
}

// Get a specific notification by ID
export async function getCompanyNotificationById(id: string): Promise<Notification> {
  return await fetchApi<Notification>(`/Notifications/${id}`)
}

// Create a new notification
export async function createCompanyNotification(data: {
  title: string
  message: string
  type: string
  recipientRole: string
  recipientIds: number[]
  isBroadcast: boolean
  companyId: number
}): Promise<Notification> {
  return await fetchApi<Notification>(`/Notifications`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// Update an existing notification
export async function updateCompanyNotification(
  id: string,
  data: {
    title?: string
    message?: string
    type?: string
    status?: string
    readAt?: string
  },
): Promise<Notification> {
  return await fetchApi<Notification>(`/Notifications/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

// Delete a notification
export async function deleteCompanyNotification(id: string): Promise<void> {
  await fetchApi<void>(`/Notifications/${id}`, { method: "DELETE" })
}

// Mark notification as read
export async function markCompanyNotificationAsRead(id: string): Promise<Notification> {
  return await fetchApi<Notification>(`/Notifications/${id}/read`, { method: "POST" })
}

// Get notifications for the current user
export async function getUserNotifications(): Promise<Notification[]> {
  const userId = getUserIdFromToken()
  const data = await fetchApi<Notification[]>(`/Notifications/user/${userId}`)
  return Array.isArray(data) ? data : []
}

// Get unread notifications count for the current user
export async function getCompanyUnreadNotificationsCount(): Promise<number> {
  const userId = getUserIdFromToken()
  const data = await fetchApi<number>(`/Notifications/user/${userId}/unread-count`)
  return typeof data === "number" ? data : 0
}

// Send a notification to professionals
export async function sendCompanyNotificationToProfessionals(data: {
  title: string
  message: string
  type: string
  professionalIds: number[]
  companyId: number
}): Promise<Notification> {
  return await fetchApi<Notification>(`/Notifications/professionals`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// Broadcast a notification to all users in the company
export async function broadcastCompanyNotification(data: {
  title: string
  message: string
  type: string
  companyId: number
}): Promise<Notification> {
  return await fetchApi<Notification>(`/Notifications/broadcast`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// Get statistics for company notifications
export async function getCompanyNotificationStats(): Promise<{
  total: number
  unread: number
  read: number
  byType: Record<string, number>
}> {
  const companyId = getCompanyIdFromToken()
  return await fetchApi<{
    total: number
    unread: number
    read: number
    byType: Record<string, number>
  }>(`/Notifications/company/${companyId}/stats`)
}
