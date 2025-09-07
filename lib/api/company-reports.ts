import { API_URL } from "../api/utils"
import type { CompanyReportData, ReportFilter, ReportType, SavedReport, ScheduledReport } from "@/types/company-report"

/**
 * Obtém relatórios financeiros da empresa
 * @param companyId ID da empresa
 * @param filters Filtros para os relatórios
 */
export async function getFinancialReports(companyId: string, filters: ReportFilter): Promise<CompanyReportData> {
  const queryParams = new URLSearchParams()

  if (filters.startDate) queryParams.append("startDate", filters.startDate.toISOString())
  if (filters.endDate) queryParams.append("endDate", filters.endDate.toISOString())
  if (filters.service) queryParams.append("service", filters.service)
  if (filters.professional) queryParams.append("professional", filters.professional)
  if (filters.region) queryParams.append("region", filters.region)

  const response = await fetch(`${API_URL}/companies/${companyId}/reports/financial?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Falha ao obter relatórios financeiros")
  }

  return response.json()
}

/**
 * Obtém relatórios operacionais da empresa
 * @param companyId ID da empresa
 * @param filters Filtros para os relatórios
 */
export async function getOperationalReports(companyId: string, filters: ReportFilter): Promise<CompanyReportData> {
  const queryParams = new URLSearchParams()

  if (filters.startDate) queryParams.append("startDate", filters.startDate.toISOString())
  if (filters.endDate) queryParams.append("endDate", filters.endDate.toISOString())
  if (filters.service) queryParams.append("service", filters.service)
  if (filters.professional) queryParams.append("professional", filters.professional)
  if (filters.region) queryParams.append("region", filters.region)

  const response = await fetch(`${API_URL}/companies/${companyId}/reports/operational?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Falha ao obter relatórios operacionais")
  }

  return response.json()
}

/**
 * Obtém relatórios de clientes da empresa
 * @param companyId ID da empresa
 * @param filters Filtros para os relatórios
 */
export async function getCustomerReports(companyId: string, filters: ReportFilter): Promise<CompanyReportData> {
  const queryParams = new URLSearchParams()

  if (filters.startDate) queryParams.append("startDate", filters.startDate.toISOString())
  if (filters.endDate) queryParams.append("endDate", filters.endDate.toISOString())
  if (filters.service) queryParams.append("service", filters.service)
  if (filters.region) queryParams.append("region", filters.region)

  const response = await fetch(`${API_URL}/companies/${companyId}/reports/customers?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Falha ao obter relatórios de clientes")
  }

  return response.json()
}

/**
 * Obtém relatórios de serviços da empresa
 * @param companyId ID da empresa
 * @param filters Filtros para os relatórios
 */
export async function getServiceReports(companyId: string, filters: ReportFilter): Promise<CompanyReportData> {
  const queryParams = new URLSearchParams()

  if (filters.startDate) queryParams.append("startDate", filters.startDate.toISOString())
  if (filters.endDate) queryParams.append("endDate", filters.endDate.toISOString())
  if (filters.service) queryParams.append("service", filters.service)
  if (filters.professional) queryParams.append("professional", filters.professional)
  if (filters.region) queryParams.append("region", filters.region)

  const response = await fetch(`${API_URL}/companies/${companyId}/reports/services?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Falha ao obter relatórios de serviços")
  }

  return response.json()
}

/**
 * Obtém relatórios salvos da empresa
 * @param companyId ID da empresa
 */
export async function getSavedReports(companyId: string): Promise<SavedReport[]> {
  const response = await fetch(`${API_URL}/companies/${companyId}/reports/saved`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Falha ao obter relatórios salvos")
  }

  return response.json()
}

/**
 * Obtém relatórios agendados da empresa
 * @param companyId ID da empresa
 */
export async function getScheduledReports(companyId: string): Promise<ScheduledReport[]> {
  const response = await fetch(`${API_URL}/companies/${companyId}/reports/scheduled`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Falha ao obter relatórios agendados")
  }

  return response.json()
}

/**
 * Salva um relatório personalizado
 * @param companyId ID da empresa
 * @param report Dados do relatório
 */
export async function saveReport(
  companyId: string,
  report: Omit<SavedReport, "id" | "createdAt">,
): Promise<SavedReport> {
  const response = await fetch(`${API_URL}/companies/${companyId}/reports/saved`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(report),
  })

  if (!response.ok) {
    throw new Error("Falha ao salvar relatório")
  }

  return response.json()
}

/**
 * Agenda um relatório para envio automático
 * @param companyId ID da empresa
 * @param report Dados do agendamento
 */
export async function scheduleReport(
  companyId: string,
  report: Omit<ScheduledReport, "id" | "createdAt">,
): Promise<ScheduledReport> {
  const response = await fetch(`${API_URL}/companies/${companyId}/reports/scheduled`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(report),
  })

  if (!response.ok) {
    throw new Error("Falha ao agendar relatório")
  }

  return response.json()
}

/**
 * Exclui um relatório salvo
 * @param companyId ID da empresa
 * @param reportId ID do relatório
 */
export async function deleteSavedReport(companyId: string, reportId: string): Promise<void> {
  const response = await fetch(`${API_URL}/companies/${companyId}/reports/saved/${reportId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Falha ao excluir relatório")
  }
}

/**
 * Cancela um relatório agendado
 * @param companyId ID da empresa
 * @param reportId ID do relatório
 */
export async function cancelScheduledReport(companyId: string, reportId: string): Promise<void> {
  const response = await fetch(`${API_URL}/companies/${companyId}/reports/scheduled/${reportId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Falha ao cancelar relatório agendado")
  }
}

/**
 * Exporta um relatório em um formato específico
 * @param companyId ID da empresa
 * @param reportType Tipo de relatório
 * @param format Formato de exportação
 * @param filters Filtros para o relatório
 */
export async function exportReport(
  companyId: string,
  reportType: ReportType,
  format: "pdf" | "excel" | "csv",
  filters: ReportFilter,
): Promise<Blob> {
  const queryParams = new URLSearchParams()

  queryParams.append("format", format)
  if (filters.startDate) queryParams.append("startDate", filters.startDate.toISOString())
  if (filters.endDate) queryParams.append("endDate", filters.endDate.toISOString())
  if (filters.service) queryParams.append("service", filters.service)
  if (filters.professional) queryParams.append("professional", filters.professional)
  if (filters.region) queryParams.append("region", filters.region)

  const response = await fetch(
    `${API_URL}/companies/${companyId}/reports/${reportType}/export?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  )

  if (!response.ok) {
    throw new Error(`Falha ao exportar relatório como ${format.toUpperCase()}`)
  }

  return response.blob()
}
