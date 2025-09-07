"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Clock, AlertCircle } from "lucide-react"
import {
  type Cancellation,
  RefundStatus,
  CancelledByRole,
  type CancellationFormData,
  type CancellationUpdateData,
} from "@/types/cancellation"
import { fetchApi } from "@/lib/api/utils"

interface Company {
  id: number
  name: string
}

interface Customer {
  id: number
  name: string
}

interface Appointment {
  id: number
  title?: string
  address?: string
  customer?: { name: string }
  professional?: { name: string }
}

interface Professional {
  id: number
  name: string
}

interface CancellationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cancellation: Cancellation | null
  isEditing: boolean
  onSave: (data: CancellationFormData | CancellationUpdateData) => void
}

export function CancellationModal({ open, onOpenChange, cancellation, isEditing, onSave }: CancellationModalProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [formData, setFormData] = useState({
    appointmentId: 0,
    customerId: 0,
    companyId: 0,
    reason: "",
    cancelledById: 0,
    cancelledByRole: CancelledByRole.Customer,
    refundStatus: RefundStatus.Pending,
    notes: "",
  })

  const [companies, setCompanies] = useState<Company[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(false)

  const loadDropdownData = async () => {
    if (!open || isEditing) return

    setLoading(true)
    try {
      const companiesRes = await fetchApi<any>("/Companies/paged?PageSize=100")
      setCompanies(Array.isArray(companiesRes) ? companiesRes : companiesRes?.result || [])

      const customersRes = await fetchApi<any>("/Customer?PageSize=100")
      setCustomers(Array.isArray(customersRes) ? customersRes : customersRes?.results || [])

      const appointmentsRes = await fetchApi<any>("/Appointment?PageSize=100")
      setAppointments(Array.isArray(appointmentsRes) ? appointmentsRes : appointmentsRes?.results || [])

      const usersRes = await fetchApi<any>("/Users/paged?PageSize=100")
      setProfessionals(Array.isArray(usersRes) ? usersRes : usersRes?.data || [])
    } catch (error) {
      console.error("Error loading dropdown data:", error)
      setCompanies([])
      setCustomers([])
      setAppointments([])
      setProfessionals([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (cancellation && isEditing) {
      setFormData({
        appointmentId: cancellation.appointmentId || 0,
        customerId: cancellation.customerId || 0,
        companyId: cancellation.companyId || 0,
        reason: cancellation.reason || "",
        cancelledById: cancellation.cancelledById || 0,
        cancelledByRole: cancellation.cancelledByRole || CancelledByRole.Customer,
        refundStatus: cancellation.refundStatus || RefundStatus.Pending,
        notes: cancellation.notes || "",
      })
    } else {
      setFormData({
        appointmentId: 0,
        customerId: 0,
        companyId: 0,
        reason: "",
        cancelledById: 0,
        cancelledByRole: CancelledByRole.Customer,
        refundStatus: RefundStatus.Pending,
        notes: "",
      })
    }
    setActiveTab("details")
  }, [cancellation, isEditing, open])

  useEffect(() => {
    loadDropdownData()
  }, [open, isEditing])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isEditing && cancellation) {
      const updateData: CancellationUpdateData = {
        reason: formData.reason,
        refundStatus: formData.refundStatus,
        notes: formData.notes || undefined,
      }
      onSave(updateData)
    } else {
      const createData: CancellationFormData = {
        appointmentId: formData.appointmentId,
        customerId: formData.customerId,
        companyId: formData.companyId,
        reason: formData.reason,
        cancelledById: formData.cancelledById,
        cancelledByRole: formData.cancelledByRole,
        refundStatus: formData.refundStatus,
        notes: formData.notes || undefined,
      }
      onSave(createData)
    }
  }

  const getCancelledByLabel = (role: CancelledByRole) => {
    switch (role) {
      case CancelledByRole.Customer:
        return "Customer"
      case CancelledByRole.Professional:
        return "Professional"
      case CancelledByRole.Company:
        return "Company"
      case CancelledByRole.Admin:
        return "Administrator"
      default:
        return "Unknown"
    }
  }

  const getRefundStatusLabel = (status: RefundStatus) => {
    switch (status) {
      case RefundStatus.Pending:
        return "Pending"
      case RefundStatus.Processed:
        return "Processed"
      case RefundStatus.Rejected:
        return "Rejected"
      case RefundStatus.NotApplicable:
        return "Not Applicable"
      default:
        return "Unknown"
    }
  }

  const getAppointmentDisplay = (appointment: Appointment) => {
    const title = appointment.title || `Appointment #${appointment.id}`
    const customer = appointment.customer?.name ? ` - ${appointment.customer.name}` : ""
    const address = appointment.address ? ` (${appointment.address})` : ""
    return `${title}${customer}${address}`
  }

  const getCancelledByOptions = () => {
    switch (formData.cancelledByRole) {
      case CancelledByRole.Customer:
        return customers
      case CancelledByRole.Professional:
        return professionals
      case CancelledByRole.Company:
        return companies
      case CancelledByRole.Admin:
        return [{ id: 1, name: "Administrator" }]
      default:
        return []
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a2234] border-[#2a3349] text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Cancellation" : "Create New Cancellation"}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="bg-[#0f172a] border border-[#2a3349]">
            <TabsTrigger value="details" className="data-[state=active]:bg-[#2a3349]">
              Details
            </TabsTrigger>
            <TabsTrigger value="refund" className="data-[state=active]:bg-[#2a3349]">
              Refund
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Cancellation Information</h3>

                  {!isEditing && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="appointmentId">Appointment * ({appointments.length} loaded)</Label>
                        <Select
                          value={formData.appointmentId.toString()}
                          onValueChange={(value) => setFormData({ ...formData, appointmentId: Number(value) })}
                          disabled={loading}
                        >
                          <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                            <SelectValue placeholder={loading ? "Loading appointments..." : "Select appointment"} />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a2234] border-[#2a3349]">
                            {appointments.map((appointment) => (
                              <SelectItem key={appointment.id} value={appointment.id.toString()}>
                                {getAppointmentDisplay(appointment)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customerId">Customer * ({customers.length} loaded)</Label>
                        <Select
                          value={formData.customerId.toString()}
                          onValueChange={(value) => setFormData({ ...formData, customerId: Number(value) })}
                          disabled={loading}
                        >
                          <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                            <SelectValue placeholder={loading ? "Loading customers..." : "Select customer"} />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a2234] border-[#2a3349]">
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id.toString()}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyId">Company * ({companies.length} loaded)</Label>
                        <Select
                          value={formData.companyId.toString()}
                          onValueChange={(value) => setFormData({ ...formData, companyId: Number(value) })}
                          disabled={loading}
                        >
                          <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                            <SelectValue placeholder={loading ? "Loading companies..." : "Select company"} />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a2234] border-[#2a3349]">
                            {companies.map((company) => (
                              <SelectItem key={company.id} value={company.id.toString()}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cancelledByRole">Cancelled By Role</Label>
                        <Select
                          value={formData.cancelledByRole.toString()}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              cancelledByRole: Number(value) as CancelledByRole,
                              cancelledById: 0,
                            })
                          }
                        >
                          <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                            <SelectValue placeholder="Select who cancelled" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a2234] border-[#2a3349]">
                            <SelectItem value={CancelledByRole.Customer.toString()}>Customer</SelectItem>
                            <SelectItem value={CancelledByRole.Professional.toString()}>Professional</SelectItem>
                            <SelectItem value={CancelledByRole.Company.toString()}>Company</SelectItem>
                            <SelectItem value={CancelledByRole.Admin.toString()}>Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cancelledById">Cancelled By * ({getCancelledByOptions().length} loaded)</Label>
                        <Select
                          value={formData.cancelledById.toString()}
                          onValueChange={(value) => setFormData({ ...formData, cancelledById: Number(value) })}
                          disabled={loading || getCancelledByOptions().length === 0}
                        >
                          <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                            <SelectValue
                              placeholder={
                                loading
                                  ? "Loading..."
                                  : `Select ${getCancelledByLabel(formData.cancelledByRole).toLowerCase()}`
                              }
                            />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a2234] border-[#2a3349]">
                            {getCancelledByOptions().map((option) => (
                              <SelectItem key={option.id} value={option.id.toString()}>
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="reason">Cancellation Reason</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="bg-[#0f172a] border-[#2a3349] text-white min-h-[120px]"
                      placeholder="Describe the reason for cancellation"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="bg-[#0f172a] border-[#2a3349] text-white min-h-[120px]"
                      placeholder="Additional notes about the cancellation"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Refund Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="refundStatus">Refund Status</Label>
                    <Select
                      value={formData.refundStatus.toString()}
                      onValueChange={(value) =>
                        setFormData({ ...formData, refundStatus: Number(value) as RefundStatus })
                      }
                    >
                      <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                        <SelectValue placeholder="Select refund status" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2234] border-[#2a3349]">
                        <SelectItem value={RefundStatus.Pending.toString()}>Pending</SelectItem>
                        <SelectItem value={RefundStatus.Processed.toString()}>Processed</SelectItem>
                        <SelectItem value={RefundStatus.Rejected.toString()}>Rejected</SelectItem>
                        <SelectItem value={RefundStatus.NotApplicable.toString()}>Not Applicable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {isEditing && cancellation && (
                    <Card className="bg-[#0f172a] border-[#2a3349]">
                      <CardContent className="pt-4 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#2a3349] rounded-full">
                            <AlertCircle className="h-5 w-5 text-[#06b6d4]" />
                          </div>
                          <div className="space-y-1 flex-1">
                            <p className="text-sm text-gray-400">Current Information</p>
                            <div className="space-y-2">
                              <p className="text-sm">
                                <span className="text-gray-400">Appointment ID:</span> #{cancellation.appointmentId}
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-400">Customer ID:</span> #{cancellation.customerId}
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-400">Company ID:</span> #{cancellation.companyId}
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-400">Cancelled By:</span>{" "}
                                {getCancelledByLabel(cancellation.cancelledByRole)} (ID: {cancellation.cancelledById})
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-[#0f172a] border-[#2a3349]">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Policy Reminder</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {isEditing
                              ? "You can only edit the reason, refund status, and notes for existing cancellations."
                              : "Cancellations made by customers less than 24 hours in advance may be subject to fees. Cancellations made by professionals or companies usually result in full refunds."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#2a3349] text-gray-400 hover:text-white hover:bg-[#2a3349] bg-transparent"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-[#06b6d4] hover:bg-[#0891b2]"
                  onClick={() => setActiveTab("refund")}
                >
                  Next
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="refund" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Refund Summary</h3>

                  <Card className="bg-[#0f172a] border-[#2a3349]">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Status:</span>
                          <span className="font-medium">{getRefundStatusLabel(formData.refundStatus)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Cancelled By:</span>
                          <span className="font-medium">{getCancelledByLabel(formData.cancelledByRole)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="p-3 bg-[#0f172a] rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Reason</p>
                    <p className="font-medium">{formData.reason || "No reason provided"}</p>
                  </div>

                  {formData.notes && (
                    <div className="p-3 bg-[#0f172a] rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Notes</p>
                      <p className="font-medium">{formData.notes}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Additional Information</h3>

                  <Card className="bg-[#0f172a] border-[#2a3349]">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-[#06b6d4] mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Processing Time</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {formData.refundStatus === RefundStatus.Pending
                              ? "This refund is awaiting processing. It may take 3-5 business days to complete."
                              : formData.refundStatus === RefundStatus.Processed
                                ? "This refund has been processed and should appear in the customer's account within 3-5 business days."
                                : formData.refundStatus === RefundStatus.Rejected
                                  ? "This refund has been rejected. The customer has been notified."
                                  : "No refund is applicable for this cancellation."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0f172a] border-[#2a3349]">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Important Note</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {isEditing
                              ? "Changes to the refund status will be reflected immediately. Make sure all information is correct before saving."
                              : "Once created, this cancellation will be processed according to the selected refund status. You can modify it later if needed."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator className="bg-[#2a3349] my-6" />

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[#2a3349] text-gray-400 hover:text-white hover:bg-[#2a3349] bg-transparent"
                    onClick={() => setActiveTab("details")}
                  >
                    Back
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[#2a3349] text-gray-400 hover:text-white hover:bg-[#2a3349] bg-transparent"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#06b6d4] hover:bg-[#0891b2]">
                    {isEditing ? "Save Changes" : "Create Cancellation"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
