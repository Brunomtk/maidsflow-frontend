"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type {
  TimeSlot,
  ScheduleAvailability,
  ScheduleSettings,
  ScheduleConflict,
  CompanyScheduleFilters,
} from "@/types/company-schedule"
import type { Appointment } from "@/types/appointment"
import {
  getCompanyScheduleSettings,
  updateCompanyScheduleSettings,
  getCompanyTimeSlots,
  createCompanyTimeSlot,
  updateCompanyTimeSlot,
  deleteCompanyTimeSlot,
  getCompanyScheduleAvailability,
  updateCompanyScheduleAvailability,
  setCompanyHoliday,
  removeCompanyHoliday,
  checkSchedulingConflicts,
  getAvailableTimeSlots,
} from "@/lib/api/company-schedule"
import { getAppointmentsByCompany } from "@/lib/api/appointments"
import { useToast } from "@/hooks/use-toast"

interface CompanyScheduleContextType {
  // State
  scheduleSettings: ScheduleSettings | null
  timeSlots: TimeSlot[]
  availability: ScheduleAvailability[]
  appointments: Appointment[]
  availableSlots: { startTime: string; endTime: string }[]
  conflicts: ScheduleConflict[]
  isLoading: boolean
  error: string | null
  filters: CompanyScheduleFilters

  // Settings
  fetchScheduleSettings: (companyId: string) => Promise<ScheduleSettings | null>
  updateSettings: (
    companyId: string,
    data: Partial<Omit<ScheduleSettings, "id" | "companyId" | "createdAt" | "updatedAt">>,
  ) => Promise<ScheduleSettings | null>

  // Time Slots
  fetchTimeSlots: (companyId: string, day?: string) => Promise<TimeSlot[]>
  addTimeSlot: (
    companyId: string,
    data: Omit<TimeSlot, "id" | "companyId" | "createdAt" | "updatedAt">,
  ) => Promise<TimeSlot | null>
  editTimeSlot: (
    companyId: string,
    timeSlotId: string,
    data: Partial<Omit<TimeSlot, "id" | "companyId" | "createdAt" | "updatedAt">>,
  ) => Promise<TimeSlot | null>
  removeTimeSlot: (companyId: string, timeSlotId: string) => Promise<boolean>

  // Availability
  fetchAvailability: (
    companyId: string,
    startDate: string,
    endDate: string,
    professionalId?: string,
    teamId?: string,
  ) => Promise<ScheduleAvailability[]>
  updateAvailability: (
    companyId: string,
    date: string,
    data: Partial<Omit<ScheduleAvailability, "id" | "companyId" | "createdAt" | "updatedAt">>,
  ) => Promise<ScheduleAvailability | null>

  // Holidays
  addHoliday: (companyId: string, date: string, holidayName: string) => Promise<ScheduleAvailability | null>
  deleteHoliday: (companyId: string, date: string) => Promise<boolean>

  // Appointments
  fetchAppointments: (companyId: string, filters?: Record<string, any>) => Promise<Appointment[]>

  // Conflicts
  checkConflicts: (
    companyId: string,
    appointmentData: {
      start: string
      end: string
      professionalId?: string
      teamId?: string
      appointmentId?: string
    },
  ) => Promise<ScheduleConflict[]>

  // Available Slots
  fetchAvailableSlots: (
    companyId: string,
    date: string,
    professionalId?: string,
    teamId?: string,
    duration?: number,
  ) => Promise<{ startTime: string; endTime: string }[]>

  // Filters
  setFilters: (filters: Partial<CompanyScheduleFilters>) => void
  clearFilters: () => void
}

const CompanyScheduleContext = createContext<CompanyScheduleContextType | undefined>(undefined)

const defaultFilters: CompanyScheduleFilters = {
  startDate: undefined,
  endDate: undefined,
  professionalId: undefined,
  teamId: undefined,
  status: undefined,
  type: undefined,
}

export function CompanyScheduleProvider({ children }: { children: ReactNode }) {
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [availability, setAvailability] = useState<ScheduleAvailability[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [availableSlots, setAvailableSlots] = useState<{ startTime: string; endTime: string }[]>([])
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CompanyScheduleFilters>(defaultFilters)
  const { toast } = useToast()

  // Settings
  const fetchScheduleSettings = async (companyId: string): Promise<ScheduleSettings | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCompanyScheduleSettings(companyId)
      setScheduleSettings(data)
      return data
    } catch (err) {
      setError("Failed to fetch schedule settings")
      toast({
        title: "Error",
        description: "Failed to fetch schedule settings. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updateSettings = async (
    companyId: string,
    data: Partial<Omit<ScheduleSettings, "id" | "companyId" | "createdAt" | "updatedAt">>,
  ): Promise<ScheduleSettings | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedSettings = await updateCompanyScheduleSettings(companyId, data)
      setScheduleSettings(updatedSettings)
      toast({
        title: "Success",
        description: "Schedule settings updated successfully.",
      })
      return updatedSettings
    } catch (err) {
      setError("Failed to update schedule settings")
      toast({
        title: "Error",
        description: "Failed to update schedule settings. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Time Slots
  const fetchTimeSlots = async (companyId: string, day?: string): Promise<TimeSlot[]> => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCompanyTimeSlots(companyId, day)
      setTimeSlots(data)
      return data
    } catch (err) {
      setError("Failed to fetch time slots")
      toast({
        title: "Error",
        description: "Failed to fetch time slots. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const addTimeSlot = async (
    companyId: string,
    data: Omit<TimeSlot, "id" | "companyId" | "createdAt" | "updatedAt">,
  ): Promise<TimeSlot | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const newTimeSlot = await createCompanyTimeSlot(companyId, data)
      setTimeSlots((prev) => [...prev, newTimeSlot])
      toast({
        title: "Success",
        description: "Time slot added successfully.",
      })
      return newTimeSlot
    } catch (err) {
      setError("Failed to add time slot")
      toast({
        title: "Error",
        description: "Failed to add time slot. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const editTimeSlot = async (
    companyId: string,
    timeSlotId: string,
    data: Partial<Omit<TimeSlot, "id" | "companyId" | "createdAt" | "updatedAt">>,
  ): Promise<TimeSlot | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedTimeSlot = await updateCompanyTimeSlot(companyId, timeSlotId, data)
      setTimeSlots((prev) => prev.map((slot) => (slot.id === timeSlotId ? updatedTimeSlot : slot)))
      toast({
        title: "Success",
        description: "Time slot updated successfully.",
      })
      return updatedTimeSlot
    } catch (err) {
      setError("Failed to update time slot")
      toast({
        title: "Error",
        description: "Failed to update time slot. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const removeTimeSlot = async (companyId: string, timeSlotId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await deleteCompanyTimeSlot(companyId, timeSlotId)
      setTimeSlots((prev) => prev.filter((slot) => slot.id !== timeSlotId))
      toast({
        title: "Success",
        description: "Time slot deleted successfully.",
      })
      return true
    } catch (err) {
      setError("Failed to delete time slot")
      toast({
        title: "Error",
        description: "Failed to delete time slot. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Availability
  const fetchAvailability = async (
    companyId: string,
    startDate: string,
    endDate: string,
    professionalId?: string,
    teamId?: string,
  ): Promise<ScheduleAvailability[]> => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCompanyScheduleAvailability(companyId, startDate, endDate, professionalId, teamId)
      setAvailability(data)
      return data
    } catch (err) {
      setError("Failed to fetch schedule availability")
      toast({
        title: "Error",
        description: "Failed to fetch schedule availability. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const updateAvailability = async (
    companyId: string,
    date: string,
    data: Partial<Omit<ScheduleAvailability, "id" | "companyId" | "createdAt" | "updatedAt">>,
  ): Promise<ScheduleAvailability | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedAvailability = await updateCompanyScheduleAvailability(companyId, date, data)
      setAvailability((prev) => prev.map((item) => (item.date === date ? updatedAvailability : item)))
      toast({
        title: "Success",
        description: "Schedule availability updated successfully.",
      })
      return updatedAvailability
    } catch (err) {
      setError("Failed to update schedule availability")
      toast({
        title: "Error",
        description: "Failed to update schedule availability. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Holidays
  const addHoliday = async (
    companyId: string,
    date: string,
    holidayName: string,
  ): Promise<ScheduleAvailability | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const holiday = await setCompanyHoliday(companyId, date, holidayName)
      setAvailability((prev) => {
        const exists = prev.some((item) => item.date === date)
        if (exists) {
          return prev.map((item) => (item.date === date ? holiday : item))
        } else {
          return [...prev, holiday]
        }
      })
      toast({
        title: "Success",
        description: "Holiday added successfully.",
      })
      return holiday
    } catch (err) {
      setError("Failed to add holiday")
      toast({
        title: "Error",
        description: "Failed to add holiday. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const deleteHoliday = async (companyId: string, date: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await removeCompanyHoliday(companyId, date)
      setAvailability((prev) =>
        prev.map((item) => (item.date === date ? { ...item, isHoliday: false, holidayName: undefined } : item)),
      )
      toast({
        title: "Success",
        description: "Holiday removed successfully.",
      })
      return true
    } catch (err) {
      setError("Failed to remove holiday")
      toast({
        title: "Error",
        description: "Failed to remove holiday. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Appointments
  const fetchAppointments = async (companyId: string, filters?: Record<string, any>): Promise<Appointment[]> => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAppointmentsByCompany(companyId, filters)

      // Convert string dates to Date objects for the frontend
      const formattedAppointments = data.map((appointment) => ({
        ...appointment,
        start: new Date(appointment.start),
        end: new Date(appointment.end),
      })) as unknown as Appointment[]

      setAppointments(formattedAppointments)
      return formattedAppointments
    } catch (err) {
      setError("Failed to fetch appointments")
      toast({
        title: "Error",
        description: "Failed to fetch appointments. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Conflicts
  const checkConflicts = async (
    companyId: string,
    appointmentData: {
      start: string
      end: string
      professionalId?: string
      teamId?: string
      appointmentId?: string
    },
  ): Promise<ScheduleConflict[]> => {
    setIsLoading(true)
    setError(null)
    try {
      const conflictData = await checkSchedulingConflicts(companyId, appointmentData)
      setConflicts(conflictData)
      return conflictData
    } catch (err) {
      setError("Failed to check scheduling conflicts")
      toast({
        title: "Error",
        description: "Failed to check scheduling conflicts. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Available Slots
  const fetchAvailableSlots = async (
    companyId: string,
    date: string,
    professionalId?: string,
    teamId?: string,
    duration?: number,
  ): Promise<{ startTime: string; endTime: string }[]> => {
    setIsLoading(true)
    setError(null)
    try {
      const slots = await getAvailableTimeSlots(companyId, date, professionalId, teamId, duration)
      setAvailableSlots(slots)
      return slots
    } catch (err) {
      setError("Failed to fetch available time slots")
      toast({
        title: "Error",
        description: "Failed to fetch available time slots. Please try again.",
        variant: "destructive",
      })
      console.error(err)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Filters
  const updateFilters = (newFilters: Partial<CompanyScheduleFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters(defaultFilters)
  }

  return (
    <CompanyScheduleContext.Provider
      value={{
        // State
        scheduleSettings,
        timeSlots,
        availability,
        appointments,
        availableSlots,
        conflicts,
        isLoading,
        error,
        filters,

        // Settings
        fetchScheduleSettings,
        updateSettings,

        // Time Slots
        fetchTimeSlots,
        addTimeSlot,
        editTimeSlot,
        removeTimeSlot,

        // Availability
        fetchAvailability,
        updateAvailability,

        // Holidays
        addHoliday,
        deleteHoliday,

        // Appointments
        fetchAppointments,

        // Conflicts
        checkConflicts,

        // Available Slots
        fetchAvailableSlots,

        // Filters
        setFilters: updateFilters,
        clearFilters,
      }}
    >
      {children}
    </CompanyScheduleContext.Provider>
  )
}

export function useCompanyScheduleContext() {
  const context = useContext(CompanyScheduleContext)
  if (context === undefined) {
    throw new Error("useCompanyScheduleContext must be used within a CompanyScheduleProvider")
  }
  return context
}
