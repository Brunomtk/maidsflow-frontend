"use client"

import { useState } from "react"
import type { Appointment } from "@/types/appointment"
import {
  getProfessionalHistory,
  getProfessionalHistoryByDateRange,
  getProfessionalHistoryByServiceType,
  getProfessionalHistoryDetails,
  getProfessionalHistoryStatistics,
  exportProfessionalHistory,
  getProfessionalMonthlySummary,
  type HistoryStatistics,
  type MonthlySummary,
} from "@/lib/api/professional-history"
import { useToast } from "./use-toast"

export function useProfessionalHistory() {
  const [history, setHistory] = useState<Appointment[]>([])
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statistics, setStatistics] = useState<HistoryStatistics | null>(null)
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([])
  const { toast } = useToast()

  // Format appointments to have Date objects instead of strings
  const formatAppointment = (appointment: Appointment): Appointment => {
    return {
      ...appointment,
      start: new Date(appointment.start),
      end: new Date(appointment.end),
    } as unknown as Appointment
  }

  const formatAppointments = (appointments: Appointment[]): Appointment[] => {
    return appointments.map(formatAppointment)
  }

  // Fetch all history for the professional
  const fetchHistory = async (filters?: Record<string, any>) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getProfessionalHistory(filters)
      const formattedData = formatAppointments(data)
      setHistory(formattedData)
      return formattedData
    } catch (err) {
      const errorMessage = "Failed to fetch history"
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

  // Fetch history by date range
  const fetchHistoryByDateRange = async (startDate: string, endDate: string, filters?: Record<string, any>) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getProfessionalHistoryByDateRange(startDate, endDate, filters)
      const formattedData = formatAppointments(data)
      setHistory(formattedData)
      return formattedData
    } catch (err) {
      const errorMessage = "Failed to fetch history for date range"
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

  // Fetch history by service type
  const fetchHistoryByServiceType = async (serviceType: string, filters?: Record<string, any>) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getProfessionalHistoryByServiceType(serviceType, filters)
      const formattedData = formatAppointments(data)
      setHistory(formattedData)
      return formattedData
    } catch (err) {
      const errorMessage = "Failed to fetch history for service type"
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

  // Fetch history details by appointment ID
  const fetchHistoryDetails = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getProfessionalHistoryDetails(id)
      const formattedData = formatAppointment(data)
      setCurrentAppointment(formattedData)
      return formattedData
    } catch (err) {
      const errorMessage = "Failed to fetch history details"
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

  // Fetch history statistics
  const fetchHistoryStatistics = async (startDate?: string, endDate?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getProfessionalHistoryStatistics(startDate, endDate)
      setStatistics(data)
      return data
    } catch (err) {
      const errorMessage = "Failed to fetch history statistics"
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

  // Fetch monthly summary
  const fetchMonthlySummary = async (year: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getProfessionalMonthlySummary(year)
      setMonthlySummaries(data)
      return data
    } catch (err) {
      const errorMessage = "Failed to fetch monthly summary"
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

  // Export history to CSV/PDF
  const exportHistory = async (format: "csv" | "pdf", filters?: Record<string, any>) => {
    setIsLoading(true)
    setError(null)
    try {
      const blob = await exportProfessionalHistory(format, filters)
      toast({
        title: "Success",
        description: `History exported as ${format.toUpperCase()} successfully`,
      })
      return blob
    } catch (err) {
      const errorMessage = `Failed to export history as ${format.toUpperCase()}`
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

  return {
    history,
    currentAppointment,
    isLoading,
    error,
    statistics,
    monthlySummaries,
    fetchHistory,
    fetchHistoryByDateRange,
    fetchHistoryByServiceType,
    fetchHistoryDetails,
    fetchHistoryStatistics,
    fetchMonthlySummary,
    exportHistory,
  }
}
