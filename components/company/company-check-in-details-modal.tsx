"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Users, Building, MapPin, Clock, Calendar, CheckCircle, AlertCircle, FileText, Hash } from "lucide-react"
import { format } from "date-fns"

interface CompanyCheckInDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  checkIn: any
}

export function CompanyCheckInDetailsModal({ isOpen, onClose, checkIn }: CompanyCheckInDetailsModalProps) {
  if (!checkIn) return null

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500">Pending</Badge>
      case 1:
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500">Checked In</Badge>
      case 2:
        return <Badge className="bg-green-500/20 text-green-500 border-green-500">Completed</Badge>
      case 3:
        return <Badge className="bg-red-500/20 text-red-500 border-red-500">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500">Unknown</Badge>
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-[#1a2234] border-[#2a3349] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Check-in Details
            {getStatusBadge(checkIn.status ?? 0)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
            <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-3">
              <Hash className="h-4 w-4" />
              Reference IDs
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">Record ID:</span>
                <div className="text-white font-mono">{checkIn.id || "N/A"}</div>
              </div>
              <div>
                <span className="text-gray-400">Appointment ID:</span>
                <div className="text-white font-mono">{checkIn.appointmentId || "N/A"}</div>
              </div>
              <div>
                <span className="text-gray-400">Professional ID:</span>
                <div className="text-white font-mono">{checkIn.professionalId || "N/A"}</div>
              </div>
              <div>
                <span className="text-gray-400">Customer ID:</span>
                <div className="text-white font-mono">{checkIn.customerId || "N/A"}</div>
              </div>
              <div>
                <span className="text-gray-400">Company ID:</span>
                <div className="text-white font-mono">{checkIn.companyId || "N/A"}</div>
              </div>
              <div>
                <span className="text-gray-400">Team ID:</span>
                <div className="text-white font-mono">{checkIn.teamId || "N/A"}</div>
              </div>
              {checkIn.gpsTrackingId && (
                <div>
                  <span className="text-gray-400">GPS Tracking ID:</span>
                  <div className="text-white font-mono">{checkIn.gpsTrackingId}</div>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-[#2a3349]" />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-[#06b6d4] mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Professional</p>
                  <p className="font-medium text-white">{checkIn.professionalName || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-[#06b6d4] mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Team</p>
                  <p className="font-medium text-white">{checkIn.teamName || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-[#06b6d4] mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Customer</p>
                  <p className="font-medium text-white">{checkIn.customerName || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-[#06b6d4] mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Service Type</p>
                  <p className="font-medium text-white">{checkIn.serviceType || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-[#06b6d4] mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Check-in Time</p>
                  <p className="font-medium text-white">{formatDateTime(checkIn.checkInTime)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-[#06b6d4] mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Check-out Time</p>
                  <p className="font-medium text-white">{formatDateTime(checkIn.checkOutTime)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-[#2a3349]" />

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-[#06b6d4] mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-400">Location</p>
                <p className="font-medium text-white">{checkIn.address || "N/A"}</p>
                <div className="flex items-center gap-2 mt-2">
                  {checkIn.gpsTrackingId ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">GPS Verified</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">GPS Not Verified</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Created:</span>
                <div className="text-white">{formatDateTime(checkIn.createdDate)}</div>
              </div>
              <div>
                <span className="text-gray-400">Last Updated:</span>
                <div className="text-white">{formatDateTime(checkIn.updatedDate)}</div>
              </div>
            </div>

            {checkIn.notes && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-[#06b6d4] mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Notes</p>
                  <p className="text-white mt-1 bg-[#0f172a] p-3 rounded-md border border-[#2a3349]">{checkIn.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
