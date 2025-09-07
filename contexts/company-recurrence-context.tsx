"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { CompanyRecurrence, CompanyRecurrenceFilters } from "@/types/company-recurrence"
import { companyRecurrenceApi } from "@/lib/api/company-recurrence"
import { useToast } from "@/hooks/use-toast"

interface CompanyRecurrenceContextType {
  // State
  recurrences: CompanyRecurrence[]
  customers: any[]
  teams: any[]
  isLoading: boolean
  error: string | null
  filters: CompanyRecurrenceFilters
  pagination: {
    currentPage: number
    pageCount: number
    pageSize: number
    totalItems: number
  }

  // Actions
  fetchRecurrences: (companyId: number, filters?: CompanyRecurrenceFilters) => Promise<void>
  fetchRecurrenceById: (id: number) => Promise<CompanyRecurrence | null>
  createRecurrence: (
    data: Omit<CompanyRecurrence, "id" | "createdDate" | "updatedDate" | "customer" | "team" | "company">,
  ) => Promise<CompanyRecurrence | null>
  updateRecurrence: (id: number, data: Partial<CompanyRecurrence>) => Promise<CompanyRecurrence | null>
  deleteRecurrence: (id: number) => Promise<boolean>
  fetchCustomers: (companyId?: number) => Promise<void>
  fetchTeams: (companyId?: number) => Promise<void>

  // Filters
  setFilters: (filters: Partial<CompanyRecurrenceFilters>) => void
  clearFilters: () => void
}

const CompanyRecurrenceContext = createContext<CompanyRecurrenceContextType | undefined>(undefined)

const defaultFilters: CompanyRecurrenceFilters = {
  status: undefined,
  type: undefined,
  search: undefined,
  companyId: undefined,
  teamId: undefined,
  customerId: undefined,
  startDate: undefined,
  endDate: undefined,
  pageNumber: 1,
  pageSize: 10,
}

export function CompanyRecurrenceProvider({ children }: { children: ReactNode }) {
  const [recurrences, setRecurrences] = useState<CompanyRecurrence[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CompanyRecurrenceFilters>(defaultFilters)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageCount: 1,
    pageSize: 10,
    totalItems: 0,
  })
  const { toast } = useToast()

  const fetchRecurrences = async (companyId: number, newFilters?: CompanyRecurrenceFilters): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const filterParams = { ...filters, ...newFilters, companyId }
      const response = await companyRecurrenceApi.getAll(filterParams)
      setRecurrences(response.results)
      setPagination({
        currentPage: response.currentPage,
        pageCount: response.pageCount,
        pageSize: response.pageSize,
        totalItems: response.totalItems,
      })
    } catch (err) {
      const errorMessage = "Failed to fetch recurrences"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRecurrenceById = async (id: number): Promise<CompanyRecurrence | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const recurrence = await companyRecurrenceApi.getById(id)
      return recurrence
    } catch (err) {
      const errorMessage = "Failed to fetch recurrence details"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const createRecurrence = async (
    data: Omit<CompanyRecurrence, "id" | "createdDate" | "updatedDate" | "customer" | "team" | "company">,
  ): Promise<CompanyRecurrence | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const newRecurrence = await companyRecurrenceApi.create(data)
      setRecurrences((prev) => [newRecurrence, ...prev])
      toast({
        title: "Success",
        description: "Recurrence created successfully",
      })
      return newRecurrence
    } catch (err) {
      const errorMessage = "Failed to create recurrence"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updateRecurrence = async (id: number, data: Partial<CompanyRecurrence>): Promise<CompanyRecurrence | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedRecurrence = await companyRecurrenceApi.update(id, data)
      setRecurrences((prev) => prev.map((recurrence) => (recurrence.id === id ? updatedRecurrence : recurrence)))
      toast({
        title: "Success",
        description: "Recurrence updated successfully",
      })
      return updatedRecurrence
    } catch (err) {
      const errorMessage = "Failed to update recurrence"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const deleteRecurrence = async (id: number): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await companyRecurrenceApi.delete(id)
      setRecurrences((prev) => prev.filter((recurrence) => recurrence.id !== id))
      toast({
        title: "Success",
        description: "Recurrence deleted successfully",
      })
      return true
    } catch (err) {
      const errorMessage = "Failed to delete recurrence"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error(err)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCustomers = async (companyId?: number): Promise<void> => {
    try {
      const customersList = await companyRecurrenceApi.getCustomers(companyId)
      setCustomers(customersList)
    } catch (err) {
      console.error("Failed to fetch customers:", err)
    }
  }

  const fetchTeams = async (companyId?: number): Promise<void> => {
    try {
      const teamsList = await companyRecurrenceApi.getTeams(companyId)
      setTeams(teamsList)
    } catch (err) {
      console.error("Failed to fetch teams:", err)
    }
  }

  const updateFilters = (newFilters: Partial<CompanyRecurrenceFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters(defaultFilters)
  }

  return (
    <CompanyRecurrenceContext.Provider
      value={{
        // State
        recurrences,
        customers,
        teams,
        isLoading,
        error,
        filters,
        pagination,

        // Actions
        fetchRecurrences,
        fetchRecurrenceById,
        createRecurrence,
        updateRecurrence,
        deleteRecurrence,
        fetchCustomers,
        fetchTeams,

        // Filters
        setFilters: updateFilters,
        clearFilters,
      }}
    >
      {children}
    </CompanyRecurrenceContext.Provider>
  )
}

export function useCompanyRecurrenceContext() {
  const context = useContext(CompanyRecurrenceContext)
  if (context === undefined) {
    throw new Error("useCompanyRecurrenceContext must be used within a CompanyRecurrenceProvider")
  }
  return context
}
