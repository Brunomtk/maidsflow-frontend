"use client"

import { useState, useCallback } from "react"
import { professionalsApi, type ProfessionalWithDetails } from "@/lib/api/professionals"
import { useToast } from "@/hooks/use-toast"

interface UseProfessionalReturn {
  professional: ProfessionalWithDetails | null
  isLoading: boolean
  error: string | null
  fetchProfessional: (id: string) => Promise<void>
  updateProfessional: (data: Partial<ProfessionalWithDetails>) => Promise<boolean>
  deleteProfessional: () => Promise<boolean>
  getSchedule: (startDate: string, endDate: string) => Promise<{ date: string; appointments: any[] }[] | null>
}

export function useProfessional(initialId?: string): UseProfessionalReturn {
  const [professional, setProfessional] = useState<ProfessionalWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchProfessional = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await professionalsApi.getProfessionalById(id)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          })
          return
        }

        setProfessional(response.data || null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch professional"
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
    [toast],
  )

  const updateProfessional = useCallback(
    async (data: Partial<ProfessionalWithDetails>): Promise<boolean> => {
      if (!professional) {
        setError("No professional selected")
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await professionalsApi.updateProfessional(professional.id, data)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          })
          return false
        }

        // Atualizar o profissional local com os novos dados
        // Precisamos buscar novamente para obter todos os detalhes atualizados
        const updatedResponse = await professionalsApi.getProfessionalById(professional.id)
        if (updatedResponse.data) {
          setProfessional(updatedResponse.data)
        }

        toast({
          title: "Success",
          description: "Professional updated successfully",
        })
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update professional"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [professional, toast],
  )

  const deleteProfessional = useCallback(async (): Promise<boolean> => {
    if (!professional) {
      setError("No professional selected")
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await professionalsApi.deleteProfessional(professional.id)

      if (response.error) {
        setError(response.error)
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
        return false
      }

      setProfessional(null)
      toast({
        title: "Success",
        description: "Professional deleted successfully",
        variant: "destructive",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete professional"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [professional, toast])

  const getSchedule = useCallback(
    async (startDate: string, endDate: string): Promise<{ date: string; appointments: any[] }[] | null> => {
      if (!professional) {
        setError("No professional selected")
        return null
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await professionalsApi.getProfessionalSchedule(professional.id, startDate, endDate)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          })
          return null
        }

        return response.data || null
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch professional schedule"
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
    [professional, toast],
  )

  // Fetch professional if initialId is provided
  if (initialId && !professional && !isLoading && !error) {
    fetchProfessional(initialId)
  }

  return {
    professional,
    isLoading,
    error,
    fetchProfessional,
    updateProfessional,
    deleteProfessional,
    getSchedule,
  }
}
