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
import { MapPin, Clock, Route, Battery, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import type { GPSTracking } from "@/types/gps-tracking"

interface GpsTrackingDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  gpsData: GPSTracking | null
  onEdit: (gpsData: GPSTracking) => void
  onDelete: (id: number) => void
  onStatusToggle: (gpsData: GPSTracking) => void
}

export function GpsTrackingDetailsModal({
  isOpen,
  onClose,
  gpsData,
  onEdit,
  onDelete,
  onStatusToggle,
}: GpsTrackingDetailsModalProps) {
  if (!gpsData) return null

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "bg-green-500/20 text-green-500 border-green-500"
      case 2:
        return "bg-red-500/20 text-red-500 border-red-500"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500"
    }
  }

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1:
        return "Active"
      case 2:
        return "Inactive"
      default:
        return "Unknown"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this GPS tracking record?")) {
      onDelete(gpsData.id)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a2234] border-[#2a3349] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            GPS Tracking Details
            <Badge className={getStatusColor(gpsData.status)}>{getStatusLabel(gpsData.status)}</Badge>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Detailed information about the GPS tracking record
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Professional Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Professional Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Name</p>
                <p className="text-white">{gpsData.professionalName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">ID</p>
                <p className="text-white">{gpsData.professionalId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Company</p>
                <p className="text-white">{gpsData.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Vehicle</p>
                <p className="text-white">{gpsData.vehicle}</p>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Location Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="h-4 w-4 text-[#06b6d4]" />
                <span>{gpsData.location.address}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Latitude</p>
                  <p className="text-white">{gpsData.location.latitude}</p>
                </div>
                <div>
                  <p className="text-gray-400">Longitude</p>
                  <p className="text-white">{gpsData.location.longitude}</p>
                </div>
                <div>
                  <p className="text-gray-400">Accuracy</p>
                  <p className="text-white">{gpsData.location.accuracy}m</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Tracking Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-[#06b6d4]" />
                <div>
                  <p className="text-sm text-gray-400">Speed</p>
                  <p className="text-white">{gpsData.speed} km/h</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-[#06b6d4]" />
                <div>
                  <p className="text-sm text-gray-400">Battery</p>
                  <p className="text-white">{gpsData.battery}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#06b6d4]" />
                <div>
                  <p className="text-sm text-gray-400">Last Update</p>
                  <p className="text-white text-xs">{formatDate(gpsData.timestamp)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {gpsData.notes && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Notes</h3>
              <p className="text-gray-300 bg-[#2a3349] p-3 rounded-md">{gpsData.notes}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Record Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Created</p>
                <p className="text-white">{formatDate(gpsData.createdDate)}</p>
              </div>
              <div>
                <p className="text-gray-400">Updated</p>
                <p className="text-white">{formatDate(gpsData.updatedDate)}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onStatusToggle(gpsData)}
              className="border-[#2a3349] text-white hover:bg-[#2a3349] bg-transparent"
            >
              {gpsData.status === 1 ? (
                <>
                  <ToggleRight className="h-4 w-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <ToggleLeft className="h-4 w-4 mr-2" />
                  Activate
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[#2a3349] text-white hover:bg-[#2a3349] bg-transparent"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                onEdit(gpsData)
                onClose()
              }}
              className="bg-[#06b6d4] hover:bg-[#0891b2] text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
