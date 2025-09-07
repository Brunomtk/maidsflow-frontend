// Internal Report Types
export type InternalReportStatus = "pending" | "in_progress" | "resolved"
export type InternalReportPriority = "low" | "medium" | "high"

export interface InternalReportComment {
  id: string
  authorId: string
  author: string
  date: string
  text: string
}

export interface InternalReport {
  id: string
  title: string
  professionalId: string
  professional: string
  teamId: string
  team: string
  category: string
  status: InternalReportStatus
  date: string
  description: string
  priority: InternalReportPriority
  assignedToId: string
  assignedTo: string
  comments: InternalReportComment[]
  createdAt: string
  updatedAt: string
}

export interface InternalReportFormData {
  title: string
  professionalId: string
  professional?: string
  teamId: string
  team?: string
  category: string
  status?: InternalReportStatus
  description: string
  priority?: InternalReportPriority
  assignedToId: string
  assignedTo?: string
}

export interface InternalReportFilters {
  status?: InternalReportStatus | "all"
  priority?: InternalReportPriority
  category?: string
  professionalId?: string
  teamId?: string
  search?: string
}
