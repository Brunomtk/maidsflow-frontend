import { usePaymentsContext } from "@/contexts/payments-context"
import type { Payment, PaymentFilters } from "@/types/payment"
import { format } from "date-fns"

export const usePayments = () => {
  const context = usePaymentsContext()

  // Format date for display
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A"
    return format(new Date(dateString), "PPP")
  }

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  // Get status color for UI
  const getStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case 1: // Paid
        return "bg-green-100 text-green-800 border-green-300"
      case 0: // Pending
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case 2: // Overdue
        return "bg-red-100 text-red-800 border-red-300"
      case 3: // Cancelled
        return "bg-gray-100 text-gray-800 border-gray-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Get status label for display
  const getStatusLabel = (status: Payment["status"]) => {
    switch (status) {
      case 1:
        return "Paid"
      case 0:
        return "Pending"
      case 2:
        return "Overdue"
      case 3:
        return "Cancelled"
      default:
        return "Unknown"
    }
  }

  // Get payment method label for display
  const getMethodLabel = (method?: Payment["method"]) => {
    if (method === undefined || method === null) return "N/A"

    switch (method) {
      case 0:
        return "Credit Card"
      case 1:
        return "Debit Card"
      case 2:
        return "Bank Transfer"
      case 3:
        return "PIX"
      default:
        return "Unknown"
    }
  }

  // Check if a payment is overdue
  const isOverdue = (payment: Payment) => {
    if (payment.status === 1 || payment.status === 3) return false // Paid or Cancelled

    const dueDate = new Date(payment.dueDate)
    const today = new Date()

    return dueDate < today
  }

  // Update filters and fetch payments
  const updateFilters = (newFilters: Partial<PaymentFilters>) => {
    const updatedFilters = { ...context.filters, ...newFilters, page: 1 }
    context.setFilters(updatedFilters)
    context.fetchPayments(updatedFilters)
  }

  // Change page
  const changePage = (page: number) => {
    const updatedFilters = { ...context.filters, page }
    context.setFilters(updatedFilters)
    context.fetchPayments(updatedFilters)
  }

  return {
    ...context,
    formatDate,
    formatCurrency,
    getStatusColor,
    getStatusLabel,
    getMethodLabel,
    isOverdue,
    updateFilters,
    changePage,
  }
}
