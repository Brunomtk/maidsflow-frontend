"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Users, Building, MapPin, Clock, Calendar, CheckCircle, AlertCircle, FileText } from "lucide-react"

interface CompanyCheckInDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  checkIn: any
}

export function CompanyCheckInDetailsModal({ isOpen, onClose, checkIn }: CompanyCheckInDetailsModalProps) {
  if (!checkIn) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "on-time":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500">On Time</Badge>
      case "late":
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500">Late</Badge>
      case "pending":
        return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500">Pending</Badge>
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a2234] border-[#2a3349] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Check-in Details
            {getStatusBadge(checkIn.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Professional</p>
                  <p className="font-medium text-white">{checkIn.professional}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Team</p>
                  <p className="font-medium text-white">{checkIn.team}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Client</p>
                  <p className="font-medium text-white">{checkIn.client}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Date</p>
                  <p className="font-medium text-white">{checkIn.date}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Scheduled Time</p>
                  <p className="font-medium text-white">{checkIn.scheduledTime}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Check-in Time</p>
                  <p className="font-medium text-white">{checkIn.checkInTime || "Not checked in"}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-[#2a3349]" />

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-400">Location</p>
                <p className="font-medium text-white">{checkIn.location}</p>
                <div className="flex items-center gap-2 mt-2">
                  {checkIn.gpsVerified ? (
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

            {checkIn.notes && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Notes</p>
                  <p className="text-white mt-1">{checkIn.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
