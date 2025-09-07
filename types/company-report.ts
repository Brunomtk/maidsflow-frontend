export type ReportType = "financial" | "operational" | "customers" | "services" | "custom"

export interface ReportFilter {
  startDate?: Date
  endDate?: Date
  service?: string
  professional?: string
  region?: string
  status?: string
  team?: string
  searchQuery?: string
}

export interface ReportMetric {
  label: string
  value: number | string
  change?: number
  changeLabel?: string
  trend?: "up" | "down" | "neutral"
}

export interface ChartData {
  type: "line" | "bar" | "pie" | "bar-horizontal" | "bar-stacked"
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string
  }[]
}

export interface TableData {
  headers: string[]
  rows: (string | number)[][]
}

export interface CompanyReportData {
  metrics: ReportMetric[]
  charts: Record<string, ChartData>
  tables: Record<string, TableData>
  summary?: string
}

export interface SavedReport {
  id: string
  name: string
  description: string
  type: ReportType
  filters: ReportFilter
  createdAt: Date
  lastUpdated?: Date
  tags: string[]
}

export interface ScheduledReport {
  id: string
  name: string
  description: string
  type: ReportType
  filters: ReportFilter
  frequency: "daily" | "weekly" | "monthly" | "quarterly"
  dayOfWeek?: number // 0-6, where 0 is Sunday
  dayOfMonth?: number // 1-31
  recipients: string[] // email addresses
  createdAt: Date
  nextSendDate: Date
  lastSentDate?: Date
  format: "pdf" | "excel" | "csv"
  active: boolean
}

export interface ReportExportOptions {
  format: "pdf" | "excel" | "csv"
  includeCharts: boolean
  includeTables: boolean
  includeSummary: boolean
  orientation?: "portrait" | "landscape"
  pageSize?: "a4" | "letter"
}
