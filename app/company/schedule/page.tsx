"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Plus, RefreshCw } from "lucide-react"
import { CompanyScheduleCalendar } from "@/components/company/company-schedule-calendar"
import CompanyAppointmentModal from "@/components/company/company-appointment-modal"
import { CompanyAppointmentDetailsModal } from "@/components/company/company-appointment-details-modal"
import { CompanyAppointmentsProvider, useCompanyAppointments } from "@/contexts/company-appointments-context"
import type { Appointment } from "@/types/appointment"

function CompanyScheduleContent() {
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [filterProfessional, setFilterProfessional] = useState("all")
  const { appointments, isLoading, fetchAppointments, addAppointment, editAppointment, removeAppointment } =
    useCompanyAppointments()

  const filteredAppointments = appointments.filter((appointment) => {
    if (filterStatus !== "all" && appointment.status.toString() !== filterStatus) return false
    if (filterType !== "all" && appointment.type.toString() !== filterType) return false
    if (filterProfessional !== "all" && appointment.professionalId?.toString() !== filterProfessional) return false
    return true
  })

  // Modal states
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const handleAddAppointment = (date?: Date) => {
    setSelectedAppointment(null)
    setIsEditing(false)
    setIsAppointmentModalOpen(true)

    // If a date is provided, we'll use it as the default start time
    if (date) {
      const endDate = new Date(date.getTime() + 2 * 60 * 60 * 1000) // Add 2 hours
      setSelectedAppointment({
        start: date,
        end: endDate,
      } as Appointment)
    }
  }

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailsModalOpen(true)
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsEditing(true)
    setIsAppointmentModalOpen(true)
    setIsDetailsModalOpen(false)
  }

  const handleDeleteAppointment = async (appointment: Appointment) => {
    if (appointment.id) {
      await removeAppointment(appointment.id)
      await handleRefresh() // Use handleRefresh instead of fetchAppointments
    }
  }

  const handleSubmitAppointment = async (data: any) => {
    if (isEditing && selectedAppointment?.id) {
      await editAppointment(selectedAppointment.id, data)
    } else {
      await addAppointment(data)
    }
    setIsAppointmentModalOpen(false)
    await handleRefresh() // Use handleRefresh instead of fetchAppointments
  }

  const handleClearFilters = () => {
    setFilterStatus("all")
    setFilterType("all")
    setFilterProfessional("all")
  }

  const handleRefresh = async () => {
    await fetchAppointments()
  }

  // Get unique professionals from appointments for filter
  const uniqueProfessionals = appointments.reduce(
    (acc, appointment) => {
      if (appointment.professional && !acc.find((p) => p.id === appointment.professional!.id)) {
        acc.push(appointment.professional)
      }
      return acc
    },
    [] as Array<{ id: number; name: string; email: string }>,
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground">Loading appointments...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Schedule</h1>
          <p className="text-muted-foreground">View and manage your scheduled services</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="border-border text-foreground hover:bg-muted bg-transparent"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => handleAddAppointment()} className="bg-[#06b6d4] hover:bg-[#0891b2] text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[160px] bg-muted border-border text-foreground">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="all" className="hover:bg-muted">
                    All Status
                  </SelectItem>
                  <SelectItem value="0" className="hover:bg-muted">
                    Scheduled
                  </SelectItem>
                  <SelectItem value="1" className="hover:bg-muted">
                    In Progress
                  </SelectItem>
                  <SelectItem value="2" className="hover:bg-muted">
                    Completed
                  </SelectItem>
                  <SelectItem value="3" className="hover:bg-muted">
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[160px] bg-muted border-border text-foreground">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="all" className="hover:bg-muted">
                    All Types
                  </SelectItem>
                  <SelectItem value="0" className="hover:bg-muted">
                    Residential
                  </SelectItem>
                  <SelectItem value="1" className="hover:bg-muted">
                    Commercial
                  </SelectItem>
                  <SelectItem value="2" className="hover:bg-muted">
                    Industrial
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterProfessional} onValueChange={setFilterProfessional}>
                <SelectTrigger className="w-full sm:w-[180px] bg-muted border-border text-foreground">
                  <SelectValue placeholder="Filter by professional" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="all" className="hover:bg-muted">
                    All Professionals
                  </SelectItem>
                  {uniqueProfessionals.map((professional) => (
                    <SelectItem key={professional.id} value={professional.id.toString()} className="hover:bg-muted">
                      {professional.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(filterStatus !== "all" || filterType !== "all" || filterProfessional !== "all") && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="border-border text-foreground bg-transparent hover:bg-muted whitespace-nowrap"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            <Tabs defaultValue="week" className="w-full sm:w-auto" onValueChange={(value) => setViewMode(value as any)}>
              <TabsList className="bg-muted border border-border">
                <TabsTrigger value="day" className="data-[state=active]:bg-card text-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Day
                </TabsTrigger>
                <TabsTrigger value="week" className="data-[state=active]:bg-card text-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Week
                </TabsTrigger>
                <TabsTrigger value="month" className="data-[state=active]:bg-card text-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Month
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <CompanyScheduleCalendar
            appointments={filteredAppointments}
            view={viewMode}
            onViewDetails={handleViewDetails}
            onEdit={handleEditAppointment}
            onDelete={handleDeleteAppointment}
            onAddAppointment={handleAddAppointment}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <CompanyAppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSubmit={handleSubmitAppointment}
        appointment={selectedAppointment}
      />

      <CompanyAppointmentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        appointment={selectedAppointment}
        onEdit={handleEditAppointment}
        onDelete={handleDeleteAppointment}
      />
    </div>
  )
}

export default function SchedulePage() {
  return (
    <CompanyAppointmentsProvider>
      <CompanyScheduleContent />
    </CompanyAppointmentsProvider>
  )
}
