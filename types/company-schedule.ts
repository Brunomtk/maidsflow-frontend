export interface TimeSlot {
  id: string
  companyId: string
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
  startTime: string // Format: "HH:MM" (24-hour)
  endTime: string // Format: "HH:MM" (24-hour)
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

export interface ScheduleAvailability {
  id: string
  companyId: string
  professionalId?: string
  teamId?: string
  date: string // ISO date string
  timeSlots: TimeSlot[]
  isHoliday: boolean
  holidayName?: string
  createdAt: string
  updatedAt: string
}

export interface ScheduleSettings {
  id: string
  companyId: string
  defaultStartTime: string // Format: "HH:MM" (24-hour)
  defaultEndTime: string // Format: "HH:MM" (24-hour)
  slotDuration: number // in minutes
  bufferTime: number // in minutes
  workingDays: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[]
  allowOverlapping: boolean
  autoConfirm: boolean
  createdAt: string
  updatedAt: string
}

export interface CompanyScheduleFilters {
  startDate?: string
  endDate?: string
  professionalId?: string
  teamId?: string
  status?: string[]
  type?: string[]
}

export interface ScheduleConflict {
  type: "overlap" | "unavailable" | "holiday" | "outside_hours"
  message: string
  conflictingAppointmentId?: string
  date?: string
  timeSlot?: string
}
