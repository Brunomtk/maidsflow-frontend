import type { Appointment, PerformanceMetrics, Notification, Review } from "@/types"
import { apiRequest } from "./utils"

export interface DashboardStats {
  todayAppointments: number
  weekAppointments: number
  monthAppointments: number
  completedToday: number
  pendingCheckIns: number
  averageRating: number
  totalReviews: number
  monthlyEarnings: number
  completionRate: number
  punctualityRate: number
}

export interface DashboardSummary {
  stats: DashboardStats
  upcomingAppointments: Appointment[]
  recentActivities: Activity[]
  performanceMetrics: PerformanceMetrics
  recentReviews: Review[]
  notifications: Notification[]
  weeklySchedule: WeeklySchedule[]
  monthlyTrend: MonthlyTrend
}

export interface Activity {
  id: string
  type: "check_in" | "check_out" | "appointment_completed" | "review_received" | "payment_received"
  title: string
  description: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface WeeklySchedule {
  date: string
  dayOfWeek: string
  appointments: number
  completed: number
  cancelled: number
}

export interface MonthlyTrend {
  appointments: TrendData[]
  earnings: TrendData[]
  ratings: TrendData[]
}

export interface TrendData {
  date: string
  value: number
  change?: number
}

// Professional Appointment from API
export interface ProfessionalAppointment {
  title: string
  address: string
  start: string
  end: string
  companyId: number
  company: {
    name: string
    cnpj: string
    responsible: string
    email: string
    phone: string
    planId: number
    status: number
    id: number
    createdDate: string
    updatedDate: string
  }
  customerId: number
  customer: {
    name: string
    document: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    observations: string
    status: number
    companyId: number
    id: number
    createdDate: string
    updatedDate: string
  }
  id: number
  createdDate: string
  updatedDate: string
}

// Check Record from API
export interface CheckRecord {
  professionalId: number
  professionalName: string
  companyId: number
  customerId: number
  customerName: string
  appointmentId: number
  address: string
  teamId: number
  teamName: string
  checkInTime: string | null
  checkOutTime: string | null
  status: number // 0 = Pending, 1 = Checked In, 2 = Completed
  serviceType: string
  notes: string
  id: number
  createdDate: string
  updatedDate: string
}

// Internal Feedback from API
export interface InternalFeedback {
  id: number
  title: string
  professionalId: number
  teamId: number
  category: string
  status: number // 0 = Open, 1 = In Progress, 2 = Resolved
  date: string
  description: string
  priority: number // 0 = Low, 1 = Medium, 2 = High
  assignedToId: number
  comments: any[]
  createdDate: string
  updatedDate: string
}

export interface ApiResponse<T> {
  results?: T[]
  data?: T[]
  currentPage: number
  pageCount?: number
  totalPages?: number
  pageSize?: number
  itemsPerPage?: number
  totalItems: number
  firstRowOnPage?: number
  lastRowOnPage?: number
  meta?: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

// Get professional appointments
export async function getProfessionalAppointments(params?: {
  page?: number
  pageSize?: number
  professionalId?: number
  status?: number
  type?: number
  search?: string
  startDate?: string
  endDate?: string
}): Promise<ApiResponse<ProfessionalAppointment>> {
  const searchParams = new URLSearchParams()
  
  if (params?.page) searchParams.append('Page', params.page.toString())
  if (params?.pageSize) searchParams.append('PageSize', params.pageSize.toString())
  if (params?.professionalId) searchParams.append('ProfessionalId', params.professionalId.toString())
  if (params?.status !== undefined) searchParams.append('Status', params.status.toString())
  if (params?.type !== undefined) searchParams.append('Type', params.type.toString())
  if (params?.search) searchParams.append('Search', params.search)
  if (params?.startDate) searchParams.append('StartDate', params.startDate)
  if (params?.endDate) searchParams.append('EndDate', params.endDate)

  return apiRequest<ApiResponse<ProfessionalAppointment>>(
    `/Appointment?${searchParams.toString()}`
  )
}

// Get check records
export async function getCheckRecords(params?: {
  page?: number
  pageSize?: number
  professionalId?: number
  status?: number
  search?: string
}): Promise<ApiResponse<CheckRecord>> {
  const searchParams = new URLSearchParams()
  
  if (params?.page) searchParams.append('Page', params.page.toString())
  if (params?.pageSize) searchParams.append('PageSize', params.pageSize.toString())
  if (params?.professionalId) searchParams.append('ProfessionalId', params.professionalId.toString())
  if (params?.status !== undefined) searchParams.append('Status', params.status.toString())
  if (params?.search) searchParams.append('Search', params.search)

  return apiRequest<ApiResponse<CheckRecord>>(
    `/CheckRecord?${searchParams.toString()}`
  )
}

// Get internal feedback
export async function getInternalFeedback(params?: {
  status?: string
  priority?: string
  category?: string
  professionalId?: number
  teamId?: number
  search?: string
  pageNumber?: number
  pageSize?: number
}): Promise<ApiResponse<InternalFeedback>> {
  const searchParams = new URLSearchParams()
  
  if (params?.status) searchParams.append('Status', params.status)
  if (params?.priority) searchParams.append('Priority', params.priority)
  if (params?.category) searchParams.append('Category', params.category)
  if (params?.professionalId) searchParams.append('ProfessionalId', params.professionalId.toString())
  if (params?.teamId) searchParams.append('TeamId', params.teamId.toString())
  if (params?.search) searchParams.append('Search', params.search)
  if (params?.pageNumber) searchParams.append('PageNumber', params.pageNumber.toString())
  if (params?.pageSize) searchParams.append('PageSize', params.pageSize.toString())

  return apiRequest<ApiResponse<InternalFeedback>>(
    `/InternalFeedback/paged?${searchParams.toString()}`
  )
}

// Get dashboard summary for professional
export async function getProfessionalDashboard(): Promise<DashboardSummary> {
  const response = await apiRequest<any>("/professional/dashboard")

  return {
    ...response,
    upcomingAppointments: response.upcomingAppointments.map((apt: any) => ({
      ...apt,
      scheduledDate: new Date(apt.scheduledDate),
      createdAt: new Date(apt.createdAt),
      updatedAt: new Date(apt.updatedAt),
    })),
    recentActivities: response.recentActivities.map((activity: any) => ({
      ...activity,
      timestamp: new Date(activity.timestamp),
    })),
    performanceMetrics: {
      ...response.performanceMetrics,
      startDate: new Date(response.performanceMetrics.startDate),
      endDate: new Date(response.performanceMetrics.endDate),
      createdAt: new Date(response.performanceMetrics.createdAt),
      updatedAt: new Date(response.performanceMetrics.updatedAt),
    },
    recentReviews: response.recentReviews.map((review: any) => ({
      ...review,
      createdAt: new Date(review.createdAt),
    })),
  }
}

// Get dashboard statistics
export async function getProfessionalDashboardStats(): Promise<DashboardStats> {
  return apiRequest<DashboardStats>("/professional/dashboard/stats")
}

// Get upcoming appointments for dashboard
export async function getProfessionalUpcomingAppointments(limit = 5): Promise<Appointment[]> {
  const response = await apiRequest<any[]>(`/professional/dashboard/upcoming-appointments?limit=${limit}`)

  return response.map((apt) => ({
    ...apt,
    scheduledDate: new Date(apt.scheduledDate),
    createdAt: new Date(apt.createdAt),
    updatedAt: new Date(apt.updatedAt),
  }))
}

// Get recent activities
export async function getProfessionalRecentActivities(limit = 10): Promise<Activity[]> {
  const response = await apiRequest<any[]>(`/professional/dashboard/activities?limit=${limit}`)

  return response.map((activity) => ({
    ...activity,
    timestamp: new Date(activity.timestamp),
  }))
}

// Get weekly schedule summary
export async function getProfessionalWeeklySchedule(): Promise<WeeklySchedule[]> {
  return apiRequest<WeeklySchedule[]>("/professional/dashboard/weekly-schedule")
}

// Get monthly performance trend
export async function getProfessionalMonthlyTrend(): Promise<MonthlyTrend> {
  return apiRequest<MonthlyTrend>("/professional/dashboard/monthly-trend")
}

// Get today's appointments
export async function getProfessionalTodayAppointments(): Promise<Appointment[]> {
  const response = await apiRequest<any[]>("/professional/dashboard/today-appointments")

  return response.map((apt) => ({
    ...apt,
    scheduledDate: new Date(apt.scheduledDate),
    createdAt: new Date(apt.createdAt),
    updatedAt: new Date(apt.updatedAt),
  }))
}

// Get pending check-ins
export async function getProfessionalPendingCheckIns(): Promise<Appointment[]> {
  const response = await apiRequest<any[]>("/professional/dashboard/pending-checkins")

  return response.map((apt) => ({
    ...apt,
    scheduledDate: new Date(apt.scheduledDate),
    createdAt: new Date(apt.createdAt),
    updatedAt: new Date(apt.updatedAt),
  }))
}

// Get earnings summary
export async function getProfessionalEarningsSummary(period: "daily" | "weekly" | "monthly" = "monthly"): Promise<{
  total: number
  pending: number
  paid: number
  average: number
  transactions: Array<{
    id: string
    date: Date
    amount: number
    status: "pending" | "paid" | "processing"
    description: string
  }>
}> {
  const response = await apiRequest<any>(`/professional/dashboard/earnings?period=${period}`)

  return {
    ...response,
    transactions: response.transactions.map((t: any) => ({
      ...t,
      date: new Date(t.date),
    })),
  }
}

// Get performance quick stats
export async function getProfessionalQuickStats(): Promise<{
  rating: number
  totalReviews: number
  completionRate: number
  punctualityRate: number
  monthlyAppointments: number
  weeklyGrowth: number
}> {
  return apiRequest("/professional/dashboard/quick-stats")
}

// Get notifications preview for dashboard
export async function getProfessionalDashboardNotifications(limit = 5): Promise<Notification[]> {
  return apiRequest<Notification[]>(`/professional/dashboard/notifications?limit=${limit}`)
}

// Mark dashboard as viewed (for analytics)
export async function markDashboardViewed(): Promise<void> {
  await apiRequest("/professional/dashboard/viewed", { method: "POST" })
}
