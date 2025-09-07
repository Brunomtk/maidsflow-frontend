"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Users,
  Building,
  MapPin,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  Timer,
  CheckSquare,
} from "lucide-react"

interface CompanyCheckOutDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  checkOut: any
}

export function CompanyCheckOutDetailsModal({ isOpen, onClose, checkOut }: CompanyCheckOutDetailsModalProps) {
  if (!checkOut) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500">Completed</Badge>
      case "in-progress":
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500">In Progress</Badge>
      case "early-departure":
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500">Early Departure</Badge>
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a2234] border-[#2a3349] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Check-out Details
            {getStatusBadge(checkOut.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Professional</p>
                  <p className="font-medium text-white">{checkOut.professional}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Team</p>
                  <p className="font-medium text-white">{checkOut.team}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Client</p>
                  <p className="font-medium text-white">{checkOut.client}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Date</p>
                  <p className="font-medium text-white">{checkOut.date}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Check-in Time</p>
                  <p className="font-medium text-white">{checkOut.checkInTime}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Check-out Time</p>
                  <p className="font-medium text-white">{checkOut.checkOutTime || "Not checked out"}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-[#2a3349]" />

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Timer className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">Total Duration</p>
                <p className="font-medium text-white">{checkOut.duration}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-400">Location</p>
                <p className="font-medium text-white">{checkOut.location}</p>
                <div className="flex items-center gap-2 mt-2">
                  {checkOut.gpsVerified ? (
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

            <div className="flex items-start gap-3">
              <CheckSquare className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">Tasks Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {checkOut.tasksCompleted ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">All tasks completed</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-yellow-500">Tasks pending</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {checkOut.notes && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Notes</p>
                  <p className="text-white mt-1">{checkOut.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
