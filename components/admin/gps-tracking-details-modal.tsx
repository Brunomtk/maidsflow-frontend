"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MapPin, Car, Clock, Battery, Gauge, Wifi, FileText } from "lucide-react"
import type { GPSTracking } from "@/types/gps-tracking"

interface GpsTrackingDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  gpsData: GPSTracking | null
}

export function GpsTrackingDetailsModal({ isOpen, onClose, gpsData }: GpsTrackingDetailsModalProps) {
  if (!gpsData) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusText = (status: number) => {
    return status === 1 ? "Active" : "Inactive"
  }

  const getStatusColor = (status: number) => {
    return status === 1 ? "border-green-500 text-green-500" : "border-red-500 text-red-500"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a2234] border-[#2a3349] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#06b6d4]" />
            GPS Tracking Details
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Complete information about the GPS tracking record
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              {gpsData.professionalName || `Professional ${gpsData.professionalId}`}
            </h3>
            <Badge variant="outline" className={getStatusColor(gpsData.status)}>
              {getStatusText(gpsData.status)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Location</span>
                </div>
                <p className="font-medium">{gpsData.location.address}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {gpsData.location.latitude.toFixed(6)}, {gpsData.location.longitude.toFixed(6)}
                </p>
              </div>

              <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Car className="h-4 w-4" />
                  <span className="text-sm">Vehicle</span>
                </div>
                <p className="font-medium">{gpsData.vehicle}</p>
              </div>

              <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Last Update</span>
                </div>
                <p className="font-medium">{formatDate(gpsData.timestamp)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Gauge className="h-4 w-4" />
                  <span className="text-sm">Speed</span>
                </div>
                <p className="font-medium">{gpsData.speed} km/h</p>
              </div>

              <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Battery className="h-4 w-4" />
                  <span className="text-sm">Battery Level</span>
                </div>
                <p className="font-medium">{gpsData.battery}%</p>
              </div>

              <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm">GPS Accuracy</span>
                </div>
                <p className="font-medium">±{gpsData.location.accuracy} meters</p>
              </div>
            </div>
          </div>

          {gpsData.notes && (
            <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm">Notes</span>
              </div>
              <p className="text-sm">{gpsData.notes}</p>
            </div>
          )}

          <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
            <h4 className="font-medium mb-2">Additional Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Company:</span>
                <span className="ml-2">{gpsData.companyName || `Company ${gpsData.companyId}`}</span>
              </div>
              <div>
                <span className="text-gray-400">Tracking ID:</span>
                <span className="ml-2">{gpsData.id}</span>
              </div>
              <div>
                <span className="text-gray-400">Created:</span>
                <span className="ml-2">{formatDate(gpsData.createdDate)}</span>
              </div>
              <div>
                <span className="text-gray-400">Updated:</span>
                <span className="ml-2">{formatDate(gpsData.updatedDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
