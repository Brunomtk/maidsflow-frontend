"use client"

import type { ReactNode } from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import type {
  InternalReport,
  InternalReportFormData,
  InternalReportFilters,
  InternalReportComment,
} from "@/types/internal-report"
import {
  getInternalReports,
  getInternalReportById,
  createInternalReport,
  updateInternalReport,
  deleteInternalReport,
  addCommentToInternalReport,
  getInternalReportsByProfessional,
  getInternalReportsByTeam,
  getInternalReportsByCategory,
  getInternalReportsByStatus,
  getInternalReportsByPriority,
} from "@/lib/api/internal-reports"
import { useToast } from "@/hooks/use-toast"

interface InternalReportsContextType {
  reports: InternalReport[]
  isLoading: boolean
  error: Error | null
  filters: InternalReportFilters
  setFilters: (filters: InternalReportFilters) => void
  resetFilters: () => void
  fetchReports: () => Promise<void>
  fetchReportById: (id: string) => Promise<InternalReport | null>
  addReport: (data: InternalReportFormData) => Promise<InternalReport>
  updateReport: (id: string, data: Partial<InternalReportFormData>) => Promise<InternalReport>
  deleteReport: (id: string) => Promise<void>
  addComment: (reportId: string, comment: Omit<InternalReportComment, "id" | "date">) => Promise<InternalReportComment>
  fetchReportsByProfessional: (professionalId: string) => Promise<InternalReport[]>
  fetchReportsByTeam: (teamId: string) => Promise<InternalReport[]>
  fetchReportsByCategory: (category: string) => Promise<InternalReport[]>
  fetchReportsByStatus: (status: string) => Promise<InternalReport[]>
  fetchReportsByPriority: (priority: string) => Promise<InternalReport[]>
}

const InternalReportsContext = createContext<InternalReportsContextType | undefined>(undefined)

export function InternalReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<InternalReport[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<InternalReportFilters>({
    status: "all",
  })
  const { toast } = useToast()

  const fetchReports = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getInternalReports(filters)
      setReports(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch internal reports"))
      toast({
        title: "Error",
        description: "Failed to fetch internal reports. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [filters, toast])

  const fetchReportById = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const report = await getInternalReportById(id)
        return report
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to fetch internal report with ID ${id}`))
        toast({
          title: "Error",
          description: `Failed to fetch internal report details. Please try again.`,
          variant: "destructive",
        })
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const addReport = useCallback(
    async (data: InternalReportFormData) => {
      setIsLoading(true)
      setError(null)
      try {
        const newReport = await createInternalReport(data)
        setReports((prev) => [newReport, ...prev])
        toast({
          title: "Success",
          description: "Internal report has been added successfully.",
        })
        return newReport
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to add internal report"))
        toast({
          title: "Error",
          description: "Failed to add internal report. Please try again.",
          variant: "destructive",
        })
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const updateReport = useCallback(
    async (id: string, data: Partial<InternalReportFormData>) => {
      setIsLoading(true)
      setError(null)
      try {
        const updatedReport = await updateInternalReport(id, data)
        setReports((prev) => prev.map((report) => (report.id === id ? updatedReport : report)))
        toast({
          title: "Success",
          description: "Internal report has been updated successfully.",
        })
        return updatedReport
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to update internal report with ID ${id}`))
        toast({
          title: "Error",
          description: "Failed to update internal report. Please try again.",
          variant: "destructive",
        })
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const deleteReport = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)
      try {
        await deleteInternalReport(id)
        setReports((prev) => prev.filter((report) => report.id !== id))
        toast({
          title: "Success",
          description: "Internal report has been deleted successfully.",
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to delete internal report with ID ${id}`))
        toast({
          title: "Error",
          description: "Failed to delete internal report. Please try again.",
          variant: "destructive",
        })
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const addComment = useCallback(
    async (reportId: string, comment: Omit<InternalReportComment, "id" | "date">) => {
      setIsLoading(true)
      setError(null)
      try {
        const newComment = await addCommentToInternalReport(reportId, comment)
        setReports((prev) =>
          prev.map((report) => {
            if (report.id === reportId) {
              return {
                ...report,
                comments: [...report.comments, newComment],
                updatedAt: new Date().toISOString(),
              }
            }
            return report
          }),
        )
        toast({
          title: "Success",
          description: "Comment has been added successfully.",
        })
        return newComment
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to add comment to internal report with ID ${reportId}`))
        toast({
          title: "Error",
          description: "Failed to add comment. Please try again.",
          variant: "destructive",
        })
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const fetchReportsByProfessional = useCallback(
    async (professionalId: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getInternalReportsByProfessional(professionalId)
        return data
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error(`Failed to fetch internal reports for professional ${professionalId}`),
        )
        toast({
          title: "Error",
          description: "Failed to fetch internal reports by professional. Please try again.",
          variant: "destructive",
        })
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const fetchReportsByTeam = useCallback(
    async (teamId: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getInternalReportsByTeam(teamId)
        return data
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to fetch internal reports for team ${teamId}`))
        toast({
          title: "Error",
          description: "Failed to fetch internal reports by team. Please try again.",
          variant: "destructive",
        })
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const fetchReportsByCategory = useCallback(
    async (category: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getInternalReportsByCategory(category)
        return data
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to fetch internal reports for category ${category}`))
        toast({
          title: "Error",
          description: "Failed to fetch internal reports by category. Please try again.",
          variant: "destructive",
        })
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const fetchReportsByStatus = useCallback(
    async (status: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getInternalReportsByStatus(status)
        return data
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to fetch internal reports for status ${status}`))
        toast({
          title: "Error",
          description: "Failed to fetch internal reports by status. Please try again.",
          variant: "destructive",
        })
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const fetchReportsByPriority = useCallback(
    async (priority: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getInternalReportsByPriority(priority)
        return data
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to fetch internal reports for priority ${priority}`))
        toast({
          title: "Error",
          description: "Failed to fetch internal reports by priority. Please try again.",
          variant: "destructive",
        })
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const resetFilters = useCallback(() => {
    setFilters({ status: "all" })
  }, [])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  return (
    <InternalReportsContext.Provider
      value={{
        reports,
        isLoading,
        error,
        filters,
        setFilters,
        resetFilters,
        fetchReports,
        fetchReportById,
        addReport,
        updateReport,
        deleteReport,
        addComment,
        fetchReportsByProfessional,
        fetchReportsByTeam,
        fetchReportsByCategory,
        fetchReportsByStatus,
        fetchReportsByPriority,
      }}
    >
      {children}
    </InternalReportsContext.Provider>
  )
}

export function useInternalReportsContext() {
  const context = useContext(InternalReportsContext)
  if (context === undefined) {
    throw new Error("useInternalReportsContext must be used within an InternalReportsProvider")
  }
  return context
}
