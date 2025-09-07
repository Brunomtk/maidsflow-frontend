import { fetchApi } from "@/lib/api/utils"
import type {
  Cancellation,
  CancellationFormData,
  CancellationUpdateData,
  CancellationFilters,
  RefundProcessData,
} from "@/types/cancellation"

const ENDPOINTS = {
  CANCELLATIONS: "/Cancellations",
  CANCELLATION_BY_ID: (id: string | number) => `/Cancellations/${id}`,
  PROCESS_REFUND: (id: string | number) => `/Cancellations/${id}/refund`,
} as const

export const cancellationsApi = {
  // GET /api/Cancellations
  async getCancellations(filters?: CancellationFilters): Promise<Cancellation[]> {
    try {
      const params = new URLSearchParams()

      if (filters?.search) params.append("Search", filters.search)
      if (filters?.companyId) params.append("CompanyId", filters.companyId.toString())
      if (filters?.customerId) params.append("CustomerId", filters.customerId.toString())
      if (filters?.startDate) params.append("StartDate", filters.startDate)
      if (filters?.endDate) params.append("EndDate", filters.endDate)
      if (filters?.refundStatus !== undefined) params.append("RefundStatus", filters.refundStatus.toString())

      const queryString = params.toString()
      const url = queryString ? `${ENDPOINTS.CANCELLATIONS}?${queryString}` : ENDPOINTS.CANCELLATIONS

      console.log("Fetching cancellations from:", url)
      const response = await fetchApi<Cancellation[]>(url, { method: "GET" })
      console.log("Cancellations response:", response)

      // API returns array directly
      if (Array.isArray(response)) {
        return response
      }

      // If response has data property
      if (response && typeof response === "object" && "data" in response) {
        return (response as any).data || []
      }

      return []
    } catch (error) {
      console.error("Error fetching cancellations:", error)
      throw error
    }
  },

  // GET /api/Cancellations/{id}
  async getCancellationById(id: string | number): Promise<Cancellation> {
    try {
      const response = await fetchApi<Cancellation>(ENDPOINTS.CANCELLATION_BY_ID(id), { method: "GET" })
      return response
    } catch (error) {
      console.error("Error fetching cancellation by id:", error)
      throw error
    }
  },

  // POST /api/Cancellations
  async createCancellation(data: CancellationFormData): Promise<Cancellation> {
    try {
      console.log("Creating cancellation with data:", data)
      const response = await fetchApi<Cancellation>(ENDPOINTS.CANCELLATIONS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      console.log("Create cancellation response:", response)
      return response
    } catch (error) {
      console.error("Error creating cancellation:", error)
      throw error
    }
  },

  // PUT /api/Cancellations/{id}
  async updateCancellation(id: string | number, data: CancellationUpdateData): Promise<Cancellation> {
    try {
      console.log("Updating cancellation with data:", data)
      const response = await fetchApi<Cancellation>(ENDPOINTS.CANCELLATION_BY_ID(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      console.log("Update cancellation response:", response)
      return response
    } catch (error) {
      console.error("Error updating cancellation:", error)
      throw error
    }
  },

  // DELETE /api/Cancellations/{id}
  async deleteCancellation(id: string | number): Promise<void> {
    try {
      await fetchApi(ENDPOINTS.CANCELLATION_BY_ID(id), { method: "DELETE" })
    } catch (error) {
      console.error("Error deleting cancellation:", error)
      throw error
    }
  },

  // POST /api/Cancellations/{id}/refund
  async processRefund(id: string | number, refundData: RefundProcessData): Promise<Cancellation> {
    try {
      console.log("Processing refund with data:", refundData)
      const response = await fetchApi<Cancellation>(ENDPOINTS.PROCESS_REFUND(id), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(refundData),
      })
      console.log("Process refund response:", response)
      return response
    } catch (error) {
      console.error("Error processing refund:", error)
      throw error
    }
  },

  // Helper methods for specific filters
  async getCancellationsByCompany(companyId: string | number): Promise<Cancellation[]> {
    return this.getCancellations({ companyId: Number(companyId) })
  },

  async getCancellationsByCustomer(customerId: string | number): Promise<Cancellation[]> {
    return this.getCancellations({ customerId: Number(customerId) })
  },

  async getCancellationsByRefundStatus(status: string | number): Promise<Cancellation[]> {
    return this.getCancellations({ refundStatus: Number(status) })
  },
}
