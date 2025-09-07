"use client"

import { useState, useCallback } from "react"
import type { Company } from "@/types"
import { companiesApi } from "@/lib/api/companies"
import { useToast } from "@/hooks/use-toast"

interface UseCompanyReturn {
  company: Company | null
  isLoading: boolean
  error: string | null
  fetchCompany: (id: string) => Promise<void>
  updateCompany: (data: Partial<Company>) => Promise<boolean>
  deleteCompany: () => Promise<boolean>
  updateStatus: (status: "active" | "inactive") => Promise<boolean>
}

export function useCompany(initialId?: string): UseCompanyReturn {
  const [company, setCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchCompany = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await companiesApi.getCompanyById(id)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          })
          return
        }

        setCompany(response.data || null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch company"
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

  const updateCompany = useCallback(
    async (data: Partial<Company>): Promise<boolean> => {
      if (!company) {
        setError("No company selected")
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await companiesApi.updateCompany(company.id, data)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          })
          return false
        }

        setCompany(response.data || null)
        toast({
          title: "Success",
          description: "Company updated successfully",
        })
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update company"
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
    [company, toast],
  )

  const deleteCompany = useCallback(async (): Promise<boolean> => {
    if (!company) {
      setError("No company selected")
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await companiesApi.deleteCompany(company.id)

      if (response.error) {
        setError(response.error)
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
        return false
      }

      setCompany(null)
      toast({
        title: "Success",
        description: "Company deleted successfully",
        variant: "destructive",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete company"
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
  }, [company, toast])

  const updateStatus = useCallback(
    async (status: "active" | "inactive"): Promise<boolean> => {
      if (!company) {
        setError("No company selected")
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await companiesApi.updateCompanyStatus(company.id, status)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          })
          return false
        }

        setCompany(response.data || null)
        toast({
          title: "Success",
          description: `Company ${status === "active" ? "activated" : "deactivated"} successfully`,
        })
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update company status"
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
    [company, toast],
  )

  // Fetch company if initialId is provided
  if (initialId && !company && !isLoading && !error) {
    fetchCompany(initialId)
  }

  return {
    company,
    isLoading,
    error,
    fetchCompany,
    updateCompany,
    deleteCompany,
    updateStatus,
  }
}
