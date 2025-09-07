"use client"

import { useCancellationsContext } from "@/contexts/cancellations-context"
import { RefundStatus, CancelledByRole } from "@/types/cancellation"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"

export function useCancellations() {
  const context = useCancellationsContext()

  // Helper function to format dates
  const formatDate = (date: string) => {
    return format(new Date(date), "MM/dd/yyyy 'at' HH:mm", { locale: enUS })
  }

  // Helper function to get refund status color
  const getRefundStatusColor = (status: RefundStatus) => {
    switch (status) {
      case RefundStatus.Pending:
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case RefundStatus.Processed:
        return "text-green-600 bg-green-50 border-green-200"
      case RefundStatus.Rejected:
        return "text-red-600 bg-red-50 border-red-200"
      case RefundStatus.NotApplicable:
        return "text-gray-600 bg-gray-50 border-gray-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
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
        return "Not Applicable"
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

  // Helper function to get cancelled by role color
  const getCancelledByRoleColor = (role: CancelledByRole) => {
    switch (role) {
      case CancelledByRole.Customer:
        return "text-blue-600 bg-blue-50 border-blue-200"
      case CancelledByRole.Professional:
        return "text-purple-600 bg-purple-50 border-purple-200"
      case CancelledByRole.Company:
        return "text-orange-600 bg-orange-50 border-orange-200"
      case CancelledByRole.Admin:
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  // Helper function to update filters
  const updateFilters = (newFilters: Partial<typeof context.filters>) => {
    context.setFilters({ ...context.filters, ...newFilters })
  }

  // Helper function to check if refund can be processed
  const canProcessRefund = (status: RefundStatus) => {
    return status === RefundStatus.Pending
  }

  // Helper function to get refund status options
  const getRefundStatusOptions = () => [
    { value: RefundStatus.Pending, label: "Pending" },
    { value: RefundStatus.Processed, label: "Processed" },
    { value: RefundStatus.Rejected, label: "Rejected" },
    { value: RefundStatus.NotApplicable, label: "Not Applicable" },
  ]

  // Helper function to get cancelled by role options
  const getCancelledByRoleOptions = () => [
    { value: CancelledByRole.Customer, label: "Customer" },
    { value: CancelledByRole.Professional, label: "Professional" },
    { value: CancelledByRole.Company, label: "Company" },
    { value: CancelledByRole.Admin, label: "Administrator" },
  ]

  return {
    ...context,
    formatDate,
    getRefundStatusColor,
    getRefundStatusLabel,
    getCancelledByRoleLabel,
    getCancelledByRoleColor,
    updateFilters,
    canProcessRefund,
    getRefundStatusOptions,
    getCancelledByRoleOptions,
    RefundStatus,
    CancelledByRole,
  }
}
