"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useCompanies } from "./use-companies"
import { useCustomers } from "./use-customers"
import { useAppointments } from "./use-appointments"
import { useCheckRecords } from "./use-check-records"
import { usePayments } from "./use-payments"

export interface DashboardStats {
  companies: {
    total: number
    active: number
    inactive: number
    loading: boolean
  }
  customers: {
    total: number
    active: number
    inactive: number
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

export function useDashboard() {
  const [hasInitialized, setHasInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Use existing hooks
  const { companies, loading: companiesLoading, fetchCompanies } = useCompanies()
  const { customersState, fetchCustomers } = useCustomers()
  const { appointments, loading: appointmentsLoading, fetchAppointments } = useAppointments()
  const { records, loading: checkRecordsLoading, fetchRecords } = useCheckRecords()
  const { paymentsState, fetchPayments } = usePayments()

  // Memoized fetch function to prevent multiple calls
  const fetchAllData = useCallback(async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      await Promise.all([
        fetchCompanies(1, 1000),
        fetchCustomers(),
        fetchAppointments({ pageSize: 1000 }),
        fetchRecords({ pageSize: 1000 }),
        fetchPayments({ pageSize: 1000 }),
      ])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchCompanies, fetchCustomers, fetchAppointments, fetchRecords, fetchPayments, isLoading])

  // Initialize data only once
  useEffect(() => {
    if (!hasInitialized) {
      fetchAllData()
      setHasInitialized(true)
    }
  }, [hasInitialized, fetchAllData])

  // Refresh function for manual updates
  const refresh = useCallback(() => {
    setHasInitialized(false)
  }, [])

  // Calculate stats with safety checks
  const stats: DashboardStats = useMemo(() => {
    const companiesArray = companies || []
    const customersArray = customersState?.customers || []
    const appointmentsArray = appointments || []
    const recordsArray = records || []
    const paymentsArray = paymentsState?.payments || []

    return {
      companies: {
        total: companiesArray.length,
        active: companiesArray.filter((c) => c.status === "active" || c.status === 1).length,
        inactive: companiesArray.filter((c) => c.status === "inactive" || c.status === 0).length,
        loading: companiesLoading || false,
      },
      customers: {
        total: customersArray.length,
        active: customersArray.filter((c) => c.status === "active" || c.status === 1).length,
        inactive: customersArray.filter((c) => c.status === "inactive" || c.status === 0).length,
        loading: customersState?.loading || false,
      },
      appointments: {
        total: appointmentsArray.length,
        scheduled: appointmentsArray.filter((a) => a.status === "scheduled" || a.status === 0).length,
        completed: appointmentsArray.filter((a) => a.status === "completed" || a.status === 1).length,
        cancelled: appointmentsArray.filter((a) => a.status === "cancelled" || a.status === 2).length,
        loading: appointmentsLoading || false,
      },
      checkRecords: {
        total: recordsArray.length,
        checkedIn: recordsArray.filter((r) => r.type === "check_in" || r.type === "checkin").length,
        checkedOut: recordsArray.filter((r) => r.type === "check_out" || r.type === "checkout").length,
        loading: checkRecordsLoading || false,
      },
      payments: {
        total: paymentsArray.length,
        paid: paymentsArray.filter((p) => p.status === "paid" || p.status === 1).length,
        pending: paymentsArray.filter((p) => p.status === "pending" || p.status === 0).length,
        overdue: paymentsArray.filter((p) => p.status === "overdue" || p.status === 2).length,
        totalAmount: paymentsArray.reduce((sum, p) => sum + (p.amount || 0), 0),
        loading: paymentsState?.loading || false,
      },
    }
  }, [
    companies,
    companiesLoading,
    customersState,
    appointments,
    appointmentsLoading,
    records,
    checkRecordsLoading,
    paymentsState,
  ])

  return {
    stats,
    isLoading,
    refresh,
  }
}
