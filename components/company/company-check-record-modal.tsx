"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/api/utils"

interface PrefilledData {
  appointmentId?: string
  customerId?: string
  address?: string
  professionalId?: string
}

interface CompanyCheckRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  prefilledData?: PrefilledData
}

export function CompanyCheckRecordModal({ isOpen, onClose, onSuccess, prefilledData }: CompanyCheckRecordModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    appointmentId: "",
    customerId: "",
    professionalId: "",
    address: "",
    notes: "",
    type: 0, // 0 = Check-in, 1 = Check-out
  })

  // Date and time states
  const [checkDate, setCheckDate] = useState<Date>()
  const [checkTime, setCheckTime] = useState("09:00")

  // Data for dropdowns
  const [customers, setCustomers] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])

  // Load dropdown data
  useEffect(() => {
    if (isOpen && user?.companyId) {
      loadDropdownData()
    }
  }, [isOpen, user?.companyId])

  // Set prefilled data when modal opens
  useEffect(() => {
    if (isOpen && prefilledData) {
      setFormData((prev) => ({
        ...prev,
        appointmentId: prefilledData.appointmentId || "",
        customerId: prefilledData.customerId || "",
        professionalId: prefilledData.professionalId || "",
        address: prefilledData.address || "",
      }))
    } else if (isOpen && !prefilledData) {
      // Reset form for new check record
      setFormData({
        appointmentId: "",
        customerId: "",
        professionalId: "",
        address: "",
        notes: "",
        type: 0,
      })
    }
  }, [isOpen, prefilledData])

  const loadDropdownData = async () => {
    if (!user?.companyId) return

    setIsLoadingData(true)
    try {
      // Load customers with company filter
      const customersResponse = await apiRequest(`/Customer?CompanyId=${user.companyId}&PageSize=100`)
      if (customersResponse?.results) {
        setCustomers(customersResponse.results)
      } else if (Array.isArray(customersResponse)) {
        setCustomers(customersResponse.filter((customer: any) => customer.companyId === user.companyId))
      }

      // Load professionals with company filter
      const professionalsResponse = await apiRequest(`/Professional?CompanyId=${user.companyId}&PageSize=100`)
      if (professionalsResponse?.results) {
        setProfessionals(professionalsResponse.results)
      } else if (Array.isArray(professionalsResponse)) {
        setProfessionals(professionalsResponse.filter((professional: any) => professional.companyId === user.companyId))
      }

      // Load appointments with company filter
      const appointmentsResponse = await apiRequest(`/Appointment?CompanyId=${user.companyId}&PageSize=100`)
      if (appointmentsResponse?.results) {
        setAppointments(appointmentsResponse.results)
      } else if (Array.isArray(appointmentsResponse)) {
        setAppointments(appointmentsResponse.filter((appointment: any) => appointment.companyId === user.companyId))
      }
    } catch (error) {
      console.error("Error loading dropdown data:", error)
      toast({
        title: "Error",
        description: "Failed to load form data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      const now = new Date()
      setCheckDate(now)
      setCheckTime(format(now, "HH:mm"))
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!checkDate) {
      toast({
        title: "Error",
        description: "Please select a check date.",
        variant: "destructive",
      })
      return
    }

    if (!formData.address.trim()) {
      toast({
        title: "Error",
        description: "Please enter an address.",
        variant: "destructive",
      })
      return
    }

    if (!formData.customerId) {
      toast({
        title: "Error",
        description: "Please select a customer.",
        variant: "destructive",
      })
      return
    }

    if (!formData.professionalId) {
      toast({
        title: "Error",
        description: "Please select a professional.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Combine date and time
      const checkDateTime = new Date(checkDate)
      const [hour, minute] = checkTime.split(":").map(Number)
      checkDateTime.setHours(hour, minute, 0, 0)

      // Get customer and professional names
      const selectedCustomer = customers.find((c) => c.id.toString() === formData.customerId)
      const selectedProfessional = professionals.find((p) => p.id.toString() === formData.professionalId)

      // Format data for API
      const submitData = {
        companyId: user?.companyId,
        appointmentId:
          formData.appointmentId && formData.appointmentId !== "" ? Number.parseInt(formData.appointmentId) : null,
        customerId: Number.parseInt(formData.customerId),
        customerName: selectedCustomer?.name || "",
        professionalId: Number.parseInt(formData.professionalId),
        professionalName: selectedProfessional?.name || "",
        address: formData.address.trim(),
        checkDateTime: checkDateTime.toISOString(),
        type: formData.type,
        notes: formData.notes.trim() || null,
        status: 1, // Active
      }

      console.log("Submitting check record data:", submitData)

      const response = await apiRequest("/CheckRecord", {
        method: "POST",
        body: JSON.stringify(submitData),
      })

      console.log("Check record created:", response)

      toast({
        title: "Success",
        description: "Check record created successfully!",
        variant: "default",
      })

      onClose()
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error creating check record:", error)
      toast({
        title: "Error",
        description: "Failed to create check record. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1a2234] border-[#2a3349] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create Check Record</DialogTitle>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#06b6d4]" />
            <span className="ml-2 text-gray-400">Loading form data...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Appointment Selection */}
            <div className="space-y-2">
              <Label htmlFor="appointment" className="text-sm font-medium">
                Appointment (Optional)
              </Label>
              <Select
                value={formData.appointmentId}
                onValueChange={(value) => setFormData({ ...formData, appointmentId: value })}
              >
                <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white focus:border-[#06b6d4]">
                  <SelectValue placeholder="Select an appointment" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectItem value="none">No appointment</SelectItem>
                  {appointments.map((appointment) => (
                    <SelectItem key={appointment.id} value={appointment.id.toString()}>
                      {appointment.title} - {format(new Date(appointment.start), "MMM d, yyyy h:mm a")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Customer and Professional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer" className="text-sm font-medium">
                  Customer <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={formData.customerId}
                  onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                >
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white focus:border-[#06b6d4]">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name} - {customer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="professional" className="text-sm font-medium">
                  Professional <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={formData.professionalId}
                  onValueChange={(value) => setFormData({ ...formData, professionalId: value })}
                >
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white focus:border-[#06b6d4]">
                    <SelectValue placeholder="Select a professional" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                    {professionals.map((professional) => (
                      <SelectItem key={professional.id} value={professional.id.toString()}>
                        {professional.name} - {professional.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">
                Address <span className="text-red-400">*</span>
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-[#0f172a] border-[#2a3349] text-white focus:border-[#06b6d4]"
                placeholder="Enter service address"
                required
              />
            </div>

            {/* Check Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Check Type
              </Label>
              <Select
                value={formData.type.toString()}
                onValueChange={(value) => setFormData({ ...formData, type: Number.parseInt(value) })}
              >
                <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white focus:border-[#06b6d4]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectItem value="0">Check-in</SelectItem>
                  <SelectItem value="1">Check-out</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Check Date & Time <span className="text-red-400">*</span>
              </Label>
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal bg-[#0f172a] border-[#2a3349] text-white hover:bg-[#1a2234] focus:border-[#06b6d4]",
                        !checkDate && "text-gray-400",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkDate ? format(checkDate, "MMM dd, yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#1a2234] border-[#2a3349]">
                    <Calendar
                      mode="single"
                      selected={checkDate}
                      onSelect={setCheckDate}
                      initialFocus
                      className="text-white"
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <Input
                    type="time"
                    value={checkTime}
                    onChange={(e) => setCheckTime(e.target.value)}
                    className="w-24 bg-[#0f172a] border-[#2a3349] text-white focus:border-[#06b6d4]"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-[#0f172a] border-[#2a3349] text-white focus:border-[#06b6d4] resize-none"
                rows={3}
                placeholder="Add any additional notes..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="border-[#2a3349] text-white bg-transparent hover:bg-[#2a3349]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#06b6d4] hover:bg-[#0891b2] text-white min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Check Record"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
