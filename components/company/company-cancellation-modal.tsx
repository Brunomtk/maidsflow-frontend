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

interface CompanyCancellationModalProps {
  isOpen: boolean
  onClose: () => void
  cancellation?: Cancellation
}

interface Customer {
  id: number
  name: string
  email?: string
}

interface Appointment {
  id: number
  customerId: number
  customerName?: string
  serviceType?: string
  scheduledDate?: string
}

export function CompanyCancellationModal({ isOpen, onClose, cancellation }: CompanyCancellationModalProps) {
  const { addCancellation, updateCancellation } = useCompanyCancellationsContext()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingData, setLoadingData] = useState(false)

  const isEditing = !!cancellation

  const [formData, setFormData] = useState({
    appointmentId: cancellation?.appointmentId || 0,
    customerId: cancellation?.customerId || 0,
    customerName: cancellation?.customerName || "",
    reason: cancellation?.reason || "",
    refundStatus: cancellation?.refundStatus || RefundStatus.Pending,
    notes: cancellation?.notes || "",
  })

  useEffect(() => {
    if (isOpen && !isEditing) {
      loadDropdownData()
    }
  }, [isOpen, isEditing])

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
  }, [cancellation])

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
          customerName: finalCustomerName,
          companyId: user.companyId,
          reason: formData.reason,
          refundStatus: formData.refundStatus,
          notes: formData.notes,
          cancelledById: user.id || 0,
          cancelledByRole: CancelledByRole.Company,
        }

        console.log("[v0] Final payload being sent:", newCancellation)
        await addCancellation(newCancellation)
      }
      handleClose()
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
      <DialogContent className="sm:max-w-[500px] bg-[#0f172a] border-[#2a3349] text-white">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Cancellation" : "New Cancellation"}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEditing
              ? "Update the cancellation details below."
              : "Fill in the details to record a service cancellation."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {!isEditing && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointment" className="text-white">
                      Appointment
                    </Label>
                    <Select
                      value={formData.appointmentId.toString()}
                      onValueChange={handleAppointmentChange}
                      disabled={loadingData}
                    >
                      <SelectTrigger id="appointment" className="bg-[#1a2234] border-[#2a3349] text-white">
                        <SelectValue placeholder={loadingData ? "Loading..." : "Select appointment"} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                        {appointments.map((appointment) => (
                          <SelectItem key={appointment.id} value={appointment.id.toString()}>
                            #{appointment.id} - {appointment.customerName || `Customer ${appointment.customerId}`}
                            {appointment.serviceType && ` (${appointment.serviceType})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer" className="text-white">
                      Customer
                    </Label>
                    <Select
                      value={formData.customerId.toString()}
                      onValueChange={handleCustomerChange}
                      disabled={loadingData}
                    >
                      <SelectTrigger id="customer" className="bg-[#1a2234] border-[#2a3349] text-white">
                        <SelectValue placeholder={loadingData ? "Loading..." : "Select customer"} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
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
              <Label htmlFor="reason" className="text-white">
                Cancellation Reason
              </Label>
              <Select value={formData.reason} onValueChange={(value) => setFormData({ ...formData, reason: value })}>
                <SelectTrigger id="reason" className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  {getCancellationReasons().map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.reason === "Other" && (
                <Input
                  placeholder="Please specify the reason..."
                  className="bg-[#1a2234] border-[#2a3349] text-white mt-2"
                  value={formData.reason === "Other" ? "" : formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="refundStatus" className="text-white">
                Refund Status
              </Label>
              <Select
                value={formData.refundStatus.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, refundStatus: Number.parseInt(value) as RefundStatus })
                }
              >
                <SelectTrigger id="refundStatus" className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectItem value={RefundStatus.Pending.toString()}>Pending</SelectItem>
                  <SelectItem value={RefundStatus.Processed.toString()}>Processed</SelectItem>
                  <SelectItem value={RefundStatus.Rejected.toString()}>Rejected</SelectItem>
                  <SelectItem value={RefundStatus.NotApplicable.toString()}>Not Applicable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-white">
                Notes
              </Label>
              <Textarea
                id="notes"
                className="bg-[#1a2234] border-[#2a3349] text-white min-h-[80px]"
                placeholder="Enter additional notes about the cancellation..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-[#2a3349] text-white hover:bg-[#1a2234] hover:text-white bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#06b6d4] hover:bg-[#0891b2] text-white"
              disabled={loading || loadingData}
            >
              {loading ? "Saving..." : isEditing ? "Update Cancellation" : "Create Cancellation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
