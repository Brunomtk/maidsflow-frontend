"use client"

import { useState, useCallback } from "react"
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
import { useToast } from "./use-toast"
import { format, formatDistance } from "date-fns"
import { ptBR } from "date-fns/locale"

export function useReschedule() {
  const [rescheduleRequests, setRescheduleRequests] = useState<RescheduleRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<RescheduleRequest | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<RescheduleFilters>({})
  const { toast } = useToast()

  // Format dates in reschedule requests
  const formatRescheduleRequests = useCallback((requests: RescheduleRequest[]): RescheduleRequest[] => {
    return requests.map((request) => ({
      ...request,
      originalStart: new Date(request.originalStart),
      originalEnd: new Date(request.originalEnd),
      proposedStart: new Date(request.proposedStart),
      proposedEnd: new Date(request.proposedEnd),
      actualStart: request.actualStart ? new Date(request.actualStart) : undefined,
      actualEnd: request.actualEnd ? new Date(request.actualEnd) : undefined,
    }))
  }, [])

  // Helper functions for formatting
  const formatDate = useCallback((date: Date | string): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return format(dateObj, "dd/MM/yyyy", { locale: ptBR })
  }, [])

  const formatDateTime = useCallback((date: Date | string): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }, [])

  const formatTimeOnly = useCallback((date: Date | string): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return format(dateObj, "HH:mm", { locale: ptBR })
  }, [])

  const formatRelativeTime = useCallback((date: Date | string): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return formatDistance(dateObj, new Date(), { addSuffix: true, locale: ptBR })
  }, [])

  // Get status color
  const getStatusColor = useCallback((status: RescheduleRequest["status"]): string => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50"
      case "approved":
        return "text-green-600 bg-green-50"
      case "rejected":
        return "text-red-600 bg-red-50"
      case "cancelled":
        return "text-gray-600 bg-gray-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }, [])

  // Get status label
  const getStatusLabel = useCallback((status: RescheduleRequest["status"]): string => {
    switch (status) {
      case "pending":
        return "Pendente"
      case "approved":
        return "Aprovado"
      case "rejected":
        return "Rejeitado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }, [])

  // Get role label
  const getRoleLabel = useCallback((role: string): string => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "company":
        return "Empresa"
      case "professional":
        return "Profissional"
      case "customer":
        return "Cliente"
      default:
        return role
    }
  }, [])

  // Fetch all reschedule requests
  const fetchRescheduleRequests = useCallback(
    async (filters?: RescheduleFilters) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getRescheduleRequests(filters)
        const formattedData = formatRescheduleRequests(data)
        setRescheduleRequests(formattedData)
        return formattedData
      } catch (err) {
        const errorMessage = "Failed to fetch reschedule requests"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        console.error(err)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [formatRescheduleRequests, toast],
  )

  // Fetch a single reschedule request by ID
  const fetchRescheduleRequestById = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getRescheduleRequestById(id)
        const formattedRequest = {
          ...data,
          originalStart: new Date(data.originalStart),
          originalEnd: new Date(data.originalEnd),
          proposedStart: new Date(data.proposedStart),
          proposedEnd: new Date(data.proposedEnd),
          actualStart: data.actualStart ? new Date(data.actualStart) : undefined,
          actualEnd: data.actualEnd ? new Date(data.actualEnd) : undefined,
        }
        setSelectedRequest(formattedRequest)
        return formattedRequest
      } catch (err) {
        const errorMessage = "Failed to fetch reschedule request details"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        console.error(err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  // Create a new reschedule request
  const createRequest = useCallback(
    async (data: RescheduleRequestFormData) => {
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
          description: "Reschedule request created successfully",
        })

        return formattedRequest
      } catch (err) {
        const errorMessage = "Failed to create reschedule request"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        console.error(err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  // Update a reschedule request
  const updateRequest = useCallback(
    async (id: string, data: Partial<RescheduleRequestFormData>) => {
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

        if (selectedRequest?.id === id) {
          setSelectedRequest(formattedRequest)
        }

        toast({
          title: "Success",
          description: "Reschedule request updated successfully",
        })

        return formattedRequest
      } catch (err) {
        const errorMessage = "Failed to update reschedule request"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        console.error(err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [selectedRequest, toast],
  )

  // Delete a reschedule request
  const deleteRequest = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)
      try {
        await deleteRescheduleRequest(id)
        setRescheduleRequests((prev) => prev.filter((request) => request.id !== id))

        if (selectedRequest?.id === id) {
          setSelectedRequest(null)
        }

        toast({
          title: "Success",
          description: "Reschedule request deleted successfully",
        })

        return true
      } catch (err) {
        const errorMessage = "Failed to delete reschedule request"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        console.error(err)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [selectedRequest, toast],
  )

  // Respond to a reschedule request
  const respondToRequest = useCallback(
    async (id: string, responseData: RescheduleResponseData) => {
      setIsLoading(true)
      setError(null)
      try {
        // Convert Date objects to ISO strings for the API
        const apiData = {
          ...responseData,
          actualStart:
            responseData.actualStart instanceof Date
              ? responseData.actualStart.toISOString()
              : responseData.actualStart,
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

        if (selectedRequest?.id === id) {
          setSelectedRequest(formattedRequest)
        }

        toast({
          title: "Success",
          description: `Reschedule request ${responseData.status === "approved" ? "approved" : "rejected"} successfully`,
        })

        return formattedRequest
      } catch (err) {
        const errorMessage = `Failed to ${responseData.status} reschedule request`
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        console.error(err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [selectedRequest, toast],
  )

  // Cancel a reschedule request
  const cancelRequest = useCallback(
    async (id: string, note?: string) => {
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

        if (selectedRequest?.id === id) {
          setSelectedRequest(formattedRequest)
        }

        toast({
          title: "Success",
          description: "Reschedule request cancelled successfully",
        })

        return formattedRequest
      } catch (err) {
        const errorMessage = "Failed to cancel reschedule request"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        console.error(err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [selectedRequest, toast],
  )

  // Fetch reschedule requests by company
  const fetchRequestsByCompany = useCallback(
    async (companyId: string, filters?: RescheduleFilters) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getRescheduleRequestsByCompany(companyId, filters)
        const formattedData = formatRescheduleRequests(data)
        setRescheduleRequests(formattedData)
        return formattedData
      } catch (err) {
        const errorMessage = "Failed to fetch company reschedule requests"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        console.error(err)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [formatRescheduleRequests, toast],
  )

  // Fetch reschedule requests by customer
  const fetchRequestsByCustomer = useCallback(
    async (customerId: string, filters?: RescheduleFilters) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getRescheduleRequestsByCustomer(customerId, filters)
        const formattedData = formatRescheduleRequests(data)
        setRescheduleRequests(formattedData)
        return formattedData
      } catch (err) {
        const errorMessage = "Failed to fetch customer reschedule requests"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        console.error(err)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [formatRescheduleRequests, toast],
  )

  // Fetch reschedule requests by professional
  const fetchRequestsByProfessional = useCallback(
    async (professionalId: string, filters?: RescheduleFilters) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getRescheduleRequestsByProfessional(professionalId, filters)
        const formattedData = formatRescheduleRequests(data)
        setRescheduleRequests(formattedData)
        return formattedData
      } catch (err) {
        const errorMessage = "Failed to fetch professional reschedule requests"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        console.error(err)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [formatRescheduleRequests, toast],
  )

  // Fetch reschedule requests by team
  const fetchRequestsByTeam = useCallback(
    async (teamId: string, filters?: RescheduleFilters) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getRescheduleRequestsByTeam(teamId, filters)
        const formattedData = formatRescheduleRequests(data)
        setRescheduleRequests(formattedData)
        return formattedData
      } catch (err) {
        const errorMessage = "Failed to fetch team reschedule requests"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        console.error(err)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [formatRescheduleRequests, toast],
  )

  // Fetch reschedule requests by status
  const fetchRequestsByStatus = useCallback(
    async (status: RescheduleRequest["status"], filters?: RescheduleFilters) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getRescheduleRequestsByStatus(status, filters)
        const formattedData = formatRescheduleRequests(data)
        setRescheduleRequests(formattedData)
        return formattedData
      } catch (err) {
        const errorMessage = `Failed to fetch ${status} reschedule requests`
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        console.error(err)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [formatRescheduleRequests, toast],
  )

  // Fetch reschedule requests by date range
  const fetchRequestsByDateRange = useCallback(
    async (startDate: string, endDate: string, filters?: RescheduleFilters) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getRescheduleRequestsByDateRange(startDate, endDate, filters)
        const formattedData = formatRescheduleRequests(data)
        setRescheduleRequests(formattedData)
        return formattedData
      } catch (err) {
        const errorMessage = "Failed to fetch reschedule requests for date range"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        console.error(err)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [formatRescheduleRequests, toast],
  )

  // Send notification for reschedule request
  const sendNotification = useCallback(
    async (id: string) => {
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

        if (selectedRequest?.id === id) {
          setSelectedRequest(formattedRequest)
        }

        toast({
          title: "Success",
          description: "Notification sent successfully",
        })

        return formattedRequest
      } catch (err) {
        const errorMessage = "Failed to send notification"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        console.error(err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [selectedRequest, toast],
  )

  // Select a request
  const selectRequest = useCallback((request: RescheduleRequest | null) => {
    setSelectedRequest(request)
  }, [])

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<RescheduleFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  return {
    rescheduleRequests,
    selectedRequest,
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
    selectRequest,
    updateFilters,
    clearFilters,
    formatDate,
    formatDateTime,
    formatTimeOnly,
    formatRelativeTime,
    getStatusColor,
    getStatusLabel,
    getRoleLabel,
  }
}
