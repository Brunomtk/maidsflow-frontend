"use client"

import { performCheckInWithPhoto, getCheckRecordsByAppointment } from "@/lib/api/professional-check"

/* geo types */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface GeolocationPosition extends globalThis.GeolocationPosition {}

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import {
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  CheckCircle,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
  CalendarClock,
  X,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format, addDays, subDays, isToday, startOfWeek, endOfWeek } from "date-fns"
import { useProfessionalSchedule } from "@/hooks/use-professional-schedule"
import { useAuth } from "@/contexts/auth-context"
import type { Appointment } from "@/types/appointment"

const normalizePhone = (raw?: string | null) => {
  const digits = (raw || "").replace(/\D/g, "")
  if (!digits) return null
  let d = digits.replace(/^0+/, "")
  if (!d.startsWith("55") && d.length <= 12) d = "55" + d
  return d
}
export default function ProfessionalSchedule() {
  const [view, setView] = useState("day")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedMonthDay, setSelectedMonthDay] = useState<number | null>(null)

  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  const {
    appointments,
    isLoading,
    error,
    fetchAppointments,
    fetchAppointmentsByDateRange,
    scheduleSummary,
    fetchScheduleSummary,
  } = useProfessionalSchedule()

  // Memoize date strings to prevent unnecessary re-renders
  const dateRange = useMemo(() => {
    const startDate = format(subDays(currentDate, 30), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    const endDate = format(addDays(currentDate, 30), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    return { startDate, endDate }
  }, [currentDate])

  useEffect(() => {
    if (user?.professionalId) {
      fetchAppointmentsByDateRange(dateRange.startDate, dateRange.endDate, user.professionalId)
    }
  }, [dateRange.startDate, dateRange.endDate, fetchAppointmentsByDateRange, user?.professionalId])

  // Fetch schedule summary only once on mount
  useEffect(() => {
    if (user?.professionalId) {
      const now = new Date()
      fetchScheduleSummary(now.getMonth() + 1, now.getFullYear(), user.professionalId)
    }
  }, [fetchScheduleSummary, user?.professionalId])

  const filteredAppointments = useMemo(() => {
    if (!user?.professionalId) return []
    const list = appointments.filter(
      (appointment) =>
        appointment.professionalId === user.professionalId || appointment.professional?.id === user.professionalId,
    )
    // de-duplicate and sort by start
    const deduped = uniqueById(list)
    return deduped.sort((a, b) => new Date(a.start as any).getTime() - new Date(b.start as any).getTime())
  }, [appointments, user?.professionalId])

  // Get appointments for the current day
  const getTodayAppointments = useMemo(() => {
    const formattedDate = format(currentDate, "yyyy-MM-dd")
    return filteredAppointments.filter((appointment) => {
      const appointmentDate = format(new Date(appointment.start), "yyyy-MM-dd")
      return appointmentDate === formattedDate
    })
  }, [filteredAppointments, currentDate])

  const getMonthDayAppointments = useMemo(() => {
    if (selectedMonthDay === null) return []
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const date = new Date(year, month, selectedMonthDay)
    const formattedDate = format(date, "yyyy-MM-dd")

    return filteredAppointments.filter((appointment) => {
      const appointmentDate = format(new Date(appointment.start), "yyyy-MM-dd")
      return appointmentDate === formattedDate
    })
  }, [selectedMonthDay, currentDate, filteredAppointments])

  const generateDayTimeSlots = useMemo(() => {
    const timeSlots = []
    for (let i = 8; i <= 20; i++) {
      // Add hour slot (e.g., 08:00)
      const hourTime = i < 10 ? `0${i}:00` : `${i}:00`
      const hourAppointments = getTodayAppointments.filter((appointment) => {
        const startTime = new Date(appointment.start)
        const startHour = startTime.getHours()
        const startMinutes = startTime.getMinutes()
        return startHour === i && startMinutes < 30
      })

      timeSlots.push({
        time: hourTime,
        fullHour: `${i}:00`,
        appointments: hourAppointments,
        isHalfHour: false,
      })

      // Add half-hour slot (e.g., 08:30) - only if not the last hour
      if (i < 20) {
        const halfHourTime = i < 10 ? `0${i}:30` : `${i}:30`
        const halfHourAppointments = getTodayAppointments.filter((appointment) => {
          const startTime = new Date(appointment.start)
          const startHour = startTime.getHours()
          const startMinutes = startTime.getMinutes()
          return startHour === i && startMinutes >= 30
        })

        timeSlots.push({
          time: halfHourTime,
          fullHour: `${i}:30`,
          appointments: halfHourAppointments,
          isHalfHour: true,
        })
      }
    }
    return timeSlots
  }, [getTodayAppointments])

  // Generate hours for the day view (8 AM to 8 PM)
  const generateDayHours = useMemo(() => {
    const hours = []
    for (let i = 8; i <= 20; i++) {
      const hour = i < 10 ? `0${i}:00` : `${i}:00`
      const appointmentsForHour = getTodayAppointments.filter((appointment) => {
        const startHour = new Date(appointment.start).getHours()
        return startHour === i
      })

      hours.push({
        hour,
        appointments: appointmentsForHour,
      })
    }
    return hours
  }, [getTodayAppointments])

  // Generate days for the week view
  const generateWeekDays = useMemo(() => {
    const days = []
    for (let i = -3; i <= 3; i++) {
      const date = i === 0 ? currentDate : i < 0 ? subDays(currentDate, Math.abs(i)) : addDays(currentDate, i)
      const formattedDate = format(date, "yyyy-MM-dd")
      const dayAppointments = filteredAppointments.filter((appointment) => {
        const appointmentDate = format(new Date(appointment.start), "yyyy-MM-dd")
        return appointmentDate === formattedDate
      })

      days.push({
        date,
        dayName: format(date, "EEE"),
        dayNumber: format(date, "d"),
        isToday: isToday(date),
        appointments: uniqueById(dayAppointments),
      })
    }
    return days
  }, [currentDate, filteredAppointments])

  // Generate days for the month view
  const generateMonthDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the 1st
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, hasAppointment: false, appointments: [] })
    }

    // Add actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const formattedDate = format(date, "yyyy-MM-dd")
      const dayAppointments = filteredAppointments.filter((appointment) => {
        const appointmentDate = format(new Date(appointment.start), "yyyy-MM-dd")
        return appointmentDate === formattedDate
      })

      days.push({
        day,
        hasAppointment: dayAppointments.length > 0,
        appointments: uniqueById(dayAppointments),
      })
    }

    return days
  }, [currentDate, filteredAppointments])

  const getWeekAppointments = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })

    const weekAppointments = filteredAppointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.start)
      return appointmentDate >= weekStart && appointmentDate <= weekEnd
    })

    return weekAppointments
  }, [filteredAppointments, currentDate])

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setDetailsOpen(true)
  }

  const navigatePrevious = () => {
    if (view === "day") {
      setCurrentDate(subDays(currentDate, 1))
    } else if (view === "week") {
      setCurrentDate(subDays(currentDate, 7))
    } else {
      // Month view - go to previous month
      const newDate = new Date(currentDate)
      newDate.setMonth(newDate.getMonth() - 1)
      setCurrentDate(newDate)
      setSelectedMonthDay(null)
    }
  }

  const navigateNext = () => {
    if (view === "day") {
      setCurrentDate(addDays(currentDate, 1))
    } else if (view === "week") {
      setCurrentDate(addDays(currentDate, 7))
    } else {
      // Month view - go to next month
      const newDate = new Date(currentDate)
      newDate.setMonth(newDate.getMonth() + 1)
      setCurrentDate(newDate)
      setSelectedMonthDay(null)
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get status badge styling
  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return { label: "Scheduled", className: "bg-blue-50 text-blue-700 border-blue-200" }
      case 1:
        return { label: "In Progress", className: "bg-yellow-50 text-yellow-700 border-yellow-200" }
      case 2:
        return { label: "Completed", className: "bg-green-50 text-green-700 border-green-200" }
      case 3:
        return { label: "Cancelled", className: "bg-red-50 text-red-700 border-red-200" }
      default:
        return { label: "Unknown", className: "bg-gray-50 text-gray-700 border-gray-200" }
    }
  }

  // Get type label
  const getTypeLabel = (type: number) => {
    switch (type) {
      case 0:
        return "Residential"
      case 1:
        return "Commercial"
      case 2:
        return "Industrial"
      default:
        return "Unknown"
    }
  }

  const getAppointmentStyle = (appointment: any) => {
    const startTime = new Date(appointment.start)
    const endTime = new Date(appointment.end)
    const startMinutes = startTime.getMinutes()
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60) // duration in minutes

    // Calculate height based on duration (minimum 40px, 2px per minute)
    const height = Math.max(40, Math.min(duration * 2, 120))

    // Calculate top offset within the 30-minute slot (0-30 minutes = 0-50px offset)
    const topOffset = startMinutes >= 30 ? (startMinutes - 30) * 1.67 : startMinutes * 1.67

    return {
      height: `${height}px`,
      marginTop: `${topOffset}px`,
    }
  }

  if (!user) {
    return null
  }

  const handleOnMyWay = () => {
    if (!selectedAppointment) return
    const phone = normalizePhone(selectedAppointment.customer?.phone as any)
    if (!phone) {
      toast({ title: "Phone not available", description: "This client has no phone number.", variant: "destructive" })
      return
    }
    const name = selectedAppointment.customer?.name || ""
    const companyName =
      selectedAppointment.company?.name ||
      (typeof window !== "undefined" ? localStorage.getItem("company_name") || "our" : "our")
    const eta = "15 minutes"
    const message = `Hi ${name}, hope your having a nice day. Your ${companyName} team is on the way, ${eta} from your house`
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    if (typeof window !== "undefined") window.open(url, "_blank")
  }

  const handleCheckIn = async () => {
    try {
      if (!selectedAppointment || !user?.professionalId) {
        toast({ title: "Missing data", description: "No appointment or user info.", variant: "destructive" })
        return
      }
      const professionalId = Number(user.professionalId)
      const appointmentId = Number(selectedAppointment.id)

      // Verificar se já existe CheckRecord para este appointment
      const existingList = await getCheckRecordsByAppointment(professionalId, appointmentId)
      const existing = existingList?.[0] || null

      // Capturar geolocalização (opcional)
      let location: { latitude: number; longitude: number } | undefined
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        try {
          const pos = (await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              maximumAge: 60000,
              timeout: 5000,
            })
          })) as GeolocationPosition
          location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
        } catch {}
      }

      if (!existing) {
        // Não cria CheckRecord manualmente — o endpoint de check-in já cria automaticamente
        await performCheckInWithPhoto(professionalId, appointmentId, { location })
        router.push("/professional/check-in")
        return
      }

      if (!existing.checkInTime) {
        // Registro existe mas ainda sem check-in
        await performCheckInWithPhoto(professionalId, appointmentId, { location })
        router.push("/professional/check-in")
        return
      }

      // Já tem check-in aberto: apenas direciona para check-out
      toast({ title: "Já em check-in", description: "Abrindo tela para finalizar check-out." })
      router.push("/professional/check-in")
    } catch (e: any) {
      toast({
        title: "Erro no check-in",
        description: e?.message || "Não foi possível finalizar a ação.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading schedule...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
          <p className="mt-2 text-red-600">{error}</p>
          <Button onClick={() => fetchAppointments()} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      <div className="px-4 md:px-0">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">My Schedule</h2>
        <p className="text-sm md:text-base text-muted-foreground">View and manage your appointments</p>
      </div>

      <div className="flex flex-col gap-3 px-4 md:px-0">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={navigatePrevious} className="px-2 md:px-3 bg-transparent">
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Previous</span>
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday} className="px-2 md:px-3 bg-transparent">
              <span className="text-xs md:text-sm">Today</span>
            </Button>
            <Button variant="outline" size="sm" onClick={navigateNext} className="px-2 md:px-3 bg-transparent">
              <span className="hidden sm:inline mr-1">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="day" className="w-full" onValueChange={setView} value={view}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="day" className="text-xs md:text-sm">
              Day
            </TabsTrigger>
            <TabsTrigger value="week" className="text-xs md:text-sm">
              Week
            </TabsTrigger>
            <TabsTrigger value="month" className="text-xs md:text-sm">
              Month
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="px-4 md:px-0">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg text-foreground">
              {view === "day" && format(currentDate, "EEEE, MMMM d, yyyy")}
              {view === "week" && `Week of ${format(currentDate, "MMMM d, yyyy")}`}
              {view === "month" && format(currentDate, "MMMM yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            {/* Day View - Otimizado para mobile */}
            {view === "day" && (
              <div className="flex flex-col h-[500px] md:h-[600px] bg-card rounded-lg border border-border">
                <div className="flex justify-between items-center p-3 md:p-4 border-b border-border">
                  <Button variant="outline" size="sm" onClick={navigatePrevious} className="px-2 bg-transparent">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="text-sm md:text-lg font-medium text-foreground text-center">
                    {format(currentDate, "EEE, MMM d")}
                  </h3>
                  <Button variant="outline" size="sm" onClick={navigateNext} className="px-2 bg-transparent">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="relative min-h-full">
                    {Array.from({ length: 17 }, (_, i) => i + 6).map((hour) => (
                      <div
                        key={hour}
                        className="flex border-b border-border h-10 md:h-12 cursor-pointer hover:bg-muted/30"
                      >
                        <div className="w-12 md:w-16 flex-shrink-0 border-r border-border p-1 text-xs text-muted-foreground text-right pr-2">
                          {hour}:00
                        </div>
                        <div className="flex-1 relative"></div>
                      </div>
                    ))}

                    {getTodayAppointments.map((appointment) => {
                      const startDate = new Date(appointment.start)
                      const endDate = new Date(appointment.end)

                      if (startDate.toString() === "Invalid Date" || endDate.toString() === "Invalid Date") {
                        return null
                      }

                      const startHour = startDate.getHours()
                      const startMinutes = startDate.getMinutes()
                      const endHour = endDate.getHours()
                      const endMinutes = endDate.getMinutes()

                      const top = ((startHour - 6) * 60 + startMinutes) * (40 / 60)
                      const height = ((endHour - startHour) * 60 + (endMinutes - startMinutes)) * (40 / 60)

                      return (
                        <div
                          key={appointment.id}
                          className="absolute left-12 md:left-16 right-1 md:right-2 rounded-md p-1 md:p-2 border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-950 overflow-hidden cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                          style={{
                            top: `${top}px`,
                            height: `${Math.max(height, 20)}px`,
                            maxHeight: `${height}px`,
                          }}
                          onClick={() => handleViewDetails(appointment)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="overflow-hidden">
                              <h4 className="font-medium text-xs md:text-sm truncate text-foreground">
                                {appointment.title || "No Title"}
                              </h4>
                              <p className="text-xs text-muted-foreground truncate">
                                {appointment.customer?.name || "No customer"}
                                {appointment.customer &&
                                (appointment.customer.ssn ||
                                  appointment.customer.ticket ||
                                  appointment.customer.frequency ||
                                  appointment.customer.paymentMethod) ? (
                                  <span
                                    className="ml-2 text-[10px] text-muted-foreground"
                                    title={`SSN: ${appointment.customer?.ssn ?? "—"} | Ticket: ${appointment.customer?.ticket ?? "—"} | Freq: ${appointment.customer?.frequency ?? "—"} | Pay: ${appointment.customer?.paymentMethod ?? "—"}`}
                                  >
                                    ⓘ
                                  </span>
                                ) : null}
                              </p>
                              <div className="flex items-center mt-1 gap-1">
                                <Badge
                                  variant="outline"
                                  className={`${getStatusBadge(appointment.status).className} text-xs px-1 py-0 h-3 md:h-4`}
                                >
                                  {getStatusBadge(appointment.status).label}
                                </Badge>
                                <span className="text-xs text-muted-foreground hidden md:inline">
                                  {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Week View - Otimizado para mobile */}
            {view === "week" && (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto md:max-h-none">
                <div className="grid grid-cols-7 gap-1 md:gap-2">
                  {generateWeekDays.map((day, i) => (
                    <div key={i} className="text-center">
                      <div
                        className={`font-medium mb-1 md:mb-2 text-xs md:text-sm ${day.isToday ? "text-primary" : "text-foreground"}`}
                      >
                        {day.dayName}
                      </div>
                      <div
                        className={`rounded-full w-6 h-6 md:w-8 md:h-8 mx-auto flex items-center justify-center mb-1 md:mb-2 text-xs md:text-sm
                          ${day.isToday ? "bg-primary text-primary-foreground" : "text-foreground"}`}
                      >
                        {day.dayNumber}
                      </div>
                      <div
                        className={`h-16 md:h-24 rounded-md border border-border overflow-y-auto ${day.appointments.length > 0 ? "bg-primary/5" : "bg-card"}`}
                      >
                        {day.appointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="mx-0.5 md:mx-1 my-0.5 md:my-1 px-0.5 md:px-1 py-0.5 md:py-1 text-xs bg-primary/10 text-primary rounded truncate cursor-pointer hover:bg-primary/20"
                            onClick={() => handleViewDetails(appointment)}
                          >
                            <div className="hidden md:block">
                              {format(new Date(appointment.start), "HH:mm")}–
                              {format(new Date(appointment.end), "HH:mm")} • {appointment.title}
                            </div>
                            <div className="md:hidden">
                              {format(new Date(appointment.start), "HH:mm")}–
                              {format(new Date(appointment.end), "HH:mm")}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Month View - Updated with clickable days and appointment list */}
            {view === "month" && (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto md:max-h-none">
                <div className="grid grid-cols-7 gap-0.5 md:gap-1">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                    <div key={i} className="text-center font-medium p-1 md:p-2 text-xs md:text-sm text-foreground">
                      <span className="hidden md:inline">{day}</span>
                      <span className="md:hidden">{day.slice(0, 1)}</span>
                    </div>
                  ))}

                  {generateMonthDays.map((dayData, i) => (
                    <div
                      key={i}
                      onClick={() => dayData.day && setSelectedMonthDay(dayData.day)}
                      className={`h-16 md:h-24 p-0.5 md:p-1 border border-border text-xs transition-colors ${
                        dayData.day === null
                          ? "border-dashed text-muted-foreground/30 bg-muted/20"
                          : dayData.hasAppointment
                            ? "bg-primary/5 cursor-pointer hover:bg-primary/10"
                            : "bg-card cursor-pointer hover:bg-muted/30"
                      } ${selectedMonthDay === dayData.day ? "ring-2 ring-primary bg-primary/10" : ""}`}
                    >
                      {dayData.day && (
                        <>
                          <div className="text-xs md:text-sm text-foreground font-medium">{dayData.day}</div>
                          {dayData.appointments.length > 0 && (
                            <div className="mt-0.5 text-[10px] md:text-xs text-primary font-medium">
                              +{dayData.appointments.length}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {selectedMonthDay !== null && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base md:text-lg font-semibold text-foreground">
                        {format(
                          new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedMonthDay),
                          "MMMM d, yyyy",
                        )}{" "}
                        - Appointments
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedMonthDay(null)} className="text-xs">
                        Clear
                      </Button>
                    </div>

                    {getMonthDayAppointments.length > 0 ? (
                      <div className="space-y-2">
                        {getMonthDayAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors bg-card"
                          >
                            <div className="flex flex-col gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className={getStatusBadge(appointment.status).className}>
                                  {getStatusBadge(appointment.status).label}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {getTypeLabel(appointment.type)}
                                </Badge>
                              </div>
                              <h4 className="font-semibold text-sm text-foreground">{appointment.title}</h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {format(new Date(appointment.start), "HH:mm")} -{" "}
                                  {format(new Date(appointment.end), "HH:mm")}
                                </span>
                              </div>
                              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span className="break-words line-clamp-1">{appointment.address}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {appointment.customer?.name || "No customer"}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2 bg-transparent text-xs"
                                onClick={() => handleViewDetails(appointment)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground text-sm">No appointments on this day</div>
                    )}
                  </div>
                )}

                {selectedMonthDay === null && (
                  <div className="space-y-4">
                    <h3 className="text-base md:text-lg font-semibold text-foreground">Monthly Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                      <Card>
                        <CardContent className="pt-4 md:pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-muted-foreground text-xs md:text-sm">Total Appointments</span>
                              <span className="text-xl md:text-2xl font-bold">
                                {scheduleSummary?.totalAppointments || 0}
                              </span>
                            </div>
                            <Calendar className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-4 md:pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-muted-foreground text-xs md:text-sm">Clients Served</span>
                              <span className="text-xl md:text-2xl font-bold">
                                {scheduleSummary?.clientsServed || 0}
                              </span>
                            </div>
                            <Users className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-4 md:pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-muted-foreground text-xs md:text-sm">Completion Rate</span>
                              <span className="text-xl md:text-2xl font-bold">
                                {scheduleSummary?.completionRate || 0}%
                              </span>
                            </div>
                            <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedAppointment && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[85vh] md:max-h-[90vh] mx-2 md:mx-auto p-3 md:p-6">
            <DialogHeader className="pb-2 md:pb-4">
              <DialogTitle className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <span className="text-base md:text-lg font-semibold pr-2 text-foreground">Appointment Details</span>
                  <Badge
                    variant="outline"
                    className={`${getStatusBadge(selectedAppointment.status).className} text-xs flex-shrink-0`}
                  >
                    {getStatusBadge(selectedAppointment.status).label}
                  </Badge>
                </div>
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="max-h-[calc(85vh-120px)] md:max-h-[calc(90vh-130px)]">
              <div className="space-y-4 md:space-y-6 pr-1 md:pr-4">
                {/* Service Details Section */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold mb-2 text-foreground">
                      {selectedAppointment.title}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(selectedAppointment.start), "PPP, p")} -{" "}
                          {format(new Date(selectedAppointment.end), "p")}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground break-words">{selectedAppointment.address}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Service Info Grid */}
                  <div>
                    <h4 className="font-medium mb-3 text-base text-foreground">Service Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium text-foreground">{getTypeLabel(selectedAppointment.type)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium text-foreground">
                          {getStatusBadge(selectedAppointment.status).label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Company:</span>
                        <span className="font-medium text-foreground">
                          {selectedAppointment.company?.name || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Team:</span>
                        <span className="font-medium text-foreground">{selectedAppointment.team?.name || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Client Information Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-foreground">Client Information</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={`/.jpg?height=48&width=48&query=${selectedAppointment.customer?.name || "Customer"}`}
                            alt={selectedAppointment.customer?.name || "Customer"}
                          />
                          <AvatarFallback className="text-sm">
                            {selectedAppointment.customer?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-base text-foreground">
                            {selectedAppointment.customer?.name || "No customer"}
                          </div>
                          <div className="text-sm text-muted-foreground">Client</div>
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        {selectedAppointment.customer?.phone && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>Phone</span>
                            </div>
                            <span className="font-medium text-foreground">{selectedAppointment.customer.phone}</span>
                          </div>
                        )}
                        {selectedAppointment.customer?.email && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>Email</span>
                            </div>
                            <span className="font-medium text-xs md:text-sm break-all text-foreground">
                              {selectedAppointment.customer.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notes Section */}
                  {selectedAppointment.notes && (
                    <>
                      <Separator />
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          <h4 className="font-medium text-base text-foreground">Notes</h4>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm leading-relaxed text-foreground">{selectedAppointment.notes}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedAppointment.customer?.phone && (
                        <Button variant="outline" size="sm" className="bg-transparent" onClick={handleOnMyWay}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          On my way
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Button className="w-full" onClick={handleCheckIn}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Check In
                      </Button>
                      <Button asChild variant="outline" className="w-full bg-transparent">
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={
                            selectedAppointment?.address
                              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAppointment.address)}`
                              : undefined
                          }
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Get Directions
                        </a>
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        variant="outline"
                        className="w-full text-red-500 hover:text-red-500 hover:bg-red-50 bg-transparent"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setDetailsOpen(false)}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Ensure no duplicate appointments by id
const uniqueById = <T extends { id: any }>(arr: T[]) => {
  const seen = new Set<any>()
  const out: T[] = []
  for (const item of arr) {
    if (!seen.has(item.id)) {
      seen.add(item.id)
      out.push(item)
    }
  }
  return out
}
