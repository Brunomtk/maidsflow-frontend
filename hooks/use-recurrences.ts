"use client"

import { useState, useEffect, useCallback } from "react"
import { recurrencesApi } from "@/lib/api/recurrences"
import type { Recurrence, RecurrenceFilters } from "@/types/recurrence"

interface UseRecurrencesReturn {
  recurrences: Recurrence[]
  loading: boolean
  selectedRecurrence: Recurrence | null
  filters: {
    searchQuery: string
    status: string
    type: string
    companyId: string
  }
  pagination: {
    currentPage: number
    totalPages: number
    pageSize: number
    totalItems: number
  }
  companies: any[]
  customers: any[]
  teams: any[]
  loadingDropdowns: boolean
  handleSearch: (query: string) => void
  handleStatusFilter: (status: string) => void
  handleTypeFilter: (type: string) => void
  handleCompanyFilter: (companyId: string) => void
  addRecurrence: (data: any) => Promise<void>
  editRecurrence: (id: number, data: any) => Promise<void>
  removeRecurrence: (id: number) => Promise<void>
  selectRecurrence: (recurrence: Recurrence | null) => void
  setPage: (page: number) => void
  refreshData: () => Promise<void>
}

export function useRecurrences(): UseRecurrencesReturn {
  const [recurrences, setRecurrences] = useState<Recurrence[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecurrence, setSelectedRecurrence] = useState<Recurrence | null>(null)
  const [companies, setCompanies] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loadingDropdowns, setLoadingDropdowns] = useState(false)

  const [filters, setFilters] = useState({
    searchQuery: "",
    status: "all",
    type: "all",
    companyId: "all",
  })

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0,
  })

  // Load recurrences data
  const loadRecurrences = useCallback(async () => {
    setLoading(true)
    try {
      const apiFilters: RecurrenceFilters = {
        pageNumber: pagination.currentPage,
        pageSize: pagination.pageSize,
      }

      if (filters.searchQuery.trim()) {
        apiFilters.search = filters.searchQuery.trim()
      }

      if (filters.status !== "all") {
        apiFilters.status = filters.status === "active" ? "1" : "0"
      }

      if (filters.type !== "all") {
        switch (filters.type) {
          case "regular":
            apiFilters.type = "1"
            break
          case "deep":
            apiFilters.type = "2"
            break
          case "specialized":
            apiFilters.type = "3"
            break
        }
      }

      if (filters.companyId !== "all") {
        apiFilters.companyId = Number.parseInt(filters.companyId)
      }

      console.log("Loading recurrences with filters:", apiFilters)
      const response = await recurrencesApi.getAll(apiFilters)

      setRecurrences(response.results)
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.pageCount,
        pageSize: response.pageSize,
        totalItems: response.totalItems,
      })
    } catch (error) {
      console.error("Failed to load recurrences:", error)
      setRecurrences([])
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.currentPage, pagination.pageSize])

  // Load dropdown data
  const loadDropdownData = useCallback(async () => {
    setLoadingDropdowns(true)
    try {
      const [companiesResult, customersResult, teamsResult] = await Promise.allSettled([
        recurrencesApi.getCompanies(),
        recurrencesApi.getCustomers(),
        recurrencesApi.getTeams(),
      ])

      if (companiesResult.status === "fulfilled") {
        setCompanies(companiesResult.value)
      }

      if (customersResult.status === "fulfilled") {
        setCustomers(customersResult.value)
      }

      if (teamsResult.status === "fulfilled") {
        setTeams(teamsResult.value)
      }
    } catch (error) {
      console.error("Failed to load dropdown data:", error)
    } finally {
      setLoadingDropdowns(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadRecurrences()
  }, [loadRecurrences])

  useEffect(() => {
    loadDropdownData()
  }, [loadDropdownData])

  // Filter handlers
  const handleSearch = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }))
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }, [])

  const handleStatusFilter = useCallback((status: string) => {
    setFilters((prev) => ({ ...prev, status }))
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }, [])

  const handleTypeFilter = useCallback((type: string) => {
    setFilters((prev) => ({ ...prev, type }))
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }, [])

  const handleCompanyFilter = useCallback((companyId: string) => {
    setFilters((prev) => ({ ...prev, companyId }))
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }, [])

  // CRUD operations
  const addRecurrence = useCallback(
    async (data: any) => {
      try {
        console.log("Adding recurrence:", data)
        await recurrencesApi.create(data)
        await loadRecurrences()
      } catch (error) {
        console.error("Failed to add recurrence:", error)
        throw error
      }
    },
    [loadRecurrences],
  )

  const editRecurrence = useCallback(
    async (id: number, data: any) => {
      try {
        console.log("Editing recurrence:", id, data)
        await recurrencesApi.update(id, data)
        await loadRecurrences()
      } catch (error) {
        console.error("Failed to edit recurrence:", error)
        throw error
      }
    },
    [loadRecurrences],
  )

  const removeRecurrence = useCallback(
    async (id: number) => {
      try {
        console.log("Removing recurrence:", id)
        await recurrencesApi.delete(id)
        await loadRecurrences()
      } catch (error) {
        console.error("Failed to remove recurrence:", error)
        throw error
      }
    },
    [loadRecurrences],
  )

  const selectRecurrence = useCallback((recurrence: Recurrence | null) => {
    setSelectedRecurrence(recurrence)
  }, [])

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }))
  }, [])

  const refreshData = useCallback(async () => {
    await Promise.all([loadRecurrences(), loadDropdownData()])
  }, [loadRecurrences, loadDropdownData])

  return {
    recurrences,
    loading,
    selectedRecurrence,
    filters,
    pagination,
    companies,
    customers,
    teams,
    loadingDropdowns,
    handleSearch,
    handleStatusFilter,
    handleTypeFilter,
    handleCompanyFilter,
    addRecurrence,
    editRecurrence,
    removeRecurrence,
    selectRecurrence,
    setPage,
    refreshData,
  }
}
