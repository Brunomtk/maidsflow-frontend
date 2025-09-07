"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Clock, User, Building, Calendar, FileText, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface CheckInDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  checkIn: any
  onEdit: (checkIn: any) => void
  onDelete: (checkIn: any) => void
}

export function CheckInDetailsModal({ isOpen, onClose, checkIn, onEdit, onDelete }: CheckInDetailsModalProps) {
  if (!checkIn) return null

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return { label: "Pending", className: "border-yellow-500 text-yellow-500" }
      case 1:
        return { label: "Checked In", className: "border-blue-500 text-blue-500" }
      case 2:
        return { label: "Checked Out", className: "border-green-500 text-green-500" }
      default:
        return { label: "Unknown", className: "border-gray-500 text-gray-500" }
    }
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString || dateString === "0001-01-01T00:00:00") return "Not set"
    try {
      return format(new Date(dateString), "PPP 'at' HH:mm")
    } catch {
      return "Invalid date"
    }
  }

  const statusInfo = getStatusBadge(checkIn.status || 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a2234] border-[#2a3349] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-[#2a3349]">
              <AvatarFallback className="bg-[#2a3349] text-[#06b6d4]">
                {(checkIn.professionalName || "N/A")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-lg font-semibold">{checkIn.professionalName || "N/A"}</div>
              <div className="text-sm text-gray-400">Check-in Record Details</div>
            </div>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            View detailed information about this check-in record.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Status</span>
            </div>
            <Badge variant="outline" className={statusInfo.className}>
              {statusInfo.label}
            </Badge>
          </div>

          <Separator className="bg-[#2a3349]" />

          {/* Professional Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <User className="h-4 w-4" />
              Professional Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Name:</span>
                <div className="text-white">{checkIn.professionalName || "N/A"}</div>
              </div>
              <div>
                <span className="text-gray-400">ID:</span>
                <div className="text-white">{checkIn.professionalId || "N/A"}</div>
              </div>
            </div>
          </div>

          <Separator className="bg-[#2a3349]" />

          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Name:</span>
                <div className="text-white">{checkIn.customerName || "N/A"}</div>
              </div>
              <div>
                <span className="text-gray-400">ID:</span>
                <div className="text-white">{checkIn.customerId || "N/A"}</div>
              </div>
            </div>
            {checkIn.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-gray-400 text-sm">Address:</span>
                  <div className="text-white text-sm">{checkIn.address}</div>
                </div>
              </div>
            )}
          </div>

          <Separator className="bg-[#2a3349]" />

          {/* Company & Team Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Company & Team
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Company ID:</span>
                <div className="text-white">{checkIn.companyId || "N/A"}</div>
              </div>
              <div>
                <span className="text-gray-400">Team:</span>
                <div className="text-white">{checkIn.teamName || "N/A"}</div>
              </div>
            </div>
          </div>

          <Separator className="bg-[#2a3349]" />

          {/* Service Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Service Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Service Type:</span>
                <div className="text-white">{checkIn.serviceType || "N/A"}</div>
              </div>
              <div>
                <span className="text-gray-400">Appointment ID:</span>
                <div className="text-white">{checkIn.appointmentId || "N/A"}</div>
              </div>
            </div>
          </div>

          <Separator className="bg-[#2a3349]" />

          {/* Time Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Check-in Time:</span>
                <div className="text-white">{formatDateTime(checkIn.checkInTime)}</div>
              </div>
              <div>
                <span className="text-gray-400">Check-out Time:</span>
                <div className="text-white">{formatDateTime(checkIn.checkOutTime)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Created:</span>
                <div className="text-white">{formatDateTime(checkIn.createdDate)}</div>
              </div>
              <div>
                <span className="text-gray-400">Updated:</span>
                <div className="text-white">{formatDateTime(checkIn.updatedDate)}</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {checkIn.notes && (
            <>
              <Separator className="bg-[#2a3349]" />
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </h3>
                <div className="text-sm text-white bg-[#0f172a] p-3 rounded-md border border-[#2a3349]">
                  {checkIn.notes}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-transparent border-[#2a3349] text-white hover:bg-[#2a3349]"
          >
            Close
          </Button>
          <Button
            variant="outline"
            onClick={() => onEdit(checkIn)}
            className="bg-transparent border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4] hover:text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => onDelete(checkIn)}
            className="bg-transparent border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
