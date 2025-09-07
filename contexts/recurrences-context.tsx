"use client"

import type React from "react"
import { createContext, useContext } from "react"
import type { Recurrence } from "@/types/recurrence"
import { useRecurrences } from "@/hooks/use-recurrences"

interface RecurrencesContextType {
  recurrences: Recurrence[]
  loading: boolean
  error: string | null
  selectedRecurrence: Recurrence | null
  filters: {
    searchQuery: string
    status: string
    type: string
    companyId: string
  }
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    pageSize: number
  }
  companies: any[]
  customers: any[]
  teams: any[]
  loadingDropdowns: boolean
  fetchRecurrences: () => Promise<void>
  fetchRecurrenceById: (id: number) => Promise<Recurrence | null>
  addRecurrence: (data: any) => Promise<void>
  editRecurrence: (id: number, data: any) => Promise<void>
  removeRecurrence: (id: number) => Promise<void>
  selectRecurrence: (recurrence: Recurrence | null) => void
  setPage: (page: number) => void
  refreshData: () => Promise<void>
  handleSearch: (query: string) => void
  handleStatusFilter: (status: string) => void
  handleTypeFilter: (type: string) => void
  handleCompanyFilter: (companyId: string) => void
}

const RecurrencesContext = createContext<RecurrencesContextType | undefined>(undefined)

export function RecurrencesProvider({ children }: { children: React.ReactNode }) {
  const recurrencesData = useRecurrences()

  return <RecurrencesContext.Provider value={recurrencesData}>{children}</RecurrencesContext.Provider>
}

export const useRecurrencesContext = () => {
  const context = useContext(RecurrencesContext)
  if (context === undefined) {
    throw new Error("useRecurrencesContext must be used within a RecurrencesProvider")
  }
  return context
}
