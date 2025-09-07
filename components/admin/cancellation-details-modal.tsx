"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Calendar,
  User,
  Building2,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Mail,
  MessageSquare,
  FileText,
  History,
  Send,
} from "lucide-react"
import { useCancellations } from "@/hooks/use-cancellations"
import type { Cancellation } from "@/types/cancellation"
import type { RefundStatus, CancelledByRole } from "@/types/cancellation"

interface CancellationDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cancellation: Cancellation | null
}

export function CancellationDetailsModal({ open, onOpenChange, cancellation }: CancellationDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [message, setMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)

  const {
    formatDate,
    getRefundStatusColor,
    getRefundStatusLabel,
    getCancelledByRoleLabel,
    getCancelledByRoleColor,
    canProcessRefund,
    processRefund,
    RefundStatus: RefundStatusEnum,
    CancelledByRole: CancelledByRoleEnum,
  } = useCancellations()

  useEffect(() => {
    if (open) {
      setActiveTab("overview")
      setMessage("")
    }
  }, [open])

  if (!cancellation) return null

  const handleProcessRefund = async (status: RefundStatus) => {
    try {
      await processRefund(cancellation.id, {
        status: status,
        notes: status === RefundStatusEnum.Processed ? "Refund approved" : "Refund rejected",
      })
    } catch (error) {
      console.error("Error processing refund:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return

    setSendingMessage(true)
    try {
      // TODO: Implement message sending API
      console.log("Sending message:", message)
      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSendingMessage(false)
    }
  }

  const getRefundBadge = (status: RefundStatus) => {
    const colorClass = getRefundStatusColor(status)
    const label = getRefundStatusLabel(status)

    return (
      <Badge variant="outline" className={colorClass}>
        {label}
      </Badge>
    )
  }

  const getCancelledByBadge = (role: CancelledByRole) => {
    const colorClass = getCancelledByRoleColor(role)
    const label = getCancelledByRoleLabel(role)

    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm ${colorClass}`}>
        {role === CancelledByRoleEnum.Customer && <User className="h-4 w-4" />}
        {role === CancelledByRoleEnum.Professional && <User className="h-4 w-4" />}
        {role === CancelledByRoleEnum.Company && <Building2 className="h-4 w-4" />}
        {role === CancelledByRoleEnum.Admin && <AlertCircle className="h-4 w-4" />}
        {label}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a2234] border-[#2a3349] text-white max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Cancellation Details #{cancellation.id}</span>
            {getRefundBadge(cancellation.refundStatus)}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="bg-[#0f172a] border border-[#2a3349]">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#2a3349]">
              Overview
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-[#2a3349]">
              Complete Details
            </TabsTrigger>
            <TabsTrigger value="refund" className="data-[state=active]:bg-[#2a3349]">
              Refund
            </TabsTrigger>
            <TabsTrigger value="actions" className="data-[state=active]:bg-[#2a3349]">
              Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Customer */}
              <Card className="bg-[#0f172a] border-[#2a3349]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-[#06b6d4]" />
                    Customer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-white font-medium">
                      {cancellation.customerName || `Customer #${cancellation.customerId}`}
                    </p>
                    <p className="text-sm text-gray-400">ID: {cancellation.customerId}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Appointment */}
              <Card className="bg-[#0f172a] border-[#2a3349]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#06b6d4]" />
                    Appointment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Appointment ID</p>
                    <p className="text-white font-medium">#{cancellation.appointmentId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Company ID</p>
                    <p className="text-white">#{cancellation.companyId}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              <Card className="bg-[#0f172a] border-[#2a3349]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[#06b6d4]" />
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Refund Status</p>
                    {getRefundBadge(cancellation.refundStatus)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Cancelled At</p>
                    <p className="text-white">{formatDate(cancellation.cancelledAt)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#0f172a] border-[#2a3349]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#06b6d4]" />
                  Cancellation Reason
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Cancelled by:</span>
                    {getCancelledByBadge(cancellation.cancelledByRole)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Cancelled by ID:</span>
                    <span className="text-white">#{cancellation.cancelledById}</span>
                  </div>
                  <Separator className="bg-[#2a3349]" />
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Reason:</p>
                    <p className="text-white bg-[#1a2234] p-3 rounded-md border border-[#2a3349]">
                      {cancellation.reason}
                    </p>
                  </div>
                  {cancellation.notes && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Notes:</p>
                      <p className="text-white bg-[#1a2234] p-3 rounded-md border border-[#2a3349]">
                        {cancellation.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#0f172a] border-[#2a3349]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#06b6d4]" />
                    Technical Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Cancellation ID</p>
                      <p className="text-white font-mono">#{cancellation.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Appointment ID</p>
                      <p className="text-white font-mono">#{cancellation.appointmentId}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Customer ID</p>
                      <p className="text-white font-mono">#{cancellation.customerId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Company ID</p>
                      <p className="text-white font-mono">#{cancellation.companyId}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Cancelled By ID</p>
                    <p className="text-white font-mono">#{cancellation.cancelledById}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0f172a] border-[#2a3349]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-[#06b6d4]" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#06b6d4] rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-white">Cancellation created</p>
                        <p className="text-xs text-gray-400">{formatDate(cancellation.createdDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-white">Appointment cancelled</p>
                        <p className="text-xs text-gray-400">{formatDate(cancellation.cancelledAt)}</p>
                      </div>
                    </div>
                    {cancellation.updatedDate !== cancellation.createdDate && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-white">Last updated</p>
                          <p className="text-xs text-gray-400">{formatDate(cancellation.updatedDate)}</p>
                        </div>
                      </div>
                    )}
                    {cancellation.refundStatus === RefundStatusEnum.Processed && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-white">Refund processed</p>
                          <p className="text-xs text-gray-400">Status updated</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="refund" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#0f172a] border-[#2a3349]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[#06b6d4]" />
                    Refund Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status:</span>
                    {getRefundBadge(cancellation.refundStatus)}
                  </div>
                  <Separator className="bg-[#2a3349]" />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Cancelled by:</span>
                    {getCancelledByBadge(cancellation.cancelledByRole)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0f172a] border-[#2a3349]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    Processing Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cancellation.refundStatus === RefundStatusEnum.Pending && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                      <p className="text-yellow-400 text-sm">
                        This refund is awaiting processing. Use the actions below to approve or reject.
                      </p>
                    </div>
                  )}
                  {cancellation.refundStatus === RefundStatusEnum.Processed && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                      <p className="text-green-400 text-sm">This refund has been processed successfully.</p>
                    </div>
                  )}
                  {cancellation.refundStatus === RefundStatusEnum.Rejected && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                      <p className="text-red-400 text-sm">This refund has been rejected.</p>
                    </div>
                  )}
                  {cancellation.refundStatus === RefundStatusEnum.NotApplicable && (
                    <div className="p-3 bg-gray-500/10 border border-gray-500/20 rounded-md">
                      <p className="text-gray-400 text-sm">No refund is applicable for this cancellation.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Refund Actions */}
              {canProcessRefund(cancellation.refundStatus) && (
                <Card className="bg-[#0f172a] border-[#2a3349]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-[#06b6d4]" />
                      Process Refund
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-400">
                      Choose an action to process the refund for this cancellation:
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleProcessRefund(RefundStatusEnum.Processed)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Refund
                      </Button>
                      <Button
                        onClick={() => handleProcessRefund(RefundStatusEnum.Rejected)}
                        variant="outline"
                        className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10 bg-transparent"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Communication */}
              <Card className="bg-[#0f172a] border-[#2a3349]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-[#06b6d4]" />
                    Communication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="message">Send message to customer</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="bg-[#1a2234] border-[#2a3349] text-white min-h-[100px]"
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sendingMessage}
                    className="w-full bg-[#06b6d4] hover:bg-[#0891b2]"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendingMessage ? "Sending..." : "Send Message"}
                  </Button>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="bg-[#0f172a] border-[#2a3349]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-[#06b6d4]" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-400">Send automatic notifications about the cancellation status.</p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full border-[#2a3349] text-gray-400 hover:text-white hover:bg-[#2a3349] bg-transparent"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Notify by Email
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-[#2a3349] text-gray-400 hover:text-white hover:bg-[#2a3349] bg-transparent"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Notify by SMS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#2a3349] text-gray-400 hover:text-white hover:bg-[#2a3349] bg-transparent"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
