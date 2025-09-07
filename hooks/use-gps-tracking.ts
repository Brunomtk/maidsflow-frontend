"use client"

import { useState, useEffect } from "react"
import type { GPSTracking, GPSTrackingFilters } from "@/types/gps-tracking"
import { gpsTrackingApi } from "@/lib/api/gps-tracking"

export function useGpsTracking(initialFilters?: GPSTrackingFilters) {
  const [gpsRecords, setGpsRecords] = useState<GPSTracking[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })
  const [filters, setFilters] = useState<GPSTrackingFilters>(
    initialFilters || {
      status: "all",
      searchQuery: "",
      pageNumber: 1,
      pageSize: 10,
    },
  )

  const fetchGpsRecords = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: response, error: apiError } = await gpsTrackingApi.getRecords(filters)

      if (apiError) {
        throw new Error(apiError)
      }

      if (response) {
        setGpsRecords(response.data)
        setPagination(response.meta)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch GPS tracking records"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGpsRecords()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const updateFilters = (newFilters: Partial<GPSTrackingFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const resetFilters = () => {
    setFilters({
      status: "all",
      searchQuery: "",
      pageNumber: 1,
      pageSize: 10,
    })
  }

  // Helper function to format status for display
  const formatStatus = (status: number) => {
    return status === 1 ? "Active" : "Inactive"
  }

  // Helper function to get status color
  const getStatusColor = (status: number) => {
    return status === 1 ? "green" : "red"
  }

  // Helper function to convert status string to number
  const convertStatusToNumber = (status: string | number) => {
    if (typeof status === "number") return status
    if (status === "active") return 1
    if (status === "inactive") return 2
    return 1 // default to active
  }

  // Helper function to convert status number to string
  const convertStatusToString = (status: number) => {
    return status === 1 ? "active" : "inactive"
  }

  return {
    gpsRecords,
    isLoading,
    error,
    filters,
    pagination,
    updateFilters,
    resetFilters,
    refreshData: fetchGpsRecords,
    formatStatus,
    getStatusColor,
    convertStatusToNumber,
    convertStatusToString,
  }
}
