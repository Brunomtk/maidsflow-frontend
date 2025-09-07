"use client"

import { useState, useEffect, useCallback } from "react"
import type { CheckRecord } from "@/types/check-record"
import {
  getCheckRecords,
  getCheckRecordById,
  createCheckRecord,
  updateCheckRecord,
  deleteCheckRecord,
  performCheckIn,
  performCheckOut,
  type CheckRecordFilters,
} from "@/lib/api/check-records"
import { useToast } from "@/hooks/use-toast"

export const useCheckRecords = (initialFilters?: CheckRecordFilters) => {
  const [records, setRecords] = useState<CheckRecord[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CheckRecordFilters>(initialFilters || {})
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageCount: 1,
    pageSize: 10,
    totalItems: 0,
    firstRowOnPage: 1,
    lastRowOnPage: 10,
  })
  const { toast } = useToast()

  const fetchRecords = useCallback(
    async (customFilters?: CheckRecordFilters): Promise<CheckRecord[]> => {
      setIsLoading(true)
      setError(null)
      try {
        const filtersToUse = customFilters || filters
        const response = await getCheckRecords(filtersToUse)
        setRecords(response.results)
        setPagination({
          currentPage: response.currentPage,
          pageCount: response.pageCount,
          pageSize: response.pageSize,
          totalItems: response.totalItems,
          firstRowOnPage: response.firstRowOnPage,
          lastRowOnPage: response.lastRowOnPage,
        })
        return response.results
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch check records"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [filters, toast],
  )

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const getRecordById = async (id: string): Promise<CheckRecord | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const record = await getCheckRecordById(id)
      return record
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to fetch check record with ID ${id}`
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
  }

  const createRecord = async (
    data: Omit<CheckRecord, "id" | "createdAt" | "updatedAt">,
  ): Promise<CheckRecord | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const newRecord = await createCheckRecord(data)
      setRecords((prev) => [...prev, newRecord])
      toast({
        title: "Success",
        description: "Check record created successfully",
      })
      return newRecord
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create check record"
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
  }

  const updateRecord = async (id: string, data: Partial<CheckRecord>): Promise<CheckRecord | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedRecord = await updateCheckRecord(id, data)
      setRecords((prev) => prev.map((record) => (record.id === id ? updatedRecord : record)))
      toast({
        title: "Success",
        description: "Check record updated successfully",
      })
      return updatedRecord
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to update check record with ID ${id}`
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
  }

  const deleteRecord = async (id: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await deleteCheckRecord(id)
      setRecords((prev) => prev.filter((record) => record.id !== id))
      toast({
        title: "Success",
        description: "Check record deleted successfully",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to delete check record with ID ${id}`
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
  }

  const checkIn = async (
    data: Omit<CheckRecord, "id" | "createdAt" | "updatedAt" | "checkOutTime" | "status">,
  ): Promise<CheckRecord | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const newRecord = await performCheckIn(data)
      setRecords((prev) => [...prev, newRecord])
      toast({
        title: "Success",
        description: "Check-in performed successfully",
      })
      return newRecord
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to perform check-in"
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
  }

  const checkOut = async (id: string): Promise<CheckRecord | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedRecord = await performCheckOut(id)
      setRecords((prev) => prev.map((record) => (record.id === id ? updatedRecord : record)))
      toast({
        title: "Success",
        description: "Check-out performed successfully",
      })
      return updatedRecord
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to perform check-out for record with ID ${id}`
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
  }

  const updateFilters = (newFilters: Partial<CheckRecordFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const resetFilters = () => {
    setFilters({})
  }

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format time for display
  const formatTime = (dateString: string | null): string => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Format status for display
  const formatStatus = (status: string): { label: string; className: string } => {
    switch (status) {
      case "pending":
        return { label: "Pending", className: "bg-gray-500/20 text-gray-500 border-gray-500" }
      case "checked_in":
        return { label: "Checked In", className: "bg-blue-500/20 text-blue-500 border-blue-500" }
      case "checked_out":
        return { label: "Checked Out", className: "bg-green-500/20 text-green-500 border-green-500" }
      default:
        return { label: status, className: "bg-gray-500/20 text-gray-500 border-gray-500" }
    }
  }

  // Format service type for display
  const formatServiceType = (type: string): { label: string; className: string } => {
    switch (type) {
      case "regular":
        return { label: "Regular", className: "bg-blue-400/20 text-blue-400 border-blue-400" }
      case "deep":
        return { label: "Deep", className: "bg-purple-400/20 text-purple-400 border-purple-400" }
      case "specialized":
        return { label: "Specialized", className: "bg-orange-400/20 text-orange-400 border-orange-400" }
      default:
        return { label: type, className: "bg-gray-400/20 text-gray-400 border-gray-400" }
    }
  }

  // Calculate duration between check-in and check-out
  const calculateDuration = (checkInTime: string, checkOutTime: string | null): string => {
    if (!checkInTime || !checkOutTime) return "-"

    const start = new Date(checkInTime)
    const end = new Date(checkOutTime)
    const durationMs = end.getTime() - start.getTime()

    // Convert to hours and minutes
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  // Get check-in records
  const getCheckInRecords = (): CheckRecord[] => {
    return records.filter((record) => record.status === "pending" || record.status === "checked_in")
  }

  // Get check-out records
  const getCheckOutRecords = (): CheckRecord[] => {
    return records.filter((record) => record.status === "checked_in" || record.status === "checked_out")
  }

  // Get check-in stats
  const getCheckInStats = () => {
    const checkInRecords = getCheckInRecords()
    return {
      total: checkInRecords.length,
      pending: checkInRecords.filter((record) => record.status === "pending").length,
      checkedIn: checkInRecords.filter((record) => record.status === "checked_in").length,
    }
  }

  // Get check-out stats
  const getCheckOutStats = () => {
    const checkOutRecords = getCheckOutRecords()
    return {
      total: checkOutRecords.length,
      inProgress: checkOutRecords.filter((record) => record.status === "checked_in").length,
      completed: checkOutRecords.filter((record) => record.status === "checked_out").length,
    }
  }

  return {
    records,
    isLoading,
    error,
    filters,
    pagination, // Added pagination to return object
    fetchRecords,
    getRecordById,
    createRecord,
    updateRecord,
    deleteRecord,
    checkIn,
    checkOut,
    updateFilters,
    resetFilters,
    formatDate,
    formatTime,
    formatStatus,
    formatServiceType,
    calculateDuration,
    getCheckInRecords,
    getCheckOutRecords,
    getCheckInStats,
    getCheckOutStats,
  }
}
