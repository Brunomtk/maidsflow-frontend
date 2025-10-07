"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, MapPin, User, Phone, Mail, FileText, Edit, Trash2, Plus } from "lucide-react"
import { format, isValid } from "date-fns"
import type { Appointment } from "@/types/appointment"
import { useToast } from "@/hooks/use-toast"
import { getCheckRecords, createCheckRecordFromAppointment } from "@/lib/api/check-records"
import { useCompanyAppointments } from "@/contexts/company-appointments-context"

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
  const [isCreatingCheckRecord, setIsCreatingCheckRecord] = useState(false)
  const { toast } = useToast()
  const { fetchAppointments } = useCompanyAppointments()
  const router = useRouter()

  if (!appointment) return null

  const startDate = new Date(appointment.start)
  const endDate = new Date(appointment.end)
  const isValidStartDate = isValid(startDate)
  const isValidEndDate = isValid(endDate)

  console.log("[v0] Appointment data received:", appointment)
  console.log("[v0] Start from API:", appointment.start)
  console.log("[v0] End from API:", appointment.end)
  console.log("[v0] Start as Date object:", startDate)
  console.log("[v0] End as Date object:", endDate)
  console.log("[v0] Start formatted:", isValidStartDate ? format(startDate, "h:mm a") : "Invalid")
  console.log("[v0] End formatted:", isValidEndDate ? format(endDate, "h:mm a") : "Invalid")

  const normalizePhone = (raw?: string | null) => {
    const digits = (raw || "").replace(/\D/g, "")
    if (!digits) return null
    let d = digits.replace(/^0+/, "")
    if (!d.startsWith("55") && d.length <= 12) d = "55" + d
    return d
  }

  const handleOnMyWay = () => {
    const phone = normalizePhone(appointment.customer?.phone as any)
    if (!phone) {
      alert("Client phone not available.")
      return
    }
    const name = appointment.customer?.name || ""
    const companyName =
      appointment.company?.name ||
      (typeof window !== "undefined" ? localStorage.getItem("company_name") || "our" : "our")
    const eta = "15 minutes"
    const message = `Hi ${name}, hope your having a nice day. Your ${companyName} team is on the way, ${eta} from your house`
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    if (typeof window !== "undefined") window.open(url, "_blank")
  }

  const handleCreateCheckRecord = async () => {
    if (!appointment) return

    setIsCreatingCheckRecord(true)

    try {
      // Check if a check record already exists for this appointment
      const existingRecords = await getCheckRecords({
        appointmentId: appointment.id,
        companyId: appointment.companyId,
      })

      if (existingRecords.results && existingRecords.results.length > 0) {
        // Check record already exists, navigate to check records page
        toast({
          title: "Check Record Already Exists",
          description: "A check record has already been created for this appointment.",
          variant: "default",
        })

        onClose()
        return
      }

      // No existing check record, create a new one
      await createCheckRecordFromAppointment(appointment)

      toast({
        title: "Success",
        description: "Check record created successfully and appointment status updated to In Progress",
      })

      await fetchAppointments()

      onClose()
    } catch (error) {
      console.error("Error creating check record:", error)
      toast({
        title: "Error",
        description: "Failed to create check record. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingCheckRecord(false)
    }
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
              </div>
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
              onClick={handleOnMyWay}
              className="border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white bg-transparent"
            >
              On my way
            </Button>
            {appointment.status === 0 && (
              <Button
                variant="outline"
                onClick={handleCreateCheckRecord}
                disabled={isCreatingCheckRecord}
                className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white bg-transparent"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreatingCheckRecord ? "Creating..." : "Create Check Record"}
              </Button>
            )}
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
    </>
  )
}
