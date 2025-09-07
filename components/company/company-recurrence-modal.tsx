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
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { CompanyRecurrence } from "@/types/company-recurrence"
import { useCompanyRecurrenceContext } from "@/contexts/company-recurrence-context"
import { useAuth } from "@/contexts/auth-context"

interface CompanyRecurrenceModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  recurrence?: CompanyRecurrence | null
  isEditing?: boolean
}

export function CompanyRecurrenceModal({
  isOpen,
  onClose,
  onSubmit,
  recurrence,
  isEditing = false,
}: CompanyRecurrenceModalProps) {
  const { customers, teams, fetchCustomers, fetchTeams } = useCompanyRecurrenceContext()

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    customerId: "",
    address: "",
    teamId: "",
    frequency: "1",
    day: "1",
    time: "09:00",
    duration: "60",
    status: "1",
    type: "1",
    startDate: new Date(),
    endDate: undefined as Date | undefined,
    notes: "",
  })

  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)

  const { user } = useAuth()
  const companyId = user?.companyId || 1

  useEffect(() => {
    if (isOpen) {
      fetchCustomers(companyId)
      fetchTeams(companyId)
    }
  }, [isOpen, companyId])

  useEffect(() => {
    if (recurrence && isEditing) {
      setFormData({
        title: recurrence.title || "",
        customerId: recurrence.customerId?.toString() || "",
        address: recurrence.address || "",
        teamId: recurrence.teamId?.toString() || "",
        frequency: recurrence.frequency?.toString() || "1",
        day: recurrence.day?.toString() || "1",
        time: recurrence.time || "09:00",
        duration: recurrence.duration?.toString() || "60",
        status: recurrence.status?.toString() || "1",
        type: recurrence.type?.toString() || "1",
        startDate: recurrence.startDate ? new Date(recurrence.startDate) : new Date(),
        endDate: recurrence.endDate ? new Date(recurrence.endDate) : undefined,
        notes: recurrence.notes || "",
      })
    } else {
      setFormData({
        title: "",
        customerId: "",
        address: "",
        teamId: "",
        frequency: "1",
        day: "1",
        time: "09:00",
        duration: "60",
        status: "1",
        type: "1",
        startDate: new Date(),
        endDate: undefined,
        notes: "",
      })
    }
  }, [recurrence, isEditing, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData = {
      title: formData.title,
      customerId: Number.parseInt(formData.customerId),
      address: formData.address,
      teamId: formData.teamId ? Number.parseInt(formData.teamId) : undefined,
      companyId,
      frequency: Number.parseInt(formData.frequency),
      day: Number.parseInt(formData.day),
      time: formData.time,
      duration: Number.parseInt(formData.duration),
      status: Number.parseInt(formData.status),
      type: Number.parseInt(formData.type),
      startDate: formData.startDate.toISOString(),
      endDate: formData.endDate?.toISOString(),
      notes: formData.notes || undefined,
    }

    onSubmit(submitData)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a2234] border-[#2a3349] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">{isEditing ? "Edit Recurrence" : "Add New Recurrence"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <Label htmlFor="title" className="text-white">
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
                required
              />
            </div>

            {/* Customer */}
            <div>
              <Label htmlFor="customerId" className="text-white">
                Customer *
              </Label>
              <Select value={formData.customerId} onValueChange={(value) => handleInputChange("customerId", value)}>
                <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()} className="hover:bg-[#2a3349]">
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Team */}
            <div>
              <Label htmlFor="teamId" className="text-white">
                Team
              </Label>
              <Select value={formData.teamId} onValueChange={(value) => handleInputChange("teamId", value)}>
                <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                  <SelectValue placeholder="Select team (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectItem value="" className="hover:bg-[#2a3349]">
                    No team assigned
                  </SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()} className="hover:bg-[#2a3349]">
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <Label htmlFor="address" className="text-white">
                Address *
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
                required
              />
            </div>

            {/* Frequency */}
            <div>
              <Label htmlFor="frequency" className="text-white">
                Frequency *
              </Label>
              <Select value={formData.frequency} onValueChange={(value) => handleInputChange("frequency", value)}>
                <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectItem value="1" className="hover:bg-[#2a3349]">
                    Weekly
                  </SelectItem>
                  <SelectItem value="2" className="hover:bg-[#2a3349]">
                    Biweekly
                  </SelectItem>
                  <SelectItem value="3" className="hover:bg-[#2a3349]">
                    Monthly
                  </SelectItem>
                  <SelectItem value="4" className="hover:bg-[#2a3349]">
                    Quarterly
                  </SelectItem>
                  <SelectItem value="5" className="hover:bg-[#2a3349]">
                    Yearly
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Day */}
            <div>
              <Label htmlFor="day" className="text-white">
                Day of Week *
              </Label>
              <Select value={formData.day} onValueChange={(value) => handleInputChange("day", value)}>
                <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectItem value="0" className="hover:bg-[#2a3349]">
                    Sunday
                  </SelectItem>
                  <SelectItem value="1" className="hover:bg-[#2a3349]">
                    Monday
                  </SelectItem>
                  <SelectItem value="2" className="hover:bg-[#2a3349]">
                    Tuesday
                  </SelectItem>
                  <SelectItem value="3" className="hover:bg-[#2a3349]">
                    Wednesday
                  </SelectItem>
                  <SelectItem value="4" className="hover:bg-[#2a3349]">
                    Thursday
                  </SelectItem>
                  <SelectItem value="5" className="hover:bg-[#2a3349]">
                    Friday
                  </SelectItem>
                  <SelectItem value="6" className="hover:bg-[#2a3349]">
                    Saturday
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time */}
            <div>
              <Label htmlFor="time" className="text-white">
                Time *
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <Label htmlFor="duration" className="text-white">
                Duration (minutes) *
              </Label>
              <Input
                id="duration"
                type="number"
                min="15"
                max="480"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
                required
              />
            </div>

            {/* Type */}
            <div>
              <Label htmlFor="type" className="text-white">
                Service Type *
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectItem value="1" className="hover:bg-[#2a3349]">
                    Regular
                  </SelectItem>
                  <SelectItem value="2" className="hover:bg-[#2a3349]">
                    Deep Cleaning
                  </SelectItem>
                  <SelectItem value="3" className="hover:bg-[#2a3349]">
                    Specialized
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status" className="text-white">
                Status *
              </Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectItem value="1" className="hover:bg-[#2a3349]">
                    Active
                  </SelectItem>
                  <SelectItem value="0" className="hover:bg-[#2a3349]">
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div>
              <Label className="text-white">Start Date *</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-[#0f172a] border-[#2a3349] text-white hover:bg-[#2a3349]",
                      !formData.startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#1a2234] border-[#2a3349]" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => {
                      handleInputChange("startDate", date || new Date())
                      setStartDateOpen(false)
                    }}
                    initialFocus
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div>
              <Label className="text-white">End Date (optional)</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-[#0f172a] border-[#2a3349] text-white hover:bg-[#2a3349]",
                      !formData.endDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "PPP") : "Pick an end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#1a2234] border-[#2a3349]" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => {
                      handleInputChange("endDate", date)
                      setEndDateOpen(false)
                    }}
                    initialFocus
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-white">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="bg-[#0f172a] border-[#2a3349] text-white"
              rows={3}
              placeholder="Additional notes or instructions..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#2a3349] text-white hover:bg-[#2a3349] bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#06b6d4] hover:bg-[#0891b2] text-white">
              {isEditing ? "Update Recurrence" : "Create Recurrence"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
