"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { gpsTrackingApi } from "@/lib/api/gps-tracking"
import type {
  GPSTracking,
  GPSTrackingFilters,
  GPSTrackingCreateRequest,
  GPSTrackingUpdateRequest,
} from "@/types/gps-tracking"

interface GpsTrackingState {
  records: GPSTracking[]
  loading: boolean
  error: string | null
  filters: GPSTrackingFilters
  selectedRecord: GPSTracking | null
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

type GpsTrackingAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_RECORDS"; payload: { records: GPSTracking[]; pagination: any } }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_FILTERS"; payload: GPSTrackingFilters }
  | { type: "SET_SELECTED_RECORD"; payload: GPSTracking | null }
  | { type: "ADD_RECORD"; payload: GPSTracking }
  | { type: "UPDATE_RECORD"; payload: GPSTracking }
  | { type: "DELETE_RECORD"; payload: number }

interface GpsTrackingContextType {
  state: GpsTrackingState
  fetchRecords: () => Promise<void>
  createRecord: (data: GPSTrackingCreateRequest) => Promise<void>
  updateRecord: (id: number, data: GPSTrackingUpdateRequest) => Promise<void>
  deleteRecord: (id: number) => Promise<void>
  setFilters: (filters: GPSTrackingFilters) => void
  setSelectedRecord: (record: GPSTracking | null) => void
}

const GpsTrackingContext = createContext<GpsTrackingContextType | undefined>(undefined)

const initialState: GpsTrackingState = {
  records: [],
  loading: false,
  error: null,
  filters: {
    searchQuery: "",
    status: "all",
    pageNumber: 1,
    pageSize: 10,
  },
  selectedRecord: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
}

function gpsTrackingReducer(state: GpsTrackingState, action: GpsTrackingAction): GpsTrackingState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_RECORDS":
      return {
        ...state,
        records: action.payload.records,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      }
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }
    case "SET_FILTERS":
      return { ...state, filters: action.payload }
    case "SET_SELECTED_RECORD":
      return { ...state, selectedRecord: action.payload }
    case "ADD_RECORD":
      return { ...state, records: [action.payload, ...state.records] }
    case "UPDATE_RECORD":
      return {
        ...state,
        records: state.records.map((record) => (record.id === action.payload.id ? action.payload : record)),
      }
    case "DELETE_RECORD":
      return {
        ...state,
        records: state.records.filter((record) => record.id !== action.payload),
      }
    default:
      return state
  }
}

export function GpsTrackingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gpsTrackingReducer, initialState)

  const fetchRecords = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      const { data: response, error } = await gpsTrackingApi.getRecords(state.filters)

      if (error) {
        throw new Error(error)
      }

      if (response) {
        dispatch({
          type: "SET_RECORDS",
          payload: {
            records: response.data,
            pagination: response.meta,
          },
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch GPS tracking records"
      dispatch({ type: "SET_ERROR", payload: message })
      toast.error(message)
    }
  }, [state.filters])

  const createRecord = useCallback(async (data: GPSTrackingCreateRequest) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      const { data: newRecord, error } = await gpsTrackingApi.create(data)

      if (error) {
        throw new Error(error)
      }

      if (newRecord) {
        dispatch({ type: "ADD_RECORD", payload: newRecord })
        toast.success("GPS tracking record created successfully")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create GPS tracking record"
      dispatch({ type: "SET_ERROR", payload: message })
      toast.error(message)
      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  const updateRecord = useCallback(async (id: number, data: GPSTrackingUpdateRequest) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      const { data: updatedRecord, error } = await gpsTrackingApi.update(id, data)

      if (error) {
        throw new Error(error)
      }

      if (updatedRecord) {
        dispatch({ type: "UPDATE_RECORD", payload: updatedRecord })
        toast.success("GPS tracking record updated successfully")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update GPS tracking record"
      dispatch({ type: "SET_ERROR", payload: message })
      toast.error(message)
      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  const deleteRecord = useCallback(async (id: number) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      const { success, error } = await gpsTrackingApi.delete(id)

      if (error) {
        throw new Error(error)
      }

      if (success) {
        dispatch({ type: "DELETE_RECORD", payload: id })
        toast.success("GPS tracking record deleted successfully")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete GPS tracking record"
      dispatch({ type: "SET_ERROR", payload: message })
      toast.error(message)
      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  const setFilters = useCallback((filters: GPSTrackingFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters })
  }, [])

  const setSelectedRecord = useCallback((record: GPSTracking | null) => {
    dispatch({ type: "SET_SELECTED_RECORD", payload: record })
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [state.filters])

  const value: GpsTrackingContextType = {
    state,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    setFilters,
    setSelectedRecord,
  }

  return <GpsTrackingContext.Provider value={value}>{children}</GpsTrackingContext.Provider>
}

export function useGpsTracking() {
  const context = useContext(GpsTrackingContext)
  if (context === undefined) {
    throw new Error("useGpsTracking must be used within a GpsTrackingProvider")
  }
  return context
}
