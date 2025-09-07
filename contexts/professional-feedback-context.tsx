"use client"

import type { ReactNode } from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { InternalFeedback, InternalFeedbackFilters } from "@/types/internal-feedback"
import { professionalFeedbackApi } from "@/lib/api/professional-feedback"
import { useToast } from "@/hooks/use-toast"

interface CreateFeedbackData {
  title: string
  category: string
  description: string
  priority: number
  status: number
}

interface ProfessionalFeedbackContextType {
  feedbacks: InternalFeedback[]
  isLoading: boolean
  error: Error | null
  filters: InternalFeedbackFilters
  setFilters: (filters: InternalFeedbackFilters) => void
  resetFilters: () => void
  fetchFeedbacks: () => Promise<void>
  createFeedback: (data: CreateFeedbackData) => Promise<InternalFeedback | null>
  addComment: (feedbackId: number, comment: string) => Promise<InternalFeedback | null>
  getFeedbackById: (id: number) => Promise<InternalFeedback | null>
}

const ProfessionalFeedbackContext = createContext<ProfessionalFeedbackContextType | undefined>(undefined)

export function ProfessionalFeedbackProvider({ children }: { children: ReactNode }) {
  const [feedbacks, setFeedbacks] = useState<InternalFeedback[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<InternalFeedbackFilters>({
    status: "all",
  })
  const { toast } = useToast()

  const fetchFeedbacks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await professionalFeedbackApi.getMyFeedbacks(filters)

      if (error) {
        throw new Error(error)
      }

      if (data) {
        setFeedbacks(data.data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch feedbacks"))
      toast({
        title: "Error",
        description: "Failed to fetch feedbacks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [filters, toast])

  const createFeedback = useCallback(
    async (data: CreateFeedbackData) => {
      setIsLoading(true)
      setError(null)
      try {
        const { data: newFeedback, error } = await professionalFeedbackApi.create(data)

        if (error) {
          throw new Error(error)
        }

        if (newFeedback) {
          setFeedbacks((prev) => [newFeedback, ...prev])
          toast({
            title: "Success",
            description: "Feedback has been submitted successfully.",
          })
          return newFeedback
        }
        return null
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to create feedback"))
        toast({
          title: "Error",
          description: "Failed to submit feedback. Please try again.",
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
    async (feedbackId: number, comment: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const { data: updatedFeedback, error } = await professionalFeedbackApi.addComment(feedbackId, comment)

        if (error) {
          throw new Error(error)
        }

        if (updatedFeedback) {
          setFeedbacks((prev) => prev.map((feedback) => (feedback.id === feedbackId ? updatedFeedback : feedback)))
          toast({
            title: "Success",
            description: "Comment has been added successfully.",
          })
          return updatedFeedback
        }
        return null
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to add comment"))
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

  const getFeedbackById = useCallback(
    async (id: number) => {
      setIsLoading(true)
      setError(null)
      try {
        const { data, error } = await professionalFeedbackApi.getById(id)

        if (error) {
          throw new Error(error)
        }

        return data || null
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to fetch feedback with ID ${id}`))
        toast({
          title: "Error",
          description: "Failed to fetch feedback details. Please try again.",
          variant: "destructive",
        })
        return null
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
    fetchFeedbacks()
  }, [fetchFeedbacks])

  return (
    <ProfessionalFeedbackContext.Provider
      value={{
        feedbacks,
        isLoading,
        error,
        filters,
        setFilters,
        resetFilters,
        fetchFeedbacks,
        createFeedback,
        addComment,
        getFeedbackById,
      }}
    >
      {children}
    </ProfessionalFeedbackContext.Provider>
  )
}

export function useProfessionalFeedbackContext() {
  const context = useContext(ProfessionalFeedbackContext)
  if (context === undefined) {
    throw new Error("useProfessionalFeedbackContext must be used within a ProfessionalFeedbackProvider")
  }
  return context
}
