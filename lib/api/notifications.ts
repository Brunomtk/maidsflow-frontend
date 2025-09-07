import { fetchApi } from "./utils"
import type {
  Notification,
  NotificationFormData,
  NotificationUpdateData,
  NotificationFilters,
} from "@/types/notification"

const API_BASE = "/Notifications"

// Get all notifications with optional filters
export async function getNotifications(filters?: NotificationFilters): Promise<Notification[]> {
  const params = new URLSearchParams()

  if (filters?.type) params.append("Type", filters.type)
  if (filters?.recipientRole) params.append("RecipientRole", filters.recipientRole)
  if (filters?.search) params.append("Search", filters.search)

  const url = params.toString() ? `${API_BASE}?${params.toString()}` : API_BASE
  return fetchApi<Notification[]>(url)
}

// Get a specific notification by ID
export async function getNotificationById(id: number): Promise<Notification> {
  return fetchApi<Notification>(`${API_BASE}/${id}`)
}

// Create a new notification
export async function createNotification(data: NotificationFormData): Promise<Notification> {
  return fetchApi<Notification>(API_BASE, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// Update an existing notification
export async function updateNotification(id: number, data: NotificationUpdateData): Promise<Notification> {
  return fetchApi<Notification>(`${API_BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

// Delete a notification
export async function deleteNotification(id: number): Promise<void> {
  return fetchApi<void>(`${API_BASE}/${id}`, {
    method: "DELETE",
  })
}

// Mark a notification as read
export async function markNotificationAsRead(id: number): Promise<void> {
  return fetchApi<void>(`${API_BASE}/${id}/read`, {
    method: "POST",
  })
}

// Get unread notifications count for a user
export async function getUnreadNotificationsCount(userId: number): Promise<number> {
  return fetchApi<number>(`${API_BASE}/user/${userId}/unread-count`)
}

// Get notifications for a specific user
export async function getUserNotifications(userId: number): Promise<Notification[]> {
  return fetchApi<Notification[]>(`${API_BASE}/user/${userId}`)
}

// Send notification to specific recipients
export async function sendNotification(
  title: string,
  message: string,
  type: string,
  recipientIds: number[],
  recipientRole: string,
  companyId?: number,
): Promise<void> {
  return fetchApi<void>(`${API_BASE}/send`, {
    method: "POST",
    body: JSON.stringify({
      title,
      message,
      type,
      recipientIds,
      recipientRole,
      companyId,
    }),
  })
}

// Broadcast notification to all users of a role
export async function broadcastNotification(
  title: string,
  message: string,
  type: string,
  recipientRole: string,
  companyId?: number,
): Promise<void> {
  return fetchApi<void>(`${API_BASE}/broadcast`, {
    method: "POST",
    body: JSON.stringify({
      title,
      message,
      type,
      recipientRole,
      companyId,
    }),
  })
}
