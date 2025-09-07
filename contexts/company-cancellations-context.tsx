"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"
import { cancellationsApi } from "@/lib/api/cancellations"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import type {
  Cancellation,
  CancellationFormData,
  CancellationFilters,
  CancellationUpdateData,
  RefundProcessData,
  CancellationStats,
} from "@/types/cancellation"

interface CompanyCancellationsContextType {
  cancellations: Cancellation[]
  loading: boolean
  error: string | null
  stats: CancellationStats | null
  filters: CancellationFilters
  setFilters: (filters: CancellationFilters) => void
  refreshData: () => Promise<void>
  addCancellation: (data: CancellationFormData) => Promise<void>
  updateCancellation: (id: number, data: CancellationUpdateData) => Promise<void>
  deleteCancellation: (id: number) => Promise<void>
  processRefund: (id: number, data: RefundProcessData) => Promise<void>
}

const CompanyCancellationsContext = createContext<CompanyCancellationsContextType | undefined>(undefined)

export function useCompanyCancellationsContext() {
  const context = useContext(CompanyCancellationsContext)
  if (!context) {
    throw new Error("useCompanyCancellationsContext must be used within a CompanyCancellationsProvider")
  }
  return context
}

interface CompanyCancellationsProviderProps {
  children: React.ReactNode
}

export function CompanyCancellationsProvider({ children }: CompanyCancellationsProviderProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [cancellations, setCancellations] = useState<Cancellation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<CancellationStats | null>(null)
  const [filters, setFilters] = useState<CancellationFilters>({})

  const initialLoadRef = useRef(false)

  const fetchCancellations = useCallback(async () => {
    if (!user?.companyId) return

    setLoading(true)
    setError(null)
    try {
      const companyFilters = {
        companyId: user.companyId,
        search: filters.search,
        customerId: filters.customerId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      }
      const data = await cancellationsApi.getCancellations(companyFilters)

      let filteredData = data
      if (filters.refundStatus !== undefined) {
        filteredData = data.filter((c) => c.refundStatus === filters.refundStatus)
      }

      setCancellations(filteredData)

      const calculatedStats: CancellationStats = {
        total: filteredData.length,
        pending: filteredData.filter((c) => c.refundStatus === 0).length,
        processed: filteredData.filter((c) => c.refundStatus === 1).length,
        rejected: filteredData.filter((c) => c.refundStatus === 2).length,
        totalRefunded: filteredData.filter((c) => c.refundStatus === 1).length,
        averageRefundTime: 2.5,
        topReasons: calculateTopReasons(filteredData),
      }
      setStats(calculatedStats)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch cancellations"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [user?.companyId, filters, toast])

  const calculateTopReasons = (data: Cancellation[]): Array<{ reason: string; count: number }> => {
    const reasonCounts: Record<string, number> = {}
    data.forEach((c) => {
      reasonCounts[c.reason] = (reasonCounts[c.reason] || 0) + 1
    })
    return Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  const refreshData = useCallback(async () => {
    await fetchCancellations()
  }, [fetchCancellations])

  const addCancellation = useCallback(
    async (data: CancellationFormData) => {
      try {
        setLoading(true)
        const newCancellation = await cancellationsApi.createCancellation(data)
        setCancellations((prev) => [newCancellation, ...prev])
        await refreshData()
        toast({
          title: "Success",
          description: "Cancellation created successfully",
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create cancellation"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [refreshData, toast],
  )

  const updateCancellation = useCallback(
    async (id: number, data: CancellationUpdateData) => {
      try {
        setLoading(true)
        const updatedCancellation = await cancellationsApi.updateCancellation(id, data)
        setCancellations((prev) =>
          prev.map((cancellation) => (cancellation.id === id ? updatedCancellation : cancellation)),
        )
        await refreshData()
        toast({
          title: "Success",
          description: "Cancellation updated successfully",
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update cancellation"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [refreshData, toast],
  )

  const deleteCancellation = useCallback(
    async (id: number) => {
      try {
        setLoading(true)
        await cancellationsApi.deleteCancellation(id)
        setCancellations((prev) => prev.filter((cancellation) => cancellation.id !== id))
        await refreshData()
        toast({
          title: "Success",
          description: "Cancellation deleted successfully",
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete cancellation"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [refreshData, toast],
  )

  const processRefund = useCallback(
    async (id: number, data: RefundProcessData) => {
      try {
        setLoading(true)
        const updatedCancellation = await cancellationsApi.processRefund(id, data)
        setCancellations((prev) =>
          prev.map((cancellation) => (cancellation.id === id ? updatedCancellation : cancellation)),
        )
        await refreshData()
        toast({
          title: "Success",
          description: "Refund processed successfully",
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to process refund"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [refreshData, toast],
  )

  useEffect(() => {
    if (user?.companyId && !initialLoadRef.current) {
      initialLoadRef.current = true
      fetchCancellations()
    }
  }, [user?.companyId, fetchCancellations])

  useEffect(() => {
    if (initialLoadRef.current && user?.companyId) {
      fetchCancellations()
    }
  }, [filters, fetchCancellations, user?.companyId])

  const value: CompanyCancellationsContextType = {
    cancellations,
    loading,
    error,
    stats,
    filters,
    setFilters,
    refreshData,
    addCancellation,
    updateCancellation,
    deleteCancellation,
    processRefund,
  }

  return <CompanyCancellationsContext.Provider value={value}>{children}</CompanyCancellationsContext.Provider>
}
