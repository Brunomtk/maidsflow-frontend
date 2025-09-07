"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle } from "lucide-react"

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Check Record Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Professional</h3>
              <p className="font-medium">{record.professionalName || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Customer</h3>
              <p className="font-medium">{record.customerName || "N/A"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Team</h3>
              <p className="font-medium">{record.teamName || "No team assigned"}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Service Type</h3>
              <p className="font-medium">{record.serviceType || "N/A"}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Address</h3>
            <p className="font-medium">{record.address || "N/A"}</p>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Status</h3>
            <div className="mt-1">{getStatusBadge(record.status)}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Check In Time</h3>
              <p className="font-medium">{formatDateTime(record.checkInTime)}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Check Out Time</h3>
              <p className="font-medium">{formatDateTime(record.checkOutTime)}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Notes</h3>
            <p className="font-medium whitespace-pre-wrap">{record.notes || "No notes"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold">Created</h3>
              <p>{formatDateTime(record.createdDate)}</p>
            </div>
            <div>
              <h3 className="font-semibold">Last Updated</h3>
              <p>{formatDateTime(record.updatedDate)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
