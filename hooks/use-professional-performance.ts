"use client"

import { useState, useCallback } from "react"
import type {
  PerformanceMetrics,
  PerformanceGoal,
  Achievement,
  PerformanceRanking,
  PerformanceReport,
  PerformanceComparison,
} from "@/types/performance"
import * as performanceApi from "@/lib/api/professional-performance"

export function useProfessionalPerformance() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback((error: any) => {
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    setError(message)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Métricas
  const getCurrentMetrics = useCallback(
    async (professionalId: string): Promise<PerformanceMetrics | null> => {
      try {
        setLoading(true)
        setError(null)
        return await performanceApi.getCurrentPerformanceMetrics(professionalId)
      } catch (error) {
        handleError(error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [handleError],
  )

  const getHistoricalMetrics = useCallback(
    async (
      professionalId: string,
      params?: performanceApi.GetPerformanceMetricsParams,
    ): Promise<PerformanceMetrics[]> => {
      try {
        setLoading(true)
        setError(null)
        return await performanceApi.getPerformanceMetrics(professionalId, params)
      } catch (error) {
        handleError(error)
        return []
      } finally {
        setLoading(false)
      }
    },
    [handleError],
  )

  // Metas
  const getGoals = useCallback(
    async (professionalId: string): Promise<PerformanceGoal[]> => {
      try {
        setLoading(true)
        setError(null)
        return await performanceApi.getPerformanceGoals(professionalId)
      } catch (error) {
        handleError(error)
        return []
      } finally {
        setLoading(false)
      }
    },
    [handleError],
  )

  const createGoal = useCallback(
    async (professionalId: string, goalData: performanceApi.CreateGoalData): Promise<PerformanceGoal | null> => {
      try {
        setLoading(true)
        setError(null)
        return await performanceApi.createPerformanceGoal(professionalId, goalData)
      } catch (error) {
        handleError(error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [handleError],
  )

  const updateGoal = useCallback(
    async (
      professionalId: string,
      goalId: string,
      goalData: performanceApi.UpdateGoalData,
    ): Promise<PerformanceGoal | null> => {
      try {
        setLoading(true)
        setError(null)
        return await performanceApi.updatePerformanceGoal(professionalId, goalId, goalData)
      } catch (error) {
        handleError(error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [handleError],
  )

  const deleteGoal = useCallback(
    async (professionalId: string, goalId: string): Promise<boolean> => {
      try {
        setLoading(true)
        setError(null)
        await performanceApi.deletePerformanceGoal(professionalId, goalId)
        return true
      } catch (error) {
        handleError(error)
        return false
      } finally {
        setLoading(false)
      }
    },
    [handleError],
  )

  // Conquistas
  const getAchievements = useCallback(
    async (professionalId: string): Promise<Achievement[]> => {
      try {
        setLoading(true)
        setError(null)
        return await performanceApi.getAchievements(professionalId)
      } catch (error) {
        handleError(error)
        return []
      } finally {
        setLoading(false)
      }
    },
    [handleError],
  )

  // Rankings
  const getRankings = useCallback(
    async (
      professionalId: string,
      category: "overall" | "rating" | "punctuality" | "productivity" = "overall",
      period: "weekly" | "monthly" | "yearly" = "monthly",
    ): Promise<PerformanceRanking[]> => {
      try {
        setLoading(true)
        setError(null)
        return await performanceApi.getPerformanceRanking(professionalId, category, period)
      } catch (error) {
        handleError(error)
        return []
      } finally {
        setLoading(false)
      }
    },
    [handleError],
  )

  // Comparações
  const getComparisons = useCallback(
    async (
      professionalId: string,
      period: "weekly" | "monthly" | "yearly" = "monthly",
    ): Promise<PerformanceComparison[]> => {
      try {
        setLoading(true)
        setError(null)
        return await performanceApi.getPerformanceComparisons(professionalId, period)
      } catch (error) {
        handleError(error)
        return []
      } finally {
        setLoading(false)
      }
    },
    [handleError],
  )

  // Relatórios
  const getReports = useCallback(
    async (professionalId: string): Promise<PerformanceReport[]> => {
      try {
        setLoading(true)
        setError(null)
        return await performanceApi.getPerformanceReports(professionalId)
      } catch (error) {
        handleError(error)
        return []
      } finally {
        setLoading(false)
      }
    },
    [handleError],
  )

  const generateReport = useCallback(
    async (professionalId: string, period: string): Promise<PerformanceReport | null> => {
      try {
        setLoading(true)
        setError(null)
        return await performanceApi.generatePerformanceReport(professionalId, period)
      } catch (error) {
        handleError(error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [handleError],
  )

  return {
    loading,
    error,
    clearError,
    getCurrentMetrics,
    getHistoricalMetrics,
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    getAchievements,
    getRankings,
    getComparisons,
    getReports,
    generateReport,
  }
}
