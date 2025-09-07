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
        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No appointments found</h3>
        <p className="text-gray-400">Create your first appointment to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id} className="bg-[#1a2234] border-[#2a3349] hover:border-[#06b6d4] transition-colors">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{appointment.title}</h3>
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
                      className="text-gray-400 hover:text-white hover:bg-[#2a3349]"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(appointment)}
                      className="text-gray-400 hover:text-white hover:bg-[#2a3349]"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(appointment)}
                      className="text-gray-400 hover:text-red-400 hover:bg-[#2a3349]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date & Time */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Date & Time</span>
                    </div>
                    <div className="text-white">
                      <div className="text-sm">{format(new Date(appointment.start), "MMM dd, yyyy")}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(appointment.start), "HH:mm")} - {format(new Date(appointment.end), "HH:mm")}
                      </div>
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">Customer</span>
                    </div>
                    <div className="text-white">
                      <div className="text-sm">{appointment.customer?.name || "N/A"}</div>
                      <div className="text-xs text-gray-400">{appointment.customer?.phone || ""}</div>
                    </div>
                  </div>

                  {/* Team & Professional */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">Team</span>
                    </div>
                    <div className="text-white">
                      <div className="text-sm">{appointment.team?.name || "N/A"}</div>
                      <div className="text-xs text-gray-400">{appointment.professional?.name || ""}</div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">Address</span>
                    </div>
                    <div className="text-white">
                      <div className="text-sm truncate" title={appointment.address}>
                        {appointment.address}
                      </div>
                      <div className="text-xs text-gray-400">{appointment.company?.name || ""}</div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {appointment.notes && (
                  <div className="pt-2 border-t border-[#2a3349]">
                    <p className="text-sm text-gray-400">
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
