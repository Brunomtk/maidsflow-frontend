"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback } from "react"
import type { Notification } from "@/types/notification"

// State interface
interface ProfessionalNotificationsState {
  notifications: Notification[]
  selectedNotification: Notification | null
  loading: boolean
  error: string | null
  filters: {
    type: string
    status: string
    search: string
    startDate: string
    endDate: string
  }
  stats: {
    total: number
    unread: number
    read: number
    important: number
    thisWeek: number
    thisMonth: number
  }
}

// Action types
type ProfessionalNotificationsAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_NOTIFICATIONS"; payload: Notification[] }
  | { type: "SET_SELECTED_NOTIFICATION"; payload: Notification | null }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "UPDATE_NOTIFICATION"; payload: Notification }
  | { type: "REMOVE_NOTIFICATION"; payload: string }
  | { type: "MARK_AS_READ"; payload: string }
  | { type: "MARK_ALL_AS_READ" }
  | { type: "SET_FILTERS"; payload: Partial<ProfessionalNotificationsState["filters"]> }
  | { type: "SET_STATS"; payload: ProfessionalNotificationsState["stats"] }
  | { type: "RESET_STATE" }

// Context interface
interface ProfessionalNotificationsContextType {
  state: ProfessionalNotificationsState
  dispatch: React.Dispatch<ProfessionalNotificationsAction>
  // Action creators
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setNotifications: (notifications: Notification[]) => void
  setSelectedNotification: (notification: Notification | null) => void
  addNotification: (notification: Notification) => void
  updateNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  setFilters: (filters: Partial<ProfessionalNotificationsState["filters"]>) => void
  setStats: (stats: ProfessionalNotificationsState["stats"]) => void
  resetState: () => void
}

// Initial state
const initialState: ProfessionalNotificationsState = {
  notifications: [],
  selectedNotification: null,
  loading: false,
  error: null,
  filters: {
    type: "all",
    status: "all",
    search: "",
    startDate: "",
    endDate: "",
  },
  stats: {
    total: 0,
    unread: 0,
    read: 0,
    important: 0,
    thisWeek: 0,
    thisMonth: 0,
  },
}

// Reducer
function professionalNotificationsReducer(
  state: ProfessionalNotificationsState,
  action: ProfessionalNotificationsAction,
): ProfessionalNotificationsState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }

    case "SET_NOTIFICATIONS":
      return { ...state, notifications: action.payload, loading: false, error: null }

    case "SET_SELECTED_NOTIFICATION":
      return { ...state, selectedNotification: action.payload }

    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      }

    case "UPDATE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload.id ? action.payload : notification,
        ),
        selectedNotification:
          state.selectedNotification?.id === action.payload.id ? action.payload : state.selectedNotification,
      }

    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter((notification) => notification.id !== action.payload),
        selectedNotification: state.selectedNotification?.id === action.payload ? null : state.selectedNotification,
      }

    case "MARK_AS_READ":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload
            ? { ...notification, status: "read", readAt: new Date().toISOString() }
            : notification,
        ),
        selectedNotification:
          state.selectedNotification?.id === action.payload
            ? { ...state.selectedNotification, status: "read", readAt: new Date().toISOString() }
            : state.selectedNotification,
      }

    case "MARK_ALL_AS_READ":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.status === "unread"
            ? { ...notification, status: "read", readAt: new Date().toISOString() }
            : notification,
        ),
      }

    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      }

    case "SET_STATS":
      return { ...state, stats: action.payload }

    case "RESET_STATE":
      return initialState

    default:
      return state
  }
}

// Create context
const ProfessionalNotificationsContext = createContext<ProfessionalNotificationsContextType | undefined>(undefined)

// Provider component
export function ProfessionalNotificationsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(professionalNotificationsReducer, initialState)

  // Action creators
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading })
  }, [])

  const setError = useCallback((error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error })
  }, [])

  const setNotifications = useCallback((notifications: Notification[]) => {
    dispatch({ type: "SET_NOTIFICATIONS", payload: notifications })
  }, [])

  const setSelectedNotification = useCallback((notification: Notification | null) => {
    dispatch({ type: "SET_SELECTED_NOTIFICATION", payload: notification })
  }, [])

  const addNotification = useCallback((notification: Notification) => {
    dispatch({ type: "ADD_NOTIFICATION", payload: notification })
  }, [])

  const updateNotification = useCallback((notification: Notification) => {
    dispatch({ type: "UPDATE_NOTIFICATION", payload: notification })
  }, [])

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: id })
  }, [])

  const markAsRead = useCallback((id: string) => {
    dispatch({ type: "MARK_AS_READ", payload: id })
  }, [])

  const markAllAsRead = useCallback(() => {
    dispatch({ type: "MARK_ALL_AS_READ" })
  }, [])

  const setFilters = useCallback((filters: Partial<ProfessionalNotificationsState["filters"]>) => {
    dispatch({ type: "SET_FILTERS", payload: filters })
  }, [])

  const setStats = useCallback((stats: ProfessionalNotificationsState["stats"]) => {
    dispatch({ type: "SET_STATS", payload: stats })
  }, [])

  const resetState = useCallback(() => {
    dispatch({ type: "RESET_STATE" })
  }, [])

  const value: ProfessionalNotificationsContextType = {
    state,
    dispatch,
    setLoading,
    setError,
    setNotifications,
    setSelectedNotification,
    addNotification,
    updateNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    setFilters,
    setStats,
    resetState,
  }

  return <ProfessionalNotificationsContext.Provider value={value}>{children}</ProfessionalNotificationsContext.Provider>
}

// Hook to use the context
export function useProfessionalNotificationsContext() {
  const context = useContext(ProfessionalNotificationsContext)
  if (context === undefined) {
    throw new Error("useProfessionalNotificationsContext must be used within a ProfessionalNotificationsProvider")
  }
  return context
}
