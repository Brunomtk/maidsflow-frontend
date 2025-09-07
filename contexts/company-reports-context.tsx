"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import {
  getFinancialReports,
  getOperationalReports,
  getCustomerReports,
  getServiceReports,
  getSavedReports,
  getScheduledReports,
  saveReport,
  scheduleReport,
  deleteSavedReport,
  cancelScheduledReport,
  exportReport,
} from "@/lib/api/company-reports"
import type {
  CompanyReportData,
  ReportFilter,
  ReportType,
  SavedReport,
  ScheduledReport,
  ReportExportOptions,
} from "@/types/company-report"
import { toast } from "@/components/ui/use-toast"

interface CompanyReportsContextType {
  // Estado
  isLoading: boolean
  error: string | null
  currentReportType: ReportType
  filters: ReportFilter
  reportData: CompanyReportData | null
  savedReports: SavedReport[]
  scheduledReports: ScheduledReport[]

  // Ações
  setReportType: (type: ReportType) => void
  setFilters: (filters: ReportFilter) => void
  generateReport: (companyId: string) => Promise<void>
  saveCurrentReport: (companyId: string, name: string, description: string, tags: string[]) => Promise<void>
  scheduleCurrentReport: (
    companyId: string,
    name: string,
    description: string,
    frequency: "daily" | "weekly" | "monthly" | "quarterly",
    options: {
      dayOfWeek?: number
      dayOfMonth?: number
      recipients: string[]
      format: "pdf" | "excel" | "csv"
    },
  ) => Promise<void>
  deleteSaved: (companyId: string, reportId: string) => Promise<void>
  cancelScheduled: (companyId: string, reportId: string) => Promise<void>
  exportCurrentReport: (companyId: string, options: ReportExportOptions) => Promise<Blob>
  loadSavedReports: (companyId: string) => Promise<void>
  loadScheduledReports: (companyId: string) => Promise<void>
}

const CompanyReportsContext = createContext<CompanyReportsContextType | undefined>(undefined)

export function CompanyReportsProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentReportType, setCurrentReportType] = useState<ReportType>("financial")
  const [filters, setFilters] = useState<ReportFilter>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    endDate: new Date(),
  })
  const [reportData, setReportData] = useState<CompanyReportData | null>(null)
  const [savedReports, setSavedReports] = useState<SavedReport[]>([])
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([])

  const generateReport = useCallback(
    async (companyId: string) => {
      setIsLoading(true)
      setError(null)

      try {
        let data: CompanyReportData

        switch (currentReportType) {
          case "financial":
            data = await getFinancialReports(companyId, filters)
            break
          case "operational":
            data = await getOperationalReports(companyId, filters)
            break
          case "customers":
            data = await getCustomerReports(companyId, filters)
            break
          case "services":
            data = await getServiceReports(companyId, filters)
            break
          case "custom":
            // For custom reports, we might need to combine data from multiple sources
            const financialData = await getFinancialReports(companyId, filters)
            const operationalData = await getOperationalReports(companyId, filters)

            // Combine the data (simplified example)
            data = {
              metrics: [...financialData.metrics, ...operationalData.metrics],
              charts: { ...financialData.charts, ...operationalData.charts },
              tables: { ...financialData.tables, ...operationalData.tables },
            }
            break
        }

        setReportData(data)
      } catch (err) {
        setError("Erro ao gerar relatório. Tente novamente.")
        toast({
          title: "Erro",
          description: "Não foi possível gerar o relatório. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [currentReportType, filters],
  )

  const saveCurrentReport = useCallback(
    async (companyId: string, name: string, description: string, tags: string[]) => {
      if (!reportData) {
        toast({
          title: "Erro",
          description: "Não há dados de relatório para salvar. Gere um relatório primeiro.",
          variant: "destructive",
        })
        return
      }

      setIsLoading(true)

      try {
        const savedReport = await saveReport(companyId, {
          name,
          description,
          type: currentReportType,
          filters,
          tags,
        })

        setSavedReports((prev) => [...prev, savedReport])

        toast({
          title: "Sucesso",
          description: "Relatório salvo com sucesso.",
        })
      } catch (err) {
        toast({
          title: "Erro",
          description: "Não foi possível salvar o relatório. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [currentReportType, filters, reportData],
  )

  const scheduleCurrentReport = useCallback(
    async (
      companyId: string,
      name: string,
      description: string,
      frequency: "daily" | "weekly" | "monthly" | "quarterly",
      options: {
        dayOfWeek?: number
        dayOfMonth?: number
        recipients: string[]
        format: "pdf" | "excel" | "csv"
      },
    ) => {
      setIsLoading(true)

      try {
        const scheduledReport = await scheduleReport(companyId, {
          name,
          description,
          type: currentReportType,
          filters,
          frequency,
          dayOfWeek: options.dayOfWeek,
          dayOfMonth: options.dayOfMonth,
          recipients: options.recipients,
          nextSendDate: new Date(), // This would be calculated on the server
          format: options.format,
          active: true,
        })

        setScheduledReports((prev) => [...prev, scheduledReport])

        toast({
          title: "Sucesso",
          description: "Relatório agendado com sucesso.",
        })
      } catch (err) {
        toast({
          title: "Erro",
          description: "Não foi possível agendar o relatório. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [currentReportType, filters],
  )

  const deleteSaved = useCallback(async (companyId: string, reportId: string) => {
    setIsLoading(true)

    try {
      await deleteSavedReport(companyId, reportId)

      setSavedReports((prev) => prev.filter((report) => report.id !== reportId))

      toast({
        title: "Sucesso",
        description: "Relatório excluído com sucesso.",
      })
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o relatório. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const cancelScheduled = useCallback(async (companyId: string, reportId: string) => {
    setIsLoading(true)

    try {
      await cancelScheduledReport(companyId, reportId)

      setScheduledReports((prev) => prev.filter((report) => report.id !== reportId))

      toast({
        title: "Sucesso",
        description: "Agendamento de relatório cancelado com sucesso.",
      })
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o agendamento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const exportCurrentReport = useCallback(
    async (companyId: string, options: ReportExportOptions) => {
      setIsLoading(true)

      try {
        const blob = await exportReport(companyId, currentReportType, options.format, filters)

        toast({
          title: "Sucesso",
          description: `Relatório exportado como ${options.format.toUpperCase()} com sucesso.`,
        })

        return blob
      } catch (err) {
        toast({
          title: "Erro",
          description: "Não foi possível exportar o relatório. Tente novamente.",
          variant: "destructive",
        })
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [currentReportType, filters],
  )

  const loadSavedReports = useCallback(async (companyId: string) => {
    setIsLoading(true)

    try {
      const reports = await getSavedReports(companyId)
      setSavedReports(reports)
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os relatórios salvos. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadScheduledReports = useCallback(async (companyId: string) => {
    setIsLoading(true)

    try {
      const reports = await getScheduledReports(companyId)
      setScheduledReports(reports)
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os relatórios agendados. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <CompanyReportsContext.Provider
      value={{
        isLoading,
        error,
        currentReportType,
        filters,
        reportData,
        savedReports,
        scheduledReports,
        setReportType: setCurrentReportType,
        setFilters,
        generateReport,
        saveCurrentReport,
        scheduleCurrentReport,
        deleteSaved,
        cancelScheduled,
        exportCurrentReport,
        loadSavedReports,
        loadScheduledReports,
      }}
    >
      {children}
    </CompanyReportsContext.Provider>
  )
}

export function useCompanyReports() {
  const context = useContext(CompanyReportsContext)

  if (context === undefined) {
    throw new Error("useCompanyReports must be used within a CompanyReportsProvider")
  }

  return context
}
