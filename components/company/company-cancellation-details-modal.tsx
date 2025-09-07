"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, Calendar, DollarSign, Edit, MapPin, Trash2, User } from "lucide-react"
import { CompanyCancellationModal } from "./company-cancellation-modal"
import { useCompanyCancellations } from "@/hooks/use-company-cancellations"
import { RefundStatus, type Cancellation } from "@/types/cancellation"

interface CompanyCancellationDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  cancellation: Cancellation
}

export function CompanyCancellationDetailsModal({
  isOpen,
  onClose,
  cancellation,
}: CompanyCancellationDetailsModalProps) {
  const {
    deleteCancellation,
    processRefund,
    formatDate,
    getRefundStatusColor,
    getRefundStatusLabel,
    getCancelledByRoleLabel,
  } = useCompanyCancellations()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleEdit = () => {
    setIsEditModalOpen(true)
    onClose()
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this cancellation?")) {
      setLoading(true)
      try {
        await deleteCancellation(cancellation.id)
        onClose()
      } catch (error) {
        console.error("Error deleting cancellation:", error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleProcessRefund = async (status: RefundStatus) => {
    setLoading(true)
    try {
      await processRefund(cancellation.id, { status })
      onClose()
    } catch (error) {
      console.error("Error processing refund:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] bg-[#0f172a] border-[#2a3349] text-white overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">Cancellation Details</DialogTitle>
              <Badge className={getRefundStatusColor(cancellation.refundStatus)}>
                {getRefundStatusLabel(cancellation.refundStatus)}
              </Badge>
            </div>
            <DialogDescription className="text-gray-400">
              ID: #{cancellation.id} • Created on {formatDate(cancellation.createdDate)}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="flex-1 overflow-hidden">
            <TabsList className="bg-[#1a2234] p-1 mb-4">
              <TabsTrigger value="details" className="data-[state=active]:bg-[#06b6d4] data-[state=active]:text-white">
                Details
              </TabsTrigger>
              <TabsTrigger value="client" className="data-[state=active]:bg-[#06b6d4] data-[state=active]:text-white">
                Customer
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-[#06b6d4] data-[state=active]:text-white">
                Timeline
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 pr-4">
              <TabsContent value="details" className="mt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1a2234] p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-[#06b6d4]" />
                        <h3 className="font-medium">Cancellation Date</h3>
                      </div>
                      <p>{formatDate(cancellation.cancelledAt)}</p>
                    </div>

                    <div className="bg-[#1a2234] p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-[#06b6d4]" />
                        <h3 className="font-medium">Cancelled by</h3>
                      </div>
                      <p>{getCancelledByRoleLabel(cancellation.cancelledByRole)}</p>
                    </div>
                  </div>

                  <div className="bg-[#1a2234] p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-[#06b6d4]" />
                      <h3 className="font-medium">Cancellation Reason</h3>
                    </div>
                    <p>{cancellation.reason}</p>
                  </div>

                  <div className="bg-[#1a2234] p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-[#06b6d4]" />
                      <h3 className="font-medium">Refund Status</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRefundStatusColor(cancellation.refundStatus)}>
                        {getRefundStatusLabel(cancellation.refundStatus)}
                      </Badge>
                      {cancellation.refundStatus === RefundStatus.Pending && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleProcessRefund(RefundStatus.Processed)}
                            disabled={loading}
                          >
                            Process
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent"
                            onClick={() => handleProcessRefund(RefundStatus.Rejected)}
                            disabled={loading}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#1a2234] p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Notes</h3>
                    <p className="text-gray-400">
                      {cancellation.notes || "No additional notes provided for this cancellation."}
                    </p>
                  </div>

                  <div className="bg-[#1a2234] p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Appointment Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400">Appointment ID</p>
                        <p>#{cancellation.appointmentId}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Customer ID</p>
                        <p>#{cancellation.customerId}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="client" className="mt-0">
                <div className="space-y-4">
                  <div className="bg-[#1a2234] p-4 rounded-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-[#2a3349] flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">
                          {cancellation.customerName || "Customer not identified"}
                        </h3>
                        <p className="text-gray-400">customer@example.com</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-gray-400">Phone</p>
                        <p>(555) 123-4567</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Customer since</p>
                        <p>Jan 15, 2025</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1a2234] p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-[#06b6d4]" />
                      <h3 className="font-medium">Address</h3>
                    </div>
                    <p>123 Main Street</p>
                    <p>Apt 4B</p>
                    <p>New York, NY 10001</p>
                  </div>

                  <div className="bg-[#1a2234] p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Cancellation History</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p>Regular Cleaning</p>
                          <p className="text-sm text-gray-400">May 20, 2025</p>
                        </div>
                        <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/20">Processed</Badge>
                      </div>
                      <Separator className="bg-[#2a3349]" />
                      <div className="flex justify-between items-center">
                        <div>
                          <p>Deep Cleaning</p>
                          <p className="text-sm text-gray-400">Mar 15, 2025</p>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/20">Rejected</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="mt-0">
                <div className="space-y-4">
                  <div className="bg-[#1a2234] p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Cancellation Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-1 bg-[#06b6d4] rounded relative">
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-[#06b6d4]"></div>
                        </div>
                        <div>
                          <p className="font-medium">Cancellation Requested</p>
                          <p className="text-sm text-gray-400">{formatDate(cancellation.createdDate)}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-1 bg-[#2a3349] rounded relative">
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-[#2a3349]"></div>
                        </div>
                        <div>
                          <p className="font-medium">Cancellation Processed</p>
                          <p className="text-sm text-gray-400">{formatDate(cancellation.cancelledAt)}</p>
                        </div>
                      </div>
                      {cancellation.refundStatus === RefundStatus.Processed && (
                        <div className="flex gap-3">
                          <div className="w-1 bg-[#2a3349] rounded relative">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-[#2a3349]"></div>
                          </div>
                          <div>
                            <p className="font-medium">Refund Processed</p>
                            <p className="text-sm text-gray-400">{formatDate(cancellation.updatedDate)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#1a2234] p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Transaction Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400">Original Amount</p>
                        <p className="text-xl font-semibold">$150.00</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Cancellation Fee</p>
                        <p className="text-xl font-semibold">$15.00</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Refund Amount</p>
                        <p className="text-xl font-semibold text-green-500">$135.00</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Payment Method</p>
                        <p>Credit Card</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-[#2a3349]">
            <Button
              variant="outline"
              className="border-[#2a3349] text-white hover:bg-[#1a2234] hover:text-white bg-transparent"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              variant="outline"
              className="border-[#2a3349] text-red-400 hover:bg-red-500/10 hover:text-red-400 bg-transparent"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button className="bg-[#06b6d4] hover:bg-[#0891b2] text-white" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <CompanyCancellationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        cancellation={cancellation}
      />
    </>
  )
}
