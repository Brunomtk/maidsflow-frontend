"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "sonner"
import {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  updatePlanStatus,
  getPlanSubscribers,
} from "@/lib/api/plans"
import type { Plan, PlanFormData, PlanFilters } from "@/types/plan"

interface PlansContextType {
  plans: Plan[]
  currentPlan: Plan | null
  loading: boolean
  error: string | null
  filters: PlanFilters
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  fetchPlans: (page?: number, limit?: number) => Promise<void>
  fetchPlan: (id: string) => Promise<void>
  addPlan: (planData: PlanFormData) => Promise<boolean>
  editPlan: (id: string, planData: PlanFormData) => Promise<boolean>
  removePlan: (id: string) => Promise<boolean>
  activatePlan: (id: string) => Promise<boolean>
  deactivatePlan: (id: string) => Promise<boolean>
  updateFilters: (newFilters: Partial<PlanFilters>) => void
  resetFilters: () => void
  fetchPlanSubscribers: (planId: string, page?: number, limit?: number) => Promise<any[]>
}

const defaultPagination = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
}

const PlansContext = createContext<PlansContextType | undefined>(undefined)

export function PlansProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<PlanFilters>({})
  const [pagination, setPagination] = useState(defaultPagination)

  const fetchPlans = async (page = 1, limit = 10) => {
    setLoading(true)
    setError(null)

    try {
      const response = await getPlans(page, limit, filters.status, filters.search)

      if (response.status === 200 && response.data) {
        setPlans(response.data.items)
        setPagination({
          currentPage: response.data.meta.currentPage,
          totalPages: response.data.meta.totalPages,
          totalItems: response.data.meta.totalItems,
          itemsPerPage: response.data.meta.itemsPerPage,
        })
      } else {
        setError(response.error || "Failed to fetch plans")
        toast.error(response.error || "Failed to fetch plans")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlan = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await getPlan(id)

      if (response.status === 200 && response.data) {
        setCurrentPlan(response.data)
      } else {
        setError(response.error || "Failed to fetch plan")
        toast.error(response.error || "Failed to fetch plan")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const addPlan = async (planData: PlanFormData): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await createPlan(planData)

      if (response.status === 201) {
        // Changed from 200 to 201
        toast.success("Plan created successfully")
        // Refresh the plans list
        await fetchPlans()
        return true
      } else {
        setError(response.error || "Failed to create plan")
        toast.error(response.error || "Failed to create plan")
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  const editPlan = async (id: string, planData: PlanFormData): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await updatePlan(id, planData)

      if (response.status === 200) {
        toast.success("Plan updated successfully")
        // Refresh the plans list
        await fetchPlans()
        return true
      } else {
        setError(response.error || "Failed to update plan")
        toast.error(response.error || "Failed to update plan")
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  const removePlan = async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await deletePlan(id)

      if (response.status === 200) {
        setPlans((prevPlans) => prevPlans.filter((plan) => plan.id.toString() !== id))

        if (currentPlan && currentPlan.id.toString() === id) {
          setCurrentPlan(null)
        }

        toast.success("Plan deleted successfully")
        return true
      } else {
        setError(response.error || "Failed to delete plan")
        toast.error(response.error || "Failed to delete plan")
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  const activatePlan = async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await updatePlanStatus(id, 1) // 1 = active

      if (response.status === 200) {
        toast.success("Plan activated successfully")
        // Refresh the plans list
        await fetchPlans()
        return true
      } else {
        setError(response.error || "Failed to activate plan")
        toast.error(response.error || "Failed to activate plan")
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  const deactivatePlan = async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await updatePlanStatus(id, 0) // 0 = inactive

      if (response.status === 200) {
        toast.success("Plan deactivated successfully")
        // Refresh the plans list
        await fetchPlans()
        return true
      } else {
        setError(response.error || "Failed to deactivate plan")
        toast.error(response.error || "Failed to deactivate plan")
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = (newFilters: Partial<PlanFilters>) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
    }))
  }

  const resetFilters = () => {
    setFilters({})
  }

  const fetchPlanSubscribers = async (planId: string, page = 1, limit = 10): Promise<any[]> => {
    setLoading(true)
    setError(null)

    try {
      const response = await getPlanSubscribers(planId, page, limit)

      if (response.status === 200 && response.data) {
        return response.data.items
      } else {
        setError(response.error || "Failed to fetch plan subscribers")
        toast.error(response.error || "Failed to fetch plan subscribers")
        return []
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Fetch plans when filters change
  useEffect(() => {
    fetchPlans()
  }, [filters])

  const value = {
    plans,
    currentPlan,
    loading,
    error,
    filters,
    pagination,
    fetchPlans,
    fetchPlan,
    addPlan,
    editPlan,
    removePlan,
    activatePlan,
    deactivatePlan,
    updateFilters,
    resetFilters,
    fetchPlanSubscribers,
  }

  return <PlansContext.Provider value={value}>{children}</PlansContext.Provider>
}

export function usePlansContext() {
  const context = useContext(PlansContext)

  if (context === undefined) {
    throw new Error("usePlansContext must be used within a PlansProvider")
  }

  return context
}
