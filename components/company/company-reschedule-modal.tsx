"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Calendar } from "lucide-react"

interface CompanyRescheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  reschedule?: any
}

export function CompanyRescheduleModal({ isOpen, onClose, onSubmit, reschedule }: CompanyRescheduleModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    customer: "",
    serviceType: "",
    team: "",
    address: "",
    originalDate: "",
    originalTime: "",
    requestedDate: "",
    requestedTime: "",
    reason: "",
    priority: "medium",
    status: "pending",
    notes: "",
  })

  useEffect(() => {
    if (reschedule) {
      setFormData({
        customer: reschedule.customer || "",
        serviceType: reschedule.serviceType || "",
        team: reschedule.team || "",
        address: reschedule.address || "",
        originalDate: reschedule.originalDate || "",
        originalTime: reschedule.originalTime || "",
        requestedDate: reschedule.requestedDate || "",
        requestedTime: reschedule.requestedTime || "",
        reason: reschedule.reason || "",
        priority: reschedule.priority || "medium",
        status: reschedule.status || "pending",
        notes: reschedule.notes || "",
      })
    } else {
      // Reset form for new reschedule
      setFormData({
        customer: "",
        serviceType: "",
        team: "",
        address: "",
        originalDate: "",
        originalTime: "",
        requestedDate: "",
        requestedTime: "",
        reason: "",
        priority: "medium",
        status: "pending",
        notes: "",
      })
    }
  }, [reschedule, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onSubmit({
      ...formData,
      id: reschedule?.id,
      requestId: reschedule?.requestId || `RSC-${Date.now()}`,
      requestedAt: new Date().toISOString(),
    })

    setIsLoading(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Sample data for dropdowns
  const customers = ["John Smith", "Emma Johnson", "Michael Brown", "Sophia Davis", "William Miller", "Olivia Wilson"]

  const serviceTypes = ["Regular Cleaning", "Deep Cleaning", "Specialized Service", "Post-Construction"]

  const teams = ["Team Alpha", "Team Beta", "Team Gamma", "Team Delta"]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a2234] border-[#2a3349] text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#06b6d4]" />
            {reschedule?.id ? "Edit Reschedule Request" : "New Reschedule Request"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {reschedule?.id
              ? "Update the reschedule request information."
              : "Create a new reschedule request for a service appointment."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-400">Customer Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Select value={formData.customer} onValueChange={(value) => handleChange("customer", value)}>
                    <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                      {customers.map((customer) => (
                        <SelectItem key={customer} value={customer} className="hover:bg-[#2a3349]">
                          {customer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select value={formData.serviceType} onValueChange={(value) => handleChange("serviceType", value)}>
                    <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                      {serviceTypes.map((type) => (
                        <SelectItem key={type} value={type} className="hover:bg-[#2a3349]">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="team">Assigned Team</Label>
                  <Select value={formData.team} onValueChange={(value) => handleChange("team", value)}>
                    <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                      {teams.map((team) => (
                        <SelectItem key={team} value={team} className="hover:bg-[#2a3349]">
                          {team}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Service Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="bg-[#0f172a] border-[#2a3349] text-white"
                    placeholder="Enter service address"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Schedule Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-400">Schedule Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <p className="text-sm text-gray-400">Original Schedule</p>
                  <div className="grid gap-2">
                    <Label htmlFor="originalDate">Date</Label>
                    <Input
                      id="originalDate"
                      type="date"
                      value={formData.originalDate}
                      onChange={(e) => handleChange("originalDate", e.target.value)}
                      className="bg-[#0f172a] border-[#2a3349] text-white"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="originalTime">Time</Label>
                    <Input
                      id="originalTime"
                      type="time"
                      value={formData.originalTime}
                      onChange={(e) => handleChange("originalTime", e.target.value)}
                      className="bg-[#0f172a] border-[#2a3349] text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-gray-400">Requested Schedule</p>
                  <div className="grid gap-2">
                    <Label htmlFor="requestedDate">Date</Label>
                    <Input
                      id="requestedDate"
                      type="date"
                      value={formData.requestedDate}
                      onChange={(e) => handleChange("requestedDate", e.target.value)}
                      className="bg-[#0f172a] border-[#2a3349] text-white"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="requestedTime">Time</Label>
                    <Input
                      id="requestedTime"
                      type="time"
                      value={formData.requestedTime}
                      onChange={(e) => handleChange("requestedTime", e.target.value)}
                      className="bg-[#0f172a] border-[#2a3349] text-white"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Request Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-400">Request Details</h3>

              <div className="grid gap-2">
                <Label htmlFor="reason">Reason for Reschedule</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => handleChange("reason", e.target.value)}
                  className="bg-[#0f172a] border-[#2a3349] text-white min-h-[80px]"
                  placeholder="Explain why the reschedule is needed"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                    <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                      <SelectItem value="high" className="hover:bg-[#2a3349]">
                        High Priority
                      </SelectItem>
                      <SelectItem value="medium" className="hover:bg-[#2a3349]">
                        Medium Priority
                      </SelectItem>
                      <SelectItem value="low" className="hover:bg-[#2a3349]">
                        Low Priority
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                    <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                      <SelectItem value="pending" className="hover:bg-[#2a3349]">
                        Pending
                      </SelectItem>
                      <SelectItem value="approved" className="hover:bg-[#2a3349]">
                        Approved
                      </SelectItem>
                      <SelectItem value="rejected" className="hover:bg-[#2a3349]">
                        Rejected
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  className="bg-[#0f172a] border-[#2a3349] text-white min-h-[60px]"
                  placeholder="Any additional information"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#2a3349] text-white hover:bg-[#2a3349]"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-[#06b6d4] hover:bg-[#0891b2] text-white">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
