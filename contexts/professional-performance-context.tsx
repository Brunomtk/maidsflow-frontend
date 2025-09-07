"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback } from "react"
import type {
  PerformanceMetrics,
  PerformanceGoal,
  Achievement,
  PerformanceRanking,
  PerformanceReport,
  PerformanceComparison,
} from "@/types/performance"
import * as performanceApi from "@/lib/api/professional-performance"

interface ProfessionalPerformanceState {
  // Métricas
  currentMetrics: PerformanceMetrics | null
  historicalMetrics: PerformanceMetrics[]

  // Metas
  goals: PerformanceGoal[]
  selectedGoal: PerformanceGoal | null

  // Conquistas
  achievements: Achievement[]

  // Rankings
  rankings: PerformanceRanking[]

  // Comparações
  comparisons: PerformanceComparison[]

  // Relatórios
  reports: PerformanceReport[]
  selectedReport: PerformanceReport | null

  // Estados
  loading: boolean
  error: string | null
}

type ProfessionalPerformanceAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_CURRENT_METRICS"; payload: PerformanceMetrics }
  | { type: "SET_HISTORICAL_METRICS"; payload: PerformanceMetrics[] }
  | { type: "SET_GOALS"; payload: PerformanceGoal[] }
  | { type: "SET_SELECTED_GOAL"; payload: PerformanceGoal | null }
  | { type: "ADD_GOAL"; payload: PerformanceGoal }
  | { type: "UPDATE_GOAL"; payload: PerformanceGoal }
  | { type: "REMOVE_GOAL"; payload: string }
  | { type: "SET_ACHIEVEMENTS"; payload: Achievement[] }
  | { type: "SET_RANKINGS"; payload: PerformanceRanking[] }
  | { type: "SET_COMPARISONS"; payload: PerformanceComparison[] }
  | { type: "SET_REPORTS"; payload: PerformanceReport[] }
  | { type: "SET_SELECTED_REPORT"; payload: PerformanceReport | null }
  | { type: "ADD_REPORT"; payload: PerformanceReport }

const initialState: ProfessionalPerformanceState = {
  currentMetrics: null,
  historicalMetrics: [],
  goals: [],
  selectedGoal: null,
  achievements: [],
  rankings: [],
  comparisons: [],
  reports: [],
  selectedReport: null,
  loading: false,
  error: null,
}

function professionalPerformanceReducer(
  state: ProfessionalPerformanceState,
  action: ProfessionalPerformanceAction,
): ProfessionalPerformanceState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }
    case "SET_CURRENT_METRICS":
      return { ...state, currentMetrics: action.payload }
    case "SET_HISTORICAL_METRICS":
      return { ...state, historicalMetrics: action.payload }
    case "SET_GOALS":
      return { ...state, goals: action.payload }
    case "SET_SELECTED_GOAL":
      return { ...state, selectedGoal: action.payload }
    case "ADD_GOAL":
      return { ...state, goals: [...state.goals, action.payload] }
    case "UPDATE_GOAL":
      return {
        ...state,
        goals: state.goals.map((goal) => (goal.id === action.payload.id ? action.payload : goal)),
        selectedGoal: state.selectedGoal?.id === action.payload.id ? action.payload : state.selectedGoal,
      }
    case "REMOVE_GOAL":
      return {
        ...state,
        goals: state.goals.filter((goal) => goal.id !== action.payload),
        selectedGoal: state.selectedGoal?.id === action.payload ? null : state.selectedGoal,
      }
    case "SET_ACHIEVEMENTS":
      return { ...state, achievements: action.payload }
    case "SET_RANKINGS":
      return { ...state, rankings: action.payload }
    case "SET_COMPARISONS":
      return { ...state, comparisons: action.payload }
    case "SET_REPORTS":
      return { ...state, reports: action.payload }
    case "SET_SELECTED_REPORT":
      return { ...state, selectedReport: action.payload }
    case "ADD_REPORT":
      return { ...state, reports: [action.payload, ...state.reports] }
    default:
      return state
  }
}

interface ProfessionalPerformanceContextType extends ProfessionalPerformanceState {
  // Métricas
  fetchCurrentMetrics: (professionalId: string) => Promise<void>
  fetchHistoricalMetrics: (professionalId: string, params?: performanceApi.GetPerformanceMetricsParams) => Promise<void>

  // Metas
  fetchGoals: (professionalId: string) => Promise<void>
  createGoal: (professionalId: string, goalData: performanceApi.CreateGoalData) => Promise<void>
  updateGoal: (professionalId: string, goalId: string, goalData: performanceApi.UpdateGoalData) => Promise<void>
  deleteGoal: (professionalId: string, goalId: string) => Promise<void>
  selectGoal: (goal: PerformanceGoal | null) => void

  // Conquistas
  fetchAchievements: (professionalId: string) => Promise<void>

  // Rankings
  fetchRankings: (
    professionalId: string,
    category?: "overall" | "rating" | "punctuality" | "productivity",
    period?: "weekly" | "monthly" | "yearly",
  ) => Promise<void>

  // Comparações
  fetchComparisons: (professionalId: string, period?: "weekly" | "monthly" | "yearly") => Promise<void>

  // Relatórios
  fetchReports: (professionalId: string) => Promise<void>
  generateReport: (professionalId: string, period: string) => Promise<void>
  selectReport: (report: PerformanceReport | null) => void

  // Utilitários
  clearError: () => void
}

const ProfessionalPerformanceContext = createContext<ProfessionalPerformanceContextType | undefined>(undefined)

export function ProfessionalPerformanceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(professionalPerformanceReducer, initialState)

  const handleError = useCallback((error: any) => {
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    dispatch({ type: "SET_ERROR", payload: message })
  }, [])

  // Métricas
  const fetchCurrentMetrics = useCallback(
    async (professionalId: string) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        const metrics = await performanceApi.getCurrentPerformanceMetrics(professionalId)
        dispatch({ type: "SET_CURRENT_METRICS", payload: metrics })
      } catch (error) {
        handleError(error)
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },
    [handleError],
  )

  const fetchHistoricalMetrics = useCallback(
    async (professionalId: string, params?: performanceApi.GetPerformanceMetricsParams) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        const metrics = await performanceApi.getPerformanceMetrics(professionalId, params)
        dispatch({ type: "SET_HISTORICAL_METRICS", payload: metrics })
      } catch (error) {
        handleError(error)
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },
    [handleError],
  )

  // Metas
  const fetchGoals = useCallback(
    async (professionalId: string) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        const goals = await performanceApi.getPerformanceGoals(professionalId)
        dispatch({ type: "SET_GOALS", payload: goals })
      } catch (error) {
        handleError(error)
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },
    [handleError],
  )

  const createGoal = useCallback(
    async (professionalId: string, goalData: performanceApi.CreateGoalData) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        const goal = await performanceApi.createPerformanceGoal(professionalId, goalData)
        dispatch({ type: "ADD_GOAL", payload: goal })
      } catch (error) {
        handleError(error)
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },
    [handleError],
  )

  const updateGoal = useCallback(
    async (professionalId: string, goalId: string, goalData: performanceApi.UpdateGoalData) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        const goal = await performanceApi.updatePerformanceGoal(professionalId, goalId, goalData)
        dispatch({ type: "UPDATE_GOAL", payload: goal })
      } catch (error) {
        handleError(error)
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },
    [handleError],
  )

  const deleteGoal = useCallback(
    async (professionalId: string, goalId: string) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        await performanceApi.deletePerformanceGoal(professionalId, goalId)
        dispatch({ type: "REMOVE_GOAL", payload: goalId })
      } catch (error) {
        handleError(error)
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },
    [handleError],
  )

  const selectGoal = useCallback((goal: PerformanceGoal | null) => {
    dispatch({ type: "SET_SELECTED_GOAL", payload: goal })
  }, [])

  // Conquistas
  const fetchAchievements = useCallback(
    async (professionalId: string) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        const achievements = await performanceApi.getAchievements(professionalId)
        dispatch({ type: "SET_ACHIEVEMENTS", payload: achievements })
      } catch (error) {
        handleError(error)
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },
    [handleError],
  )

  // Rankings
  const fetchRankings = useCallback(
    async (
      professionalId: string,
      category: "overall" | "rating" | "punctuality" | "productivity" = "overall",
      period: "weekly" | "monthly" | "yearly" = "monthly",
    ) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        const rankings = await performanceApi.getPerformanceRanking(professionalId, category, period)
        dispatch({ type: "SET_RANKINGS", payload: rankings })
      } catch (error) {
        handleError(error)
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },
    [handleError],
  )

  // Comparações
  const fetchComparisons = useCallback(
    async (professionalId: string, period: "weekly" | "monthly" | "yearly" = "monthly") => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        const comparisons = await performanceApi.getPerformanceComparisons(professionalId, period)
        dispatch({ type: "SET_COMPARISONS", payload: comparisons })
      } catch (error) {
        handleError(error)
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },
    [handleError],
  )

  // Relatórios
  const fetchReports = useCallback(
    async (professionalId: string) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        const reports = await performanceApi.getPerformanceReports(professionalId)
        dispatch({ type: "SET_REPORTS", payload: reports })
      } catch (error) {
        handleError(error)
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },
    [handleError],
  )

  const generateReport = useCallback(
    async (professionalId: string, period: string) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        const report = await performanceApi.generatePerformanceReport(professionalId, period)
        dispatch({ type: "ADD_REPORT", payload: report })
      } catch (error) {
        handleError(error)
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },
    [handleError],
  )

  const selectReport = useCallback((report: PerformanceReport | null) => {
    dispatch({ type: "SET_SELECTED_REPORT", payload: report })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", payload: null })
  }, [])

  const value: ProfessionalPerformanceContextType = {
    ...state,
    fetchCurrentMetrics,
    fetchHistoricalMetrics,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    selectGoal,
    fetchAchievements,
    fetchRankings,
    fetchComparisons,
    fetchReports,
    generateReport,
    selectReport,
    clearError,
  }

  return <ProfessionalPerformanceContext.Provider value={value}>{children}</ProfessionalPerformanceContext.Provider>
}

export function useProfessionalPerformanceContext() {
  const context = useContext(ProfessionalPerformanceContext)
  if (context === undefined) {
    throw new Error("useProfessionalPerformanceContext must be used within a ProfessionalPerformanceProvider")
  }
  return context
}
