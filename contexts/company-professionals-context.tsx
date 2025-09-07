"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Professional, PaginatedResponse } from "@/types"
import { companyProfessionalsApi } from "@/lib/api/company-professionals"
import type { ProfessionalWithDetails } from "@/lib/api/professionals"
import { useToast } from "@/hooks/use-toast"

interface CompanyProfessionalsContextType {
  professionals: Professional[]
  isLoading: boolean
  error: string | null
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  filters: {
    status: string
    teamId: string
    search: string
  }
  teams: { id: string; name: string }[]
  fetchProfessionals: (
    companyId: string,
    page?: number,
    limit?: number,
    status?: string,
    teamId?: string,
    search?: string,
  ) => Promise<void>
  getProfessionalById: (companyId: string, id: string) => Promise<ProfessionalWithDetails | null>
  createProfessional: (
    companyId: string,
    professionalData: Omit<ProfessionalWithDetails, "id" | "createdAt" | "updatedAt" | "rating" | "completedServices">,
  ) => Promise<Professional | null>
  updateProfessional: (
    companyId: string,
    id: string,
    professionalData: Partial<ProfessionalWithDetails>,
  ) => Promise<Professional | null>
  deleteProfessional: (companyId: string, id: string) => Promise<boolean>
  getProfessionalSchedule: (
    companyId: string,
    id: string,
    startDate: string,
    endDate: string,
  ) => Promise<{ date: string; appointments: any[] }[] | null>
  fetchTeams: (companyId: string) => Promise<void>
  setFilters: (filters: { status?: string; teamId?: string; search?: string }) => void
}

const CompanyProfessionalsContext = createContext<CompanyProfessionalsContextType | undefined>(undefined)

export function CompanyProfessionalsProvider({ children }: { children: ReactNode }) {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })
  const [filters, setFiltersState] = useState({
    status: "all",
    teamId: "all",
    search: "",
  })
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([])
  const { toast } = useToast()

  const fetchProfessionals = useCallback(
    async (
      companyId: string,
      page = 1,
      limit = 10,
      status = filters.status,
      teamId = filters.teamId,
      search = filters.search,
    ) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await companyProfessionalsApi.getCompanyProfessionals(
          companyId,
          page,
          limit,
          status,
          teamId,
          search,
        )

        if (response.error) {
          setError(response.error)
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          })
          return
        }

        if (response.data) {
          const paginatedData = response.data as PaginatedResponse<Professional>
          setProfessionals(paginatedData.data)
          setPagination(paginatedData.meta)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch professionals"
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
    [filters, toast],
  )

  const getProfessionalById = useCallback(
    async (companyId: string, id: string): Promise<ProfessionalWithDetails | null> => {
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
          return null
        }

        return response.data || null
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch professional"
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

  const createProfessional = useCallback(
    async (
      companyId: string,
      professionalData: Omit<
        ProfessionalWithDetails,
        "id" | "createdAt" | "updatedAt" | "rating" | "completedServices"
      >,
    ): Promise<Professional | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await companyProfessionalsApi.createCompanyProfessional(companyId, professionalData)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          })
          return null
        }

        toast({
          title: "Success",
          description: "Professional created successfully",
        })

        // Refresh the professionals list
        fetchProfessionals(companyId, pagination.currentPage, pagination.itemsPerPage)

        return response.data || null
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create professional"
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
    [fetchProfessionals, pagination, toast],
  )

  const updateProfessional = useCallback(
    async (
      companyId: string,
      id: string,
      professionalData: Partial<ProfessionalWithDetails>,
    ): Promise<Professional | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await companyProfessionalsApi.updateCompanyProfessional(companyId, id, professionalData)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          })
          return null
        }

        toast({
          title: "Success",
          description: "Professional updated successfully",
        })

        // Refresh the professionals list
        fetchProfessionals(companyId, pagination.currentPage, pagination.itemsPerPage)

        return response.data || null
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update professional"
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
    [fetchProfessionals, pagination, toast],
  )

  const deleteProfessional = useCallback(
    async (companyId: string, id: string): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await companyProfessionalsApi.deleteCompanyProfessional(companyId, id)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          })
          return false
        }

        toast({
          title: "Success",
          description: "Professional deleted successfully",
          variant: "destructive",
        })

        // Refresh the professionals list
        fetchProfessionals(companyId, pagination.currentPage, pagination.itemsPerPage)

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
    [fetchProfessionals, pagination, toast],
  )

  const getProfessionalSchedule = useCallback(
    async (
      companyId: string,
      id: string,
      startDate: string,
      endDate: string,
    ): Promise<{ date: string; appointments: any[] }[] | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await companyProfessionalsApi.getCompanyProfessionalSchedule(companyId, id, startDate, endDate)

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
    [toast],
  )

  const fetchTeams = useCallback(async (companyId: string) => {
    try {
      const response = await companyProfessionalsApi.getCompanyTeams(companyId)

      if (response.error) {
        console.error(response.error)
        return
      }

      if (response.data) {
        setTeams(response.data)
      }
    } catch (err) {
      console.error("Failed to fetch teams:", err)
    }
  }, [])

  const setFilters = useCallback(
    (newFilters: { status?: string; teamId?: string; search?: string }) => {
      const updatedFilters = {
        ...filters,
        ...newFilters,
      }
      setFiltersState(updatedFilters)
    },
    [filters],
  )

  const value = {
    professionals,
    isLoading,
    error,
    pagination,
    filters,
    teams,
    fetchProfessionals,
    getProfessionalById,
    createProfessional,
    updateProfessional,
    deleteProfessional,
    getProfessionalSchedule,
    fetchTeams,
    setFilters,
  }

  return <CompanyProfessionalsContext.Provider value={value}>{children}</CompanyProfessionalsContext.Provider>
}

export function useCompanyProfessionals() {
  const context = useContext(CompanyProfessionalsContext)
  if (context === undefined) {
    throw new Error("useCompanyProfessionals must be used within a CompanyProfessionalsProvider")
  }
  return context
}
