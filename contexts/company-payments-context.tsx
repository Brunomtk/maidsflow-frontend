"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Payment, PaymentFormData, PaymentFilters } from "@/types/payment"
import { toast } from "@/hooks/use-toast"
import * as paymentsApi from "@/lib/api/payments"

interface CompanyPaymentsContextType {
  payments: Payment[]
  isLoading: boolean
  error: Error | null
  filters: PaymentFilters & { companyId: number }
  selectedPayment: Payment | null
  statistics: {
    totalAmount: number
    pendingAmount: number
    overdueAmount: number
    completedAmount: number
    pendingCount: number
    overdueCount: number
    completedCount: number
  } | null

  // CRUD operations
  fetchPayments: (filters?: Omit<PaymentFilters, "companyId">) => Promise<void>
  fetchPaymentById: (id: number) => Promise<Payment | null>
  addPayment: (paymentData: Omit<PaymentFormData, "companyId">) => Promise<Payment>
  editPayment: (id: number, paymentData: Partial<PaymentFormData>) => Promise<Payment>
  deletePayment: (id: number) => Promise<void>

  // Status operations
  markAsPaid: (id: number, paymentDate?: string) => Promise<Payment>
  markAsOverdue: (id: number) => Promise<Payment>
  markAsCancelled: (id: number) => Promise<Payment>

  // Filter operations
  setFilters: (newFilters: Omit<PaymentFilters, "companyId">) => void
  resetFilters: () => void

  // Selection operations
  selectPayment: (payment: Payment | null) => void

  // Specialized fetching
  fetchPaymentsByStatus: (status: 0 | 1 | 2 | 3) => Promise<void>
  fetchPaymentsByDateRange: (startDate: string, endDate: string) => Promise<void>
  fetchPaymentsByPlan: (planId: number) => Promise<void>

  // Statistics
  fetchPaymentStatistics: () => Promise<void>
}

const CompanyPaymentsContext = createContext<CompanyPaymentsContextType | undefined>(undefined)

export const CompanyPaymentsProvider: React.FC<{ children: ReactNode; companyId: number }> = ({
  children,
  companyId,
}) => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<PaymentFilters & { companyId: number }>({ companyId })
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [statistics, setStatistics] = useState<{
    totalAmount: number
    pendingAmount: number
    overdueAmount: number
    completedAmount: number
    pendingCount: number
    overdueCount: number
    completedCount: number
  } | null>(null)

  // Fetch payments with optional filters
  const fetchPayments = async (newFilters?: Omit<PaymentFilters, "companyId">) => {
    setIsLoading(true)
    setError(null)

    try {
      const filterParams = {
        companyId,
        pageSize: 100,
        ...newFilters,
      }

      const response = await paymentsApi.getPayments(filterParams)
      setPayments(response.results || [])

      if (newFilters) {
        setFilters({ ...newFilters, companyId })
      }

      await fetchPaymentStatistics()
    } catch (err) {
      setError(err as Error)
      toast({
        title: "Error",
        description: `Failed to fetch payments: ${(err as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch a single payment by ID
  const fetchPaymentById = async (id: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const payment = await paymentsApi.getPaymentById(id)
      return payment || null
    } catch (err) {
      setError(err as Error)
      toast({
        title: "Error",
        description: `Failed to fetch payment: ${(err as Error).message}`,
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Add a new payment
  const addPayment = async (paymentData: Omit<PaymentFormData, "companyId">) => {
    setIsLoading(true)
    setError(null)

    try {
      const newPayment = await paymentsApi.createPayment({
        ...paymentData,
        companyId,
      })

      setPayments((prev) => [newPayment, ...prev])
      await fetchPaymentStatistics()

      toast({
        title: "Success",
        description: "Payment created successfully",
      })

      return newPayment
    } catch (err) {
      setError(err as Error)
      toast({
        title: "Error",
        description: `Failed to create payment: ${(err as Error).message}`,
        variant: "destructive",
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Edit an existing payment
  const editPayment = async (id: number, paymentData: Partial<PaymentFormData>) => {
    setIsLoading(true)
    setError(null)

    try {
      const updatedPayment = await paymentsApi.updatePayment(id, paymentData)

      setPayments((prev) => prev.map((p) => (p.id === id ? updatedPayment : p)))
      await fetchPaymentStatistics()

      toast({
        title: "Success",
        description: "Payment updated successfully",
      })

      return updatedPayment
    } catch (err) {
      setError(err as Error)
      toast({
        title: "Error",
        description: `Failed to update payment: ${(err as Error).message}`,
        variant: "destructive",
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a payment
  const deletePayment = async (id: number) => {
    setIsLoading(true)
    setError(null)

    try {
      await paymentsApi.deletePayment(id)

      setPayments((prev) => prev.filter((p) => p.id !== id))
      await fetchPaymentStatistics()

      toast({
        title: "Success",
        description: "Payment deleted successfully",
      })
    } catch (err) {
      setError(err as Error)
      toast({
        title: "Error",
        description: `Failed to delete payment: ${(err as Error).message}`,
        variant: "destructive",
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Mark a payment as paid
  const markAsPaid = async (id: number, paymentDate?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const updatedPayment = await paymentsApi.updatePaymentStatus(id, {
        status: 1,
        paymentDate: paymentDate || new Date().toISOString(),
      })

      setPayments((prev) => prev.map((p) => (p.id === id ? updatedPayment : p)))
      await fetchPaymentStatistics()

      toast({
        title: "Success",
        description: "Payment marked as paid",
      })

      return updatedPayment
    } catch (err) {
      setError(err as Error)
      toast({
        title: "Error",
        description: `Failed to mark payment as paid: ${(err as Error).message}`,
        variant: "destructive",
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Mark a payment as overdue
  const markAsOverdue = async (id: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const updatedPayment = await paymentsApi.updatePaymentStatus(id, {
        status: 2,
      })

      setPayments((prev) => prev.map((p) => (p.id === id ? updatedPayment : p)))
      await fetchPaymentStatistics()

      toast({
        title: "Success",
        description: "Payment marked as overdue",
      })

      return updatedPayment
    } catch (err) {
      setError(err as Error)
      toast({
        title: "Error",
        description: `Failed to mark payment as overdue: ${(err as Error).message}`,
        variant: "destructive",
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Mark a payment as cancelled
  const markAsCancelled = async (id: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const updatedPayment = await paymentsApi.updatePaymentStatus(id, {
        status: 3,
      })

      setPayments((prev) => prev.map((p) => (p.id === id ? updatedPayment : p)))
      await fetchPaymentStatistics()

      toast({
        title: "Success",
        description: "Payment cancelled",
      })

      return updatedPayment
    } catch (err) {
      setError(err as Error)
      toast({
        title: "Error",
        description: `Failed to cancel payment: ${(err as Error).message}`,
        variant: "destructive",
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({ companyId })
    fetchPayments({})
  }

  // Select a payment
  const selectPayment = (payment: Payment | null) => {
    setSelectedPayment(payment)
  }

  // Fetch payments by status
  const fetchPaymentsByStatus = async (status: 0 | 1 | 2 | 3) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await paymentsApi.getPayments({
        companyId,
        status,
        pageSize: 100,
      })

      setPayments(response.results || [])
      setFilters((prev) => ({ ...prev, status }))
    } catch (err) {
      setError(err as Error)
      toast({
        title: "Error",
        description: `Failed to fetch payments by status: ${(err as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch payments by date range
  const fetchPaymentsByDateRange = async (startDate: string, endDate: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await paymentsApi.getPayments({
        companyId,
        startDate,
        endDate,
        pageSize: 100,
      })

      setPayments(response.results || [])
      setFilters((prev) => ({ ...prev, startDate, endDate }))
    } catch (err) {
      setError(err as Error)
      toast({
        title: "Error",
        description: `Failed to fetch payments by date range: ${(err as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch payments by plan
  const fetchPaymentsByPlan = async (planId: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await paymentsApi.getPayments({
        companyId,
        planId,
        pageSize: 100,
      })

      setPayments(response.results || [])
      setFilters((prev) => ({ ...prev, planId }))
    } catch (err) {
      setError(err as Error)
      toast({
        title: "Error",
        description: `Failed to fetch payments by plan: ${(err as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch payment statistics
  const fetchPaymentStatistics = async () => {
    try {
      const companyPayments =
        payments.length > 0 ? payments : await paymentsApi.getPayments({ companyId }).then((res) => res.results || [])

      let totalAmount = 0
      let pendingAmount = 0
      let overdueAmount = 0
      let completedAmount = 0
      let pendingCount = 0
      let overdueCount = 0
      let completedCount = 0

      companyPayments.forEach((payment) => {
        totalAmount += payment.amount || 0

        if (payment.status === 0) {
          // Pending
          pendingAmount += payment.amount || 0
          pendingCount++
        } else if (payment.status === 2) {
          // Overdue
          overdueAmount += payment.amount || 0
          overdueCount++
        } else if (payment.status === 1) {
          // Paid
          completedAmount += payment.amount || 0
          completedCount++
        }
      })

      setStatistics({
        totalAmount,
        pendingAmount,
        overdueAmount,
        completedAmount,
        pendingCount,
        overdueCount,
        completedCount,
      })
    } catch (err) {
      console.error("Failed to fetch payment statistics:", err)
      setStatistics(null)
    }
  }

  // Load initial data
  useEffect(() => {
    fetchPayments()
  }, [companyId])

  const value = {
    payments,
    isLoading,
    error,
    filters,
    selectedPayment,
    statistics,
    fetchPayments,
    fetchPaymentById,
    addPayment,
    editPayment,
    deletePayment,
    markAsPaid,
    markAsOverdue,
    markAsCancelled,
    setFilters,
    resetFilters,
    selectPayment,
    fetchPaymentsByStatus,
    fetchPaymentsByDateRange,
    fetchPaymentsByPlan,
    fetchPaymentStatistics,
  }

  return <CompanyPaymentsContext.Provider value={value}>{children}</CompanyPaymentsContext.Provider>
}

export const useCompanyPaymentsContext = () => {
  const context = useContext(CompanyPaymentsContext)
  if (context === undefined) {
    throw new Error("useCompanyPaymentsContext must be used within a CompanyPaymentsProvider")
  }
  return context
}
