"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isToday,
  isSameMonth,
} from "date-fns"
import type { Appointment } from "@/types/appointment"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface AppointmentCalendarProps {
  appointments: Appointment[]
  onAppointmentClick: (appointment: Appointment) => void
  onDateClick: (date: Date) => void
  view?: "day" | "week" | "month"
}

export function AppointmentCalendar({
  appointments,
  onAppointmentClick,
  onDateClick,
  view = "week",
}: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "bg-blue-500"
      case 1:
        return "bg-yellow-500"
      case 2:
        return "bg-green-500"
      case 3:
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "Scheduled"
      case 1:
        return "In Progress"
      case 2:
        return "Completed"
      case 3:
        return "Cancelled"
      default:
        return "Unknown"
    }
  }

  const getTypeColor = (type: number) => {
    switch (type) {
      case 0:
        return "border-blue-400"
      case 1:
        return "border-purple-400"
      case 2:
        return "border-orange-400"
      default:
        return "border-gray-400"
    }
  }

  const renderDayView = () => {
    const hours = Array.from({ length: 17 }, (_, i) => i + 6) // 6 AM to 10 PM

    const dayAppointments = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.start)
      return (
        appointmentDate.toString() !== "Invalid Date" &&
        appointmentDate.getFullYear() > 1900 &&
        isSameDay(appointmentDate, currentDate)
      )
    })

    return (
      <div className="flex flex-col h-[600px] bg-[#1a2234] rounded-lg border border-[#2a3349]">
        <div className="flex justify-between items-center p-4 border-b border-[#2a3349]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate((prev) => addDays(prev, -1))}
            className="border-[#2a3349] text-white hover:bg-[#2a3349]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium text-white">{format(currentDate, "EEEE, MMMM d, yyyy")}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate((prev) => addDays(prev, 1))}
            className="border-[#2a3349] text-white hover:bg-[#2a3349]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="relative min-h-full">
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex border-b border-[#2a3349] h-12 cursor-pointer hover:bg-[#1a2234]/30"
                onClick={() => {
                  const date = new Date(currentDate)
                  date.setHours(hour, 0, 0, 0)
                  onDateClick(date)
                }}
              >
                <div className="w-16 flex-shrink-0 border-r border-[#2a3349] p-1 text-xs text-gray-400 text-right pr-2">
                  {hour}:00
                </div>
                <div className="flex-1 relative"></div>
              </div>
            ))}

            {dayAppointments.map((appointment) => {
              const startDate = new Date(appointment.start)
              const endDate = new Date(appointment.end)

              if (startDate.toString() === "Invalid Date" || endDate.toString() === "Invalid Date") {
                return null
              }

              const startHour = startDate.getHours()
              const startMinutes = startDate.getMinutes()
              const endHour = endDate.getHours()
              const endMinutes = endDate.getMinutes()

              const top = ((startHour - 6) * 60 + startMinutes) * (48 / 60)
              const height = ((endHour - startHour) * 60 + (endMinutes - startMinutes)) * (48 / 60)

              return (
                <div
                  key={appointment.id}
                  className={`absolute left-16 right-2 rounded-md p-2 border-l-4 ${getTypeColor(appointment.type)} bg-[#0f172a] overflow-hidden cursor-pointer hover:bg-[#2a3349] transition-colors`}
                  style={{
                    top: `${top}px`,
                    height: `${Math.max(height, 24)}px`,
                    maxHeight: `${height}px`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onAppointmentClick(appointment)
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="overflow-hidden">
                      <h4 className="font-medium text-sm truncate text-white">{appointment.title || "No Title"}</h4>
                      <p className="text-xs text-gray-400 truncate">{appointment.customer?.name || "No customer"}</p>
                      <div className="flex items-center mt-1">
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(appointment.status)} text-white text-xs px-1 py-0 h-4`}
                        >
                          {getStatusText(appointment.status)}
                        </Badge>
                        <span className="text-xs text-gray-400 ml-2">
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
    )
  }

  const renderWeekView = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }) // Start on Monday
    const end = endOfWeek(currentDate, { weekStartsOn: 1 })
    const weekDays = eachDayOfInterval({ start, end })
    const hours = Array.from({ length: 17 }, (_, i) => i + 6) // 6 AM to 10 PM

    return (
      <div className="flex flex-col h-[600px] bg-[#1a2234] rounded-lg border border-[#2a3349]">
        <div className="flex justify-between items-center p-4 border-b border-[#2a3349]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate((prev) => subWeeks(prev, 1))}
            className="border-[#2a3349] text-white hover:bg-[#2a3349]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium text-white">
            {format(start, "MMM d")} - {format(end, "MMM d, yyyy")}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate((prev) => addWeeks(prev, 1))}
            className="border-[#2a3349] text-white hover:bg-[#2a3349]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="min-w-[900px] relative">
            {/* Header with days */}
            <div className="sticky top-0 bg-[#0f172a] z-10 border-b border-[#2a3349] flex">
              <div className="w-16 border-r border-[#2a3349] p-2"></div>
              {weekDays.map((day) => (
                <div
                  key={day.toString()}
                  className={`flex-1 p-2 text-center border-r border-[#2a3349] last:border-r-0 ${
                    isToday(day) ? "bg-[#1a2234]" : ""
                  }`}
                >
                  <div className="text-sm font-medium text-white">{format(day, "EEE")}</div>
                  <div className={`text-xs ${isToday(day) ? "text-[#06b6d4]" : "text-gray-400"}`}>
                    {format(day, "MMM d")}
                  </div>
                </div>
              ))}
            </div>

            {/* Time grid */}
            <div className="relative">
              {hours.map((hour) => (
                <div key={hour} className="flex h-12 border-b border-[#2a3349]">
                  <div className="w-16 border-r border-[#2a3349] p-1 text-xs text-gray-400 text-right pr-2 flex-shrink-0">
                    {hour}:00
                  </div>
                  {weekDays.map((day, dayIndex) => (
                    <div
                      key={`${hour}-${day}`}
                      className="flex-1 border-r border-[#2a3349] last:border-r-0 relative cursor-pointer hover:bg-[#1a2234]/30"
                      onClick={() => {
                        const date = new Date(day)
                        date.setHours(hour, 0, 0, 0)
                        onDateClick(date)
                      }}
                    ></div>
                  ))}
                </div>
              ))}

              {/* Appointments overlay */}
              {appointments.map((appointment) => {
                const appointmentDate = new Date(appointment.start)

                if (appointmentDate.toString() === "Invalid Date" || appointmentDate.getFullYear() <= 1900) {
                  return null
                }

                const dayIndex = weekDays.findIndex((day) => isSameDay(day, appointmentDate))

                if (dayIndex === -1) return null

                const startDate = new Date(appointment.start)
                const endDate = new Date(appointment.end)
                const startHour = startDate.getHours()
                const startMinutes = startDate.getMinutes()
                const endHour = endDate.getHours()
                const endMinutes = endDate.getMinutes()

                const top = ((startHour - 6) * 60 + startMinutes) * (48 / 60)
                const height = Math.max(((endHour - startHour) * 60 + (endMinutes - startMinutes)) * (48 / 60), 24)

                return (
                  <div
                    key={appointment.id}
                    className={`absolute rounded-md p-1 border-l-4 ${getTypeColor(
                      appointment.type,
                    )} bg-[#0f172a] overflow-hidden cursor-pointer hover:bg-[#2a3349] transition-colors z-20`}
                    style={{
                      top: `${top + 48}px`, // Add header height
                      height: `${height}px`,
                      left: `calc(64px + calc(calc(100% - 64px) / 7) * ${dayIndex})`,
                      width: `calc(calc(calc(100% - 64px) / 7) - 4px)`,
                      marginLeft: "2px",
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onAppointmentClick(appointment)
                    }}
                  >
                    <div className="flex justify-between items-start h-full">
                      <div className="overflow-hidden flex-1">
                        <h4 className="font-medium text-xs truncate text-white">{appointment.title || "No Title"}</h4>
                        <p className="text-xs text-gray-400 truncate">{appointment.customer?.name || "No customer"}</p>
                        <p className="text-xs text-gray-400">{format(startDate, "h:mm a")}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderMonthView = () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start, end })

    // Get the first day of the month and adjust for the grid
    const firstDayOfMonth = start.getDay()
    const daysFromPrevMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 // Adjust for Monday start

    // Get days from previous month to fill the grid
    const prevMonthDays = eachDayOfInterval({
      start: addDays(start, -daysFromPrevMonth),
      end: addDays(start, -1),
    })

    // Calculate how many days we need from the next month
    const totalDaysToShow = 42 // 6 weeks
    const daysFromNextMonth = totalDaysToShow - days.length - prevMonthDays.length

    // Get days from next month
    const nextMonthDays = eachDayOfInterval({
      start: addDays(end, 1),
      end: addDays(end, daysFromNextMonth),
    })

    // Combine all days
    const allDays = [...prevMonthDays, ...days, ...nextMonthDays]

    return (
      <div className="flex flex-col h-[600px] bg-[#1a2234] rounded-lg border border-[#2a3349]">
        <div className="flex justify-between items-center p-4 border-b border-[#2a3349]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate((prev) => subMonths(prev, 1))}
            className="border-[#2a3349] text-white hover:bg-[#2a3349]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium text-white">{format(currentDate, "MMMM yyyy")}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate((prev) => addMonths(prev, 1))}
            className="border-[#2a3349] text-white hover:bg-[#2a3349]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 border-b border-[#2a3349]">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="p-2 text-center border-r border-[#2a3349] last:border-r-0">
              <div className="text-sm font-medium text-white">{day}</div>
            </div>
          ))}
        </div>

        <ScrollArea className="flex-1">
          <div className="grid grid-cols-7 auto-rows-[minmax(100px,_1fr)]">
            {allDays.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, currentDate)
              const dayAppointments = appointments.filter((appointment) => {
                const appointmentDate = new Date(appointment.start)
                return (
                  appointmentDate.toString() !== "Invalid Date" &&
                  appointmentDate.getFullYear() > 1900 &&
                  isSameDay(appointmentDate, day)
                )
              })

              return (
                <div
                  key={index}
                  className={`border-r border-b border-[#2a3349] last:border-r-0 p-2 ${
                    isCurrentMonth ? "bg-transparent" : "bg-[#0f172a]/50"
                  } ${isToday(day) ? "bg-[#06b6d4]/10" : ""} cursor-pointer hover:bg-[#1a2234]/30`}
                  onClick={() => {
                    // If clicking on an empty area, add a new appointment at 9am
                    const date = new Date(day)
                    date.setHours(9, 0, 0, 0)
                    onDateClick(date)
                  }}
                >
                  <div className="text-xs font-medium mb-1 text-right">
                    <span className={isCurrentMonth ? "text-white" : "text-gray-500"}>{format(day, "d")}</span>
                  </div>

                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`rounded-sm p-1 border-l-2 ${getTypeColor(
                          appointment.type,
                        )} bg-[#0f172a] text-white text-xs cursor-pointer hover:bg-[#2a3349] transition-colors`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onAppointmentClick(appointment)
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(appointment.status)}`}></div>
                          <span className="truncate">
                            {new Date(appointment.start).toString() !== "Invalid Date" &&
                            new Date(appointment.start).getFullYear() > 1900
                              ? format(new Date(appointment.start), "h:mm a")
                              : "No time"}
                          </span>
                        </div>
                        <div className="truncate font-medium">{appointment.title || "No Title"}</div>
                      </div>
                    ))}

                    {dayAppointments.length > 3 && (
                      <button
                        className="text-xs text-[#06b6d4] hover:text-[#0891b2] transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Set the current date to this day and switch to day view
                          setCurrentDate(day)
                        }}
                      >
                        +{dayAppointments.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="h-full">
        {view === "day" && renderDayView()}
        {view === "week" && renderWeekView()}
        {view === "month" && renderMonthView()}
      </div>
    </TooltipProvider>
  )
}
