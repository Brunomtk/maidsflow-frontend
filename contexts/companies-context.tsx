"use client"

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react"
import type { Company, CompanyCreateRequest, CompanyUpdateRequest, CompanyFilters } from "@/types"
import { companiesApi } from "@/lib/api/companies"
import { toast } from "sonner"

interface CompaniesContextType {
  companies: Company[]
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
    search: string
  }
  fetchCompanies: (page?: number, limit?: number, status?: string, search?: string) => Promise<void>
  getCompanyById: (id: number) => Promise<Company | null>
  createCompany: (companyData: CompanyCreateRequest) => Promise<Company | null>
  updateCompany: (id: number, companyData: CompanyUpdateRequest) => Promise<Company | null>
  deleteCompany: (id: number) => Promise<boolean>
  updateCompanyStatus: (id: number, status: "active" | "inactive") => Promise<Company | null>
  setFilters: (filters: { status?: string; search?: string }) => void
}

export const CompaniesContext = createContext<CompaniesContextType | undefined>(undefined)

export function CompaniesProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([])
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
    search: "",
  })

  const isLoadingRef = useRef(false)

  const fetchCompanies = useCallback(async (page = 1, limit = 10, status?: string, search?: string) => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      const apiFilters: CompanyFilters = {
        pageNumber: page,
        pageSize: limit,
        searchQuery: search,
      }
      if (status && status !== "all") {
        apiFilters.status = status === "active" ? 1 : 0
      }

      const { data, error: apiError } = await companiesApi.getRecords(apiFilters)

      if (apiError) throw new Error(apiError)

      if (data && data.result) {
        setCompanies(data.result)
        setPagination({
          currentPage: page,
          totalPages: data.pageCount || 1,
          totalItems: 0, // API doesn't provide totalItems
          itemsPerPage: limit,
        })
      } else {
        setCompanies([])
        setPagination({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch companies"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
      isLoadingRef.current = false
    }
  }, [])

  const getCompanyById = useCallback(async (id: number): Promise<Company | null> => {
    setIsLoading(true)
    const { data, error } = await companiesApi.getById(id)
    setIsLoading(false)
    if (error) {
      toast.error(error)
      return null
    }
    return data || null
  }, [])

  const createCompany = useCallback(
    async (companyData: CompanyCreateRequest): Promise<Company | null> => {
      setIsLoading(true)
      const { data, error } = await companiesApi.create(companyData)
      setIsLoading(false)
      if (error) {
        toast.error(error)
        return null
      }
      toast.success("Company created successfully")
      await fetchCompanies(1, pagination.itemsPerPage, "all", "")
      return data || null
    },
    [fetchCompanies, pagination.itemsPerPage],
  )

  const updateCompany = useCallback(
    async (id: number, companyData: CompanyUpdateRequest): Promise<Company | null> => {
      setIsLoading(true)
      const { data, error } = await companiesApi.update(id, companyData)
      setIsLoading(false)
      if (error) {
        toast.error(error)
        return null
      }
      toast.success("Company updated successfully")
      await fetchCompanies(pagination.currentPage, pagination.itemsPerPage, filters.status, filters.search)
      return data || null
    },
    [fetchCompanies, pagination.currentPage, pagination.itemsPerPage, filters],
  )

  const deleteCompany = useCallback(
    async (id: number): Promise<boolean> => {
      setIsLoading(true)
      const { success, error } = await companiesApi.delete(id)
      setIsLoading(false)
      if (error) {
        toast.error(error)
        return false
      }
      toast.success("Company deleted successfully")
      await fetchCompanies(pagination.currentPage, pagination.itemsPerPage, filters.status, filters.search)
      return success || false
    },
    [fetchCompanies, pagination.currentPage, pagination.itemsPerPage, filters],
  )

  const updateCompanyStatus = useCallback(
    async (id: number, status: "active" | "inactive"): Promise<Company | null> => {
      setIsLoading(true)
      const statusValue = status === "active" ? 1 : 0
      const { data, error } = await companiesApi.updateStatus(id, statusValue)
      setIsLoading(false)
      if (error) {
        toast.error(error)
        return null
      }
      toast.success(`Company ${status}d successfully`)
      await fetchCompanies(pagination.currentPage, pagination.itemsPerPage, filters.status, filters.search)
      return data || null
    },
    [fetchCompanies, pagination.currentPage, pagination.itemsPerPage, filters],
  )

  const setFilters = useCallback(
    (newFilters: { status?: string; search?: string }) => {
      const updatedFilters = { ...filters, ...newFilters }
      setFiltersState(updatedFilters)
      fetchCompanies(1, pagination.itemsPerPage, updatedFilters.status, updatedFilters.search)
    },
    [filters, fetchCompanies, pagination.itemsPerPage],
  )

  const value = {
    companies,
    isLoading,
    error,
    pagination,
    filters,
    fetchCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
    updateCompanyStatus,
    setFilters,
  }

  return <CompaniesContext.Provider value={value}>{children}</CompaniesContext.Provider>
}

export function useCompanies() {
  const context = useContext(CompaniesContext)
  if (context === undefined) {
    throw new Error("useCompanies must be used within a CompaniesProvider")
  }
  return context
}
