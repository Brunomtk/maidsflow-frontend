import type { Payment, PaymentFormData, PaymentFilters } from "@/types/payment"
import { getPayments, getPaymentById, createPayment, updatePayment, updatePaymentStatus } from "@/lib/api/payments"

// Get all payments for a specific company with optional filters
export const getCompanyPayments = async (
  companyId: number,
  filters?: Omit<PaymentFilters, "companyId">,
): Promise<Payment[]> => {
  try {
    // Always include the companyId in the filters
    const result = await getPayments({ ...filters, companyId })
    return Array.isArray(result) ? result : []
  } catch (error) {
    console.error("Error fetching company payments:", error)
    return []
  }
}

// Get a single payment by ID (with company verification)
export const getCompanyPaymentById = async (companyId: number, id: number): Promise<Payment | null> => {
  try {
    const payment = await getPaymentById(id)

    // Security check: ensure the payment belongs to the company
    if (payment && payment.companyId === companyId) {
      return payment
    }

    return null
  } catch (error) {
    console.error(`Error fetching company payment with ID ${id}:`, error)
    throw error
  }
}

// Create a new payment for a company
export const createCompanyPayment = async (
  companyId: number,
  paymentData: Omit<PaymentFormData, "companyId">,
): Promise<Payment> => {
  try {
    // Always set the companyId to ensure the payment is associated with the company
    return await createPayment({
      ...paymentData,
      companyId,
    })
  } catch (error) {
    console.error("Error creating company payment:", error)
    throw error
  }
}

// Update an existing payment (with company verification)
export const updateCompanyPayment = async (
  companyId: number,
  id: number,
  paymentData: Partial<PaymentFormData>,
): Promise<Payment> => {
  try {
    // First verify the payment belongs to the company
    const payment = await getPaymentById(id)

    if (!payment || payment.companyId !== companyId) {
      throw new Error("Payment not found or does not belong to this company")
    }

    return await updatePayment(id, paymentData)
  } catch (error) {
    console.error(`Error updating company payment with ID ${id}:`, error)
    throw error
  }
}

// Update payment status (with company verification)
export const updateCompanyPaymentStatus = async (
  companyId: number,
  id: number,
  status: 0 | 1 | 2 | 3,
  paymentDate?: string,
): Promise<Payment> => {
  try {
    // First verify the payment belongs to the company
    const payment = await getPaymentById(id)

    if (!payment || payment.companyId !== companyId) {
      throw new Error("Payment not found or does not belong to this company")
    }

    return await updatePaymentStatus(id, status, paymentDate)
  } catch (error) {
    console.error(`Error updating status for company payment with ID ${id}:`, error)
    throw error
  }
}

// Get payments by status for a company
export const getCompanyPaymentsByStatus = async (companyId: number, status: 0 | 1 | 2 | 3): Promise<Payment[]> => {
  return getCompanyPayments(companyId, { status })
}

// Get payments by date range for a company
export const getCompanyPaymentsByDateRange = async (
  companyId: number,
  startDate: string,
  endDate: string,
): Promise<Payment[]> => {
  return getCompanyPayments(companyId, { startDate, endDate })
}

// Get payments by plan for a company
export const getCompanyPaymentsByPlan = async (companyId: number, planId: number): Promise<Payment[]> => {
  return getCompanyPayments(companyId, { planId })
}

// Get payment statistics for a company
export const getCompanyPaymentStatistics = async (
  companyId: number,
): Promise<{
  totalAmount: number
  pendingAmount: number
  overdueAmount: number
  completedAmount: number
  pendingCount: number
  overdueCount: number
  completedCount: number
}> => {
  try {
    const payments = await getCompanyPayments(companyId)

    // Garantir que payments é um array
    const safePayments = Array.isArray(payments) ? payments : []

    let totalAmount = 0
    let pendingAmount = 0
    let overdueAmount = 0
    let completedAmount = 0
    let pendingCount = 0
    let overdueCount = 0
    let completedCount = 0

    safePayments.forEach((payment) => {
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

    return {
      totalAmount,
      pendingAmount,
      overdueAmount,
      completedAmount,
      pendingCount,
      overdueCount,
      completedCount,
    }
  } catch (error) {
    console.error("Error calculating company payment statistics:", error)
    return {
      totalAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      completedAmount: 0,
      pendingCount: 0,
      overdueCount: 0,
      completedCount: 0,
    }
  }
}
