import type { UserRole } from "./user"

// Feedback Types
export interface Feedback {
  id: string
  senderId: string
  senderName?: string
  senderRole: UserRole
  companyId?: string
  type: "suggestion" | "complaint" | "praise"
  category: string
  subject: string
  message: string
  priority: "low" | "medium" | "high"
  status: "pending" | "in_progress" | "resolved"
  attachments?: string[]
  createdAt: string
  updatedAt: string
}
