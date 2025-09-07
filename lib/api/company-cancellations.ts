import { apiRequest } from "./utils"
import type {
  Cancellation,
  CancellationFormData,
  CancellationFilters,
  CancellationUpdateData,
  RefundProcessData,
  CancellationStats,
} from "@/types/cancellation"

export const companyCancellationsApi = {
  // Get all cancellations for the company
  async getCancellations(companyId: number, filters?: CancellationFilters): Promise<Cancellation[]> {
    try {
      const params = new URLSearchParams()

      if (companyId) params.append("CompanyId", companyId.toString())
      if (filters?.search) params.append("Search", filters.search)
      if (filters?.customerId) params.append("CustomerId", filters.customerId.toString())
      if (filters?.startDate) params.append("StartDate", filters.startDate)
      if (filters?.endDate) params.append("EndDate", filters.endDate)
      if (filters?.refundStatus && filters.refundStatus !== "all") {
        params.append("RefundStatus", filters.refundStatus.toString())
      }

      const response = await apiRequest<Cancellation[]>(`/Cancellations?${params.toString()}`, {
        method: "GET",
      })

      return response.filter((c) => c.companyId === companyId)
    } catch (error) {
      console.error("Error fetching company cancellations:", error)
      throw error
    }
  },

  // Get cancellation by ID
  async getCancellationById(id: number): Promise<Cancellation> {
    try {
      const response = await apiRequest<Cancellation>(`/Cancellations/${id}`, {
        method: "GET",
      })
      return response
    } catch (error) {
      console.error("Error fetching cancellation:", error)
      throw error
    }
  },

  // Create new cancellation
  async createCancellation(data: CancellationFormData): Promise<Cancellation> {
    try {
      const response = await apiRequest<Cancellation>(`/Cancellations`, {
        method: "POST",
        body: JSON.stringify(data),
      })
      return response
    } catch (error) {
      console.error("Error creating cancellation:", error)
      throw error
    }
  },

  // Update cancellation
  async updateCancellation(id: number, data: CancellationUpdateData): Promise<Cancellation> {
    try {
      const response = await apiRequest<Cancellation>(`/Cancellations/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
      return response
    } catch (error) {
      console.error("Error updating cancellation:", error)
      throw error
    }
  },

  // Delete cancellation
  async deleteCancellation(id: number): Promise<void> {
    try {
      await apiRequest<void>(`/Cancellations/${id}`, {
        method: "DELETE",
      })
    } catch (error) {
      console.error("Error deleting cancellation:", error)
      throw error
    }
  },

  // Process refund
  async processRefund(id: number, data: RefundProcessData): Promise<Cancellation> {
    try {
      const response = await apiRequest<Cancellation>(`/Cancellations/${id}/refund`, {
        method: "POST",
        body: JSON.stringify(data),
      })
      return response
    } catch (error) {
      console.error("Error processing refund:", error)
      throw error
    }
  },

  // Get cancellation statistics (mock implementation)
  async getCancellationStats(companyId: number, filters?: CancellationFilters): Promise<CancellationStats> {
    try {
      // Since there's no specific stats endpoint, we'll calculate from the main data
      const cancellations = await this.getCancellations(companyId, filters)

      const stats: CancellationStats = {
        total: cancellations.length,
        pending: cancellations.filter((c) => c.refundStatus === 0).length,
        processed: cancellations.filter((c) => c.refundStatus === 1).length,
        rejected: cancellations.filter((c) => c.refundStatus === 2).length,
        totalRefunded: cancellations.filter((c) => c.refundStatus === 1).length * 100, // Mock calculation
        averageRefundTime: 2.5, // Mock value
        topReasons: this.calculateTopReasons(cancellations),
      }

      return stats
    } catch (error) {
      console.error("Error fetching cancellation stats:", error)
      throw error
    }
  },

  // Helper method to calculate top reasons
  calculateTopReasons(cancellations: Cancellation[]): Array<{ reason: string; count: number }> {
    const reasonCounts: Record<string, number> = {}

    cancellations.forEach((c) => {
      reasonCounts[c.reason] = (reasonCounts[c.reason] || 0) + 1
    })

    return Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  },

  // Export cancellations (mock implementation)
  async exportCancellations(
    companyId: number,
    format: "csv" | "excel" | "pdf",
    filters?: CancellationFilters,
  ): Promise<Blob> {
    try {
      const cancellations = await this.getCancellations(companyId, filters)

      // Mock CSV export
      if (format === "csv") {
        const headers = ["ID", "Customer", "Reason", "Status", "Date", "Notes"]
        const rows = cancellations.map((c) => [
          c.id.toString(),
          c.customerName || "N/A",
          c.reason,
          this.getRefundStatusLabel(c.refundStatus),
          new Date(c.cancelledAt).toLocaleDateString("en-US"),
          c.notes || "",
        ])

        const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

        return new Blob([csvContent], { type: "text/csv" })
      }

      throw new Error(`Export format ${format} not implemented`)
    } catch (error) {
      console.error("Error exporting cancellations:", error)
      throw error
    }
  },

  // Helper method to get refund status label
  getRefundStatusLabel(status: number): string {
    switch (status) {
      case 0:
        return "Pending"
      case 1:
        return "Processed"
      case 2:
        return "Rejected"
      case 3:
        return "Not Applicable"
      default:
        return "Unknown"
    }
  },
}
