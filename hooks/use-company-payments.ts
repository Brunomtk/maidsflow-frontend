"use client"

import { useCompanyPaymentsContext } from "@/contexts/company-payments-context"
import { useCallback, useState } from "react"

export function useCompanyPayments() {
  const context = useCompanyPaymentsContext()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Format date for display
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "N/A"
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString))
  }, [])

  // Format currency for display
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }, [])

  // Get status color for UI
  const getStatusColor = useCallback((status: number) => {
    switch (status) {
      case 1: // Paid
        return "border-green-500 text-green-500"
      case 0: // Pending
        return "border-amber-500 text-amber-500"
      case 2: // Overdue
        return "border-red-500 text-red-500"
      case 3: // Cancelled
        return "border-gray-500 text-gray-500"
      default:
        return "border-gray-500 text-gray-500"
    }
  }, [])

  // Get status badge color for UI
  const getStatusBadgeColor = useCallback((status: number) => {
    switch (status) {
      case 1: // Paid
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case 0: // Pending
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case 2: // Overdue
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case 3: // Cancelled
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }, [])

  // Get status label for display
  const getStatusLabel = useCallback((status: number) => {
    switch (status) {
      case 1:
        return "Pago"
      case 0:
        return "Pendente"
      case 2:
        return "Vencido"
      case 3:
        return "Cancelado"
      default:
        return "Desconhecido"
    }
  }, [])

  // Get payment method label for display
  const getMethodLabel = useCallback((method?: number) => {
    if (method === undefined) return "N/A"

    switch (method) {
      case 0:
        return "Cartão de Crédito"
      case 1:
        return "Cartão de Débito"
      case 2:
        return "Transferência Bancária"
      case 3:
        return "PIX"
      default:
        return "Desconhecido"
    }
  }, [])

  // Check if a payment is overdue
  const isOverdue = useCallback((payment: any) => {
    if (payment.status === 1 || payment.status === 3) return false // Paid or Cancelled

    const dueDate = new Date(payment.dueDate)
    const today = new Date()

    return dueDate < today
  }, [])

  // Filter payments based on search term and status
  const filteredPayments = context.payments.filter((payment) => {
    const matchesSearch =
      searchTerm === "" ||
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.planName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.companyName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || payment.status.toString() === statusFilter

    return matchesSearch && matchesStatus
  })

  const refreshPayments = useCallback(() => {
    context.fetchPayments()
  }, [context])

  return {
    ...context,
    payments: filteredPayments,
    loading: context.isLoading,
    error: context.error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    refreshPayments,
    formatDate,
    formatCurrency,
    getStatusColor,
    getStatusBadgeColor,
    getStatusLabel,
    getMethodLabel,
    isOverdue,
  }
}
