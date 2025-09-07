"use client"

import { useCompanyCancellationsContext } from "@/contexts/company-cancellations-context"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import { useEffect, useRef } from "react"
import { RefundStatus, CancelledByRole } from "@/types/cancellation"

export function useCompanyCancellations() {
  const context = useCompanyCancellationsContext()
  const initialLoadRef = useRef(false)

  // Helper function to format dates
  const formatDate = (date: string) => {
    return format(new Date(date), "MM/dd/yyyy 'at' HH:mm", { locale: enUS })
  }

  // Helper function to format short date
  const formatShortDate = (date: string) => {
    return format(new Date(date), "MM/dd/yyyy", { locale: enUS })
  }

  // Helper function to get refund status color
  const getRefundStatusColor = (status: RefundStatus) => {
    switch (status) {
      case RefundStatus.Pending:
        return "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20"
      case RefundStatus.Processed:
        return "bg-green-500/20 text-green-500 hover:bg-green-500/20"
      case RefundStatus.Rejected:
        return "bg-red-500/20 text-red-500 hover:bg-red-500/20"
      case RefundStatus.NotApplicable:
        return "bg-gray-500/20 text-gray-500 hover:bg-gray-500/20"
      default:
        return "bg-gray-500/20 text-gray-500 hover:bg-gray-500/20"
    }
  }

  // Helper function to get refund status label
  const getRefundStatusLabel = (status: RefundStatus) => {
    switch (status) {
      case RefundStatus.Pending:
        return "Pending"
      case RefundStatus.Processed:
        return "Processed"
      case RefundStatus.Rejected:
        return "Rejected"
      case RefundStatus.NotApplicable:
        return "Not Applicable"
      default:
        return "Unknown"
    }
  }

  // Helper function to get cancelled by role label
  const getCancelledByRoleLabel = (role: CancelledByRole) => {
    switch (role) {
      case CancelledByRole.Customer:
        return "Customer"
      case CancelledByRole.Professional:
        return "Professional"
      case CancelledByRole.Company:
        return "Company"
      case CancelledByRole.Admin:
        return "Administrator"
      default:
        return "Unknown"
    }
  }

  // Helper function to update filters
  const updateFilters = (newFilters: Partial<typeof context.filters>) => {
    context.setFilters({ ...context.filters, ...newFilters })
  }

  // Helper function to get cancellation reasons for select
  const getCancellationReasons = () => [
    { value: "Customer was not at location at scheduled time", label: "Customer not at location" },
    { value: "Technical problem with team transportation", label: "Technical transportation issue" },
    { value: "Unfavorable weather conditions", label: "Weather conditions" },
    { value: "Customer request", label: "Customer request" },
    { value: "Professional unavailable", label: "Professional unavailable" },
    { value: "Equipment problems", label: "Equipment problems" },
    { value: "Emergency", label: "Emergency" },
    { value: "Other", label: "Other reason" },
  ]

  // Helper function to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  // Helper function to calculate refund percentage
  const calculateRefundPercentage = () => {
    if (!context.stats || context.stats.total === 0) return 0
    return ((context.stats.processed / context.stats.total) * 100).toFixed(1)
  }

  // Helper function to get customers for select (mock data)
  const getCustomers = () => [
    { value: 1, label: "John Silva" },
    { value: 2, label: "Mary Santos" },
    { value: 3, label: "Peter Oliveira" },
    { value: 4, label: "Anna Costa" },
    { value: 5, label: "Charles Ferreira" },
  ]

  // Helper function to get appointments for select (mock data)
  const getAppointments = () => [
    { value: 1, label: "Appointment #001 - John Silva" },
    { value: 2, label: "Appointment #002 - Mary Santos" },
    { value: 3, label: "Appointment #003 - Peter Oliveira" },
  ]

  // Load initial data
  useEffect(() => {
    if (!initialLoadRef.current) {
      context.fetchCancellations()
      context.fetchStats()
      initialLoadRef.current = true
    }
  }, []) // Empty dependency array to run only once

  useEffect(() => {
    if (initialLoadRef.current) {
      context.fetchCancellations()
      context.fetchStats()
    }
  }, [context.filters])

  return {
    ...context,
    formatDate,
    formatShortDate,
    getRefundStatusColor,
    getRefundStatusLabel,
    getCancelledByRoleLabel,
    updateFilters,
    getCancellationReasons,
    formatCurrency,
    calculateRefundPercentage,
    getCustomers,
    getAppointments,
  }
}
