"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
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
import { useToast } from "@/hooks/use-toast"

interface ProfessionalHistoryContextType {
  history: Appointment[]
  currentAppointment: Appointment | null
  isLoading: boolean
  error: string | null
  statistics: HistoryStatistics | null
  monthlySummaries: MonthlySummary[]
  fetchHistory: (filters?: Record<string, any>) => Promise<void>
  fetchHistoryByDateRange: (startDate: string, endDate: string, filters?: Record<string, any>) => Promise<void>
  fetchHistoryByServiceType: (serviceType: string, filters?: Record<string, any>) => Promise<void>
  fetchHistoryDetails: (id: string) => Promise<Appointment | null>
  fetchHistoryStatistics: (startDate?: string, endDate?: string) => Promise<void>
  fetchMonthlySummary: (year: number) => Promise<void>
  exportHistory: (format: "csv" | "pdf", filters?: Record<string, any>) => Promise<Blob | null>
}

const ProfessionalHistoryContext = createContext<ProfessionalHistoryContextType | undefined>(undefined)

export function ProfessionalHistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<Appointment[]>([])
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
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

  const fetchHistory = async (filters?: Record<string, any>) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getProfessionalHistory(filters)
      const formattedData = formatAppointments(data)
      setHistory(formattedData)
    } catch (err) {
      const errorMessage = "Failed to fetch history"
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

  const fetchHistoryByDateRange = async (startDate: string, endDate: string, filters?: Record<string, any>) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getProfessionalHistoryByDateRange(startDate, endDate, filters)
      const formattedData = formatAppointments(data)
      setHistory(formattedData)
    } catch (err) {
      const errorMessage = "Failed to fetch history for date range"
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

  const fetchHistoryByServiceType = async (serviceType: string, filters?: Record<string, any>) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getProfessionalHistoryByServiceType(serviceType, filters)
      const formattedData = formatAppointments(data)
      setHistory(formattedData)
    } catch (err) {
      const errorMessage = "Failed to fetch history for service type"
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

  const fetchHistoryDetails = async (id: string): Promise<Appointment | null> => {
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

  const fetchHistoryStatistics = async (startDate?: string, endDate?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getProfessionalHistoryStatistics(startDate, endDate)
      setStatistics(data)
    } catch (err) {
      const errorMessage = "Failed to fetch history statistics"
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

  const fetchMonthlySummary = async (year: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getProfessionalMonthlySummary(year)
      setMonthlySummaries(data)
    } catch (err) {
      const errorMessage = "Failed to fetch monthly summary"
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

  const exportHistory = async (format: "csv" | "pdf", filters?: Record<string, any>): Promise<Blob | null> => {
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

  // Initial data fetch
  useEffect(() => {
    fetchHistory()

    // Get current year for monthly summary
    const currentYear = new Date().getFullYear()
    fetchMonthlySummary(currentYear)

    // Get statistics for the last 30 days
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)
    fetchHistoryStatistics(thirtyDaysAgo.toISOString().split("T")[0], today.toISOString().split("T")[0])
  }, [])

  return (
    <ProfessionalHistoryContext.Provider
      value={{
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
      }}
    >
      {children}
    </ProfessionalHistoryContext.Provider>
  )
}

export function useProfessionalHistoryContext() {
  const context = useContext(ProfessionalHistoryContext)
  if (context === undefined) {
    throw new Error("useProfessionalHistoryContext must be used within a ProfessionalHistoryProvider")
  }
  return context
}
