"use client"

import { useState, useCallback } from "react"
import { companyProfessionalsApi } from "@/lib/api/company-professionals"
import type { ProfessionalWithDetails } from "@/lib/api/professionals"
import { useToast } from "@/hooks/use-toast"

interface UseCompanyProfessionalReturn {
  professional: ProfessionalWithDetails | null
  isLoading: boolean
  error: string | null
  fetchProfessional: (companyId: string, id: string) => Promise<void>
  updateProfessional: (companyId: string, data: Partial<ProfessionalWithDetails>) => Promise<boolean>
  deleteProfessional: (companyId: string) => Promise<boolean>
  getSchedule: (
    companyId: string,
    startDate: string,
    endDate: string,
  ) => Promise<{ date: string; appointments: any[] }[] | null>
}

export function useCompanyProfessional(initialCompanyId?: string, initialId?: string): UseCompanyProfessionalReturn {
  const [professional, setProfessional] = useState<ProfessionalWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchProfessional = useCallback(
    async (companyId: string, id: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await companyProfessionalsApi.getCompanyProfessionalById(companyId, id)

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
    async (companyId: string, data: Partial<ProfessionalWithDetails>): Promise<boolean> => {
      if (!professional) {
        setError("No professional selected")
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await companyProfessionalsApi.updateCompanyProfessional(companyId, professional.id, data)

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
        const updatedResponse = await companyProfessionalsApi.getCompanyProfessionalById(companyId, professional.id)
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

  const deleteProfessional = useCallback(
    async (companyId: string): Promise<boolean> => {
      if (!professional) {
        setError("No professional selected")
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await companyProfessionalsApi.deleteCompanyProfessional(companyId, professional.id)

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
    },
    [professional, toast],
  )

  const getSchedule = useCallback(
    async (
      companyId: string,
      startDate: string,
      endDate: string,
    ): Promise<{ date: string; appointments: any[] }[] | null> => {
      if (!professional) {
        setError("No professional selected")
        return null
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await companyProfessionalsApi.getCompanyProfessionalSchedule(
          companyId,
          professional.id,
          startDate,
          endDate,
        )

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

  // Fetch professional if initialCompanyId and initialId are provided
  if (initialCompanyId && initialId && !professional && !isLoading && !error) {
    fetchProfessional(initialCompanyId, initialId)
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
