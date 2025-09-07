// Re-export all types from their respective files
export * from "./api"
export * from "./appointment"
export * from "./auth"
export * from "./cancellation"
export * from "./chat"
export * from "./check-record"
export * from "./company"
export * from "./company-report"
export * from "./company-schedule"
export * from "./customer"
export * from "./feedback"
export * from "./gps-tracking"
export * from "./internal-feedback"
export * from "./internal-report"
export * from "./leader"
export * from "./material"
export * from "./notification"
export * from "./payment"
export * from "./performance"
export * from "./plan"
export * from "./professional"
export * from "./recurrence"
export * from "./reschedule"
export * from "./review"
export * from "./team"
export * from "./user"

// Common types used across the application
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

export interface ApiResponse<T> {
  data?: T
  status: number
  error?: string
  message?: string
}

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface SelectOption {
  value: string
  label: string
}

export interface FilterOptions {
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface DashboardStats {
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  pendingAppointments: number
  totalRevenue: number
  averageRating: number
  totalCustomers: number
  activeProfessionals: number
}

export interface ChartData {
  name: string
  value: number
  color?: string
}

export interface TimeSeriesData {
  date: string
  value: number
  label?: string
}

export interface NotificationSettings {
  email: boolean
  sms: boolean
  push: boolean
  inApp: boolean
}

export interface UserPreferences {
  theme: "light" | "dark" | "system"
  language: string
  timezone: string
  notifications: NotificationSettings
}

export interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface ContactInfo {
  email: string
  phone: string
  whatsapp?: string
  website?: string
}

export interface BusinessHours {
  monday: { open: string; close: string; closed: boolean }
  tuesday: { open: string; close: string; closed: boolean }
  wednesday: { open: string; close: string; closed: boolean }
  thursday: { open: string; close: string; closed: boolean }
  friday: { open: string; close: string; closed: boolean }
  saturday: { open: string; close: string; closed: boolean }
  sunday: { open: string; close: string; closed: boolean }
}

export interface ServiceArea {
  id: string
  name: string
  coordinates: Array<{ lat: number; lng: number }>
  active: boolean
}

export interface FileUpload {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: string
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId: string
  changes: Record<string, any>
  timestamp: string
  ipAddress: string
  userAgent: string
}

export interface SystemSettings {
  maintenanceMode: boolean
  allowRegistration: boolean
  requireEmailVerification: boolean
  maxFileUploadSize: number
  supportedFileTypes: string[]
  defaultLanguage: string
  defaultTimezone: string
}

export interface Integration {
  id: string
  name: string
  type: string
  enabled: boolean
  config: Record<string, any>
  lastSync?: string
  status: "connected" | "disconnected" | "error"
}

export interface Webhook {
  id: string
  url: string
  events: string[]
  active: boolean
  secret: string
  createdAt: string
  lastTriggered?: string
}

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests: boolean
  skipFailedRequests: boolean
}

export interface CacheConfig {
  ttl: number
  maxSize: number
  strategy: "lru" | "fifo" | "lfu"
}

export interface DatabaseConfig {
  host: string
  port: number
  database: string
  ssl: boolean
  poolSize: number
  timeout: number
}

export interface EmailConfig {
  provider: string
  apiKey: string
  fromEmail: string
  fromName: string
  templates: Record<string, string>
}

export interface SMSConfig {
  provider: string
  apiKey: string
  fromNumber: string
}

export interface PaymentConfig {
  provider: string
  publicKey: string
  secretKey: string
  webhookSecret: string
  currency: string
}

export interface StorageConfig {
  provider: string
  bucket: string
  region: string
  accessKey: string
  secretKey: string
}

export interface MonitoringConfig {
  enabled: boolean
  provider: string
  apiKey: string
  projectId: string
}

export interface SecurityConfig {
  jwtSecret: string
  jwtExpiresIn: string
  bcryptRounds: number
  corsOrigins: string[]
  rateLimiting: RateLimitConfig
}

export interface AppConfig {
  app: {
    name: string
    version: string
    environment: string
    port: number
    baseUrl: string
  }
  database: DatabaseConfig
  cache: CacheConfig
  email: EmailConfig
  sms: SMSConfig
  payment: PaymentConfig
  storage: StorageConfig
  monitoring: MonitoringConfig
  security: SecurityConfig
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
  role: "admin" | "company" | "professional"
  companyId?: number
  termsAccepted: boolean
}

export interface ProfessionalWithDetails {
  id: number
  name: string
  email: string
  phone?: string
  avatar?: string
  status: "active" | "inactive" | "suspended"
  rating: number
  totalJobs: number
  completedJobs: number
  joinedAt: string
  lastActive?: string
  skills: string[]
  certifications: string[]
  location?: Address
  availability: BusinessHours
  companyId: number
  teamId?: number
  team?: {
    id: number
    name: string
    region: string
  }
  company?: {
    id: number
    name: string
    logo?: string
  }
}

export interface ProfessionalPagedResponse {
  data: ProfessionalWithDetails[]
  meta: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}
