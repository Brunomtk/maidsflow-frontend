"use client"

import type { ReactNode } from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import type {
  InternalFeedback,
  InternalFeedbackFormData,
  InternalFeedbackFilters,
  InternalFeedbackComment,
} from "@/types/internal-feedback"
import {
  getCompanyFeedback,
  getCompanyFeedbackById,
  createCompanyFeedback,
  updateCompanyFeedback,
  deleteCompanyFeedback,
  addCommentToCompanyFeedback,
  getCompanyFeedbackStats,
  getCompanyFeedbackByProfessional,
  getCompanyFeedbackByTeam,
  resolveCompanyFeedback,
  exportCompanyFeedback,
} from "@/lib/api/company-feedback"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface CompanyFeedbackStats {
  total: number
  pending: number
  resolved: number
  inProgress: number
  byType: Record<string, number>
  byPriority: Record<string, number>
}

interface CompanyFeedbackContextType {
  feedbacks: InternalFeedback[]
  isLoading: boolean
  error: Error | null
  filters: InternalFeedbackFilters
  stats: CompanyFeedbackStats | null
  setFilters: (filters: InternalFeedbackFilters) => void
  resetFilters: () => void
  fetchFeedbacks: () => Promise<void>
  fetchFeedbackById: (id: string) => Promise<InternalFeedback | null>
  addFeedback: (data: InternalFeedbackFormData) => Promise<InternalFeedback>
  updateFeedback: (id: string, data: Partial<InternalFeedbackFormData>) => Promise<InternalFeedback>
  deleteFeedback: (id: string) => Promise<void>
  addComment: (
    feedbackId: string,
    comment: Omit<InternalFeedbackComment, "id" | "date">,
  ) => Promise<InternalFeedbackComment>
  resolveFeedback: (id: string, resolution: string) => Promise<InternalFeedback>
  fetchFeedbacksByProfessional: (professionalId: string) => Promise<InternalFeedback[]>
  fetchFeedbacksByTeam: (teamId: string) => Promise<InternalFeedback[]>
  fetchStats: () => Promise<void>
  exportFeedback: (format: "csv" | "excel" | "pdf") => Promise<void>
}

const CompanyFeedbackContext = createContext<CompanyFeedbackContextType | undefined>(undefined)

export function CompanyFeedbackProvider({ children }: { children: ReactNode }) {
  const [feedbacks, setFeedbacks] = useState<InternalFeedback[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [stats, setStats] = useState<CompanyFeedbackStats | null>(null)
  const [filters, setFilters] = useState<InternalFeedbackFilters>({
    status: "all",
  })
  const { toast } = useToast()
  const { user } = useAuth()
  const companyId = user?.companyId || ""

  const fetchFeedbacks = useCallback(async () => {
    if (!companyId) return

    setIsLoading(true)
    setError(null)
    try {
      const data = await getCompanyFeedback(companyId, filters)
      setFeedbacks(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch company feedback"))
      toast({
        title: "Error",
        description: "Failed to fetch feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [companyId, filters, toast])

  const fetchFeedbackById = useCallback(
    async (id: string) => {
      if (!companyId) return null

      setIsLoading(true)
      setError(null)
      try {
        const feedback = await getCompanyFeedbackById(companyId, id)
        return feedback
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to fetch feedback with ID ${id}`))
        toast({
          title: "Error",
          description: `Failed to fetch feedback details. Please try again.`,
          variant: "destructive",
        })
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [companyId, toast],
  )

  const addFeedback = useCallback(
    async (data: InternalFeedbackFormData) => {
      if (!companyId) throw new Error("Company ID not found")

      setIsLoading(true)
      setError(null)
      try {
        const newFeedback = await createCompanyFeedback(companyId, data)
        setFeedbacks((prev) => [newFeedback, ...prev])
        toast({
          title: "Success",
          description: "Feedback has been added successfully.",
        })
        return newFeedback
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to add feedback"))
        toast({
          title: "Error",
          description: "Failed to add feedback. Please try again.",
          variant: "destructive",
        })
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [companyId, toast],
  )

  const updateFeedback = useCallback(
    async (id: string, data: Partial<InternalFeedbackFormData>) => {
      if (!companyId) throw new Error("Company ID not found")

      setIsLoading(true)
      setError(null)
      try {
        const updatedFeedback = await updateCompanyFeedback(companyId, id, data)
        setFeedbacks((prev) => prev.map((feedback) => (feedback.id === id ? updatedFeedback : feedback)))
        toast({
          title: "Success",
          description: "Feedback has been updated successfully.",
        })
        return updatedFeedback
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to update feedback with ID ${id}`))
        toast({
          title: "Error",
          description: "Failed to update feedback. Please try again.",
          variant: "destructive",
        })
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [companyId, toast],
  )

  const deleteFeedback = useCallback(
    async (id: string) => {
      if (!companyId) throw new Error("Company ID not found")

      setIsLoading(true)
      setError(null)
      try {
        await deleteCompanyFeedback(companyId, id)
        setFeedbacks((prev) => prev.filter((feedback) => feedback.id !== id))
        toast({
          title: "Success",
          description: "Feedback has been deleted successfully.",
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to delete feedback with ID ${id}`))
        toast({
          title: "Error",
          description: "Failed to delete feedback. Please try again.",
          variant: "destructive",
        })
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [companyId, toast],
  )

  const addComment = useCallback(
    async (feedbackId: string, comment: Omit<InternalFeedbackComment, "id" | "date">) => {
      if (!companyId) throw new Error("Company ID not found")

      setIsLoading(true)
      setError(null)
      try {
        const newComment = await addCommentToCompanyFeedback(companyId, feedbackId, comment)
        setFeedbacks((prev) =>
          prev.map((feedback) => {
            if (feedback.id === feedbackId) {
              return {
                ...feedback,
                comments: [...feedback.comments, newComment],
                updatedAt: new Date().toISOString(),
              }
            }
            return feedback
          }),
        )
        toast({
          title: "Success",
          description: "Comment has been added successfully.",
        })
        return newComment
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to add comment to feedback with ID ${feedbackId}`))
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
    [companyId, toast],
  )

  const resolveFeedback = useCallback(
    async (id: string, resolution: string) => {
      if (!companyId) throw new Error("Company ID not found")

      setIsLoading(true)
      setError(null)
      try {
        const resolvedFeedback = await resolveCompanyFeedback(companyId, id, resolution)
        setFeedbacks((prev) => prev.map((feedback) => (feedback.id === id ? resolvedFeedback : feedback)))
        toast({
          title: "Success",
          description: "Feedback has been resolved successfully.",
        })
        return resolvedFeedback
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to resolve feedback with ID ${id}`))
        toast({
          title: "Error",
          description: "Failed to resolve feedback. Please try again.",
          variant: "destructive",
        })
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [companyId, toast],
  )

  const fetchFeedbacksByProfessional = useCallback(
    async (professionalId: string) => {
      if (!companyId) return []

      setIsLoading(true)
      setError(null)
      try {
        const data = await getCompanyFeedbackByProfessional(companyId, professionalId)
        return data
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to fetch feedback for professional ${professionalId}`))
        toast({
          title: "Error",
          description: "Failed to fetch feedback by professional. Please try again.",
          variant: "destructive",
        })
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [companyId, toast],
  )

  const fetchFeedbacksByTeam = useCallback(
    async (teamId: string) => {
      if (!companyId) return []

      setIsLoading(true)
      setError(null)
      try {
        const data = await getCompanyFeedbackByTeam(companyId, teamId)
        return data
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to fetch feedback for team ${teamId}`))
        toast({
          title: "Error",
          description: "Failed to fetch feedback by team. Please try again.",
          variant: "destructive",
        })
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [companyId, toast],
  )

  const fetchStats = useCallback(async () => {
    if (!companyId) return

    setIsLoading(true)
    setError(null)
    try {
      const statsData = await getCompanyFeedbackStats(companyId)
      setStats(statsData)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch feedback statistics"))
      toast({
        title: "Error",
        description: "Failed to fetch feedback statistics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [companyId, toast])

  const exportFeedback = useCallback(
    async (format: "csv" | "excel" | "pdf") => {
      if (!companyId) return

      setIsLoading(true)
      setError(null)
      try {
        const blob = await exportCompanyFeedback(companyId, format, filters)

        // Create download link
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `feedback-${new Date().toISOString().split("T")[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Success",
          description: `Feedback exported successfully as ${format.toUpperCase()}.`,
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to export feedback"))
        toast({
          title: "Error",
          description: "Failed to export feedback. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [companyId, filters, toast],
  )

  const resetFilters = useCallback(() => {
    setFilters({ status: "all" })
  }, [])

  useEffect(() => {
    if (companyId) {
      fetchFeedbacks()
      fetchStats()
    }
  }, [fetchFeedbacks, fetchStats, companyId])

  return (
    <CompanyFeedbackContext.Provider
      value={{
        feedbacks,
        isLoading,
        error,
        filters,
        stats,
        setFilters,
        resetFilters,
        fetchFeedbacks,
        fetchFeedbackById,
        addFeedback,
        updateFeedback,
        deleteFeedback,
        addComment,
        resolveFeedback,
        fetchFeedbacksByProfessional,
        fetchFeedbacksByTeam,
        fetchStats,
        exportFeedback,
      }}
    >
      {children}
    </CompanyFeedbackContext.Provider>
  )
}

export function useCompanyFeedbackContext() {
  const context = useContext(CompanyFeedbackContext)
  if (context === undefined) {
    throw new Error("useCompanyFeedbackContext must be used within a CompanyFeedbackProvider")
  }
  return context
}
