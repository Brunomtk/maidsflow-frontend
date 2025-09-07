"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import type {
  GPSTracking,
  CompanyGPSTrackingFilters,
  GPSTrackingCreateRequest,
  GPSTrackingUpdateRequest,
} from "@/types/gps-tracking"
import {
  getCompanyGpsTrackingRecords,
  getCompanyGpsTrackingRecord,
  createCompanyGpsTrackingRecord,
  updateCompanyGpsTrackingRecord,
  deleteCompanyGpsTrackingRecord,
  getCompanyTeamGpsTrackingRecords,
  getCompanyProfessionalGpsTrackingRecords,
  getCompanyActiveGpsTracking,
  getCompanyInactiveGpsTracking,
  updateCompanyGpsTrackingStatus,
  getCompanyGpsTrackingByStatus,
  searchCompanyGpsTracking,
} from "@/lib/api/company-gps-tracking"

interface CompanyGpsTrackingContextType {
  gpsRecords: GPSTracking[]
  selectedGpsRecord: GPSTracking | null
  isLoading: boolean
  error: string | null
  filters: CompanyGPSTrackingFilters
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  fetchGpsRecords: (companyId: string, filters?: CompanyGPSTrackingFilters) => Promise<void>
  fetchGpsRecord: (companyId: string, id: string) => Promise<void>
  createGpsRecord: (companyId: string, data: Omit<GPSTrackingCreateRequest, "companyId">) => Promise<GPSTracking>
  updateGpsRecord: (
    companyId: string,
    id: string,
    data: Omit<GPSTrackingUpdateRequest, "companyId">,
  ) => Promise<GPSTracking>
  deleteGpsRecord: (companyId: string, id: string) => Promise<void>
  fetchGpsRecordsByTeam: (companyId: string, teamId: string) => Promise<void>
  fetchGpsRecordsByProfessional: (companyId: string, professionalId: string) => Promise<void>
  fetchActiveGpsRecords: (companyId: string) => Promise<void>
  fetchInactiveGpsRecords: (companyId: string) => Promise<void>
  updateGpsStatus: (companyId: string, id: string, status: number) => Promise<GPSTracking>
  fetchGpsRecordsByStatus: (companyId: string, status: number | "all") => Promise<void>
  searchGpsRecords: (companyId: string, query: string) => Promise<void>
  setFilters: (filters: CompanyGPSTrackingFilters) => void
  resetFilters: () => void
  setSelectedGpsRecord: (record: GPSTracking | null) => void
}

const CompanyGpsTrackingContext = createContext<CompanyGpsTrackingContextType | undefined>(undefined)

export function CompanyGpsTrackingProvider({ children }: { children: ReactNode }) {
  const [gpsRecords, setGpsRecords] = useState<GPSTracking[]>([])
  const [selectedGpsRecord, setSelectedGpsRecord] = useState<GPSTracking | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CompanyGPSTrackingFilters>({
    status: "all",
    searchQuery: "",
    pageNumber: 1,
    pageSize: 10,
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })
  const { toast } = useToast()

  const fetchGpsRecords = async (companyId: string, customFilters?: CompanyGPSTrackingFilters) => {
    setIsLoading(true)
    setError(null)
    try {
      const filtersToUse = customFilters || filters
      const data = await getCompanyGpsTrackingRecords(companyId, filtersToUse)
      setGpsRecords(data.data)
      setPagination(data.meta)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch GPS tracking records"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGpsRecord = async (companyId: string, id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCompanyGpsTrackingRecord(companyId, id)
      setSelectedGpsRecord(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to fetch GPS tracking record ${id}`
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createGpsRecord = async (companyId: string, data: Omit<GPSTrackingCreateRequest, "companyId">) => {
    setIsLoading(true)
    setError(null)
    try {
      const newRecord = await createCompanyGpsTrackingRecord(companyId, data)

      // Refresh the list
      await fetchGpsRecords(companyId, filters)

      toast({
        title: "Success",
        description: "GPS tracking record created successfully",
      })

      return newRecord
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create GPS tracking record"
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
  }

  const updateGpsRecord = async (companyId: string, id: string, data: Omit<GPSTrackingUpdateRequest, "companyId">) => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedRecord = await updateCompanyGpsTrackingRecord(companyId, id, data)

      // Update records list
      setGpsRecords((prev) => prev.map((record) => (record.id === Number.parseInt(id) ? updatedRecord : record)))

      // Update selected record if it's the one being edited
      if (selectedGpsRecord && selectedGpsRecord.id === Number.parseInt(id)) {
        setSelectedGpsRecord(updatedRecord)
      }

      toast({
        title: "Success",
        description: "GPS tracking record updated successfully",
      })

      return updatedRecord
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to update GPS tracking record ${id}`
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
  }

  const deleteGpsRecord = async (companyId: string, id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await deleteCompanyGpsTrackingRecord(companyId, id)

      // Remove from records list
      setGpsRecords((prev) => prev.filter((record) => record.id !== Number.parseInt(id)))

      // Clear selected record if it's the one being deleted
      if (selectedGpsRecord && selectedGpsRecord.id === Number.parseInt(id)) {
        setSelectedGpsRecord(null)
      }

      toast({
        title: "Success",
        description: "GPS tracking record deleted successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to delete GPS tracking record ${id}`
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
  }

  const fetchGpsRecordsByTeam = async (companyId: string, teamId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCompanyTeamGpsTrackingRecords(companyId, teamId)
      setGpsRecords(data.data)
      setPagination(data.meta)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to fetch GPS tracking records for team ${teamId}`
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGpsRecordsByProfessional = async (companyId: string, professionalId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCompanyProfessionalGpsTrackingRecords(companyId, professionalId)
      setGpsRecords(data.data)
      setPagination(data.meta)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to fetch GPS tracking records for professional ${professionalId}`
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchActiveGpsRecords = async (companyId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCompanyActiveGpsTracking(companyId)
      setGpsRecords(data.data)
      setPagination(data.meta)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch active GPS tracking records"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchInactiveGpsRecords = async (companyId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCompanyInactiveGpsTracking(companyId)
      setGpsRecords(data.data)
      setPagination(data.meta)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch inactive GPS tracking records"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateGpsStatus = async (companyId: string, id: string, status: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedRecord = await updateCompanyGpsTrackingStatus(companyId, id, status)

      // Update records list
      setGpsRecords((prev) => prev.map((record) => (record.id === Number.parseInt(id) ? updatedRecord : record)))

      // Update selected record if it's the one being edited
      if (selectedGpsRecord && selectedGpsRecord.id === Number.parseInt(id)) {
        setSelectedGpsRecord(updatedRecord)
      }

      const statusText = status === 1 ? "active" : "inactive"
      toast({
        title: "Success",
        description: `GPS tracking status updated to ${statusText}`,
      })

      return updatedRecord
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to update GPS tracking status for ${id}`
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
  }

  const fetchGpsRecordsByStatus = async (companyId: string, status: number | "all") => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCompanyGpsTrackingByStatus(companyId, status)
      setGpsRecords(data.data)
      setPagination(data.meta)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to fetch GPS tracking records with status ${status}`
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const searchGpsRecords = async (companyId: string, query: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await searchCompanyGpsTracking(companyId, query)
      setGpsRecords(data.data)
      setPagination(data.meta)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to search GPS tracking records"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetFilters = () => {
    setFilters({
      status: "all",
      searchQuery: "",
      pageNumber: 1,
      pageSize: 10,
    })
  }

  const value = {
    gpsRecords,
    selectedGpsRecord,
    isLoading,
    error,
    filters,
    pagination,
    fetchGpsRecords,
    fetchGpsRecord,
    createGpsRecord,
    updateGpsRecord,
    deleteGpsRecord,
    fetchGpsRecordsByTeam,
    fetchGpsRecordsByProfessional,
    fetchActiveGpsRecords,
    fetchInactiveGpsRecords,
    updateGpsStatus,
    fetchGpsRecordsByStatus,
    searchGpsRecords,
    setFilters,
    resetFilters,
    setSelectedGpsRecord,
  }

  return <CompanyGpsTrackingContext.Provider value={value}>{children}</CompanyGpsTrackingContext.Provider>
}

export function useCompanyGpsTracking() {
  const context = useContext(CompanyGpsTrackingContext)
  if (context === undefined) {
    throw new Error("useCompanyGpsTracking must be used within a CompanyGpsTrackingProvider")
  }
  return context
}
