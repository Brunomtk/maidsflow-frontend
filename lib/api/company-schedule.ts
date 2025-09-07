import type { TimeSlot, ScheduleAvailability, ScheduleSettings, ScheduleConflict } from "@/types/company-schedule"
import { apiRequest } from "./utils"

// Get company schedule settings
export async function getCompanyScheduleSettings(companyId: string): Promise<ScheduleSettings> {
  return apiRequest<ScheduleSettings>({ url: `/companies/${companyId}/schedule/settings`, method: "GET" })
}

// Update company schedule settings
export async function updateCompanyScheduleSettings(
  companyId: string,
  data: Partial<Omit<ScheduleSettings, "id" | "companyId" | "createdAt" | "updatedAt">>,
): Promise<ScheduleSettings> {
  return apiRequest<ScheduleSettings>({
    url: `/companies/${companyId}/schedule/settings`,
    method: "PUT",
    data,
  })
}

// Get company time slots
export async function getCompanyTimeSlots(companyId: string, day?: string): Promise<TimeSlot[]> {
  const url = day
    ? `/companies/${companyId}/schedule/time-slots?day=${day}`
    : `/companies/${companyId}/schedule/time-slots`
  return apiRequest<TimeSlot[]>({ url, method: "GET" })
}

// Create company time slot
export async function createCompanyTimeSlot(
  companyId: string,
  data: Omit<TimeSlot, "id" | "companyId" | "createdAt" | "updatedAt">,
): Promise<TimeSlot> {
  return apiRequest<TimeSlot>({
    url: `/companies/${companyId}/schedule/time-slots`,
    method: "POST",
    data,
  })
}

// Update company time slot
export async function updateCompanyTimeSlot(
  companyId: string,
  timeSlotId: string,
  data: Partial<Omit<TimeSlot, "id" | "companyId" | "createdAt" | "updatedAt">>,
): Promise<TimeSlot> {
  return apiRequest<TimeSlot>({
    url: `/companies/${companyId}/schedule/time-slots/${timeSlotId}`,
    method: "PUT",
    data,
  })
}

// Delete company time slot
export async function deleteCompanyTimeSlot(companyId: string, timeSlotId: string): Promise<void> {
  return apiRequest<void>({
    url: `/companies/${companyId}/schedule/time-slots/${timeSlotId}`,
    method: "DELETE",
  })
}

// Get company schedule availability
export async function getCompanyScheduleAvailability(
  companyId: string,
  startDate: string,
  endDate: string,
  professionalId?: string,
  teamId?: string,
): Promise<ScheduleAvailability[]> {
  let url = `/companies/${companyId}/schedule/availability?startDate=${startDate}&endDate=${endDate}`

  if (professionalId) {
    url += `&professionalId=${professionalId}`
  }

  if (teamId) {
    url += `&teamId=${teamId}`
  }

  return apiRequest<ScheduleAvailability[]>({ url, method: "GET" })
}

// Update company schedule availability
export async function updateCompanyScheduleAvailability(
  companyId: string,
  date: string,
  data: Partial<Omit<ScheduleAvailability, "id" | "companyId" | "createdAt" | "updatedAt">>,
): Promise<ScheduleAvailability> {
  return apiRequest<ScheduleAvailability>({
    url: `/companies/${companyId}/schedule/availability/${date}`,
    method: "PUT",
    data,
  })
}

// Set holiday
export async function setCompanyHoliday(
  companyId: string,
  date: string,
  holidayName: string,
): Promise<ScheduleAvailability> {
  return apiRequest<ScheduleAvailability>({
    url: `/companies/${companyId}/schedule/holidays`,
    method: "POST",
    data: { date, holidayName },
  })
}

// Remove holiday
export async function removeCompanyHoliday(companyId: string, date: string): Promise<void> {
  return apiRequest<void>({
    url: `/companies/${companyId}/schedule/holidays/${date}`,
    method: "DELETE",
  })
}

// Check for scheduling conflicts
export async function checkSchedulingConflicts(
  companyId: string,
  appointmentData: {
    start: string
    end: string
    professionalId?: string
    teamId?: string
    appointmentId?: string // For updates, to exclude current appointment
  },
): Promise<ScheduleConflict[]> {
  return apiRequest<ScheduleConflict[]>({
    url: `/companies/${companyId}/schedule/conflicts`,
    method: "POST",
    data: appointmentData,
  })
}

// Get available time slots for a specific date
export async function getAvailableTimeSlots(
  companyId: string,
  date: string,
  professionalId?: string,
  teamId?: string,
  duration?: number, // in minutes
): Promise<{ startTime: string; endTime: string }[]> {
  let url = `/companies/${companyId}/schedule/available-slots?date=${date}`

  if (professionalId) {
    url += `&professionalId=${professionalId}`
  }

  if (teamId) {
    url += `&teamId=${teamId}`
  }

  if (duration) {
    url += `&duration=${duration}`
  }

  return apiRequest<{ startTime: string; endTime: string }[]>({ url, method: "GET" })
}
