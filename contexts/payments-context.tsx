"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { getPayments, createPayment, updatePayment, deletePayment } from "@/lib/api/payments"
import type { Payment, PaymentFormData, PaymentFilters, PaymentsResponse } from "@/types/payment"
import { toast } from "@/components/ui/use-toast"

interface PaymentsContextType {
  payments: Payment[]
  isLoading: boolean
  error: Error | null
  pagination: Omit<PaymentsResponse, "results">
  filters: PaymentFilters
  selectedPayment: Payment | null
  fetchPayments: () => Promise<void>
  setFilters: (newFilters: Partial<PaymentFilters>) => void
  selectPayment: (payment: Payment | null) => void
  addPayment: (data: PaymentFormData) => Promise<boolean>
  editPayment: (id: number, data: PaymentFormData) => Promise<boolean>
  removePayment: (id: number) => Promise<boolean>
}

const PaymentsContext = createContext<PaymentsContextType | undefined>(undefined)

export const PaymentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFiltersState] = useState<PaymentFilters>({ page: 1, pageSize: 10 })
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [pagination, setPagination] = useState<Omit<PaymentsResponse, "results">>({
    currentPage: 1,
    pageCount: 1,
    pageSize: 10,
    totalItems: 0,
    firstRowOnPage: 0,
    lastRowOnPage: 0,
  })

  const fetchPayments = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getPayments(filters)
      setPayments(response.results || [])
      setPagination({
        currentPage: response.currentPage,
        pageCount: response.pageCount,
        pageSize: response.pageSize,
        totalItems: response.totalItems,
        firstRowOnPage: response.firstRowOnPage,
        lastRowOnPage: response.lastRowOnPage,
      })
    } catch (err) {
      setError(err as Error)
      toast({ title: "Error", description: "Failed to fetch payments.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  const setFilters = (newFilters: Partial<PaymentFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters, page: newFilters.page || 1 }))
  }

  const selectPayment = (payment: Payment | null) => {
    setSelectedPayment(payment)
  }

  const addPayment = async (data: PaymentFormData) => {
    try {
      await createPayment(data)
      toast({ title: "Success", description: "Payment created successfully." })
      await fetchPayments()
      return true
    } catch (err) {
      toast({ title: "Error", description: "Failed to create payment.", variant: "destructive" })
      return false
    }
  }

  const editPayment = async (id: number, data: PaymentFormData) => {
    try {
      await updatePayment(id, data)
      toast({ title: "Success", description: "Payment updated successfully." })
      await fetchPayments()
      return true
    } catch (err) {
      toast({ title: "Error", description: "Failed to update payment.", variant: "destructive" })
      return false
    }
  }

  const removePayment = async (id: number) => {
    try {
      await deletePayment(id)
      toast({ title: "Success", description: "Payment deleted successfully." })
      await fetchPayments()
      return true
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete payment.", variant: "destructive" })
      return false
    }
  }

  const value = {
    payments,
    isLoading,
    error,
    pagination,
    filters,
    selectedPayment,
    fetchPayments,
    setFilters,
    selectPayment,
    addPayment,
    editPayment,
    removePayment,
  }

  return <PaymentsContext.Provider value={value}>{children}</PaymentsContext.Provider>
}

export const usePaymentsContext = () => {
  const context = useContext(PaymentsContext)
  if (context === undefined) {
    throw new Error("usePaymentsContext must be used within a PaymentsProvider")
  }
  return context
}
