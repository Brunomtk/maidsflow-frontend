"use client"

import { useCallback, useMemo } from "react"
import { useCompanyReports } from "@/contexts/company-reports-context"
import type { ChartData, TableData } from "@/types/company-report"

export function useCompanyReportsUtils() {
  const {
    isLoading,
    error,
    currentReportType,
    filters,
    reportData,
    savedReports,
    scheduledReports,
    setReportType,
    setFilters,
    generateReport,
    saveCurrentReport,
    scheduleCurrentReport,
    deleteSaved,
    cancelScheduled,
    exportCurrentReport,
    loadSavedReports,
    loadScheduledReports,
  } = useCompanyReports()

  // Formatação de datas para exibição
  const formatDateRange = useCallback((startDate?: Date, endDate?: Date): string => {
    if (!startDate || !endDate) return "Período não definido"

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    }

    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }, [])

  // Formatação de valores monetários
  const formatCurrency = useCallback((value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }, [])

  // Formatação de percentuais
  const formatPercentage = useCallback((value: number): string => {
    return `${value.toFixed(1)}%`
  }, [])

  // Obter dados de um gráfico específico
  const getChartData = useCallback(
    (chartKey: string): ChartData | null => {
      if (!reportData || !reportData.charts[chartKey]) return null
      return reportData.charts[chartKey]
    },
    [reportData],
  )

  // Obter dados de uma tabela específica
  const getTableData = useCallback(
    (tableKey: string): TableData | null => {
      if (!reportData || !reportData.tables[tableKey]) return null
      return reportData.tables[tableKey]
    },
    [reportData],
  )

  // Aplicar filtros predefinidos
  const applyPresetFilter = useCallback(
    (preset: "today" | "last7days" | "lastMonth" | "lastQuarter"): void => {
      const today = new Date()
      let startDate: Date

      switch (preset) {
        case "today":
          startDate = new Date(today)
          startDate.setHours(0, 0, 0, 0)
          setFilters({ ...filters, startDate, endDate: today })
          break
        case "last7days":
          startDate = new Date(today)
          startDate.setDate(today.getDate() - 7)
          setFilters({ ...filters, startDate, endDate: today })
          break
        case "lastMonth":
          startDate = new Date(today)
          startDate.setMonth(today.getMonth() - 1)
          setFilters({ ...filters, startDate, endDate: today })
          break
        case "lastQuarter":
          startDate = new Date(today)
          startDate.setMonth(today.getMonth() - 3)
          setFilters({ ...filters, startDate, endDate: today })
          break
      }
    },
    [filters, setFilters],
  )

  // Verificar se há dados disponíveis
  const hasData = useMemo(() => {
    return reportData !== null && reportData.metrics.length > 0 && Object.keys(reportData.charts).length > 0
  }, [reportData])

  // Obter métricas de comparação com período anterior
  const getComparisonMetrics = useMemo(() => {
    if (!reportData) return []

    return reportData.metrics.filter((metric) => metric.change !== undefined)
  }, [reportData])

  // Iniciar download de um relatório exportado
  const downloadExportedReport = useCallback(
    async (
      companyId: string,
      options: {
        format: "pdf" | "excel" | "csv"
        includeCharts: boolean
        includeTables: boolean
        includeSummary: boolean
        orientation?: "portrait" | "landscape"
        pageSize?: "a4" | "letter"
      },
    ) => {
      try {
        const blob = await exportCurrentReport(companyId, options)

        // Criar URL para o blob
        const url = window.URL.createObjectURL(blob)

        // Criar link para download
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url

        // Definir nome do arquivo
        const dateStr = new Date().toISOString().split("T")[0]
        a.download = `relatorio-${currentReportType}-${dateStr}.${options.format}`

        // Adicionar à página, clicar e remover
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        return true
      } catch (err) {
        return false
      }
    },
    [currentReportType, exportCurrentReport],
  )

  return {
    // Estado
    isLoading,
    error,
    currentReportType,
    filters,
    reportData,
    savedReports,
    scheduledReports,
    hasData,

    // Ações
    setReportType,
    setFilters,
    generateReport,
    saveCurrentReport,
    scheduleCurrentReport,
    deleteSaved,
    cancelScheduled,
    loadSavedReports,
    loadScheduledReports,
    downloadExportedReport,

    // Utilitários
    formatDateRange,
    formatCurrency,
    formatPercentage,
    getChartData,
    getTableData,
    applyPresetFilter,
    getComparisonMetrics,
  }
}
