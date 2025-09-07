"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
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

interface CheckRecordsContextType {
  records: CheckRecord[]
  isLoading: boolean
  error: string | null
  filters: CheckRecordFilters
  fetchRecords: (filters?: CheckRecordFilters) => Promise<CheckRecord[]>
  getRecordById: (id: string) => Promise<CheckRecord | null>
  createRecord: (data: Omit<CheckRecord, "id" | "createdAt" | "updatedAt">) => Promise<CheckRecord | null>
  updateRecord: (id: string, data: Partial<CheckRecord>) => Promise<CheckRecord | null>
  deleteRecord: (id: string) => Promise<boolean>
  checkIn: (
    data: Omit<CheckRecord, "id" | "createdAt" | "updatedAt" | "checkOutTime" | "status">,
  ) => Promise<CheckRecord | null>
  checkOut: (id: string) => Promise<CheckRecord | null>
  updateFilters: (newFilters: Partial<CheckRecordFilters>) => void
  resetFilters: () => void
  formatStatus: (status: string) => { label: string; className: string }
  formatServiceType: (type: string) => { label: string; className: string }
  calculateDuration: (checkInTime: string, checkOutTime: string | null) => string
}

const CheckRecordsContext = createContext<CheckRecordsContextType | undefined>(undefined)

export const useCheckRecordsContext = () => {
  const context = useContext(CheckRecordsContext)
  if (!context) {
    throw new Error("useCheckRecordsContext must be used within a CheckRecordsProvider")
  }
  return context
}

interface CheckRecordsProviderProps {
  children: ReactNode
  initialFilters?: CheckRecordFilters
}

export const CheckRecordsProvider = ({ children, initialFilters = {} }: CheckRecordsProviderProps) => {
  const [records, setRecords] = useState<CheckRecord[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CheckRecordFilters>(initialFilters)
  const { toast } = useToast()

  const fetchRecords = async (customFilters?: CheckRecordFilters): Promise<CheckRecord[]> => {
    setIsLoading(true)
    setError(null)
    try {
      const filtersToUse = customFilters || filters
      const data = await getCheckRecords(filtersToUse)
      setRecords(data)
      return data
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
  }

  useEffect(() => {
    fetchRecords()
  }, [filters])

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

  const value: CheckRecordsContextType = {
    records,
    isLoading,
    error,
    filters,
    fetchRecords,
    getRecordById,
    createRecord,
    updateRecord,
    deleteRecord,
    checkIn,
    checkOut,
    updateFilters,
    resetFilters,
    formatStatus,
    formatServiceType,
    calculateDuration,
  }

  return <CheckRecordsContext.Provider value={value}>{children}</CheckRecordsContext.Provider>
}
