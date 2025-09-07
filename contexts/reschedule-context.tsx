"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type {
  RescheduleRequest,
  RescheduleRequestFormData,
  RescheduleResponseData,
  RescheduleFilters,
} from "@/types/reschedule"
import {
  getRescheduleRequests,
  getRescheduleRequestById,
  createRescheduleRequest,
  updateRescheduleRequest,
  deleteRescheduleRequest,
  respondToRescheduleRequest,
  cancelRescheduleRequest,
  getRescheduleRequestsByCompany,
  getRescheduleRequestsByCustomer,
  getRescheduleRequestsByProfessional,
  getRescheduleRequestsByTeam,
  getRescheduleRequestsByStatus,
  getRescheduleRequestsByDateRange,
  sendRescheduleNotification,
} from "@/lib/api/reschedule"
import { useToast } from "@/hooks/use-toast"

interface RescheduleContextType {
  rescheduleRequests: RescheduleRequest[]
  isLoading: boolean
  error: string | null
  filters: RescheduleFilters
  fetchRescheduleRequests: (filters?: RescheduleFilters) => Promise<void>
  fetchRescheduleRequestById: (id: string) => Promise<RescheduleRequest | null>
  createRequest: (data: RescheduleRequestFormData) => Promise<RescheduleRequest | null>
  updateRequest: (id: string, data: Partial<RescheduleRequestFormData>) => Promise<RescheduleRequest | null>
  deleteRequest: (id: string) => Promise<boolean>
  respondToRequest: (id: string, responseData: RescheduleResponseData) => Promise<RescheduleRequest | null>
  cancelRequest: (id: string, note?: string) => Promise<RescheduleRequest | null>
  fetchRequestsByCompany: (companyId: string, filters?: RescheduleFilters) => Promise<void>
  fetchRequestsByCustomer: (customerId: string, filters?: RescheduleFilters) => Promise<void>
  fetchRequestsByProfessional: (professionalId: string, filters?: RescheduleFilters) => Promise<void>
  fetchRequestsByTeam: (teamId: string, filters?: RescheduleFilters) => Promise<void>
  fetchRequestsByStatus: (status: RescheduleRequest["status"], filters?: RescheduleFilters) => Promise<void>
  fetchRequestsByDateRange: (startDate: string, endDate: string, filters?: RescheduleFilters) => Promise<void>
  sendNotification: (id: string) => Promise<RescheduleRequest | null>
  setFilters: (filters: RescheduleFilters) => void
  clearFilters: () => void
}

const RescheduleContext = createContext<RescheduleContextType | undefined>(undefined)

export function RescheduleProvider({ children }: { children: ReactNode }) {
  const [rescheduleRequests, setRescheduleRequests] = useState<RescheduleRequest[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<RescheduleFilters>({})
  const { toast } = useToast()

  // Format dates in reschedule requests
  const formatRescheduleRequests = (requests: RescheduleRequest[]): RescheduleRequest[] => {
    return requests.map((request) => ({
      ...request,
      originalStart: new Date(request.originalStart),
      originalEnd: new Date(request.originalEnd),
      proposedStart: new Date(request.proposedStart),
      proposedEnd: new Date(request.proposedEnd),
      actualStart: request.actualStart ? new Date(request.actualStart) : undefined,
      actualEnd: request.actualEnd ? new Date(request.actualEnd) : undefined,
    }))
  }

  const fetchRescheduleRequests = async (filters?: RescheduleFilters) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getRescheduleRequests(filters)
      const formattedData = formatRescheduleRequests(data)
      setRescheduleRequests(formattedData)
    } catch (err) {
      setError("Failed to fetch reschedule requests")
      toast({
        title: "Error",
        description: "Failed to fetch reschedule requests. Please try again.",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRescheduleRequestById = async (id: string): Promise<RescheduleRequest | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getRescheduleRequestById(id)
      return {
        ...data,
        originalStart: new Date(data.originalStart),
        originalEnd: new Date(data.originalEnd),
        proposedStart: new Date(data.proposedStart),
        proposedEnd: new Date(data.proposedEnd),
        actualStart: data.actualStart ? new Date(data.actualStart) : undefined,
        actualEnd: data.actualEnd ? new Date(data.actualEnd) : undefined,
      }
    } catch (err) {
      setError("Failed to fetch reschedule request details")
      toast({
        title: "Error",
        description: "Failed to fetch reschedule request details. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const createRequest = async (data: RescheduleRequestFormData): Promise<RescheduleRequest | null> => {
    setIsLoading(true)
    setError(null)
    try {
      // Convert Date objects to ISO strings for the API
      const apiData = {
        ...data,
        originalStart: data.originalStart instanceof Date ? data.originalStart.toISOString() : data.originalStart,
        originalEnd: data.originalEnd instanceof Date ? data.originalEnd.toISOString() : data.originalEnd,
        proposedStart: data.proposedStart instanceof Date ? data.proposedStart.toISOString() : data.proposedStart,
        proposedEnd: data.proposedEnd instanceof Date ? data.proposedEnd.toISOString() : data.proposedEnd,
      }

      const newRequest = await createRescheduleRequest(apiData)

      // Convert back to Date objects for the frontend
      const formattedRequest = {
        ...newRequest,
        originalStart: new Date(newRequest.originalStart),
        originalEnd: new Date(newRequest.originalEnd),
        proposedStart: new Date(newRequest.proposedStart),
        proposedEnd: new Date(newRequest.proposedEnd),
        actualStart: newRequest.actualStart ? new Date(newRequest.actualStart) : undefined,
        actualEnd: newRequest.actualEnd ? new Date(newRequest.actualEnd) : undefined,
      }

      setRescheduleRequests((prev) => [...prev, formattedRequest])

      toast({
        title: "Success",
        description: "Reschedule request created successfully.",
      })

      return formattedRequest
    } catch (err) {
      setError("Failed to create reschedule request")
      toast({
        title: "Error",
        description: "Failed to create reschedule request. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updateRequest = async (
    id: string,
    data: Partial<RescheduleRequestFormData>,
  ): Promise<RescheduleRequest | null> => {
    setIsLoading(true)
    setError(null)
    try {
      // Convert Date objects to ISO strings for the API
      const apiData = {
        ...data,
        originalStart: data.originalStart instanceof Date ? data.originalStart.toISOString() : data.originalStart,
        originalEnd: data.originalEnd instanceof Date ? data.originalEnd.toISOString() : data.originalEnd,
        proposedStart: data.proposedStart instanceof Date ? data.proposedStart.toISOString() : data.proposedStart,
        proposedEnd: data.proposedEnd instanceof Date ? data.proposedEnd.toISOString() : data.proposedEnd,
      }

      const updatedRequest = await updateRescheduleRequest(id, apiData)

      // Convert back to Date objects for the frontend
      const formattedRequest = {
        ...updatedRequest,
        originalStart: new Date(updatedRequest.originalStart),
        originalEnd: new Date(updatedRequest.originalEnd),
        proposedStart: new Date(updatedRequest.proposedStart),
        proposedEnd: new Date(updatedRequest.proposedEnd),
        actualStart: updatedRequest.actualStart ? new Date(updatedRequest.actualStart) : undefined,
        actualEnd: updatedRequest.actualEnd ? new Date(updatedRequest.actualEnd) : undefined,
      }

      setRescheduleRequests((prev) => prev.map((request) => (request.id === id ? formattedRequest : request)))

      toast({
        title: "Success",
        description: "Reschedule request updated successfully.",
      })

      return formattedRequest
    } catch (err) {
      setError("Failed to update reschedule request")
      toast({
        title: "Error",
        description: "Failed to update reschedule request. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const deleteRequest = async (id: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await deleteRescheduleRequest(id)
      setRescheduleRequests((prev) => prev.filter((request) => request.id !== id))
      toast({
        title: "Success",
        description: "Reschedule request deleted successfully.",
      })
      return true
    } catch (err) {
      setError("Failed to delete reschedule request")
      toast({
        title: "Error",
        description: "Failed to delete reschedule request. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const respondToRequest = async (
    id: string,
    responseData: RescheduleResponseData,
  ): Promise<RescheduleRequest | null> => {
    setIsLoading(true)
    setError(null)
    try {
      // Convert Date objects to ISO strings for the API
      const apiData = {
        ...responseData,
        actualStart:
          responseData.actualStart instanceof Date ? responseData.actualStart.toISOString() : responseData.actualStart,
        actualEnd:
          responseData.actualEnd instanceof Date ? responseData.actualEnd.toISOString() : responseData.actualEnd,
      }

      const updatedRequest = await respondToRescheduleRequest(id, apiData)

      // Convert back to Date objects for the frontend
      const formattedRequest = {
        ...updatedRequest,
        originalStart: new Date(updatedRequest.originalStart),
        originalEnd: new Date(updatedRequest.originalEnd),
        proposedStart: new Date(updatedRequest.proposedStart),
        proposedEnd: new Date(updatedRequest.proposedEnd),
        actualStart: updatedRequest.actualStart ? new Date(updatedRequest.actualStart) : undefined,
        actualEnd: updatedRequest.actualEnd ? new Date(updatedRequest.actualEnd) : undefined,
      }

      setRescheduleRequests((prev) => prev.map((request) => (request.id === id ? formattedRequest : request)))

      toast({
        title: "Success",
        description: `Reschedule request ${responseData.status === "approved" ? "approved" : "rejected"} successfully.`,
      })

      return formattedRequest
    } catch (err) {
      setError(`Failed to ${responseData.status} reschedule request`)
      toast({
        title: "Error",
        description: `Failed to ${responseData.status} reschedule request. Please try again.`,
        variant: "destructive",
      })
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const cancelRequest = async (id: string, note?: string): Promise<RescheduleRequest | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedRequest = await cancelRescheduleRequest(id, note)

      // Convert back to Date objects for the frontend
      const formattedRequest = {
        ...updatedRequest,
        originalStart: new Date(updatedRequest.originalStart),
        originalEnd: new Date(updatedRequest.originalEnd),
        proposedStart: new Date(updatedRequest.proposedStart),
        proposedEnd: new Date(updatedRequest.proposedEnd),
        actualStart: updatedRequest.actualStart ? new Date(updatedRequest.actualStart) : undefined,
        actualEnd: updatedRequest.actualEnd ? new Date(updatedRequest.actualEnd) : undefined,
      }

      setRescheduleRequests((prev) => prev.map((request) => (request.id === id ? formattedRequest : request)))

      toast({
        title: "Success",
        description: "Reschedule request cancelled successfully.",
      })

      return formattedRequest
    } catch (err) {
      setError("Failed to cancel reschedule request")
      toast({
        title: "Error",
        description: "Failed to cancel reschedule request. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRequestsByCompany = async (companyId: string, filters?: RescheduleFilters) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getRescheduleRequestsByCompany(companyId, filters)
      const formattedData = formatRescheduleRequests(data)
      setRescheduleRequests(formattedData)
    } catch (err) {
      setError("Failed to fetch company reschedule requests")
      toast({
        title: "Error",
        description: "Failed to fetch company reschedule requests. Please try again.",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRequestsByCustomer = async (customerId: string, filters?: RescheduleFilters) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getRescheduleRequestsByCustomer(customerId, filters)
      const formattedData = formatRescheduleRequests(data)
      setRescheduleRequests(formattedData)
    } catch (err) {
      setError("Failed to fetch customer reschedule requests")
      toast({
        title: "Error",
        description: "Failed to fetch customer reschedule requests. Please try again.",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRequestsByProfessional = async (professionalId: string, filters?: RescheduleFilters) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getRescheduleRequestsByProfessional(professionalId, filters)
      const formattedData = formatRescheduleRequests(data)
      setRescheduleRequests(formattedData)
    } catch (err) {
      setError("Failed to fetch professional reschedule requests")
      toast({
        title: "Error",
        description: "Failed to fetch professional reschedule requests. Please try again.",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRequestsByTeam = async (teamId: string, filters?: RescheduleFilters) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getRescheduleRequestsByTeam(teamId, filters)
      const formattedData = formatRescheduleRequests(data)
      setRescheduleRequests(formattedData)
    } catch (err) {
      setError("Failed to fetch team reschedule requests")
      toast({
        title: "Error",
        description: "Failed to fetch team reschedule requests. Please try again.",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRequestsByStatus = async (status: RescheduleRequest["status"], filters?: RescheduleFilters) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getRescheduleRequestsByStatus(status, filters)
      const formattedData = formatRescheduleRequests(data)
      setRescheduleRequests(formattedData)
    } catch (err) {
      setError(`Failed to fetch ${status} reschedule requests`)
      toast({
        title: "Error",
        description: `Failed to fetch ${status} reschedule requests. Please try again.`,
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRequestsByDateRange = async (startDate: string, endDate: string, filters?: RescheduleFilters) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getRescheduleRequestsByDateRange(startDate, endDate, filters)
      const formattedData = formatRescheduleRequests(data)
      setRescheduleRequests(formattedData)
    } catch (err) {
      setError("Failed to fetch reschedule requests for date range")
      toast({
        title: "Error",
        description: "Failed to fetch reschedule requests for date range. Please try again.",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const sendNotification = async (id: string): Promise<RescheduleRequest | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedRequest = await sendRescheduleNotification(id)

      // Convert back to Date objects for the frontend
      const formattedRequest = {
        ...updatedRequest,
        originalStart: new Date(updatedRequest.originalStart),
        originalEnd: new Date(updatedRequest.originalEnd),
        proposedStart: new Date(updatedRequest.proposedStart),
        proposedEnd: new Date(updatedRequest.proposedEnd),
        actualStart: updatedRequest.actualStart ? new Date(updatedRequest.actualStart) : undefined,
        actualEnd: updatedRequest.actualEnd ? new Date(updatedRequest.actualEnd) : undefined,
      }

      setRescheduleRequests((prev) => prev.map((request) => (request.id === id ? formattedRequest : request)))

      toast({
        title: "Success",
        description: "Notification sent successfully.",
      })

      return formattedRequest
    } catch (err) {
      setError("Failed to send notification")
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const clearFilters = () => {
    setFilters({})
  }

  // Initial fetch
  useEffect(() => {
    fetchRescheduleRequests(filters)
  }, [filters])

  return (
    <RescheduleContext.Provider
      value={{
        rescheduleRequests,
        isLoading,
        error,
        filters,
        fetchRescheduleRequests,
        fetchRescheduleRequestById,
        createRequest,
        updateRequest,
        deleteRequest,
        respondToRequest,
        cancelRequest,
        fetchRequestsByCompany,
        fetchRequestsByCustomer,
        fetchRequestsByProfessional,
        fetchRequestsByTeam,
        fetchRequestsByStatus,
        fetchRequestsByDateRange,
        sendNotification,
        setFilters,
        clearFilters,
      }}
    >
      {children}
    </RescheduleContext.Provider>
  )
}

export function useRescheduleContext() {
  const context = useContext(RescheduleContext)
  if (context === undefined) {
    throw new Error("useRescheduleContext must be used within a RescheduleProvider")
  }
  return context
}
