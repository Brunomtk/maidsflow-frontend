"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, User, Users, Eye, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import type { Appointment } from "@/types/appointment"

interface AppointmentListProps {
  appointments: Appointment[]
  onViewDetails: (appointment: Appointment) => void
  onEdit: (appointment: Appointment) => void
  onDelete: (appointment: Appointment) => void
}

const getStatusBadge = (status: number) => {
  switch (status) {
    case 0:
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Scheduled
        </Badge>
      )
    case 1:
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          In Progress
        </Badge>
      )
    case 2:
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Completed
        </Badge>
      )
    case 3:
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          Cancelled
        </Badge>
      )
    default:
      return <Badge variant="secondary">Unknown</Badge>
  }
}

const getTypeBadge = (type: number) => {
  switch (type) {
    case 0:
      return (
        <Badge variant="outline" className="border-gray-300 text-gray-700">
          Regular
        </Badge>
      )
    case 1:
      return (
        <Badge variant="outline" className="border-purple-300 text-purple-700">
          Deep Cleaning
        </Badge>
      )
    case 2:
      return (
        <Badge variant="outline" className="border-orange-300 text-orange-700">
          Specialized
        </Badge>
      )
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export function AppointmentList({ appointments, onViewDetails, onEdit, onDelete }: AppointmentListProps) {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No appointments found</h3>
        <p className="text-muted-foreground">Create your first appointment to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id} className="bg-card border-border hover:border-primary transition-colors">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{appointment.title}</h3>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(appointment.status)}
                      {getTypeBadge(appointment.type)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(appointment)}
                      className="text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(appointment)}
                      className="text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(appointment)}
                      className="text-muted-foreground hover:text-destructive hover:bg-accent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date & Time */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Date & Time</span>
                    </div>
                    <div className="text-foreground">
                      <div className="text-sm">{format(new Date(appointment.start), "MMM dd, yyyy")}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(appointment.start), "HH:mm")} - {format(new Date(appointment.end), "HH:mm")}
                      </div>
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">Customer</span>
                    </div>
                    <div className="text-foreground">
                      <div className="text-sm">{appointment.customer?.name || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">{appointment.customer?.phone || ""}</div>
                    </div>
                  </div>

                  {/* Team & Professional */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">Team</span>
                    </div>
                    <div className="text-foreground">
                      <div className="text-sm">{appointment.team?.name || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">{appointment.professional?.name || ""}</div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">Address</span>
                    </div>
                    <div className="text-foreground">
                      <div className="text-sm truncate" title={appointment.address}>
                        {appointment.address}
                      </div>
                      <div className="text-xs text-muted-foreground">{appointment.company?.name || ""}</div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {appointment.notes && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Notes:</span> {appointment.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
