"use client"

import { useState } from "react"
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
import { useToast } from "./use-toast"

export function useCompanySchedule(companyId: string) {
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [availability, setAvailability] = useState<ScheduleAvailability[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [availableSlots, setAvailableSlots] = useState<{ startTime: string; endTime: string }[]>([])
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CompanyScheduleFilters>({})
  const { toast } = useToast()

  // Helper functions
  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0]
  }

  const formatTime = (time: string): string => {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes} ${ampm}`
  }

  const parseTime = (time: string): string => {
    // Convert 12-hour format to 24-hour format
    const [timePart, ampm] = time.split(" ")
    let [hours, minutes] = timePart.split(":").map(Number)

    if (ampm === "PM" && hours < 12) {
      hours += 12
    } else if (ampm === "AM" && hours === 12) {
      hours = 0
    }

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }

  // Settings
  const fetchScheduleSettings = async (): Promise<ScheduleSettings | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCompanyScheduleSettings(companyId)
      setScheduleSettings(data)
      return data
    } catch (err) {
      const errorMessage = "Failed to fetch schedule settings"
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

  const updateSettings = async (
    data: Partial<Omit<ScheduleSettings, "id" | "companyId" | "createdAt" | "updatedAt">>,
  ): Promise<ScheduleSettings | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedSettings = await updateCompanyScheduleSettings(companyId, data)
      setScheduleSettings(updatedSettings)
      toast({
        title: "Success",
        description: "Schedule settings updated successfully",
      })
      return updatedSettings
    } catch (err) {
      const errorMessage = "Failed to update schedule settings"
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

  // Time Slots
  const fetchTimeSlots = async (day?: string): Promise<TimeSlot[]> => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCompanyTimeSlots(companyId, day)
      setTimeSlots(data)
      return data
    } catch (err) {
      const errorMessage = "Failed to fetch time slots"
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
  }

  const addTimeSlot = async (
    data: Omit<TimeSlot, "id" | "companyId" | "createdAt" | "updatedAt">,
  ): Promise<TimeSlot | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const newTimeSlot = await createCompanyTimeSlot(companyId, data)
      setTimeSlots((prev) => [...prev, newTimeSlot])
      toast({
        title: "Success",
        description: "Time slot added successfully",
      })
      return newTimeSlot
    } catch (err) {
      const errorMessage = "Failed to add time slot"
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

  const editTimeSlot = async (
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
        description: "Time slot updated successfully",
      })
      return updatedTimeSlot
    } catch (err) {
      const errorMessage = "Failed to update time slot"
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

  const removeTimeSlot = async (timeSlotId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await deleteCompanyTimeSlot(companyId, timeSlotId)
      setTimeSlots((prev) => prev.filter((slot) => slot.id !== timeSlotId))
      toast({
        title: "Success",
        description: "Time slot deleted successfully",
      })
      return true
    } catch (err) {
      const errorMessage = "Failed to delete time slot"
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

  // Availability
  const fetchAvailability = async (
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
      const errorMessage = "Failed to fetch schedule availability"
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
  }

  const updateAvailability = async (
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
        description: "Schedule availability updated successfully",
      })
      return updatedAvailability
    } catch (err) {
      const errorMessage = "Failed to update schedule availability"
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

  // Holidays
  const addHoliday = async (date: string, holidayName: string): Promise<ScheduleAvailability | null> => {
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
        description: "Holiday added successfully",
      })
      return holiday
    } catch (err) {
      const errorMessage = "Failed to add holiday"
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

  const deleteHoliday = async (date: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await removeCompanyHoliday(companyId, date)
      setAvailability((prev) =>
        prev.map((item) => (item.date === date ? { ...item, isHoliday: false, holidayName: undefined } : item)),
      )
      toast({
        title: "Success",
        description: "Holiday removed successfully",
      })
      return true
    } catch (err) {
      const errorMessage = "Failed to remove holiday"
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

  // Appointments
  const fetchAppointments = async (filters?: Record<string, any>): Promise<Appointment[]> => {
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
  }

  // Conflicts
  const checkConflicts = async (appointmentData: {
    start: string
    end: string
    professionalId?: string
    teamId?: string
    appointmentId?: string
  }): Promise<ScheduleConflict[]> => {
    setIsLoading(true)
    setError(null)
    try {
      const conflictData = await checkSchedulingConflicts(companyId, appointmentData)
      setConflicts(conflictData)
      return conflictData
    } catch (err) {
      const errorMessage = "Failed to check scheduling conflicts"
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
  }

  // Available Slots
  const fetchAvailableSlots = async (
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
      const errorMessage = "Failed to fetch available time slots"
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
  }

  // Filters
  const updateFilters = (newFilters: Partial<CompanyScheduleFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  // Utility functions
  const getDayName = (
    day: number,
  ): "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday" => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    return days[day] as "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
  }

  const isWorkingDay = (date: Date): boolean => {
    if (!scheduleSettings) return true
    const dayName = getDayName(date.getDay())
    return scheduleSettings.workingDays.includes(dayName)
  }

  const isHoliday = (date: string): boolean => {
    return availability.some((item) => item.date === date && item.isHoliday)
  }

  const getHolidayName = (date: string): string | undefined => {
    const holiday = availability.find((item) => item.date === date && item.isHoliday)
    return holiday?.holidayName
  }

  return {
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
    updateFilters,
    clearFilters,

    // Utility functions
    formatDate,
    formatTime,
    parseTime,
    getDayName,
    isWorkingDay,
    isHoliday,
    getHolidayName,
  }
}
