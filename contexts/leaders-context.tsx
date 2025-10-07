"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { Leader } from "@/types/leader"

interface LeadersState {
  leaders: Leader[]
  selectedLeader: Leader | null
  isLoading: boolean
  error: string | null
}

type LeadersAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_LEADERS"; payload: Leader[] }
  | { type: "SET_SELECTED_LEADER"; payload: Leader | null }
  | { type: "ADD_LEADER"; payload: Leader }
  | { type: "UPDATE_LEADER"; payload: Leader }
  | { type: "DELETE_LEADER"; payload: number }

const initialState: LeadersState = {
  leaders: [],
  selectedLeader: null,
  isLoading: false,
  error: null,
}

function leadersReducer(state: LeadersState, action: LeadersAction): LeadersState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "SET_LEADERS":
      return { ...state, leaders: action.payload }
    case "SET_SELECTED_LEADER":
      return { ...state, selectedLeader: action.payload }
    case "ADD_LEADER":
      return { ...state, leaders: [...state.leaders, action.payload] }
    case "UPDATE_LEADER":
      return {
        ...state,
        leaders: state.leaders.map((leader) => (leader.id === action.payload.id ? action.payload : leader)),
      }
    case "DELETE_LEADER":
      return {
        ...state,
        leaders: state.leaders.filter((leader) => leader.id !== action.payload),
      }
    default:
      return state
  }
}

interface LeadersContextType extends LeadersState {
  dispatch: React.Dispatch<LeadersAction>
}

const LeadersContext = createContext<LeadersContextType | undefined>(undefined)

export function LeadersProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(leadersReducer, initialState)

  return <LeadersContext.Provider value={{ ...state, dispatch }}>{children}</LeadersContext.Provider>
}

export function useLeadersContext() {
  const context = useContext(LeadersContext)
  if (context === undefined) {
    throw new Error("useLeadersContext must be used within a LeadersProvider")
  }
  return context
}
