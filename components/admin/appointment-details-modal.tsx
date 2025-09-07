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
import { Calendar, Clock, MapPin, User, Users, Building, FileText, Edit, Trash2 } from "lucide-react"
import { format, isValid } from "date-fns"
import type { Appointment } from "@/types/appointment"

interface AppointmentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: Appointment | null
  onEdit: (appointment: Appointment) => void
  onDelete: (appointment: Appointment) => void
}

const getStatusBadge = (status: number) => {
  switch (status) {
    case 0:
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>
    case 1:
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Progress</Badge>
    case 2:
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
    case 3:
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
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

const formatDate = (dateValue: any, formatString: string) => {
  if (!dateValue) return "N/A"

  const date = new Date(dateValue)
  if (!isValid(date)) return "Invalid date"

  return format(date, formatString)
}

export function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment,
  onEdit,
  onDelete,
}: AppointmentDetailsModalProps) {
  const normalizePhone = (raw?: string | null) => {
    const digits = (raw || "").replace(/\D/g, "")
    if (!digits) return null
    let d = digits.replace(/^0+/, "")
    if (!d.startsWith("55") && d.length <= 12) d = "55" + d
    return d
  }

  const handleOnMyWay = () => {
    if (!appointment) return
    const phone = normalizePhone(appointment.customer?.phone as any)
    if (!phone) { alert("Client phone not available."); return }
    const name = appointment.customer?.name || ""
    const companyName = appointment.company?.name || (typeof window !== "undefined" ? (localStorage.getItem("company_name") || "our") : "our")
    const eta = "15 minutes"
    const message = `Hi ${name}, hope your having a nice day. Your ${companyName} team is on the way, ${eta} from your house`
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    if (typeof window !== "undefined") window.open(url, "_blank")
  }

  if (!appointment) return null

  const startDate = new Date(appointment.start)
  const endDate = new Date(appointment.end)
  const isStartValid = isValid(startDate)
  const isEndValid = isValid(endDate)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a2234] border-[#2a3349] text-white">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{appointment.title}</DialogTitle>
              <DialogDescription className="text-gray-400 mt-1">Appointment details and information</DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(appointment.status)}
              {getTypeBadge(appointment.type)}
            
                <Button variant="outline" size="sm" className="border-[#2a3349] text-white hover:bg-[#2a3349]" onClick={handleOnMyWay}>
                  On my way
                </Button></div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date & Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#06b6d4]">
              <Calendar className="h-5 w-5" />
              <h3 className="font-semibold">Date & Time</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 pl-7">
              <div>
                <p className="text-sm text-gray-400">Date</p>
                <p className="text-white font-medium">
                  {isStartValid ? format(startDate, "EEEE, MMMM d, yyyy") : "Invalid date"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Time</p>
                <p className="text-white font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {isStartValid && isEndValid
                    ? `${format(startDate, "HH:mm")} - ${format(endDate, "HH:mm")}`
                    : "Invalid time"}
                </p>
              </div>
            </div>
          </div>

          <Separator className="bg-[#2a3349]" />

          {/* Location */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#06b6d4]">
              <MapPin className="h-5 w-5" />
              <h3 className="font-semibold">Location</h3>
            </div>
            <div className="pl-7">
              <p className="text-white">{appointment.address}</p>
            </div>
          </div>

          <Separator className="bg-[#2a3349]" />

          {/* People */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#06b6d4]">
              <User className="h-5 w-5" />
              <h3 className="font-semibold">People</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
              <div>
                <p className="text-sm text-gray-400">Customer</p>
                <p className="text-white font-medium">{appointment.customer?.name || "N/A"}</p>
                {appointment.customer?.phone && <p className="text-sm text-gray-400">{appointment.customer.phone}</p>}
                {appointment.customer?.email && <p className="text-sm text-gray-400">{appointment.customer.email}</p>}
              </div>
              <div>
                <p className="text-sm text-gray-400">Professional</p>
                <p className="text-white font-medium">{appointment.professional?.name || "N/A"}</p>
                {appointment.professional?.phone && (
                  <p className="text-sm text-gray-400">{appointment.professional.phone}</p>
                )}
              </div>
            </div>
          </div>

          <Separator className="bg-[#2a3349]" />

          {/* Organization */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#06b6d4]">
              <Building className="h-5 w-5" />
              <h3 className="font-semibold">Organization</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
              <div>
                <p className="text-sm text-gray-400">Company</p>
                <p className="text-white font-medium">{appointment.company?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Team</p>
                <p className="text-white font-medium flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {appointment.team?.name || "N/A"}
                </p>
                {appointment.team?.region && <p className="text-sm text-gray-400">{appointment.team.region}</p>}
              </div>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <>
              <Separator className="bg-[#2a3349]" />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#06b6d4]">
                  <FileText className="h-5 w-5" />
                  <h3 className="font-semibold">Notes</h3>
                </div>
                <div className="pl-7">
                  <p className="text-gray-300 whitespace-pre-wrap">{appointment.notes}</p>
                </div>
              </div>
            </>
          )}

          {/* Metadata */}
          <Separator className="bg-[#2a3349]" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Created</p>
              <p className="text-white">{formatDate(appointment.createdDate, "MMM d, yyyy 'at' HH:mm")}</p>
            </div>
            <div>
              <p className="text-gray-400">Last Updated</p>
              <p className="text-white">{formatDate(appointment.updatedDate, "MMM d, yyyy 'at' HH:mm")}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#2a3349] text-white hover:bg-[#2a3349] bg-transparent"
          >
            Close
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onEdit(appointment)}
              className="border-[#2a3349] text-white hover:bg-[#2a3349] bg-transparent"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(appointment)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
