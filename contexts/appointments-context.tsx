"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Appointment } from "@/types/appointment"
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentById,
} from "@/lib/api/appointments"
import { useToast } from "@/hooks/use-toast"

interface AppointmentsContextType {
  appointments: Appointment[]
  isLoading: boolean
  error: string | null
  fetchAppointments: (filters?: Record<string, any>) => Promise<void>
  fetchAppointmentById: (id: string) => Promise<Appointment | null>
  addAppointment: (data: Omit<Appointment, "id" | "createdAt" | "updatedAt">) => Promise<Appointment | null>
  editAppointment: (
    id: string,
    data: Partial<Omit<Appointment, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<Appointment | null>
  removeAppointment: (id: string) => Promise<boolean>
  refreshAppointments: () => Promise<void>
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined)

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchAppointments = async (filters?: Record<string, any>) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAppointments(filters)

      // Convert string dates to Date objects for the frontend
      const formattedAppointments = data.map((appointment) => ({
        ...appointment,
        start: new Date(appointment.start),
        end: new Date(appointment.end),
      })) as unknown as Appointment[]

      setAppointments(formattedAppointments)
    } catch (err) {
      setError("Failed to fetch appointments")
      toast({
        title: "Error",
        description: "Failed to fetch appointments. Please try again.",
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
      const appointment = await getAppointmentById(id)
      return {
        ...appointment,
        start: new Date(appointment.start),
        end: new Date(appointment.end),
      } as unknown as Appointment
    } catch (err) {
      setError("Failed to fetch appointment details")
      toast({
        title: "Error",
        description: "Failed to fetch appointment details. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const addAppointment = async (
    data: Omit<Appointment, "id" | "createdAt" | "updatedAt">,
  ): Promise<Appointment | null> => {
    setIsLoading(true)
    setError(null)
    try {
      // Convert Date objects to ISO strings for the API
      const apiData = {
        ...data,
        start: data.start instanceof Date ? data.start.toISOString() : data.start,
        end: data.end instanceof Date ? data.end.toISOString() : data.end,
      }

      const newAppointment = await createAppointment(apiData)

      // Convert back to Date objects for the frontend
      const formattedAppointment = {
        ...newAppointment,
        start: new Date(newAppointment.start),
        end: new Date(newAppointment.end),
      } as unknown as Appointment

      setAppointments((prev) => [...prev, formattedAppointment])

      toast({
        title: "Success",
        description: "Appointment created successfully.",
      })

      return formattedAppointment
    } catch (err) {
      setError("Failed to create appointment")
      toast({
        title: "Error",
        description: "Failed to create appointment. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const editAppointment = async (
    id: string,
    data: Partial<Omit<Appointment, "id" | "createdAt" | "updatedAt">>,
  ): Promise<Appointment | null> => {
    setIsLoading(true)
    setError(null)
    try {
      // Convert Date objects to ISO strings for the API
      const apiData = {
        ...data,
        start: data.start instanceof Date ? data.start.toISOString() : data.start,
        end: data.end instanceof Date ? data.end.toISOString() : data.end,
      }

      const updatedAppointment = await updateAppointment(id, apiData)

      // Convert back to Date objects for the frontend
      const formattedAppointment = {
        ...updatedAppointment,
        start: new Date(updatedAppointment.start),
        end: new Date(updatedAppointment.end),
      } as unknown as Appointment

      setAppointments((prev) => prev.map((appointment) => (appointment.id === id ? formattedAppointment : appointment)))

      toast({
        title: "Success",
        description: "Appointment updated successfully.",
      })

      return formattedAppointment
    } catch (err) {
      setError("Failed to update appointment")
      toast({
        title: "Error",
        description: "Failed to update appointment. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const removeAppointment = async (id: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await deleteAppointment(id)
      setAppointments((prev) => prev.filter((appointment) => appointment.id !== id))
      toast({
        title: "Success",
        description: "Appointment deleted successfully.",
      })
      return true
    } catch (err) {
      setError("Failed to delete appointment")
      toast({
        title: "Error",
        description: "Failed to delete appointment. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const refreshAppointments = async () => {
    await fetchAppointments()
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  return (
    <AppointmentsContext.Provider
      value={{
        appointments,
        isLoading,
        error,
        fetchAppointments,
        fetchAppointmentById,
        addAppointment,
        editAppointment,
        removeAppointment,
        refreshAppointments,
      }}
    >
      {children}
    </AppointmentsContext.Provider>
  )
}

export function useAppointmentsContext() {
  const context = useContext(AppointmentsContext)
  if (context === undefined) {
    throw new Error("useAppointmentsContext must be used within an AppointmentsProvider")
  }
  return context
}
