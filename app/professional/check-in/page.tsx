"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { MapPin, Clock, AlertTriangle, User, Calendar, FileText, LogIn, LogOut, Loader2 } from "lucide-react"
import { format } from "date-fns"
import {
  performCheckInWithPhoto,
  performCheckOutWithPhoto,
  getCheckRecordsByAppointment,
} from "@/lib/api/professional-check"
import { fetchApi } from "@/lib/api/utils"
import type { Appointment } from "@/types/appointment"

interface CheckRecord {
  id: number
  professionalId: number
  customerId: number
  customerName: string
  address: string
  checkInTime?: string
  checkOutTime?: string
  status: number
  serviceType: string
  notes?: string
  appointmentId?: number
}

export default function ProfessionalCheckIn() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [checkRecord, setCheckRecord] = useState<CheckRecord | null>(null)
  const [notes, setNotes] = useState("")
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Get user's location
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          setLocationError(error.message)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        },
      )
    }
  }, [])

  // Load today's appointments
  useEffect(() => {
    const loadAppointments = async () => {
      if (!user?.professionalId) return

      setIsLoading(true)
      try {
        const today = new Date()
        const startDate = format(today, "yyyy-MM-dd")
        const endDate = format(today, "yyyy-MM-dd")

        const response = await fetchApi<{ results: Appointment[] }>(
          `Appointment?ProfessionalId=${user.professionalId}&StartDate=${startDate}&EndDate=${endDate}&PageSize=100`,
        )

        const todayAppointments = response?.results || []
        setAppointments(todayAppointments)

        // Auto-select first appointment if available
        if (todayAppointments.length > 0) {
          const firstAppointment = todayAppointments[0]
          setSelectedAppointment(firstAppointment)

          // Check if there's an existing check record
          const records = await getCheckRecordsByAppointment(user.professionalId, firstAppointment.id)
          if (records && records.length > 0) {
            setCheckRecord(records[0])
          }
        }
      } catch (error) {
        console.error("Error loading appointments:", error)
        toast({
          title: "Error",
          description: "Failed to load appointments",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadAppointments()
  }, [user?.professionalId, toast])

  const handleCheckIn = async () => {
    if (!selectedAppointment || !user?.professionalId) {
      toast({
        title: "Error",
        description: "Please select an appointment",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await performCheckInWithPhoto(user.professionalId, selectedAppointment.id, {
        location: location || undefined,
        notes: notes || undefined,
      })

      toast({
        title: "Success",
        description: "Check-in completed successfully",
      })

      // Reload check record
      const records = await getCheckRecordsByAppointment(user.professionalId, selectedAppointment.id)
      if (records && records.length > 0) {
        setCheckRecord(records[0])
      }

      setNotes("")
    } catch (error: any) {
      console.error("Error checking in:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to check in",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCheckOut = async () => {
    if (!selectedAppointment || !user?.professionalId || !checkRecord) {
      toast({
        title: "Error",
        description: "No active check-in found",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await performCheckOutWithPhoto(user.professionalId, selectedAppointment.id, {
        location: location || undefined,
        notes: notes || undefined,
      })

      toast({
        title: "Success",
        description: "Check-out completed successfully",
      })

      // Navigate back to dashboard
      router.push("/professional/dashboard")
    } catch (error: any) {
      console.error("Error checking out:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to check out",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAppointmentSelect = async (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setNotes("")

    if (user?.professionalId) {
      try {
        const records = await getCheckRecordsByAppointment(user.professionalId, appointment.id)
        if (records && records.length > 0) {
          setCheckRecord(records[0])
        } else {
          setCheckRecord(null)
        }
      } catch (error) {
        console.error("Error loading check record:", error)
        setCheckRecord(null)
      }
    }
  }

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    )
  }

  const isCheckedIn = checkRecord && checkRecord.checkInTime && !checkRecord.checkOutTime

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="space-y-1 md:space-y-2">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          {isCheckedIn ? "Check-out" : "Check-in"}
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          {isCheckedIn ? "Complete your service and check out" : "Register your arrival at the service location"}
        </p>
      </div>

      {/* Location Status */}
      {location && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">Location detected</p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                  Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {locationError && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Location unavailable</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">{locationError}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointments List */}
      {appointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Today's Appointments</CardTitle>
            <CardDescription className="text-xs md:text-sm">Select an appointment to check in/out</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedAppointment?.id === appointment.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                }`}
                onClick={() => handleAppointmentSelect(appointment)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-foreground truncate">{appointment.title}</h4>
                      <Badge variant="outline" className={`${getStatusBadge(appointment.status).className} text-xs`}>
                        {getStatusBadge(appointment.status).label}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span className="truncate">{appointment.customer?.name || "No customer"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(new Date(appointment.start), "HH:mm")} - {format(new Date(appointment.end), "HH:mm")}
                        </span>
                      </div>
                      <div className="flex items-start gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="break-words">{appointment.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {appointments.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No appointments scheduled for today</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Appointment Details */}
      {selectedAppointment && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Service Details</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Information about the selected appointment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium block text-foreground">Client:</span>
                    <span className="text-sm text-muted-foreground">{selectedAppointment.customer?.name || "N/A"}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium block text-foreground">Time:</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(selectedAppointment.start), "HH:mm")} -{" "}
                      {format(new Date(selectedAppointment.end), "HH:mm")}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium block text-foreground">Address:</span>
                    <span className="text-sm text-muted-foreground break-words">{selectedAppointment.address}</span>
                  </div>
                </div>
                {selectedAppointment.notes && (
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium block text-foreground">Notes:</span>
                      <span className="text-sm text-muted-foreground">{selectedAppointment.notes}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Check Record Status */}
              {checkRecord && (
                <div className="pt-3 border-t">
                  <div className="space-y-2">
                    {checkRecord.checkInTime && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Checked in:</span>
                        <span className="font-medium text-foreground">
                          {format(new Date(checkRecord.checkInTime), "HH:mm")}
                        </span>
                      </div>
                    )}
                    {checkRecord.checkOutTime && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Checked out:</span>
                        <span className="font-medium text-foreground">
                          {format(new Date(checkRecord.checkOutTime), "HH:mm")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Check-in/Check-out Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">
                {isCheckedIn ? "Complete Check-out" : "Register Check-in"}
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                {isCheckedIn
                  ? "Add any final notes and complete your service"
                  : "Add notes about the location and confirm your arrival"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notes {isCheckedIn ? "(Optional)" : "(Before Service)"}
                </Label>
                <Textarea
                  id="notes"
                  placeholder={
                    isCheckedIn
                      ? "Any observations about the completed service?"
                      : "Any observations about the location?"
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-sm md:text-base min-h-[100px]"
                />
              </div>

              {isCheckedIn ? (
                <Button
                  className="w-full h-11 md:h-10 text-sm md:text-base font-medium"
                  onClick={handleCheckOut}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking out...
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Confirm Check-out
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  className="w-full h-11 md:h-10 text-sm md:text-base font-medium"
                  onClick={handleCheckIn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Confirm Check-in
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
