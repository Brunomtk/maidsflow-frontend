"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { professionalFeedbackApi } from "@/lib/api/professional-feedback"
import type { InternalFeedback, InternalFeedbackFilters } from "@/types/internal-feedback"

interface CreateFeedbackData {
  title: string
  category: string
  description: string
  priority: number
  status: number
}

export function useProfessionalFeedback() {
  const [feedbacks, setFeedbacks] = useState<InternalFeedback[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const fetchFeedbacks = useCallback(
    async (filters: InternalFeedbackFilters = {}) => {
      setIsLoading(true)
      setError(null)

      try {
        const { data, error } = await professionalFeedbackApi.getMyFeedbacks(filters, user?.professionalId)

        if (error) {
          throw new Error(error)
        }

        if (data) {
          setFeedbacks(data.data || [])
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch feedbacks"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast, user?.professionalId],
  )

  const createFeedback = useCallback(
    async (data: CreateFeedbackData) => {
      setIsLoading(true)
      setError(null)

      try {
        const { data: newFeedback, error } = await professionalFeedbackApi.create(
          data,
          user?.professionalId,
          user?.teamId,
          user?.name,
        )

        if (error) {
          throw new Error(error)
        }

        if (newFeedback) {
          setFeedbacks((prev) => [newFeedback, ...prev])
          toast({
            title: "Success",
            description: "Feedback submitted successfully.",
          })
          return newFeedback
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create feedback"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [toast, user?.professionalId, user?.teamId, user?.name],
  )

  const addComment = useCallback(
    async (feedbackId: number, comment: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const { data: updatedFeedback, error } = await professionalFeedbackApi.addComment(
          feedbackId,
          comment,
          user?.id,
          user?.name,
        )

        if (error) {
          throw new Error(error)
        }

        if (updatedFeedback) {
          setFeedbacks((prev) => prev.map((feedback) => (feedback.id === feedbackId ? updatedFeedback : feedback)))
          toast({
            title: "Success",
            description: "Comment added successfully.",
          })
          return updatedFeedback
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to add comment"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [toast, user?.id, user?.name],
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

        return data
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch feedback"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  return {
    feedbacks,
    isLoading,
    error,
    fetchFeedbacks,
    createFeedback,
    addComment,
    getFeedbackById,
  }
}
