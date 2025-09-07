"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Edit, Check, X, User, AlertCircle, RefreshCw, FileText, History } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface CompanyRescheduleDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  reschedule: any
  onEdit: (reschedule: any) => void
  onApprove: (reschedule: any) => void
  onReject: (reschedule: any) => void
}

export function CompanyRescheduleDetailsModal({
  isOpen,
  onClose,
  reschedule,
  onEdit,
  onApprove,
  onReject,
}: CompanyRescheduleDetailsModalProps) {
  if (!reschedule) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "Pending", className: "border-yellow-500 text-yellow-500" }
      case "approved":
        return { label: "Approved", className: "border-green-500 text-green-500" }
      case "rejected":
        return { label: "Rejected", className: "border-red-500 text-red-500" }
      default:
        return { label: status, className: "border-gray-500 text-gray-500" }
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return { label: "High Priority", className: "border-red-500 text-red-500" }
      case "medium":
        return { label: "Medium Priority", className: "border-yellow-500 text-yellow-500" }
      case "low":
        return { label: "Low Priority", className: "border-gray-500 text-gray-500" }
      default:
        return { label: priority, className: "border-gray-400 text-gray-400" }
    }
  }

  // Mock history data
  const historyData = [
    {
      id: 1,
      action: "Request Created",
      user: reschedule.customer,
      date: reschedule.requestedAt,
      details: "Customer requested to reschedule the appointment",
    },
    {
      id: 2,
      action: "Priority Set",
      user: "System",
      date: reschedule.requestedAt,
      details: `Priority set to ${reschedule.priority}`,
    },
  ]

  if (reschedule.status === "approved" && reschedule.approvedBy) {
    historyData.push({
      id: 3,
      action: "Request Approved",
      user: reschedule.approvedBy,
      date: reschedule.approvedAt,
      details: "Reschedule request was approved",
    })
  }

  if (reschedule.status === "rejected" && reschedule.rejectedBy) {
    historyData.push({
      id: 3,
      action: "Request Rejected",
      user: reschedule.rejectedBy,
      date: reschedule.rejectedAt,
      details: reschedule.rejectionReason || "Reschedule request was rejected",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-[#1a2234] border-[#2a3349] text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-[#06b6d4]" />
            Reschedule Request Details
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Complete information about the reschedule request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Header with ID and Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Request ID</p>
              <p className="text-xl font-semibold">{reschedule.requestId}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getPriorityBadge(reschedule.priority).className}>
                {getPriorityBadge(reschedule.priority).label}
              </Badge>
              <Badge variant="outline" className={getStatusBadge(reschedule.status).className}>
                {getStatusBadge(reschedule.status).label}
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="bg-[#0f172a] border border-[#2a3349] w-full">
              <TabsTrigger value="details" className="data-[state=active]:bg-[#2a3349] text-white flex-1">
                Details
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-[#2a3349] text-white flex-1">
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              {/* Customer Information */}
              <Card className="bg-[#0f172a] border-[#2a3349]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-3">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Customer Information</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Customer Name</p>
                      <p className="font-medium">{reschedule.customer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Service Type</p>
                      <p className="font-medium">{reschedule.serviceType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Assigned Team</p>
                      <p className="font-medium">{reschedule.team}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Service Address</p>
                      <p className="font-medium">{reschedule.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-[#0f172a] border-[#2a3349]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-3">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Original Schedule</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{reschedule.originalDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{reschedule.originalTime}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0f172a] border-[#2a3349] border-[#06b6d4]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-[#06b6d4] mb-3">
                      <RefreshCw className="h-4 w-4" />
                      <span className="text-sm font-medium">Requested Schedule</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#06b6d4]" />
                        <span className="text-white">{reschedule.requestedDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#06b6d4]" />
                        <span className="text-white">{reschedule.requestedTime}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reason for Reschedule */}
              <Card className="bg-[#0f172a] border-[#2a3349]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-3">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">Reason for Reschedule</span>
                  </div>
                  <p className="text-gray-300">{reschedule.reason}</p>
                </CardContent>
              </Card>

              {/* Additional Information */}
              {(reschedule.notes || reschedule.rejectionReason) && (
                <Card className="bg-[#0f172a] border-[#2a3349]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-3">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Additional Information</span>
                    </div>
                    {reschedule.notes && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-400">Notes</p>
                        <p className="text-gray-300">{reschedule.notes}</p>
                      </div>
                    )}
                    {reschedule.rejectionReason && (
                      <div>
                        <p className="text-sm text-gray-400">Rejection Reason</p>
                        <p className="text-red-400">{reschedule.rejectionReason}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Request Metadata */}
              <Card className="bg-[#0f172a] border-[#2a3349]">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Requested At</p>
                      <p className="font-medium">{reschedule.requestedAt}</p>
                    </div>
                    {reschedule.approvedAt && (
                      <div>
                        <p className="text-gray-400">Approved At</p>
                        <p className="font-medium">{reschedule.approvedAt}</p>
                        <p className="text-xs text-gray-400">by {reschedule.approvedBy}</p>
                      </div>
                    )}
                    {reschedule.rejectedAt && (
                      <div>
                        <p className="text-gray-400">Rejected At</p>
                        <p className="font-medium">{reschedule.rejectedAt}</p>
                        <p className="text-xs text-gray-400">by {reschedule.rejectedBy}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-4">
              <Card className="bg-[#0f172a] border-[#2a3349]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-4">
                    <History className="h-4 w-4" />
                    <span className="text-sm font-medium">Activity History</span>
                  </div>
                  <div className="space-y-4">
                    {historyData.map((item, index) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative">
                          <div className="h-2 w-2 bg-[#06b6d4] rounded-full mt-1.5"></div>
                          {index < historyData.length - 1 && (
                            <div className="absolute top-3 left-[3px] w-0.5 h-full bg-[#2a3349]"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">{item.action}</p>
                            <p className="text-xs text-gray-400">{item.date}</p>
                          </div>
                          <p className="text-sm text-gray-400">by {item.user}</p>
                          <p className="text-sm text-gray-300 mt-1">{item.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator className="bg-[#2a3349]" />

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            {reschedule.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => onApprove(reschedule)}
                  className="border-green-500 text-green-500 hover:bg-green-500/20"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onReject(reschedule)}
                  className="border-red-500 text-red-500 hover:bg-red-500/20"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={() => onEdit(reschedule)}
              className="border-[#2a3349] text-white hover:bg-[#2a3349]"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
