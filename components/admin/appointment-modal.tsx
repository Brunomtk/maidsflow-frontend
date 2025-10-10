"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { appointmentsApi } from "@/lib/api/appointments"
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
import { format } from "date-fns"
import { getApiUrl } from "@/lib/api/utils"
import { useToast } from "@/hooks/use-toast"

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  appointment?: any
}

export function AppointmentModal({ isOpen, onClose, onSubmit, appointment }: AppointmentModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [companies, setCompanies] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    companyId: "",
    customerId: "",
    teamId: "",
    professionalId: "",
    type: "",
    status: "0",
    date: "",
    startTime: "",
    endTime: "",
    notes: "",
  })
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(false)
  const [recurrenceType, setRecurrenceType] = useState<"weekly" | "monthly" | "bimonthly">("weekly")
  const [repeatUntil, setRepeatUntil] = useState<string>("")

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("noah_token")

    if (!token) {
      throw new Error("No authentication token found")
    }

    const url = `${getApiUrl()}/${endpoint}`
    console.log("Making API call to:", url)

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  useEffect(() => {
    if (isOpen) {
      loadInitialData()
    }
  }, [isOpen])

  useEffect(() => {
    if (appointment) {
      const startDate =
        appointment.start && appointment.start !== "0001-01-01T00:00:00" ? new Date(appointment.start) : undefined
      const endDate =
        appointment.end && appointment.end !== "0001-01-01T00:00:00" ? new Date(appointment.end) : undefined

      setFormData({
        title: appointment.title || "",
        address: appointment.address || "",
        companyId: appointment.companyId?.toString() || "",
        customerId: appointment.customerId?.toString() || "",
        teamId: appointment.teamId?.toString() || "none",
        professionalId: appointment.professionalId?.toString() || "none",
        type: appointment.type?.toString() || "",
        status: appointment.status?.toString() || "0",
        date: startDate ? format(startDate, "yyyy-MM-dd") : "",
        startTime: startDate ? format(startDate, "HH:mm") : "",
        endTime: endDate ? format(endDate, "HH:mm") : "",
        notes: appointment.notes || "",
      })
    } else {
      setFormData({
        title: "",
        recurrenceEnabled: false,
        recurrenceFrequency: "weekly",
        recurrenceEndDate: "",
        recurrenceDayOfMonth: "",
        address: "",
        companyId: "",
        customerId: "",
        teamId: "none",
        professionalId: "none",
        type: "",
        status: "0",
        date: "",
        startTime: "",
        endTime: "",
        notes: "",
      })
    }
  }, [appointment])

  const loadInitialData = async () => {
    setLoadingData(true)
    try {
      const [companiesData, customersData, teamsData, professionalsData] = await Promise.all([
        apiCall("Companies"),
        apiCall("Customer"),
        apiCall("Team"),
        apiCall("Professional"),
      ])

      setCompanies(companiesData.results || companiesData || [])
      setCustomers(customersData.results || customersData || [])
      setTeams(teamsData.results || teamsData || [])
      setProfessionals(professionalsData.results || professionalsData || [])
    } catch (error) {
      console.error("Error loading initial data:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const buildOccurrences = (
    startDateStr: string,
    endDateStr: string,
    untilStr: string,
    type: "weekly" | "monthly" | "bimonthly",
  ) => {
    const occurrences: { start: string; end: string }[] = []
    if (!startDateStr || !endDateStr || !untilStr) return occurrences

    const [sh, sm] = (formData.startTime || "09:00").split(":").map((v) => Number.parseInt(v, 10))
    const [eh, em] = (formData.endTime || "10:00").split(":").map((v) => Number.parseInt(v, 10))

    const baseParts = parseDateOnly(startDateStr)
    const base = baseParts ? new Date(baseParts.y, baseParts.m - 1, baseParts.d) : new Date(startDateStr)
    base.setHours(0, 0, 0, 0)
    const untilParts = parseDateOnly(untilStr)
    const until = untilParts ? new Date(untilParts.y, untilParts.m - 1, untilParts.d) : new Date(untilStr)
    until.setHours(23, 59, 59, 999)

    let cur = new Date(base)
    const pushOccurrence = (d: Date) => {
      const s = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), sh, sm, 0, 0))
      const e = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), eh, em, 0, 0))
      // push occurrence if still within range
      if (s <= until) {
        const y = s.getUTCFullYear(),
          m = s.getUTCMonth() + 1,
          d = s.getUTCDate()
        const ye = e.getUTCFullYear(),
          me = e.getUTCMonth() + 1,
          de = e.getUTCDate()
        occurrences.push({
          start: `${y}-${pad2(m)}-${pad2(d)}T${pad2(sh)}:${pad2(sm)}:00.000Z`,
          end: `${ye}-${pad2(me)}-${pad2(de)}T${pad2(eh)}:${pad2(em)}:00.000Z`,
        })
      }
    }

    const addInterval = (d: Date) => {
      const nd = new Date(d)
      if (type === "weekly") nd.setDate(nd.getDate() + 7)
      else if (type === "monthly") {
        nd.setMonth(nd.getMonth() + 1)
      } else {
        nd.setMonth(nd.getMonth() + 2)
      }
      return nd
    }

    // always include the first date (the selected one)
    pushOccurrence(cur)
    let guard = 0
    while (guard++ < 200) {
      cur = addInterval(cur)
      if (cur > until) break
      pushOccurrence(cur)
    }

    return occurrences
  }

  const parseDateOnly = (s?: string | null) => {
    if (!s) return null
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(s)
    if (iso) {
      const [y, m, d] = s.split("-").map((v) => Number.parseInt(v, 10))
      return { y, m, d }
    }
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (m) {
      const a = Number.parseInt(m[1], 10),
        b = Number.parseInt(m[2], 10),
        y = Number.parseInt(m[3], 10)
      // if first part > 12 assume DD/MM/YYYY else MM/DD/YYYY
      if (a > 12) return { y, m: b, d: a }
      return { y, m: a, d: b }
    }
    return null
  }

  const pad2 = (n: number) => String(n).padStart(2, "0")
  const composeISOZ = (dateStr: string, timeStr?: string) => {
    const parts = parseDateOnly(dateStr)
    let y: number, m: number, d: number
    if (parts) {
      y = parts.y
      m = parts.m
      d = parts.d
    } else {
      const dt = new Date(dateStr)
      y = dt.getFullYear()
      m = dt.getMonth() + 1
      d = dt.getDate()
    }
    const [hh, mm] = (timeStr || "00:00").split(":").map((v) => Number.parseInt(v || "0", 10))
    return `${y}-${pad2(m)}-${pad2(d)}T${pad2(hh)}:${pad2(mm)}:00.000Z`
  }
  const composeUTCISO = (dateStr: string, timeStr?: string) => {
    const parts = parseDateOnly(dateStr)
    const [hh, mm] = (timeStr || "00:00").split(":").map((v) => Number.parseInt(v || "0", 10))
    if (parts) {
      const ms = Date.UTC(parts.y, parts.m - 1, parts.d, hh, mm, 0, 0)
      return new Date(ms).toISOString()
    }
    // Fallback: append Z
    const dt = new Date(`${dateStr}T${timeStr || "00:00"}:00Z`)
    return dt.toISOString()
  }
  const composeLocalISO = (dateStr: string, timeStr?: string) => {
    const parts = parseDateOnly(dateStr)
    const [hh, mm] = (timeStr || "00:00").split(":").map((v) => Number.parseInt(v || "0", 10))
    if (parts) {
      const dt = new Date(parts.y, parts.m - 1, parts.d, hh, mm, 0, 0) // local time
      return dt.toISOString()
    }
    // Fallback: let Date parse, but this might be locale-dependent
    const dt = new Date(`${dateStr}T${timeStr || "00:00"}:00`)
    return dt.toISOString()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!formData.date) {
        toast({
          title: "Error",
          description: "Please select a date for the appointment.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (!formData.startTime || !formData.endTime) {
        toast({
          title: "Error",
          description: "Please select start and end times.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      let startDateTime = ""
      let endDateTime = ""

      if (formData.date && formData.startTime) {
        startDateTime = composeISOZ(formData.date, formData.startTime)
      }

      if (formData.date && formData.endTime) {
        endDateTime = composeISOZ(formData.date, formData.endTime)

        const startTime = new Date(startDateTime)
        const endTime = new Date(endDateTime)
        if (endTime <= startTime) {
          toast({
            title: "Error",
            description: "End time must be after start time.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      }

      const appointmentData = {
        title: formData.title,
        address: formData.address,
        start: startDateTime,
        end: endDateTime,
        companyId: Number.parseInt(formData.companyId),
        customerId: Number.parseInt(formData.customerId),
        teamId: formData.teamId && formData.teamId !== "none" ? Number.parseInt(formData.teamId) : null,
        professionalId:
          formData.professionalId && formData.professionalId !== "none"
            ? Number.parseInt(formData.professionalId)
            : null,
        status: Number.parseInt(formData.status),
        type: Number.parseInt(formData.type),
        notes: formData.notes,
      }

      if (recurrenceEnabled && repeatUntil) {
        const occs = buildOccurrences(formData.date, formData.date, repeatUntil, recurrenceType)
        for (const occ of occs) {
          const body = { ...appointmentData, start: occ.start, end: occ.end }
          await appointmentsApi.createAppointment(body as any)
        }
        // Close modal after all recurrences are created
        onClose()
      } else {
        // Wait for onSubmit to complete before closing
        await onSubmit(appointmentData)
        onClose()
      }
    } catch (error) {
      console.error("Error submitting appointment:", error)
      toast({
        title: "Error",
        description: "Failed to save appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string | Date | undefined) => {
    setFormData((prev) => {
      const next: any = { ...prev, [field]: value }
      if (field === "customerId") {
        const selected = customers.find((c) => c.id.toString() === String(value))
        if (selected && (!prev.title || prev.title.trim() === "")) {
          next.title = selected.name || (selected as any).customerName || ""
        }
      }
      return next
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-[#1a2234] border-[#2a3349] text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{appointment ? "Edit Appointment" : "New Appointment"}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {appointment
              ? "Update the appointment information below."
              : "Fill in the information to create a new appointment."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="bg-[#0f172a] border-[#2a3349] text-white"
                  placeholder="Enter appointment title"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Service Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                    <SelectItem value="0" className="hover:bg-[#2a3349]">
                      Residential
                    </SelectItem>
                    <SelectItem value="1" className="hover:bg-[#2a3349]">
                      Commercial
                    </SelectItem>
                    <SelectItem value="2" className="hover:bg-[#2a3349]">
                      Industrial
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
                placeholder="Enter service address"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Select
                  value={formData.companyId}
                  onValueChange={(value) => handleChange("companyId", value)}
                  disabled={loadingData}
                >
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                    <SelectValue placeholder={loadingData ? "Loading..." : "Select a company"} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white max-h-[200px]">
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()} className="hover:bg-[#2a3349]">
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="customer">Customer</Label>
                <Select
                  value={formData.customerId}
                  onValueChange={(value) => handleChange("customerId", value)}
                  disabled={loadingData}
                >
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                    <SelectValue placeholder={loadingData ? "Loading..." : "Select a customer"} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white max-h-[200px]">
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()} className="hover:bg-[#2a3349]">
                        {customer.name || customer.customerName || `Customer #${customer.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="team">Team (Optional)</Label>
                <Select
                  value={formData.teamId}
                  onValueChange={(value) => handleChange("teamId", value)}
                  disabled={loadingData}
                >
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                    <SelectValue placeholder={loadingData ? "Loading..." : "Select a team"} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white max-h-[200px]">
                    <SelectItem value="none" className="hover:bg-[#2a3349]">
                      No team
                    </SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()} className="hover:bg-[#2a3349]">
                        {team.name || `Team #${team.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="professional">Professional (Optional)</Label>
                <Select
                  value={formData.professionalId}
                  onValueChange={(value) => handleChange("professionalId", value)}
                  disabled={loadingData}
                >
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                    <SelectValue placeholder={loadingData ? "Loading..." : "Select a professional"} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white max-h-[200px]">
                    <SelectItem value="none" className="hover:bg-[#2a3349]">
                      No professional
                    </SelectItem>
                    {professionals.map((professional) => (
                      <SelectItem
                        key={professional.id}
                        value={professional.id.toString()}
                        className="hover:bg-[#2a3349]"
                      >
                        {professional.name || professional.professionalName || `Professional #${professional.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="bg-[#0f172a] border-[#2a3349] text-white"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange("startTime", e.target.value)}
                  className="bg-[#0f172a] border-[#2a3349] text-white"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange("endTime", e.target.value)}
                  className="bg-[#0f172a] border-[#2a3349] text-white"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectItem value="0" className="hover:bg-[#2a3349]">
                    Scheduled
                  </SelectItem>
                  <SelectItem value="1" className="hover:bg-[#2a3349]">
                    In Progress
                  </SelectItem>
                  <SelectItem value="2" className="hover:bg-[#2a3349]">
                    Completed
                  </SelectItem>
                  <SelectItem value="3" className="hover:bg-[#2a3349]">
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white min-h-[80px]"
                placeholder="Enter any additional notes"
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
            <Button
              type="submit"
              disabled={isLoading || loadingData}
              className="bg-[#06b6d4] hover:bg-[#0891b2] text-white"
            >
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

        <div className="mt-6 rounded-xl border border-[#2a3349] p-4">
          <h4 className="mb-3 text-sm font-medium text-gray-200">Recurrence</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <input
                id="recurrenceEnabled"
                type="checkbox"
                checked={recurrenceEnabled}
                onChange={(e) => setRecurrenceEnabled(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="recurrenceEnabled" className="text-sm text-gray-300">
                Enable recurrence
              </label>
            </div>
            <div>
              <Label htmlFor="recurrenceType">Frequency</Label>
              <Select
                value={recurrenceType}
                onValueChange={(v) => setRecurrenceType(v as any)}
                disabled={!recurrenceEnabled}
              >
                <SelectTrigger className="bg-transparent border-[#2a3349] text-white">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="bimonthly">Bimonthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="repeatUntil">Repeat until</Label>
              <Input
                id="repeatUntil"
                type="date"
                value={repeatUntil}
                onChange={(e) => setRepeatUntil(e.target.value)}
                disabled={!recurrenceEnabled}
              />
              <p className="text-xs text-gray-400 mt-1">
                We will create appointments from the selected Date, repeating until this date (inclusive).
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
