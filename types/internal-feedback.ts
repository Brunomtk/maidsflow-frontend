export interface InternalFeedback {
  id: number
  title: string
  professionalId: number
  teamId: number
  category: string
  status: number // 0=pending, 1=in_progress, 2=resolved
  date: string
  description: string
  priority: number // 0=low, 1=medium, 2=high
  assignedToId: number
  comments: InternalFeedbackComment[]
  createdDate: string
  updatedDate: string
}

export interface InternalFeedbackComment {
  id: number
  internalFeedbackId: number
  authorId: number
  author: string
  date: string
  text: string
  createdDate: string
  updatedDate: string
}

export interface InternalFeedbackCreateRequest {
  title: string
  professionalId: number
  teamId: number
  category: string
  status: number
  date: string
  description: string
  priority: number
  assignedToId: number
}

export interface InternalFeedbackUpdateRequest {
  title: string
  professionalId: number
  teamId: number
  category: string
  status: number
  date: string
  description: string
  priority: number
  assignedToId: number
}

export interface InternalFeedbackFilters {
  status?: number | string
  priority?: number | string
  category?: string
  professionalId?: number
  teamId?: number
  searchQuery?: string
  search?: string
  pageNumber?: number
  pageSize?: number
}

export interface InternalFeedbackPagedResponse {
  data: InternalFeedback[]
  meta: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

export interface InternalFeedbackFormData {
  title: string
  professionalId: string | number
  teamId: string | number
  category: string
  status: string | number
  description: string
  priority: string | number
  assignedToId: string | number
}

// Status enum
export enum InternalFeedbackStatus {
  PENDING = 0,
  IN_PROGRESS = 1,
  RESOLVED = 2,
}

// Priority enum
export enum InternalFeedbackPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
}

// Category options
export const INTERNAL_FEEDBACK_CATEGORIES = [
  "Equipment",
  "Scheduling",
  "Customer Info",
  "Training",
  "Safety",
  "Sistema",
  "Acesso",
  "Usabilidade",
  "Other",
] as const

export type InternalFeedbackCategory = (typeof INTERNAL_FEEDBACK_CATEGORIES)[number]
