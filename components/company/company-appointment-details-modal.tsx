"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, MapPin, User, Phone, Mail, FileText, Edit, Trash2, Plus } from "lucide-react"
import { format, isValid } from "date-fns"
import type { Appointment } from "@/types/appointment"
import { CompanyCheckRecordModal } from "./company-check-record-modal"
import { useToast } from "@/hooks/use-toast"

interface CompanyAppointmentDetailsModalProps {
  appointment: Appointment | null
  isOpen: boolean
  onClose: () => void
  onEdit: (appointment: Appointment) => void
  onDelete: (appointment: Appointment) => void
}

const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return "bg-blue-100 text-blue-800"
    case 1:
      return "bg-yellow-100 text-yellow-800"
    case 2:
      return "bg-green-100 text-green-800"
    case 3:
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
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

const getTypeText = (type: number) => {
  switch (type) {
    case 0:
      return "Regular Cleaning"
    case 1:
      return "Deep Cleaning"
    case 2:
      return "Move-in/Move-out"
    default:
      return "Other"
  }
}

const getPriorityText = (priority: number) => {
  switch (priority) {
    case 0:
      return "Low"
    case 1:
      return "Medium"
    case 2:
      return "High"
    case 3:
      return "Urgent"
    default:
      return "Normal"
  }
}

const getPriorityColor = (priority: number) => {
  switch (priority) {
    case 0:
      return "bg-gray-100 text-gray-800"
    case 1:
      return "bg-blue-100 text-blue-800"
    case 2:
      return "bg-orange-100 text-orange-800"
    case 3:
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function CompanyAppointmentDetailsModal({
  appointment,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: CompanyAppointmentDetailsModalProps) {
  const [isCheckRecordModalOpen, setIsCheckRecordModalOpen] = useState(false)
  const { toast } = useToast()

  if (!appointment) return null

  const startDate = new Date(appointment.start)
  const endDate = new Date(appointment.end)
  const isValidStartDate = isValid(startDate)
  const isValidEndDate = isValid(endDate)

  
  const normalizePhone = (raw?: string | null) => {
    const digits = (raw || "").replace(/\D/g, "")
    if (!digits) return null
    let d = digits.replace(/^0+/, "")
    if (!d.startsWith("55") && d.length <= 12) d = "55" + d
    return d
  }

  const handleOnMyWay = () => {
    const phone = normalizePhone(appointment.customer?.phone as any)
    if (!phone) { alert("Client phone not available."); return }
    const name = appointment.customer?.name || ""
    const companyName = appointment.company?.name || (typeof window !== "undefined" ? (localStorage.getItem("company_name") || "our") : "our")
    const eta = "15 minutes"
    const message = `Hi ${name}, hope your having a nice day. Your ${companyName} team is on the way, ${eta} from your house`
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    if (typeof window !== "undefined") window.open(url, "_blank")
  }
return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-[#1a2234] border-[#2a3349] text-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-white">
                {appointment.title || "Appointment Details"}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(appointment.status)}>{getStatusText(appointment.status)}</Badge>
                <Badge variant="outline" className={getPriorityColor(appointment.priority || 0)}>
                  {getPriorityText(appointment.priority || 0)}
                </Badge>
              
                <Button variant="outline" size="sm" className="border-[#2a3349] text-white hover:bg-[#2a3349]" onClick={handleOnMyWay}>
                  On my way
                </Button></div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Date & Time</span>
                </div>
                <div className="pl-6 space-y-1">
                  <p className="text-white">
                    {isValidStartDate ? format(startDate, "EEEE, MMMM d, yyyy") : "Invalid date"}
                  </p>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span className="text-sm">
                      {isValidStartDate && isValidEndDate
                        ? `${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`
                        : "Invalid time"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">Service Type</span>
                </div>
                <div className="pl-6">
                  <p className="text-white">{getTypeText(appointment.type)}</p>
                </div>
              </div>
            </div>

            <Separator className="bg-[#2a3349]" />

            {/* Customer Information */}
            {appointment.customer && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Customer Information</span>
                </div>
                <div className="pl-6 space-y-2">
                  <p className="text-white font-medium">{appointment.customer.name}</p>
                  {appointment.customer.email && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail className="h-3 w-3" />
                      <span className="text-sm">{appointment.customer.email}</span>
                    </div>
                  )}
                  {appointment.customer.phone && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Phone className="h-3 w-3" />
                      <span className="text-sm">{appointment.customer.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            {appointment.address && (
              <>
                <Separator className="bg-[#2a3349]" />
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Location</span>
                  </div>
                  <div className="pl-6">
                    <p className="text-white">{appointment.address}</p>
                  </div>
                </div>
              </>
            )}

            {/* Description */}
            {appointment.notes && (
              <>
                <Separator className="bg-[#2a3349]" />
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-300">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">Notes</span>
                  </div>
                  <div className="pl-6">
                    <p className="text-gray-300 text-sm leading-relaxed">{appointment.notes}</p>
                  </div>
                </div>
              </>
            )}

            {/* Professional Assignment */}
            {appointment.professional && (
              <>
                <Separator className="bg-[#2a3349]" />
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-300">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Assigned Professional</span>
                  </div>
                  <div className="pl-6">
                    <p className="text-white font-medium">{appointment.professional.name}</p>
                    {appointment.professional.email && (
                      <div className="flex items-center gap-2 text-gray-400 mt-1">
                        <Mail className="h-3 w-3" />
                        <span className="text-sm">{appointment.professional.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Additional Details */}
            <Separator className="bg-[#2a3349]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Created:</span>
                <p className="text-white">
                  {appointment.createdAt && isValid(new Date(appointment.createdAt))
                    ? format(new Date(appointment.createdAt), "MMM d, yyyy 'at' h:mm a")
                    : "N/A"}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Last Updated:</span>
                <p className="text-white">
                  {appointment.updatedAt && isValid(new Date(appointment.updatedAt))
                    ? format(new Date(appointment.updatedAt), "MMM d, yyyy 'at' h:mm a")
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#2a3349]">
            <Button
              variant="outline"
              onClick={() => setIsCheckRecordModalOpen(true)}
              className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Check Record
            </Button>
            <Button
              variant="outline"
              onClick={() => onEdit(appointment)}
              className="border-[#2a3349] text-white hover:bg-[#2a3349]"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => onDelete(appointment)}
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Check Record Modal */}
      <CompanyCheckRecordModal
        isOpen={isCheckRecordModalOpen}
        onClose={() => setIsCheckRecordModalOpen(false)}
        onSuccess={() => {
          setIsCheckRecordModalOpen(false)
          toast({
            title: "Success",
            description: "Check record created successfully",
          })
        }}
        prefilledData={{
          appointmentId: appointment?.id?.toString() || "",
          customerId: appointment?.customer?.id?.toString() || "",
          address: appointment?.address || "",
          professionalId: appointment?.professional?.id?.toString() || "",
        }}
      />
    </>
  )
}
