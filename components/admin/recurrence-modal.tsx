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
import { Loader2 } from "lucide-react"
import type { Recurrence, RecurrenceFormData } from "@/types/recurrence"
import { recurrencesApi } from "@/lib/api/recurrences"

interface RecurrenceModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  recurrence?: Recurrence | null
}

export function RecurrenceModal({ isOpen, onClose, onSubmit, recurrence }: RecurrenceModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingDropdowns, setLoadingDropdowns] = useState(false)
  const [companies, setCompanies] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])

  const [formData, setFormData] = useState<RecurrenceFormData>({
    title: "",
    customerId: 0,
    address: "",
    teamId: 0,
    companyId: 0,
    frequency: 1, // weekly
    day: 1, // Monday
    time: "09:00",
    duration: 60,
    status: 1, // active
    type: 1, // regular
    startDate: "",
    endDate: "",
    notes: "",
  })

  // Load dropdown data
  const loadDropdownData = async () => {
    setLoadingDropdowns(true)

    try {
      console.log("Loading dropdown data for recurrence modal...")

      const [companiesResult, customersResult, teamsResult] = await Promise.allSettled([
        recurrencesApi.getCompanies(),
        recurrencesApi.getCustomers(formData.companyId || undefined),
        recurrencesApi.getTeams(formData.companyId || undefined),
      ])

      if (companiesResult.status === "fulfilled") {
        console.log("Companies loaded:", companiesResult.value)
        setCompanies(companiesResult.value)
      } else {
        console.error("Failed to load companies:", companiesResult.reason)
      }

      if (customersResult.status === "fulfilled") {
        console.log("Customers loaded:", customersResult.value)
        setCustomers(customersResult.value)
      } else {
        console.error("Failed to load customers:", customersResult.reason)
      }

      if (teamsResult.status === "fulfilled") {
        console.log("Teams loaded:", teamsResult.value)
        setTeams(teamsResult.value)
      } else {
        console.error("Failed to load teams:", teamsResult.reason)
      }
    } catch (error) {
      console.error("Error loading dropdown data:", error)
    } finally {
      setLoadingDropdowns(false)
    }
  }

  // Load customers and teams when company changes
  const loadCompanyRelatedData = async (companyId: number) => {
    if (!companyId) return

    try {
      const [customersResult, teamsResult] = await Promise.allSettled([
        recurrencesApi.getCustomers(companyId),
        recurrencesApi.getTeams(companyId),
      ])

      if (customersResult.status === "fulfilled") {
        setCustomers(customersResult.value)
      }

      if (teamsResult.status === "fulfilled") {
        setTeams(teamsResult.value)
      }
    } catch (error) {
      console.error("Error loading company related data:", error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadDropdownData()
    }
  }, [isOpen])

  useEffect(() => {
    if (recurrence) {
      setFormData({
        title: recurrence.title || "",
        customerId: recurrence.customerId || 0,
        address: recurrence.address || "",
        teamId: recurrence.teamId || 0,
        companyId: recurrence.companyId || 0,
        frequency: recurrence.frequency || 1,
        day: recurrence.day || 1,
        time: recurrence.time || "09:00",
        duration: recurrence.duration || 60,
        status: recurrence.status || 1,
        type: recurrence.type || 1,
        startDate: recurrence.startDate ? recurrence.startDate.split("T")[0] : "",
        endDate: recurrence.endDate ? recurrence.endDate.split("T")[0] : "",
        notes: recurrence.notes || "",
      })
    } else {
      const today = new Date()
      const nextYear = new Date(today)
      nextYear.setFullYear(today.getFullYear() + 1)

      setFormData({
        title: "",
        customerId: 0,
        address: "",
        teamId: 0,
        companyId: 0,
        frequency: 1,
        day: 1,
        time: "09:00",
        duration: 60,
        status: 1,
        type: 1,
        startDate: today.toISOString().split("T")[0],
        endDate: nextYear.toISOString().split("T")[0],
        notes: "",
      })
    }
  }, [recurrence])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert("Service Title is required")
      return
    }

    if (!formData.address.trim()) {
      alert("Service Address is required")
      return
    }

    if (!formData.customerId || formData.customerId === 0) {
      alert("Customer is required")
      return
    }

    if (!formData.companyId || formData.companyId === 0) {
      alert("Company is required")
      return
    }

    setIsLoading(true)

    try {
      const submitData = {
        Title: formData.title.trim(),
        Address: formData.address.trim(),
        customerId: formData.customerId,
        companyId: formData.companyId,
        teamId: formData.teamId || null,
        frequency: formData.frequency,
        day: formData.day,
        time: formData.time,
        duration: formData.duration,
        status: formData.status,
        type: formData.type,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : "",
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        notes: formData.notes?.trim() || null,
      }

      console.log("Submitting recurrence data:", submitData)
      await onSubmit(submitData)
    } catch (error) {
      console.error("Error submitting recurrence:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof RecurrenceFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Load related data when company changes
    if (field === "companyId" && value) {
      loadCompanyRelatedData(Number.parseInt(value))
      // Reset dependent fields
      setFormData((prev) => ({ ...prev, customerId: 0, teamId: 0 }))
    }
  }

  // Get day options based on frequency
  const getDayOptions = () => {
    switch (formData.frequency) {
      case 1: // weekly
        return [
          { value: 1, label: "Monday" },
          { value: 2, label: "Tuesday" },
          { value: 3, label: "Wednesday" },
          { value: 4, label: "Thursday" },
          { value: 5, label: "Friday" },
          { value: 6, label: "Saturday" },
          { value: 7, label: "Sunday" },
        ]
      case 2: // biweekly
        return [
          { value: 1, label: "Monday" },
          { value: 2, label: "Tuesday" },
          { value: 3, label: "Wednesday" },
          { value: 4, label: "Thursday" },
          { value: 5, label: "Friday" },
          { value: 6, label: "Saturday" },
          { value: 7, label: "Sunday" },
        ]
      case 3: // monthly
        return [
          { value: 1, label: "1st day" },
          { value: 15, label: "15th day" },
          { value: 31, label: "Last day" },
        ]
      default:
        return []
    }
  }

  const getCompanyName = (company: any) => {
    return company.name || company.companyName || `Company ${company.id}`
  }

  const getCustomerName = (customer: any) => {
    return customer.name || customer.customerName || `Customer ${customer.id}`
  }

  const getTeamName = (team: any) => {
    return team.name || team.teamName || `Team ${team.id}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a2234] border-[#2a3349] text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{recurrence ? "Edit Recurring Service" : "New Recurring Service"}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {recurrence
              ? "Update the recurring service information below."
              : "Fill in the information to schedule a new recurring service."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Service Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
                placeholder="e.g. Weekly Office Cleaning, Monthly Deep Cleaning, etc."
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company">Company *</Label>
              <Select
                value={formData.companyId.toString()}
                onValueChange={(value) => handleChange("companyId", Number.parseInt(value))}
                required
              >
                <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                  <SelectValue placeholder={loadingDropdowns ? "Loading companies..." : "Select a company"} />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white max-h-[200px]">
                  {loadingDropdowns ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading companies...
                      </div>
                    </SelectItem>
                  ) : companies.length > 0 ? (
                    companies.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()} className="hover:bg-[#2a3349]">
                        {getCompanyName(company)}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-companies" disabled>
                      No companies available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select
                value={formData.customerId.toString()}
                onValueChange={(value) => handleChange("customerId", Number.parseInt(value))}
                disabled={!formData.companyId}
                required
              >
                <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                  <SelectValue
                    placeholder={
                      !formData.companyId
                        ? "Select a company first"
                        : loadingDropdowns
                          ? "Loading customers..."
                          : "Select a customer"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white max-h-[200px]">
                  {customers.length > 0 ? (
                    customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()} className="hover:bg-[#2a3349]">
                        {getCustomerName(customer)}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-customers" disabled>
                      {!formData.companyId ? "Select a company first" : "No customers available"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Service Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
                placeholder="Full address where the service will be performed"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="team">Assigned Team</Label>
              <Select
                value={formData.teamId?.toString() || ""}
                onValueChange={(value) => handleChange("teamId", Number.parseInt(value))}
                disabled={!formData.companyId}
              >
                <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                  <SelectValue
                    placeholder={
                      !formData.companyId
                        ? "Select a company first"
                        : loadingDropdowns
                          ? "Loading teams..."
                          : "Select a team (optional)"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white max-h-[200px]">
                  <SelectItem value="0" className="hover:bg-[#2a3349]">
                    No team assigned
                  </SelectItem>
                  {teams.length > 0 ? (
                    teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()} className="hover:bg-[#2a3349]">
                        {getTeamName(team)}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-teams" disabled>
                      {!formData.companyId ? "Select a company first" : "No teams available"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={formData.frequency.toString()}
                  onValueChange={(value) => handleChange("frequency", Number.parseInt(value))}
                >
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                    <SelectItem value="1" className="hover:bg-[#2a3349]">
                      Weekly
                    </SelectItem>
                    <SelectItem value="2" className="hover:bg-[#2a3349]">
                      Bi-weekly
                    </SelectItem>
                    <SelectItem value="3" className="hover:bg-[#2a3349]">
                      Monthly
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="day">Day</Label>
                <Select
                  value={formData.day.toString()}
                  onValueChange={(value) => handleChange("day", Number.parseInt(value))}
                >
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                    {getDayOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()} className="hover:bg-[#2a3349]">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="time">Start Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange("time", e.target.value)}
                  className="bg-[#0f172a] border-[#2a3349] text-white"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration.toString()}
                  onChange={(e) => handleChange("duration", Number.parseInt(e.target.value))}
                  min="30"
                  step="30"
                  className="bg-[#0f172a] border-[#2a3349] text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="bg-[#0f172a] border-[#2a3349] text-white"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  className="bg-[#0f172a] border-[#2a3349] text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Service Type</Label>
                <Select
                  value={formData.type.toString()}
                  onValueChange={(value) => handleChange("type", Number.parseInt(value))}
                >
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                    <SelectItem value="1" className="hover:bg-[#2a3349]">
                      Regular Cleaning
                    </SelectItem>
                    <SelectItem value="2" className="hover:bg-[#2a3349]">
                      Deep Cleaning
                    </SelectItem>
                    <SelectItem value="3" className="hover:bg-[#2a3349]">
                      Specialized Service
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status.toString()}
                  onValueChange={(value) => handleChange("status", Number.parseInt(value))}
                >
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                    <SelectValue placeholder="Select status" />
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
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white min-h-[80px]"
                placeholder="Additional information about the recurring service"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#2a3349] text-white hover:bg-[#2a3349] bg-transparent"
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
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
