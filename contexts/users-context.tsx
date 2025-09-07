"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { User } from "@/types/user"

interface UsersState {
  users: User[]
  selectedUser: User | null
  isLoading: boolean
  error: string | null
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

type UsersAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_USERS"; payload: User[] }
  | { type: "SET_SELECTED_USER"; payload: User | null }
  | { type: "ADD_USER"; payload: User }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "DELETE_USER"; payload: string }
  | {
      type: "SET_PAGINATION"
      payload: {
        currentPage: number
        totalPages: number
        totalItems: number
        itemsPerPage: number
      }
    }

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
}

function usersReducer(state: UsersState, action: UsersAction): UsersState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "SET_USERS":
      return { ...state, users: action.payload }
    case "SET_SELECTED_USER":
      return { ...state, selectedUser: action.payload }
    case "ADD_USER":
      return { ...state, users: [...state.users, action.payload] }
    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((user) => (user.id === action.payload.id ? action.payload : user)),
      }
    case "DELETE_USER":
      return {
        ...state,
        users: state.users.filter((user) => user.id.toString() !== action.payload),
      }
    case "SET_PAGINATION":
      return { ...state, pagination: action.payload }
    default:
      return state
  }
}

interface UsersContextType extends UsersState {
  dispatch: React.Dispatch<UsersAction>
}

const UsersContext = createContext<UsersContextType | undefined>(undefined)

export function UsersProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(usersReducer, initialState)

  return <UsersContext.Provider value={{ ...state, dispatch }}>{children}</UsersContext.Provider>
}

export function useUsersContext() {
  const context = useContext(UsersContext)
  if (context === undefined) {
    throw new Error("useUsersContext must be used within a UsersProvider")
  }
  return context
}
