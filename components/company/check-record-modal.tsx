"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CheckRecord {
  id: number
  professionalId: number
  professionalName: string
  companyId: number
  customerId: number
  customerName: string
  appointmentId: number
  address: string
  teamId: number | null
  teamName: string | null
  checkInTime: string | null
  checkOutTime: string | null
  status: number
  serviceType: string
  notes: string
  createdDate: string
  updatedDate: string
}

interface CheckRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  record?: CheckRecord | null
}

interface Professional {
  id: number
  name: string
}

interface Customer {
  id: number
  name: string
}

interface Team {
  id: number
  name: string
}

interface Appointment {
  id: number
  title: string
  address: string
}

export function CheckRecordModal({ isOpen, onClose, onSuccess, record }: CheckRecordModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])

  const [formData, setFormData] = useState({
    professionalId: "",
    customerId: "",
    appointmentId: "",
    teamId: "",
    serviceType: "",
    notes: "",
  })

  useEffect(() => {
    if (isOpen && user?.companyId) {
      loadDropdownData()
    }
  }, [isOpen, user?.companyId])

  useEffect(() => {
    if (record) {
      setFormData({
        professionalId: record.professionalId.toString(),
        customerId: record.customerId.toString(),
        appointmentId: record.appointmentId.toString(),
        teamId: record.teamId?.toString() || "",
        serviceType: record.serviceType,
        notes: record.notes,
      })
    } else {
      setFormData({
        professionalId: "0", // Updated default value
        customerId: "0", // Updated default value
        appointmentId: "0", // Updated default value
        teamId: "",
        serviceType: "",
        notes: "",
      })
    }
  }, [record])

  const loadDropdownData = async () => {
    if (!user?.companyId || !user?.token) return

    try {
      const [profResponse, custResponse, teamResponse, apptResponse] = await Promise.all([
        fetch(`/api/Professional/paged?CompanyId=${user.companyId}&PageSize=100`, {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
        fetch(`/api/Customer?CompanyId=${user.companyId}&PageSize=100`, {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
        fetch(`/api/Team/paged?CompanyId=${user.companyId}&PageSize=100`, {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
        fetch(`/api/Appointment?CompanyId=${user.companyId}&PageSize=100`, {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
      ])

      const [profData, custData, teamData, apptData] = await Promise.all([
        profResponse.json(),
        custResponse.json(),
        teamResponse.json(),
        apptResponse.json(),
      ])

      setProfessionals(profData.results || [])
      setCustomers(custData.results || [])
      setTeams(teamData.results || [])
      setAppointments(apptData.results || [])
    } catch (error) {
      console.error("Error loading dropdown data:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.companyId || !user?.token) return

    setLoading(true)
    try {
      const selectedProfessional = professionals.find((p) => p.id.toString() === formData.professionalId)
      const selectedCustomer = customers.find((c) => c.id.toString() === formData.customerId)
      const selectedTeam = teams.find((t) => t.id.toString() === formData.teamId)
      const selectedAppointment = appointments.find((a) => a.id.toString() === formData.appointmentId)

      const payload = {
        professionalId: Number.parseInt(formData.professionalId),
        professionalName: selectedProfessional?.name || "",
        companyId: user.companyId,
        customerId: Number.parseInt(formData.customerId),
        customerName: selectedCustomer?.name || "",
        appointmentId: Number.parseInt(formData.appointmentId),
        address: selectedAppointment?.address || "",
        teamId: formData.teamId ? Number.parseInt(formData.teamId) : null,
        teamName: selectedTeam?.name || null,
        serviceType: formData.serviceType,
        notes: formData.notes,
      }

      const url = record ? `/api/CheckRecord/${record.id}` : "/api/CheckRecord"
      const method = record ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        onSuccess()
      } else {
        throw new Error("Failed to save check record")
      }
    } catch (error) {
      console.error("Error saving check record:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{record ? "Edit Check Record" : "Create Check Record"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="professional">Professional *</Label>
              <Select
                value={formData.professionalId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, professionalId: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select professional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((professional) => (
                    <SelectItem key={professional.id} value={professional.id.toString()}>
                      {professional.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="customer">Customer *</Label>
              <Select
                value={formData.customerId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, customerId: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="appointment">Appointment *</Label>
              <Select
                value={formData.appointmentId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, appointmentId: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select appointment" />
                </SelectTrigger>
                <SelectContent>
                  {appointments.map((appointment) => (
                    <SelectItem key={appointment.id} value={appointment.id.toString()}>
                      {appointment.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="team">Team (Optional)</Label>
              <Select
                value={formData.teamId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, teamId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No team</SelectItem> // Updated default value
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="serviceType">Service Type</Label>
            <Select
              value={formData.serviceType}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, serviceType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Enter any additional notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : record ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
