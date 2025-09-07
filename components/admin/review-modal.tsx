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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Review, Customer, Professional, Company, Team, Appointment } from "@/types/review"
import { fetchApi } from "@/lib/api/utils"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  review?: Review | null
  mode: "create" | "edit"
}

export function ReviewModal({ isOpen, onClose, onSubmit, review, mode }: ReviewModalProps) {
  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    professionalId: "",
    professionalName: "",
    teamId: "",
    teamName: "",
    companyId: "",
    companyName: "",
    appointmentId: "",
    rating: 5,
    comment: "",
    date: new Date().toISOString().split("T")[0],
    serviceType: "",
    status: 1,
    response: "",
    responseDate: null,
  })

  const [customers, setCustomers] = useState<Customer[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load dropdown data
  const loadData = async () => {
    setIsLoadingData(true)
    try {
      console.log("Loading dropdown data...")

      // Load all dropdown data in parallel using the correct endpoints
      const [customersRes, professionalsRes, companiesRes, teamsRes, appointmentsRes] = await Promise.allSettled([
        fetchApi("/Customer?PageNumber=1&PageSize=100"),
        fetchApi("/Professional"),
        fetchApi("/Companies"),
        fetchApi("/Team?page=1&pageSize=100&status=all"),
        fetchApi("/Appointment?page=1&pageSize=100"),
      ])

      // Process customers
      if (customersRes.status === "fulfilled" && customersRes.value) {
        console.log("Customers response:", customersRes.value)
        const customersData = customersRes.value.data || customersRes.value.results || customersRes.value
        setCustomers(Array.isArray(customersData) ? customersData : [])
      } else {
        console.error("Failed to load customers:", customersRes)
        setCustomers([])
      }

      // Process professionals
      if (professionalsRes.status === "fulfilled" && professionalsRes.value) {
        console.log("Professionals response:", professionalsRes.value)
        const professionalsData =
          professionalsRes.value.data || professionalsRes.value.results || professionalsRes.value
        setProfessionals(Array.isArray(professionalsData) ? professionalsData : [])
      } else {
        console.error("Failed to load professionals:", professionalsRes)
        setProfessionals([])
      }

      // Process companies
      if (companiesRes.status === "fulfilled" && companiesRes.value) {
        console.log("Companies response:", companiesRes.value)
        const companiesData = companiesRes.value.data || companiesRes.value.results || companiesRes.value
        setCompanies(Array.isArray(companiesData) ? companiesData : [])
      } else {
        console.error("Failed to load companies:", companiesRes)
        setCompanies([])
      }

      // Process teams
      if (teamsRes.status === "fulfilled" && teamsRes.value) {
        console.log("Teams response:", teamsRes.value)
        const teamsData = teamsRes.value.data || teamsRes.value.results || teamsRes.value
        setTeams(Array.isArray(teamsData) ? teamsData : [])
      } else {
        console.error("Failed to load teams:", teamsRes)
        setTeams([])
      }

      // Process appointments
      if (appointmentsRes.status === "fulfilled" && appointmentsRes.value) {
        console.log("Appointments response:", appointmentsRes.value)
        const appointmentsData = appointmentsRes.value.data || appointmentsRes.value.results || appointmentsRes.value
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : [])
      } else {
        console.error("Failed to load appointments:", appointmentsRes)
        setAppointments([])
      }
    } catch (error) {
      console.error("Error loading dropdown data:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  // Set form data when review changes
  useEffect(() => {
    if (review && mode === "edit") {
      setFormData({
        customerId: review.customerId.toString(),
        customerName: review.customerName,
        professionalId: review.professionalId.toString(),
        professionalName: review.professionalName,
        teamId: review.teamId?.toString() || "",
        teamName: review.teamName || "",
        companyId: review.companyId.toString(),
        companyName: review.companyName,
        appointmentId: review.appointmentId?.toString() || "",
        rating: review.rating,
        comment: review.comment,
        date: review.date.split("T")[0],
        serviceType: review.serviceType,
        status: review.status,
        response: review.response || "",
        responseDate: review.response ? new Date(review.responseDate).toISOString() : null,
      })
    } else if (mode === "create") {
      setFormData({
        customerId: "",
        customerName: "",
        professionalId: "",
        professionalName: "",
        teamId: "",
        teamName: "",
        companyId: "",
        companyName: "",
        appointmentId: "",
        rating: 5,
        comment: "",
        date: new Date().toISOString().split("T")[0],
        serviceType: "",
        status: 1,
        response: "",
        responseDate: null,
      })
    }
  }, [review, mode])

  const handleAppointmentChange = (appointmentId: string) => {
    const appointment = appointments.find((a) => a.id.toString() === appointmentId)
    if (appointment) {
      console.log("Selected appointment:", appointment)
      setFormData((prev) => ({
        ...prev,
        appointmentId,
        customerId: appointment.customerId?.toString() || "",
        customerName: appointment.customerName || "",
        professionalId: appointment.professionalId?.toString() || "",
        professionalName: appointment.professionalName || "",
        companyId: appointment.companyId?.toString() || "",
        companyName: appointment.companyName || "",
        teamId: appointment.teamId?.toString() || "",
        teamName: appointment.teamName || "",
        serviceType: appointment.serviceType || "",
        date: appointment.startDate ? appointment.startDate.split("T")[0] : new Date().toISOString().split("T")[0],
      }))
    }
  }

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id.toString() === customerId)
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        customerId,
        customerName: customer.name,
      }))
    }
  }

  const handleProfessionalChange = (professionalId: string) => {
    const professional = professionals.find((p) => p.id.toString() === professionalId)
    if (professional) {
      setFormData((prev) => ({
        ...prev,
        professionalId,
        professionalName: professional.name,
      }))
    }
  }

  const handleCompanyChange = (companyId: string) => {
    const company = companies.find((c) => c.id.toString() === companyId)
    if (company) {
      setFormData((prev) => ({
        ...prev,
        companyId,
        companyName: company.name,
      }))
    }
  }

  const handleTeamChange = (teamId: string) => {
    const team = teams.find((t) => t.id.toString() === teamId)
    if (team) {
      setFormData((prev) => ({
        ...prev,
        teamId,
        teamName: team.name,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const submitData = {
        customerId: formData.customerId,
        customerName: formData.customerName,
        professionalId: formData.professionalId,
        professionalName: formData.professionalName,
        teamId: formData.teamId || "",
        teamName: formData.teamName,
        companyId: formData.companyId,
        companyName: formData.companyName,
        appointmentId: formData.appointmentId || "",
        rating: formData.rating,
        comment: formData.comment,
        date: new Date(formData.date).toISOString(),
        serviceType: formData.serviceType,
        status: formData.status,
        response: formData.response || "",
        responseDate: formData.response ? new Date().toISOString() : null,
      }

      console.log("Submitting review data:", submitData)
      await onSubmit(submitData)
      onClose()
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (rating: number, onRatingChange: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={cn("p-1 rounded transition-colors", star <= rating ? "text-yellow-400" : "text-gray-300")}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-500">{rating} out of 5</span>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1a2234] border-[#2a3349] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">{mode === "create" ? "Create New Review" : "Edit Review"}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {mode === "create" ? "Add a new review to the system." : "Update the review information."}
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#06b6d4]" />
            <span className="ml-2 text-gray-400">Loading data...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Appointment Selection */}
              <div className="col-span-2">
                <Label htmlFor="appointmentId" className="text-white">
                  Appointment
                </Label>
                <Select value={formData.appointmentId} onValueChange={handleAppointmentChange}>
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                    <SelectValue placeholder="Select appointment (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                    {appointments.map((appointment) => (
                      <SelectItem key={appointment.id} value={appointment.id.toString()} className="hover:bg-[#2a3349]">
                        #{appointment.id} - {appointment.customerName} - {appointment.professionalName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Customer */}
              <div>
                <Label htmlFor="customerId" className="text-white">
                  Customer *
                </Label>
                <Select value={formData.customerId} onValueChange={handleCustomerChange}>
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

              {/* Professional */}
              <div>
                <Label htmlFor="professionalId" className="text-white">
                  Professional *
                </Label>
                <Select value={formData.professionalId} onValueChange={handleProfessionalChange}>
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                    <SelectValue placeholder="Select professional" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                    {professionals.map((professional) => (
                      <SelectItem
                        key={professional.id}
                        value={professional.id.toString()}
                        className="hover:bg-[#2a3349]"
                      >
                        {professional.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Company */}
              <div>
                <Label htmlFor="companyId" className="text-white">
                  Company *
                </Label>
                <Select value={formData.companyId} onValueChange={handleCompanyChange}>
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()} className="hover:bg-[#2a3349]">
                        {company.name}
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
                <Select value={formData.teamId} onValueChange={handleTeamChange}>
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                    <SelectValue placeholder="Select team (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()} className="hover:bg-[#2a3349]">
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Type */}
              <div>
                <Label htmlFor="serviceType" className="text-white">
                  Service Type *
                </Label>
                <Input
                  id="serviceType"
                  value={formData.serviceType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, serviceType: e.target.value }))}
                  placeholder="Enter service type"
                  className="bg-[#0f172a] border-[#2a3349] text-white"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <Label htmlFor="date" className="text-white">
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  className="bg-[#0f172a] border-[#2a3349] text-white"
                  required
                />
              </div>

              {/* Rating */}
              <div className="col-span-2">
                <Label className="text-white">Rating *</Label>
                <div className="mt-2">
                  {renderStars(formData.rating, (rating) => setFormData((prev) => ({ ...prev, rating })))}
                </div>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status" className="text-white">
                  Status *
                </Label>
                <Select
                  value={formData.status.toString()}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: Number.parseInt(value) }))}
                >
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                    <SelectItem value="0" className="hover:bg-[#2a3349]">
                      Pending
                    </SelectItem>
                    <SelectItem value="1" className="hover:bg-[#2a3349]">
                      Published
                    </SelectItem>
                    <SelectItem value="2" className="hover:bg-[#2a3349]">
                      Rejected
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Comment */}
              <div className="col-span-2">
                <Label htmlFor="comment" className="text-white">
                  Comment *
                </Label>
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
                  placeholder="Enter review comment"
                  className="bg-[#0f172a] border-[#2a3349] text-white"
                  rows={3}
                  required
                />
              </div>

              {/* Response */}
              <div className="col-span-2">
                <Label htmlFor="response" className="text-white">
                  Response
                </Label>
                <Textarea
                  id="response"
                  value={formData.response}
                  onChange={(e) => setFormData((prev) => ({ ...prev, response: e.target.value }))}
                  placeholder="Enter response to review (optional)"
                  className="bg-[#0f172a] border-[#2a3349] text-white"
                  rows={2}
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
                disabled={isSubmitting || !formData.customerId || !formData.professionalId || !formData.comment}
                className="bg-[#06b6d4] hover:bg-[#0891b2] text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "create" ? "Creating..." : "Updating..."}
                  </>
                ) : mode === "create" ? (
                  "Create Review"
                ) : (
                  "Update Review"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
