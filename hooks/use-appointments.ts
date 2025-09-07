"use client"

import { useState, useCallback } from "react"
import { appointmentsApi } from "@/lib/api/appointments"
import { useToast } from "@/hooks/use-toast"
import type { Appointment, AppointmentFilters } from "@/types/appointment"

interface PaginationInfo {
  currentPage: number
  pageCount: number
  pageSize: number
  totalItems: number
  firstRowOnPage: number
  lastRowOnPage: number
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    pageCount: 1,
    pageSize: 10,
    totalItems: 0,
    firstRowOnPage: 1,
    lastRowOnPage: 0,
  })
  const { toast } = useToast()

  const fetchAppointments = useCallback(
    async (filters: AppointmentFilters = {}) => {
      setIsLoading(true)
      try {
        const response = await appointmentsApi.getAppointments(filters)
        setAppointments(response.results || [])
        setPagination({
          currentPage: response.currentPage,
          pageCount: response.pageCount,
          pageSize: response.pageSize,
          totalItems: response.totalItems,
          firstRowOnPage: response.firstRowOnPage,
          lastRowOnPage: response.lastRowOnPage,
        })
      } catch (error) {
        console.error("Error fetching appointments:", error)
        toast({
          title: "Error",
          description: "Failed to load appointments",
          variant: "destructive",
        })
        setAppointments([])
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const addAppointment = useCallback(
    async (appointmentData: any) => {
      try {
        await appointmentsApi.createAppointment(appointmentData)
        toast({
          title: "Success",
          description: "Appointment created successfully",
        })
        return true
      } catch (error) {
        console.error("Error creating appointment:", error)
        toast({
          title: "Error",
          description: "Failed to create appointment",
          variant: "destructive",
        })
        return false
      }
    },
    [toast],
  )

  const updateAppointment = useCallback(
    async (id: number, appointmentData: any) => {
      try {
        await appointmentsApi.updateAppointment(id, appointmentData)
        toast({
          title: "Success",
          description: "Appointment updated successfully",
        })
        return true
      } catch (error) {
        console.error("Error updating appointment:", error)
        toast({
          title: "Error",
          description: "Failed to update appointment",
          variant: "destructive",
        })
        return false
      }
    },
    [toast],
  )

  const removeAppointment = useCallback(
    async (id: number) => {
      try {
        await appointmentsApi.deleteAppointment(id)
        toast({
          title: "Success",
          description: "Appointment deleted successfully",
        })
        return true
      } catch (error) {
        console.error("Error deleting appointment:", error)
        toast({
          title: "Error",
          description: "Failed to delete appointment",
          variant: "destructive",
        })
        return false
      }
    },
    [toast],
  )

  return {
    appointments,
    isLoading,
    pagination,
    fetchAppointments,
    addAppointment,
    updateAppointment,
    removeAppointment,
  }
}
