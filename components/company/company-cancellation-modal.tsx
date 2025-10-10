"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { RefundStatus, CancelledByRole, type Cancellation, type CancellationFormData } from "@/types/cancellation"
import { useAuth } from "@/contexts/auth-context"
import { useCompanyCancellationsContext } from "@/contexts/company-cancellations-context"
import { customersApi } from "@/lib/api/customers"
import { fetchApi } from "@/lib/api/utils"
import type { Appointment } from "@/types/appointment"
import { updateCompanyAppointment } from "@/lib/api/company-appointments"

interface CompanyCancellationModalProps {
  isOpen: boolean
  onClose: () => void
  cancellation?: Cancellation
  appointment?: Appointment
  onSuccess?: () => void
}

interface Customer {
  id: number
  name: string
  email?: string
}

interface AppointmentData {
  id: number
  customerId: number
  customerName?: string
  serviceType?: string
  scheduledDate?: string
}

export function CompanyCancellationModal({
  isOpen,
  onClose,
  cancellation,
  appointment,
  onSuccess,
}: CompanyCancellationModalProps) {
  const { addCancellation, updateCancellation } = useCompanyCancellationsContext()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [loadingData, setLoadingData] = useState(false)

  const isEditing = !!cancellation

  const [formData, setFormData] = useState({
    appointmentId: cancellation?.appointmentId || appointment?.id || 0,
    customerId: cancellation?.customerId || appointment?.customerId || 0,
    customerName: cancellation?.customerName || appointment?.customer?.name || "",
    reason: cancellation?.reason || "",
    refundStatus: cancellation?.refundStatus || RefundStatus.Pending,
    notes: cancellation?.notes || "",
  })

  useEffect(() => {
    if (isOpen && !isEditing && !appointment) {
      loadDropdownData()
    }
  }, [isOpen, isEditing, appointment])

  useEffect(() => {
    if (cancellation) {
      setFormData({
        appointmentId: cancellation.appointmentId || 0,
        customerId: cancellation.customerId || 0,
        customerName: cancellation.customerName || "",
        reason: cancellation.reason || "",
        refundStatus: cancellation.refundStatus || RefundStatus.Pending,
        notes: cancellation.notes || "",
      })
    } else if (appointment) {
      setFormData({
        appointmentId: appointment.id || 0,
        customerId: appointment.customerId || 0,
        customerName: appointment.customer?.name || "",
        reason: "",
        refundStatus: RefundStatus.Pending,
        notes: "",
      })
    } else {
      setFormData({
        appointmentId: 0,
        customerId: 0,
        customerName: "",
        reason: "",
        refundStatus: RefundStatus.Pending,
        notes: "",
      })
    }
  }, [cancellation, appointment])

  const loadDropdownData = async () => {
    if (!user?.companyId) return

    setLoadingData(true)
    try {
      // Load customers for the company
      const customersResponse = await fetchApi<any>(`/Customer?CompanyId=${user.companyId}&PageSize=100`)
      const customersList = Array.isArray(customersResponse) ? customersResponse : customersResponse?.results || []
      setCustomers(customersList)

      // Load appointments for the company
      const appointmentsResponse = await fetchApi<any>(`/Appointment?CompanyId=${user.companyId}&PageSize=100`)
      const appointmentsList = Array.isArray(appointmentsResponse)
        ? appointmentsResponse
        : appointmentsResponse?.results || []
      setAppointments(appointmentsList)
    } catch (error) {
      console.error("Error loading dropdown data:", error)
      setCustomers([])
      setAppointments([])
    } finally {
      setLoadingData(false)
    }
  }

  const getCancellationReasons = () => [
    { value: "Client Schedule Conflict", label: "Client Schedule Conflict" },
    { value: "Professional Unavailable", label: "Professional Unavailable" },
    { value: "Client Dissatisfaction", label: "Client Dissatisfaction" },
    { value: "Weather Conditions", label: "Weather Conditions" },
    { value: "Client Request", label: "Client Request" },
    { value: "System Error", label: "System Error" },
    { value: "Emergency", label: "Emergency" },
    { value: "Other", label: "Other" },
  ]

  // Fetch customer name using the customers API
  const fetchCustomerName = async (customerId: number): Promise<string> => {
    try {
      console.log("[v0] Fetching customer name for ID:", customerId)
      const customer = await customersApi.getById(customerId)
      console.log("[v0] Customer API response:", customer)
      return customer.name || ""
    } catch (error) {
      console.error("[v0] Error fetching customer from API:", error)
      // Fallback to local customers list
      const localCustomer = customers.find((c) => c.id === customerId)
      return localCustomer?.name || ""
    }
  }

  const handleAppointmentChange = async (appointmentId: string) => {
    const selectedAppointment = appointments.find((apt) => apt.id === Number.parseInt(appointmentId))
    console.log("[v0] Selected appointment:", selectedAppointment)

    if (selectedAppointment) {
      let customerName = selectedAppointment.customerName

      if (!customerName && selectedAppointment.customerId) {
        customerName = await fetchCustomerName(selectedAppointment.customerId)
      }

      console.log("[v0] Final resolved customer name:", customerName)

      setFormData({
        ...formData,
        appointmentId: selectedAppointment.id,
        customerId: selectedAppointment.customerId,
        customerName: customerName,
      })
    }
  }

  const handleCustomerChange = async (customerId: string) => {
    const customerIdNum = Number.parseInt(customerId)
    console.log("[v0] Selected customer ID:", customerIdNum)

    const customerName = await fetchCustomerName(customerIdNum)

    console.log("[v0] Fetched customer name:", customerName)

    setFormData({
      ...formData,
      customerId: customerIdNum,
      customerName: customerName,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.companyId) return

    setLoading(true)
    try {
      if (isEditing && cancellation) {
        await updateCancellation(cancellation.id, {
          reason: formData.reason,
          refundStatus: formData.refundStatus,
          notes: formData.notes,
        })
      } else {
        console.log("[v0] Form data before submission:", formData)

        let finalCustomerName = formData.customerName
        if (!finalCustomerName && formData.customerId) {
          console.log("[v0] Customer name missing, fetching from API...")
          finalCustomerName = await fetchCustomerName(formData.customerId)
          console.log("[v0] Fetched customer name for submission:", finalCustomerName)
        }

        const newCancellation: CancellationFormData = {
          appointmentId: formData.appointmentId,
          customerId: formData.customerId,
          companyId: user.companyId,
          reason: formData.reason,
          refundStatus: formData.refundStatus,
          notes: formData.notes,
          cancelledById: user.id || 0,
          cancelledByRole: CancelledByRole.Company,
        }

        console.log("[v0] Final payload being sent:", newCancellation)
        await addCancellation(newCancellation)

        if (formData.appointmentId) {
          console.log("[v0] Updating appointment status to Cancelled...")
          await updateCompanyAppointment(formData.appointmentId, {
            status: 3, // Cancelled status
          })
          console.log("[v0] Appointment status updated successfully")
        }
      }
      handleClose()
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error saving cancellation:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      appointmentId: 0,
      customerId: 0,
      customerName: "",
      reason: "",
      refundStatus: RefundStatus.Pending,
      notes: "",
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#0f172a] border-[#2a3349] text-white">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {isEditing ? "Edit Cancellation" : "Cancel Appointment"}
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm">
            {isEditing
              ? "Update the cancellation details below."
              : "Fill in the details to cancel this appointment and record the cancellation."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {!isEditing && appointment && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointment-display" className="text-white text-sm">
                      Appointment
                    </Label>
                    <Input
                      id="appointment-display"
                      value={`#${appointment.id} - ${appointment.customer?.name || "Unknown"}`}
                      disabled
                      className="bg-[#1a2234] border-[#2a3349] text-gray-400 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-display" className="text-white text-sm">
                      Customer
                    </Label>
                    <Input
                      id="customer-display"
                      value={appointment.customer?.name || "Unknown"}
                      disabled
                      className="bg-[#1a2234] border-[#2a3349] text-gray-400 text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {!isEditing && !appointment && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointment" className="text-white text-sm">
                      Appointment
                    </Label>
                    <Select
                      value={formData.appointmentId.toString()}
                      onValueChange={handleAppointmentChange}
                      disabled={loadingData}
                    >
                      <SelectTrigger id="appointment" className="bg-[#1a2234] border-[#2a3349] text-white text-sm">
                        <SelectValue placeholder={loadingData ? "Loading..." : "Select appointment"} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                        {appointments.map((apt) => (
                          <SelectItem key={apt.id} value={apt.id.toString()} className="text-sm">
                            #{apt.id} - {apt.customerName || `Customer ${apt.customerId}`}
                            {apt.serviceType && ` (${apt.serviceType})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer" className="text-white text-sm">
                      Customer
                    </Label>
                    <Select
                      value={formData.customerId.toString()}
                      onValueChange={handleCustomerChange}
                      disabled={loadingData}
                    >
                      <SelectTrigger id="customer" className="bg-[#1a2234] border-[#2a3349] text-white text-sm">
                        <SelectValue placeholder={loadingData ? "Loading..." : "Select customer"} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()} className="text-sm">
                            {customer.name}
                            {customer.email && ` (${customer.email})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-white text-sm">
                Cancellation Reason
              </Label>
              <Select value={formData.reason} onValueChange={(value) => setFormData({ ...formData, reason: value })}>
                <SelectTrigger id="reason" className="bg-[#1a2234] border-[#2a3349] text-white text-sm">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  {getCancellationReasons().map((reason) => (
                    <SelectItem key={reason.value} value={reason.value} className="text-sm">
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.reason === "Other" && (
                <Input
                  placeholder="Please specify the reason..."
                  className="bg-[#1a2234] border-[#2a3349] text-white mt-2 text-sm"
                  value={formData.reason === "Other" ? "" : formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="refundStatus" className="text-white text-sm">
                Refund Status
              </Label>
              <Select
                value={formData.refundStatus.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, refundStatus: Number.parseInt(value) as RefundStatus })
                }
              >
                <SelectTrigger id="refundStatus" className="bg-[#1a2234] border-[#2a3349] text-white text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectItem value={RefundStatus.Pending.toString()} className="text-sm">
                    Pending
                  </SelectItem>
                  <SelectItem value={RefundStatus.Processed.toString()} className="text-sm">
                    Processed
                  </SelectItem>
                  <SelectItem value={RefundStatus.Rejected.toString()} className="text-sm">
                    Rejected
                  </SelectItem>
                  <SelectItem value={RefundStatus.NotApplicable.toString()} className="text-sm">
                    Not Applicable
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-white text-sm">
                Notes
              </Label>
              <Textarea
                id="notes"
                className="bg-[#1a2234] border-[#2a3349] text-white min-h-[80px] text-sm"
                placeholder="Enter additional notes about the cancellation..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto border-[#2a3349] text-white hover:bg-[#1a2234] hover:text-white bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-[#06b6d4] hover:bg-[#0891b2] text-white"
              disabled={loading || loadingData}
            >
              {loading ? "Saving..." : isEditing ? "Update Cancellation" : "Cancel Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
