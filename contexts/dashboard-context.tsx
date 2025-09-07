"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import { getApiUrl } from "@/lib/api/utils"

interface DashboardStats {
  companies: {
    total: number
    active: number
    loading: boolean
  }
  customers: {
    total: number
    active: number
    loading: boolean
  }
  appointments: {
    total: number
    scheduled: number
    completed: number
    cancelled: number
    loading: boolean
  }
  checkRecords: {
    total: number
    checkedIn: number
    checkedOut: number
    loading: boolean
  }
  payments: {
    total: number
    paid: number
    pending: number
    overdue: number
    totalAmount: number
    loading: boolean
  }
}

interface DashboardContextType {
  stats: DashboardStats
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export const useDashboardContext = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error("useDashboardContext must be used within a DashboardProvider")
  }
  return context
}

interface DashboardProviderProps {
  children: ReactNode
}

export const DashboardProvider = ({ children }: DashboardProviderProps) => {
  const [stats, setStats] = useState<DashboardStats>({
    companies: { total: 0, active: 0, loading: true },
    customers: { total: 0, active: 0, loading: true },
    appointments: { total: 0, scheduled: 0, completed: 0, cancelled: 0, loading: true },
    checkRecords: { total: 0, checkedIn: 0, checkedOut: 0, loading: true },
    payments: { total: 0, paid: 0, pending: 0, overdue: 0, totalAmount: 0, loading: true },
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Helper function to get auth token
  const getAuthToken = (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("noah_token")
    }
    return null
  }

  // Helper function to create headers
  const createHeaders = (): HeadersInit => {
    const token = getAuthToken()
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // Helper function to make API calls
  const apiCall = async (endpoint: string) => {
    const baseUrl = getApiUrl()
    const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  const fetchStats = async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log("Fetching dashboard stats from API...")

      // Fetch real data from API endpoints
      const [companiesData, customersData, appointmentsData, paymentsData] = await Promise.allSettled([
        apiCall("/Companies").catch(() => ({ results: [] })),
        apiCall("/Customer").catch(() => ({ results: [] })),
        apiCall("/Appointment").catch(() => ({ results: [] })),
        apiCall("/Payments").catch(() => ({ results: [] })),
      ])

      // Process companies data
      const companies = companiesData.status === "fulfilled" ? companiesData.value : { results: [] }
      const companiesArray = companies.results || companies.result || companies.data || companies || []
      const companiesTotal = Array.isArray(companiesArray) ? companiesArray.length : 0
      const companiesActive = Array.isArray(companiesArray)
        ? companiesArray.filter((c: any) => c.status === 1 || c.status === "Active").length
        : 0

      // Process customers data
      const customers = customersData.status === "fulfilled" ? customersData.value : { results: [] }
      const customersArray = customers.results || customers.result || customers.data || customers || []
      const customersTotal = Array.isArray(customersArray) ? customersArray.length : 0
      const customersActive = Array.isArray(customersArray)
        ? customersArray.filter((c: any) => c.status === 1 || c.status === "Active").length
        : 0

      // Process appointments data
      const appointments = appointmentsData.status === "fulfilled" ? appointmentsData.value : { results: [] }
      const appointmentsArray = appointments.results || appointments.result || appointments.data || appointments || []
      const appointmentsTotal = Array.isArray(appointmentsArray) ? appointmentsArray.length : 0
      const appointmentsScheduled = Array.isArray(appointmentsArray)
        ? appointmentsArray.filter((a: any) => a.status === "Scheduled" || a.status === 1).length
        : 0
      const appointmentsCompleted = Array.isArray(appointmentsArray)
        ? appointmentsArray.filter((a: any) => a.status === "Completed" || a.status === 2).length
        : 0
      const appointmentsCancelled = Array.isArray(appointmentsArray)
        ? appointmentsArray.filter((a: any) => a.status === "Cancelled" || a.status === 0).length
        : 0

      // Process check records data - removed unfiltered call
      const checkRecordsTotal = 0
      const checkRecordsCheckedIn = 0
      const checkRecordsCheckedOut = 0

      // Process payments data
      const payments = paymentsData.status === "fulfilled" ? paymentsData.value : { results: [] }
      const paymentsArray = payments.results || payments.result || payments.data || payments || []
      const paymentsTotal = Array.isArray(paymentsArray) ? paymentsArray.length : 0
      const paymentsPaid = Array.isArray(paymentsArray)
        ? paymentsArray.filter((p: any) => p.status === "Paid" || p.status === 1).length
        : 0
      const paymentsPending = Array.isArray(paymentsArray)
        ? paymentsArray.filter((p: any) => p.status === "Pending" || p.status === 0).length
        : 0
      const paymentsOverdue = Array.isArray(paymentsArray)
        ? paymentsArray.filter((p: any) => p.status === "Overdue" || p.status === 2).length
        : 0
      const paymentsTotalAmount = Array.isArray(paymentsArray)
        ? paymentsArray.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0)
        : 0

      const realStats: DashboardStats = {
        companies: { total: companiesTotal, active: companiesActive, loading: false },
        customers: { total: customersTotal, active: customersActive, loading: false },
        appointments: {
          total: appointmentsTotal,
          scheduled: appointmentsScheduled,
          completed: appointmentsCompleted,
          cancelled: appointmentsCancelled,
          loading: false,
        },
        checkRecords: {
          total: checkRecordsTotal,
          checkedIn: checkRecordsCheckedIn,
          checkedOut: checkRecordsCheckedOut,
          loading: false,
        },
        payments: {
          total: paymentsTotal,
          paid: paymentsPaid,
          pending: paymentsPending,
          overdue: paymentsOverdue,
          totalAmount: paymentsTotalAmount,
          loading: false,
        },
      }

      setStats(realStats)
      console.log("Dashboard stats loaded from API:", realStats)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch dashboard stats"
      console.error("Dashboard stats error:", errorMessage)
      setError(errorMessage)

      // Set loading to false for all stats on error
      setStats((prev) => ({
        companies: { ...prev.companies, loading: false },
        customers: { ...prev.customers, loading: false },
        appointments: { ...prev.appointments, loading: false },
        checkRecords: { ...prev.checkRecords, loading: false },
        payments: { ...prev.payments, loading: false },
      }))

      toast({
        title: "Warning",
        description: "Failed to load some dashboard data. Showing available information.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refresh = async () => {
    await fetchStats()
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const value: DashboardContextType = {
    stats,
    isLoading,
    error,
    refresh,
  }

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}
