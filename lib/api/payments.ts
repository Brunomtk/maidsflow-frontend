import { fetchApi } from "./utils"
import type { Payment, PaymentFormData, PaymentFilters, PaymentStatusUpdate, PaymentsResponse } from "@/types/payment"

// Get all payments with filtering and pagination
export async function getPayments(filters: PaymentFilters = {}): Promise<PaymentsResponse> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value != null && value !== "") {
      // Use exact parameter names from API documentation
      if (key === "companyId") {
        params.append("CompanyId", String(value))
      } else if (key === "status") {
        params.append("Status", String(value))
      } else if (key === "search") {
        params.append("Search", String(value))
      } else if (key === "startDate") {
        params.append("StartDate", String(value))
      } else if (key === "endDate") {
        params.append("EndDate", String(value))
      } else if (key === "planId") {
        params.append("PlanId", String(value))
      } else if (key === "page") {
        params.append("Page", String(value))
      } else if (key === "pageSize") {
        params.append("PageSize", String(value))
      }
    }
  })
  return await fetchApi<PaymentsResponse>(`/Payments?${params.toString()}`)
}

// Get a single payment by ID
export async function getPaymentById(id: number): Promise<Payment> {
  return await fetchApi<Payment>(`/Payments/${id}`)
}

// Create a new payment
export async function createPayment(paymentData: PaymentFormData): Promise<Payment> {
  return await fetchApi<Payment>(`/Payments`, {
    method: "POST",
    body: JSON.stringify(paymentData),
  })
}

// Update an existing payment
export async function updatePayment(id: number, paymentData: Partial<PaymentFormData>): Promise<Payment> {
  return await fetchApi<Payment>(`/Payments/${id}`, {
    method: "PUT",
    body: JSON.stringify(paymentData),
  })
}

// Delete a payment
export async function deletePayment(id: number): Promise<void> {
  await fetchApi<void>(`/Payments/${id}`, { method: "DELETE" })
}

// Update payment status
export async function updatePaymentStatus(id: number, statusUpdate: PaymentStatusUpdate): Promise<Payment> {
  return await fetchApi<Payment>(`/Payments/${id}/status`, {
    method: "POST",
    body: JSON.stringify(statusUpdate),
  })
}
