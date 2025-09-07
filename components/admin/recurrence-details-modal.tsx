"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Edit, Trash2, Calendar, Clock, MapPin, Users, Building, User } from "lucide-react"
import type { Recurrence } from "@/types/recurrence"

interface RecurrenceDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  recurrence: Recurrence | null
  onEdit: (recurrence: Recurrence) => void
  onDelete: (recurrence: Recurrence) => void
}

export function RecurrenceDetailsModal({ isOpen, onClose, recurrence, onEdit, onDelete }: RecurrenceDetailsModalProps) {
  if (!recurrence) return null

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return { label: "Active", className: "border-green-500 text-green-500 bg-green-500/10" }
      case 0:
        return { label: "Inactive", className: "border-red-500 text-red-500 bg-red-500/10" }
      default:
        return { label: "Unknown", className: "border-gray-500 text-gray-500 bg-gray-500/10" }
    }
  }

  const getTypeBadge = (type: number) => {
    switch (type) {
      case 1:
        return { label: "Regular", className: "border-blue-400 text-blue-400 bg-blue-400/10" }
      case 2:
        return { label: "Deep", className: "border-purple-400 text-purple-400 bg-purple-400/10" }
      case 3:
        return { label: "Specialized", className: "border-orange-400 text-orange-400 bg-orange-400/10" }
      default:
        return { label: "Unknown", className: "border-gray-400 text-gray-400 bg-gray-400/10" }
    }
  }

  const getFrequencyLabel = (frequency: number) => {
    switch (frequency) {
      case 1:
        return "Weekly"
      case 2:
        return "Bi-weekly"
      case 3:
        return "Monthly"
      default:
        return "Unknown"
    }
  }

  const getDayLabel = (day: number, frequency: number) => {
    if (frequency === 3) {
      // Monthly
      switch (day) {
        case 1:
          return "1st day of month"
        case 15:
          return "15th day of month"
        case 31:
          return "Last day of month"
        default:
          return `Day ${day} of month`
      }
    } else {
      // Weekly/Bi-weekly
      const days = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      return days[day] || `Day ${day}`
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return "N/A"
    return timeString.substring(0, 5) // HH:MM format
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`
    }
    return `${hours}h ${remainingMinutes}m`
  }

  const statusBadge = getStatusBadge(recurrence.status)
  const typeBadge = getTypeBadge(recurrence.type)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-[#1a2234] border-[#2a3349] text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{recurrence.title}</DialogTitle>
              <DialogDescription className="text-gray-400 mt-1">
                Recurring service details and schedule information
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className={statusBadge.className}>
                {statusBadge.label}
              </Badge>
              <Badge variant="outline" className={typeBadge.className}>
                {typeBadge.label}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#06b6d4]" />
              Service Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Service Title</label>
                <p className="text-white">{recurrence.title}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Service Type</label>
                <Badge variant="outline" className={typeBadge.className}>
                  {typeBadge.label}
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="bg-[#2a3349]" />

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#06b6d4]" />
              Location
            </h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Service Address</label>
              <p className="text-white">{recurrence.address}</p>
            </div>
          </div>

          <Separator className="bg-[#2a3349]" />

          {/* Client & Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Building className="h-5 w-5 text-[#06b6d4]" />
              Client & Company
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Customer</label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <p className="text-white">{recurrence.customer?.name || "N/A"}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Company</label>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  <p className="text-white">{recurrence.company?.name || "N/A"}</p>
                </div>
              </div>
            </div>
            {recurrence.team && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Assigned Team</label>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <p className="text-white">{recurrence.team.name}</p>
                </div>
              </div>
            )}
          </div>

          <Separator className="bg-[#2a3349]" />

          {/* Schedule Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#06b6d4]" />
              Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Frequency</label>
                <p className="text-white">{getFrequencyLabel(recurrence.frequency)}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Day</label>
                <p className="text-white">{getDayLabel(recurrence.day, recurrence.frequency)}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Start Time</label>
                <p className="text-white">{formatTime(recurrence.time)}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Duration</label>
                <p className="text-white">{formatDuration(recurrence.duration)}</p>
              </div>
            </div>
          </div>

          <Separator className="bg-[#2a3349]" />

          {/* Date Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Start Date</label>
                <p className="text-white">{formatDate(recurrence.startDate)}</p>
              </div>
              {recurrence.endDate && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">End Date</label>
                  <p className="text-white">{formatDate(recurrence.endDate)}</p>
                </div>
              )}
              {recurrence.lastExecution && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Last Execution</label>
                  <p className="text-white">{formatDate(recurrence.lastExecution)}</p>
                </div>
              )}
              {recurrence.nextExecution && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Next Execution</label>
                  <p className="text-white">{formatDate(recurrence.nextExecution)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {recurrence.notes && (
            <>
              <Separator className="bg-[#2a3349]" />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Notes</h3>
                <div className="bg-[#0f172a] border border-[#2a3349] rounded-md p-4">
                  <p className="text-gray-300 whitespace-pre-wrap">{recurrence.notes}</p>
                </div>
              </div>
            </>
          )}

          <Separator className="bg-[#2a3349]" />

          {/* System Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Created Date</label>
                <p className="text-white">{formatDate(recurrence.createdDate)}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Last Updated</label>
                <p className="text-white">{formatDate(recurrence.updatedDate)}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#2a3349] text-white hover:bg-[#2a3349] bg-transparent"
          >
            Close
          </Button>
          <Button
            variant="outline"
            onClick={() => onEdit(recurrence)}
            className="border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4] hover:text-white bg-transparent"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => onDelete(recurrence)}
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
