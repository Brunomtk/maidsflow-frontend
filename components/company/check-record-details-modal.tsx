"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, MapPin, User, Building, Calendar, FileText, Hash } from "lucide-react"

interface CheckRecord {
  id: number
  professionalId: number
  professionalName: string
  companyId: number
  customerId: number
  customerName: string
  appointmentId: number
  address: string
  teamId: number | null
  teamName: string | null
  checkInTime: string | null
  checkOutTime: string | null
  status: number
  serviceType: string
  notes: string
  createdDate: string
  updatedDate: string
  gpsTrackingId?: number
}

interface CheckRecordDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  record: CheckRecord | null
}

const statusMap = {
  0: { label: "Pending", color: "bg-yellow-500", icon: Clock },
  1: { label: "Checked In", color: "bg-blue-500", icon: CheckCircle },
  2: { label: "Completed", color: "bg-green-500", icon: CheckCircle },
  3: { label: "Cancelled", color: "bg-red-500", icon: XCircle },
}

export function CheckRecordDetailsModal({ isOpen, onClose, record }: CheckRecordDetailsModalProps) {
  if (!record) return null

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadge = (status: number) => {
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap[0]
    const Icon = statusInfo.icon

    return (
      <Badge className={`${statusInfo.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {statusInfo.label}
      </Badge>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Check Record Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Reference IDs
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Record ID</p>
                <p className="font-mono font-medium">{record.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Appointment ID</p>
                <p className="font-mono font-medium">{record.appointmentId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Professional ID</p>
                <p className="font-mono font-medium">{record.professionalId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Customer ID</p>
                <p className="font-mono font-medium">{record.customerId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Company ID</p>
                <p className="font-mono font-medium">{record.companyId}</p>
              </div>
              {record.teamId && (
                <div>
                  <p className="text-muted-foreground">Team ID</p>
                  <p className="font-mono font-medium">{record.teamId}</p>
                </div>
              )}
              {record.gpsTrackingId && (
                <div>
                  <p className="text-muted-foreground">GPS Tracking ID</p>
                  <p className="font-mono font-medium">{record.gpsTrackingId}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              People Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Professional</p>
                <p className="font-medium">{record.professionalName || "N/A"}</p>
                <p className="text-xs text-muted-foreground mt-1">ID: {record.professionalId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Customer</p>
                <p className="font-medium">{record.customerName || "N/A"}</p>
                <p className="text-xs text-muted-foreground mt-1">ID: {record.customerId}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Service Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Team</p>
                <p className="font-medium">{record.teamName || "No team assigned"}</p>
                {record.teamId && <p className="text-xs text-muted-foreground mt-1">ID: {record.teamId}</p>}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Service Type</p>
                <p className="font-medium">{record.serviceType || "N/A"}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </h3>
            <p className="font-medium bg-muted/50 p-3 rounded-md">{record.address || "N/A"}</p>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">Status</h3>
            <div className="mt-1">{getStatusBadge(record.status)}</div>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Check In Time</p>
                <p className="font-medium">{formatDateTime(record.checkInTime)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Check Out Time</p>
                <p className="font-medium">{formatDateTime(record.checkOutTime)}</p>
              </div>
            </div>
          </div>

          {record.notes && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Notes</h3>
              <p className="font-medium whitespace-pre-wrap bg-muted/50 p-3 rounded-md">{record.notes}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Record Timestamps
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Created</p>
                <p className="font-medium">{formatDateTime(record.createdDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                <p className="font-medium">{formatDateTime(record.updatedDate)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
