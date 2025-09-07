"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
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
import { useToast } from "@/hooks/use-toast"

interface ProfessionalScheduleContextType {
  appointments: Appointment[]
  currentAppointment: Appointment | null
  isLoading: boolean
  error: string | null
  fetchAppointments: (filters?: AppointmentFilters) => Promise<void>
  fetchAppointmentById: (id: string) => Promise<Appointment | null>
  fetchAppointmentsByDateRange: (startDate: string, endDate: string, filters?: AppointmentFilters) => Promise<void>
  checkIn: (appointmentId: string, data: { location: { lat: number; lng: number }; notes?: string }) => Promise<boolean>
  checkOut: (
    appointmentId: string,
    data: { location: { lat: number; lng: number }; notes?: string; completionDetails?: Record<string, any> },
  ) => Promise<boolean>
  requestReschedule: (
    appointmentId: string,
    data: { reason: string; suggestedDates: string[] },
  ) => Promise<{ success: boolean; message: string } | null>
  cancelAppointment: (appointmentId: string, reason: string) => Promise<{ success: boolean; message: string } | null>
  availability: { date: string; slots: { start: string; end: string }[] }[]
  fetchAvailability: (startDate: string, endDate: string) => Promise<void>
  updateAvailability: (
    data: { date: string; slots: { start: string; end: string }[] }[],
  ) => Promise<{ success: boolean; message: string } | null>
  scheduleSummary: {
    totalAppointments: number
    completedAppointments: number
    cancelledAppointments: number
    clientsServed: number
    completionRate: number
  } | null
  fetchScheduleSummary: (month: number, year: number) => Promise<void>
}

const ProfessionalScheduleContext = createContext<ProfessionalScheduleContextType | undefined>(undefined)

export function ProfessionalScheduleProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
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
  const formatAppointment = (appointment: Appointment): Appointment => {
    return {
      ...appointment,
      start: new Date(appointment.start),
      end: new Date(appointment.end),
    } as unknown as Appointment
  }

  const formatAppointments = (appointments: Appointment[]): Appointment[] => {
    return appointments.map(formatAppointment)
  }

  const fetchAppointments = async (filters?: AppointmentFilters) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getProfessionalAppointments(filters)
      const formattedData = formatAppointments(data)
      setAppointments(formattedData)
    } catch (err) {
      const errorMessage = "Failed to fetch appointments"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAppointmentById = async (id: string): Promise<Appointment | null> => {
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
  }

  const fetchAppointmentsByDateRange = async (startDate: string, endDate: string, filters?: AppointmentFilters) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getProfessionalAppointmentsByDateRange(startDate, endDate, filters)
      const formattedData = formatAppointments(data)
      setAppointments(formattedData)
    } catch (err) {
      const errorMessage = "Failed to fetch appointments for date range"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const checkIn = async (
    appointmentId: string,
    data: { location: { lat: number; lng: number }; notes?: string },
  ): Promise<boolean> => {
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
  }

  const checkOut = async (
    appointmentId: string,
    data: { location: { lat: number; lng: number }; notes?: string; completionDetails?: Record<string, any> },
  ): Promise<boolean> => {
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
  }

  const requestReschedule = async (
    appointmentId: string,
    data: { reason: string; suggestedDates: string[] },
  ): Promise<{ success: boolean; message: string } | null> => {
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
  }

  const cancelAppointment = async (
    appointmentId: string,
    reason: string,
  ): Promise<{ success: boolean; message: string } | null> => {
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
  }

  const fetchAvailability = async (startDate: string, endDate: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getProfessionalAvailability(startDate, endDate)
      setAvailability(data)
    } catch (err) {
      const errorMessage = "Failed to fetch availability"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateAvailability = async (
    data: { date: string; slots: { start: string; end: string }[] }[],
  ): Promise<{ success: boolean; message: string } | null> => {
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
  }

  const fetchScheduleSummary = async (month: number, year: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getProfessionalScheduleSummary(month, year)
      setScheduleSummary(data)
    } catch (err) {
      const errorMessage = "Failed to fetch schedule summary"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchAppointments()
    // Get current month and year for summary
    const now = new Date()
    fetchScheduleSummary(now.getMonth() + 1, now.getFullYear())
  }, [])

  return (
    <ProfessionalScheduleContext.Provider
      value={{
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
      }}
    >
      {children}
    </ProfessionalScheduleContext.Provider>
  )
}

export function useProfessionalScheduleContext() {
  const context = useContext(ProfessionalScheduleContext)
  if (context === undefined) {
    throw new Error("useProfessionalScheduleContext must be used within a ProfessionalScheduleProvider")
  }
  return context
}
