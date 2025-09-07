"use client"

import { useState } from "react"
import type { CompanyRecurrence, CompanyRecurrenceFilters } from "@/types/company-recurrence"
import { companyRecurrenceApi } from "@/lib/api/company-recurrence"
import { useToast } from "./use-toast"

export function useCompanyRecurrence(companyId: number) {
  const [recurrences, setRecurrences] = useState<CompanyRecurrence[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CompanyRecurrenceFilters>({})
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageCount: 1,
    pageSize: 10,
    totalItems: 0,
  })
  const { toast } = useToast()

  const fetchRecurrences = async (newFilters?: CompanyRecurrenceFilters): Promise<CompanyRecurrence[]> => {
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
      return response.results
    } catch (err) {
      const errorMessage = "Failed to fetch recurrences"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error(err)
      return []
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

  const fetchCustomers = async (): Promise<any[]> => {
    try {
      const customersList = await companyRecurrenceApi.getCustomers(companyId)
      setCustomers(customersList)
      return customersList
    } catch (err) {
      console.error("Failed to fetch customers:", err)
      return []
    }
  }

  const fetchTeams = async (): Promise<any[]> => {
    try {
      const teamsList = await companyRecurrenceApi.getTeams(companyId)
      setTeams(teamsList)
      return teamsList
    } catch (err) {
      console.error("Failed to fetch teams:", err)
      return []
    }
  }

  const updateFilters = (newFilters: Partial<CompanyRecurrenceFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  // Helper functions
  const getStatusText = (status: number): string => {
    switch (status) {
      case 0:
        return "Inactive"
      case 1:
        return "Active"
      default:
        return "Unknown"
    }
  }

  const getTypeText = (type: number): string => {
    switch (type) {
      case 1:
        return "Regular"
      case 2:
        return "Deep Cleaning"
      case 3:
        return "Specialized"
      default:
        return "Unknown"
    }
  }

  const getFrequencyText = (frequency: number): string => {
    switch (frequency) {
      case 1:
        return "Weekly"
      case 2:
        return "Biweekly"
      case 3:
        return "Monthly"
      case 4:
        return "Quarterly"
      case 5:
        return "Yearly"
      default:
        return "Custom"
    }
  }

  const getDayText = (day: number): string => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[day] || "Unknown"
  }

  return {
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
    updateFilters,
    clearFilters,

    // Helper functions
    getStatusText,
    getTypeText,
    getFrequencyText,
    getDayText,
  }
}
