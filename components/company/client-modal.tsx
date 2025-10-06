"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import GooglePlacesAutocomplete from "@/components/common/google-places-autocomplete"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { customersApi } from "@/lib/api/customers"
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from "@/types/customer"

type ClientForm = {
  firstName: string
  lastName: string
  email: string
  ticket?: number
  frequency?: string
  paymentMethod?: string
  countryCode: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipcode?: string
  serviceType?: string
  observations?: string
  status: boolean
}

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  client?: Customer | null
  isEditing?: boolean
  onSaved?: () => void
}

export default function ClientModal({ isOpen, onClose, client, isEditing = false, onSaved }: ClientModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<ClientForm>({
    firstName: "",
    lastName: "",
    email: "",
    ticket: undefined,
    frequency: "",
    paymentMethod: "",
    countryCode: "+1",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipcode: "",
    serviceType: "",
    observations: "",
    status: true,
  })

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}`
  }

  useEffect(() => {
    if (client && isEditing) {
      const nameParts = (client.name ?? "").split(" ")
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || ""

      setFormData({
        firstName,
        lastName,
        email: client.email ?? "",
        ticket: client.ticket,
        frequency: client.frequency ?? "",
        paymentMethod: client.paymentMethod ?? "",
        countryCode: "+1",
        phone: client.phone ?? "",
        address: client.address ?? "",
        city: client.city ?? "",
        state: client.state ?? "",
        zipcode: "",
        serviceType: "",
        observations: client.observations ?? "",
        status:
          typeof (client as any).status === "number"
            ? (client as any).status === 1
            : String((client as any).status ?? "1") === "1" ||
              String((client as any).status ?? "").toLowerCase() === "active",
      })
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        ticket: undefined,
        frequency: "",
        paymentMethod: "",
        countryCode: "+1",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipcode: "",
        serviceType: "",
        observations: "",
        status: true,
      })
    }
  }, [client, isEditing, isOpen])

  const handleInputChange = (field: keyof ClientForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    setFormData((prev) => ({ ...prev, phone: formatted }))
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast({ title: "Validation error", description: "First name is required.", variant: "destructive" })
      return false
    }
    if (!formData.email?.trim()) {
      toast({ title: "Validation error", description: "Email is required.", variant: "destructive" })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    if (!user?.companyId) {
      toast({ title: "Error", description: "Company information not found.", variant: "destructive" })
      return
    }
    try {
      setLoading(true)
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim()

      if (isEditing && client) {
        const updateData: UpdateCustomerRequest = {
          id: Number(client.id),
          name: fullName,
          ticket: typeof formData.ticket === "number" ? formData.ticket : undefined,
          frequency: formData.frequency?.trim() || "",
          paymentMethod: formData.paymentMethod?.trim() || "",
          email: formData.email.trim(),
          phone: formData.phone?.trim() || "",
          address: formData.address?.trim() || "",
          city: formData.city?.trim() || "",
          state: formData.state?.trim() || "",
          observations: formData.observations?.trim() || "",
          status: formData.status ? 1 : 0,
        }
        await customersApi.update(updateData)
        toast({ title: "Success", description: "Client updated successfully." })
      } else {
        const createData: CreateCustomerRequest = {
          name: fullName,
          ticket: typeof formData.ticket === "number" ? formData.ticket : undefined,
          frequency: formData.frequency?.trim() || "",
          paymentMethod: formData.paymentMethod?.trim() || "",
          email: formData.email.trim(),
          phone: formData.phone?.trim() || "",
          address: formData.address?.trim() || "",
          city: formData.city?.trim() || "",
          state: formData.state?.trim() || "",
          observations: formData.observations?.trim() || "",
          companyId: Number(user.companyId),
        }
        await customersApi.create(createData)
        toast({ title: "Success", description: "Client created successfully." })
      }
      onSaved?.()
      onClose()
    } catch (err) {
      console.error("Error saving client:", err)
      toast({ title: "Error", description: "Failed to save client. Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#1a2234] border-[#2a3349] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">{isEditing ? "Edit Client" : "New Client"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-300">
                First Name *
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-300">
                Last Name
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-300">
                Phone
              </Label>
              <div className="flex gap-2">
                <Select value={formData.countryCode} onValueChange={(value) => handleInputChange("countryCode", value)}>
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                    <SelectItem value="+1">+1 (US)</SelectItem>
                    <SelectItem value="+55">+55 (BR)</SelectItem>
                    <SelectItem value="+44">+44 (UK)</SelectItem>
                    <SelectItem value="+52">+52 (MX)</SelectItem>
                    <SelectItem value="+34">+34 (ES)</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  value={formData.phone ?? ""}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="bg-[#0f172a] border-[#2a3349] text-white flex-1"
                  placeholder="xxx-xxxx"
                  maxLength={8}
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="text-gray-300">
                Address
              </Label>
              <GooglePlacesAutocomplete
                value={(formData.address ?? "") as string}
                onChange={(v) => handleInputChange("address", v)}
                onSelect={(sel) => {
                  handleInputChange("address", sel.address)
                  if (sel.city) handleInputChange("city", sel.city)
                  if (sel.state) handleInputChange("state", sel.state)
                }}
                country="br"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-gray-300">
                City
              </Label>
              <Input
                id="city"
                value={formData.city ?? ""}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-gray-300">
                State
              </Label>
              <Input
                id="state"
                value={formData.state ?? ""}
                onChange={(e) => handleInputChange("state", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipcode" className="text-gray-300">
                Zipcode
              </Label>
              <Input
                id="zipcode"
                value={formData.zipcode ?? ""}
                onChange={(e) => handleInputChange("zipcode", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
                placeholder="12345"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket" className="text-gray-300">
                Ticket (R$)
              </Label>
              <Input
                id="ticket"
                type="number"
                inputMode="numeric"
                value={formData.ticket ?? ""}
                onChange={(e) => handleInputChange("ticket", e.target.value ? Number(e.target.value) : undefined)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-gray-300">
                Frequency
              </Label>
              <Select value={formData.frequency ?? ""} onValueChange={(value) => handleInputChange("frequency", value)}>
                <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-gray-300">
                Payment Method
              </Label>
              <Select
                value={formData.paymentMethod ?? ""}
                onValueChange={(value) => handleInputChange("paymentMethod", value)}
              >
                <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="venmo">Venmo</SelectItem>
                  <SelectItem value="zelle">Zelle</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceType" className="text-gray-300">
                Service Type
              </Label>
              <Select
                value={formData.serviceType ?? ""}
                onValueChange={(value) => handleInputChange("serviceType", value)}
              >
                <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="observations" className="text-gray-300">
                Observations
              </Label>
              <Textarea
                id="observations"
                value={formData.observations ?? ""}
                onChange={(e) => handleInputChange("observations", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white min-h-[80px]"
                placeholder="Additional notes about the client..."
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="status"
                checked={formData.status}
                onCheckedChange={(checked) => handleInputChange("status", checked)}
              />
              <Label htmlFor="status" className="text-gray-300">
                Active
              </Label>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              className="bg-transparent border-[#2a3349] text-white"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
              {loading ? (isEditing ? "Saving..." : "Creating...") : isEditing ? "Save Changes" : "Create Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
