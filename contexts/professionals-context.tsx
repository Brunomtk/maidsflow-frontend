"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react"
import type { Professional } from "@/types"
import {
  getProfessionals,
  getProfessionalById,
  createProfessional,
  updateProfessional,
  deleteProfessional,
  type ProfessionalWithDetails,
} from "@/lib/api/professionals"
import { useToast } from "@/hooks/use-toast"

interface ProfessionalsContextType {
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
    company: string
    search: string
  }
  fetchProfessionals: (page?: number) => Promise<void>
  getProfessional: (id: string) => Promise<ProfessionalWithDetails | null>
  addProfessional: (professional: Partial<Professional>) => Promise<Professional | null>
  editProfessional: (id: string, professional: Partial<Professional>) => Promise<Professional | null>
  removeProfessional: (id: string) => Promise<boolean>
  setFilters: (filters: Partial<ProfessionalsContextType["filters"]>) => void
  resetFilters: () => void
}

const ProfessionalsContext = createContext<ProfessionalsContextType | undefined>(undefined)

export function ProfessionalsProvider({ children }: { children: React.ReactNode }) {
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
    company: "all",
    search: "",
  })
  const { toast } = useToast()

  const fetchProfessionals = useCallback(
    async (page = 1) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await getProfessionals(
          page,
          pagination.itemsPerPage,
          filters.status,
          undefined, // teamId
          filters.search,
          filters.company,
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
          setProfessionals(response.data.data)
          setPagination(response.data.meta)
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
    [filters, pagination.itemsPerPage, toast],
  )

  const getProfessional = useCallback(
    async (id: string): Promise<ProfessionalWithDetails | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await getProfessionalById(id)

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

  const addProfessional = useCallback(
    async (professional: Partial<Professional>): Promise<Professional | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await createProfessional(professional as any)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          })
          return null
        }

        if (response.data) {
          toast({
            title: "Success",
            description: response.message || "Professional created successfully",
          })
          // Refresh professionals list
          fetchProfessionals()
          return response.data
        }

        return null
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
    [fetchProfessionals, toast],
  )

  const editProfessional = useCallback(
    async (id: string, professional: Partial<Professional>): Promise<Professional | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await updateProfessional(id, professional as any)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          })
          return null
        }

        if (response.data) {
          toast({
            title: "Success",
            description: response.message || "Professional updated successfully",
          })
          // Refresh professionals list
          fetchProfessionals()
          return response.data
        }

        return null
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
    [fetchProfessionals, toast],
  )

  const removeProfessional = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await deleteProfessional(id)

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
          description: response.message || "Professional deleted successfully",
        })
        // Refresh professionals list
        fetchProfessionals()
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
    [fetchProfessionals, toast],
  )

  const setFilters = useCallback((newFilters: Partial<ProfessionalsContextType["filters"]>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const resetFilters = useCallback(() => {
    setFiltersState({
      status: "all",
      company: "all",
      search: "",
    })
  }, [])

  // Update when filters change
  useEffect(() => {
    fetchProfessionals(1)
  }, [filters])

  // Initial fetch
  useEffect(() => {
    fetchProfessionals()
  }, [])

  const value = useMemo(
    () => ({
      professionals,
      isLoading,
      error,
      pagination,
      filters,
      fetchProfessionals,
      getProfessional,
      addProfessional,
      editProfessional,
      removeProfessional,
      setFilters,
      resetFilters,
    }),
    [
      professionals,
      isLoading,
      error,
      pagination,
      filters,
      fetchProfessionals,
      getProfessional,
      addProfessional,
      editProfessional,
      removeProfessional,
      setFilters,
      resetFilters,
    ],
  )

  return <ProfessionalsContext.Provider value={value}>{children}</ProfessionalsContext.Provider>
}

export function useProfessionals() {
  const context = useContext(ProfessionalsContext)
  if (context === undefined) {
    throw new Error("useProfessionals must be used within a ProfessionalsProvider")
  }
  return context
}
