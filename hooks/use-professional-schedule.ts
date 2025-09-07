"use client"

import { useState, useCallback } from "react"
import type { Appointment, AppointmentFilters } from "@/types/appointment"
import {
  getProfessionalAppointments,
  getProfessionalAppointmentById,
  getProfessionalAppointmentsByDateRange,
  checkInToAppointment,
  checkOutFromAppointment,
  requestRescheduleAppointment,
  cancelProfessionalAppointment,
  getProfessionalAvailability,
  updateProfessionalAvailability,
  getProfessionalScheduleSummary,
} from "@/lib/api/professional-schedule"
import { useToast } from "./use-toast"

export function useProfessionalSchedule() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availability, setAvailability] = useState<{ date: string; slots: { start: string; end: string }[] }[]>([])
  const [scheduleSummary, setScheduleSummary] = useState<{
    totalAppointments: number
    completedAppointments: number
    cancelledAppointments: number
    clientsServed: number
    completionRate: number
  } | null>(null)
  const { toast } = useToast()

  // Format appointments to have Date objects instead of strings
  const formatAppointment = useCallback((appointment: Appointment): Appointment => {
    return {
      ...appointment,
      start: new Date(appointment.start),
      end: new Date(appointment.end),
    } as unknown as Appointment
  }, [])

  const formatAppointments = useCallback(
    (appointments: Appointment[]): Appointment[] => {
      return appointments.map(formatAppointment)
    },
    [formatAppointment],
  )

  // Fetch all appointments for the professional
  const fetchAppointments = useCallback(
    async (filters?: AppointmentFilters) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getProfessionalAppointments(filters)
        const formattedData = formatAppointments(data)
        setAppointments(formattedData)
        return formattedData
      } catch (err) {
        const errorMessage = "Failed to fetch appointments"
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
    [formatAppointments, toast],
  )

  // Fetch a single appointment by ID
  const fetchAppointmentById = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getProfessionalAppointmentById(id)
        const formattedData = formatAppointment(data)
        setCurrentAppointment(formattedData)
        return formattedData
      } catch (err) {
        const errorMessage = "Failed to fetch appointment details"
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
    [formatAppointment, toast],
  )

  // Fetch appointments by date range
  const fetchAppointmentsByDateRange = useCallback(
    async (startDate: string, endDate: string, filters?: AppointmentFilters) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getProfessionalAppointmentsByDateRange(startDate, endDate, filters)
        const formattedData = formatAppointments(data)
        setAppointments(formattedData)
        return formattedData
      } catch (err) {
        const errorMessage = "Failed to fetch appointments for date range"
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
    [formatAppointments, toast],
  )

  // Check in to an appointment
  const checkIn = useCallback(
    async (appointmentId: string, data: { location: { lat: number; lng: number }; notes?: string }) => {
      setIsLoading(true)
      setError(null)
      try {
        const updatedAppointment = await checkInToAppointment(appointmentId, data)
        const formattedAppointment = formatAppointment(updatedAppointment)

        setAppointments((prev) =>
          prev.map((appointment) => (appointment.id === appointmentId ? formattedAppointment : appointment)),
        )

        if (currentAppointment?.id === appointmentId) {
          setCurrentAppointment(formattedAppointment)
        }

        toast({
          title: "Success",
          description: "Successfully checked in to appointment",
        })

        return true
      } catch (err) {
        const errorMessage = "Failed to check in to appointment"
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
    [formatAppointment, currentAppointment?.id, toast],
  )

  // Check out from an appointment
  const checkOut = useCallback(
    async (
      appointmentId: string,
      data: { location: { lat: number; lng: number }; notes?: string; completionDetails?: Record<string, any> },
    ) => {
      setIsLoading(true)
      setError(null)
      try {
        const updatedAppointment = await checkOutFromAppointment(appointmentId, data)
        const formattedAppointment = formatAppointment(updatedAppointment)

        setAppointments((prev) =>
          prev.map((appointment) => (appointment.id === appointmentId ? formattedAppointment : appointment)),
        )

        if (currentAppointment?.id === appointmentId) {
          setCurrentAppointment(formattedAppointment)
        }

        toast({
          title: "Success",
          description: "Successfully checked out from appointment",
        })

        return true
      } catch (err) {
        const errorMessage = "Failed to check out from appointment"
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
    [formatAppointment, currentAppointment?.id, toast],
  )

  // Request to reschedule an appointment
  const requestReschedule = useCallback(
    async (appointmentId: string, data: { reason: string; suggestedDates: string[] }) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await requestRescheduleAppointment(appointmentId, data)

        toast({
          title: result.success ? "Success" : "Information",
          description: result.message,
        })

        return result
      } catch (err) {
        const errorMessage = "Failed to request appointment reschedule"
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

  // Cancel an appointment
  const cancelAppointment = useCallback(
    async (appointmentId: string, reason: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await cancelProfessionalAppointment(appointmentId, { reason })

        if (result.success) {
          setAppointments((prev) => prev.filter((appointment) => appointment.id !== appointmentId))

          if (currentAppointment?.id === appointmentId) {
            setCurrentAppointment(null)
          }
        }

        toast({
          title: result.success ? "Success" : "Information",
          description: result.message,
        })

        return result
      } catch (err) {
        const errorMessage = "Failed to cancel appointment"
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
    [currentAppointment?.id, toast],
  )

  // Get professional's availability
  const fetchAvailability = useCallback(
    async (startDate: string, endDate: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getProfessionalAvailability(startDate, endDate)
        setAvailability(data)
        return data
      } catch (err) {
        const errorMessage = "Failed to fetch availability"
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
    [toast],
  )

  // Update professional's availability
  const updateAvailability = useCallback(
    async (data: { date: string; slots: { start: string; end: string }[] }[]) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await updateProfessionalAvailability(data)

        if (result.success) {
          // Update local availability state if needed
          // This might require refetching or merging the updated data
        }

        toast({
          title: result.success ? "Success" : "Information",
          description: result.message,
        })

        return result
      } catch (err) {
        const errorMessage = "Failed to update availability"
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

  // Get professional's schedule summary
  const fetchScheduleSummary = useCallback(
    async (month: number, year: number) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getProfessionalScheduleSummary(month, year)
        setScheduleSummary(data)
        return data
      } catch (err) {
        const errorMessage = "Failed to fetch schedule summary"
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

  return {
    appointments,
    currentAppointment,
    isLoading,
    error,
    fetchAppointments,
    fetchAppointmentById,
    fetchAppointmentsByDateRange,
    checkIn,
    checkOut,
    requestReschedule,
    cancelAppointment,
    availability,
    fetchAvailability,
    updateAvailability,
    scheduleSummary,
    fetchScheduleSummary,
  }
}
