export interface Notification {
  id: number
  title: string
  message: string
  type: number // 1=System, 2=Appointment, 3=Message, 4=Alert
  recipientId: number
  recipientRole: number // 1=Admin, 2=Company, 3=Professional
  companyId?: number
  status: number // 0=Unread, 1=Read
  sentAt?: string
  readAt?: string
  createdDate: string
  updatedDate: string
}

export interface NotificationFormData {
  title: string
  message: string
  type: string
  recipientRole: string
  recipientIds?: number[]
  isBroadcast: boolean
  companyId?: number
}

export interface NotificationUpdateData {
  title?: string
  message?: string
  type?: string
  status?: string
  readAt?: string
}

export interface NotificationFilters {
  type?: string
  recipientRole?: string
  search?: string
}

export enum NotificationType {
  System = 1,
  Appointment = 2,
  Message = 3,
  Alert = 4,
}

export enum NotificationStatus {
  Unread = 0,
  Read = 1,
}

export enum RecipientRole {
  Admin = 1,
  Company = 2,
  Professional = 3,
}
