"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { cancellationsApi } from "@/lib/api/cancellations"
import type {
  Cancellation,
  CancellationFilters,
  CancellationFormData,
  CancellationUpdateData,
  RefundProcessData,
} from "@/types/cancellation"
import { useToast } from "@/hooks/use-toast"

interface CancellationsContextType {
  cancellations: Cancellation[]
  loading: boolean
  error: string | null
  filters: CancellationFilters
  setFilters: (filters: CancellationFilters) => void
  refreshCancellations: () => Promise<void>
  createCancellation: (data: CancellationFormData) => Promise<Cancellation>
  updateCancellation: (id: number, data: CancellationUpdateData) => Promise<Cancellation>
  deleteCancellation: (id: number) => Promise<void>
  processRefund: (id: number, refundData: RefundProcessData) => Promise<Cancellation>
  getCancellationById: (id: number) => Promise<Cancellation>
}

const CancellationsContext = createContext<CancellationsContextType | undefined>(undefined)

export function useCancellationsContext() {
  const context = useContext(CancellationsContext)
  if (!context) {
    throw new Error("useCancellationsContext must be used within a CancellationsProvider")
  }
  return context
}

interface CancellationsProviderProps {
  children: React.ReactNode
}

export function CancellationsProvider({ children }: CancellationsProviderProps) {
  const [cancellations, setCancellations] = useState<Cancellation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CancellationFilters>({})
  const { toast } = useToast()

  const refreshCancellations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await cancellationsApi.getCancellations(filters)
      setCancellations(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar cancelamentos"
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [filters, toast])

  const createCancellation = useCallback(
    async (data: CancellationFormData): Promise<Cancellation> => {
      try {
        const newCancellation = await cancellationsApi.createCancellation(data)
        setCancellations((prev) => [newCancellation, ...prev])
        toast({
          title: "Sucesso",
          description: "Cancelamento registrado com sucesso",
        })
        return newCancellation
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao criar cancelamento"
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        })
        throw err
      }
    },
    [toast],
  )

  const updateCancellation = useCallback(
    async (id: number, data: CancellationUpdateData): Promise<Cancellation> => {
      try {
        const updatedCancellation = await cancellationsApi.updateCancellation(id, data)
        setCancellations((prev) => prev.map((c) => (c.id === id ? updatedCancellation : c)))
        toast({
          title: "Sucesso",
          description: "Cancelamento atualizado com sucesso",
        })
        return updatedCancellation
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar cancelamento"
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        })
        throw err
      }
    },
    [toast],
  )

  const deleteCancellation = useCallback(
    async (id: number): Promise<void> => {
      try {
        await cancellationsApi.deleteCancellation(id)
        setCancellations((prev) => prev.filter((c) => c.id !== id))
        toast({
          title: "Sucesso",
          description: "Cancelamento removido com sucesso",
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao remover cancelamento"
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        })
        throw err
      }
    },
    [toast],
  )

  const processRefund = useCallback(
    async (id: number, refundData: RefundProcessData): Promise<Cancellation> => {
      try {
        const updatedCancellation = await cancellationsApi.processRefund(id, refundData)
        setCancellations((prev) => prev.map((c) => (c.id === id ? updatedCancellation : c)))
        toast({
          title: "Sucesso",
          description: "Reembolso processado com sucesso",
        })
        return updatedCancellation
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao processar reembolso"
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        })
        throw err
      }
    },
    [toast],
  )

  const getCancellationById = useCallback(
    async (id: number): Promise<Cancellation> => {
      try {
        return await cancellationsApi.getCancellationById(id)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao carregar cancelamento"
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        })
        throw err
      }
    },
    [toast],
  )

  // Load cancellations on mount and when filters change
  useEffect(() => {
    refreshCancellations()
  }, [refreshCancellations])

  const value: CancellationsContextType = {
    cancellations,
    loading,
    error,
    filters,
    setFilters,
    refreshCancellations,
    createCancellation,
    updateCancellation,
    deleteCancellation,
    processRefund,
    getCancellationById,
  }

  return <CancellationsContext.Provider value={value}>{children}</CancellationsContext.Provider>
}
