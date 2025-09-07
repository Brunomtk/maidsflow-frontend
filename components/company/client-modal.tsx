"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { MapPin } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { customersApi } from "@/lib/api/customers"
import type { CreateCustomerRequest, UpdateCustomerRequest } from "@/types/customer"

interface Address {
  id?: number
  street: string
  city: string
  state: string
  zipCode: string
  isDefault: boolean
}

interface Client {
  id?: number
  name: string
  type: "individual" | "business"
  document: string
  email: string
  phone: string
  addresses: Address[]
  appointments?: number
  totalSpent?: number
  lastService?: string | null
  status: "active" | "inactive"
  createdAt?: string
  notes?: string
}

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  client?: Client | null
  isEditing?: boolean
  onSaved?: () => void
}

export default function ClientModal({ isOpen, onClose, client, isEditing = false, onSaved }: ClientModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    ssn: "",
    ticket: undefined as unknown as number | undefined,
    frequency: "",
    paymentMethod: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    observations: "",
    status: 1,
  name: "",
    type: "individual" as "individual" | "business",
    email: "",
    phone: "",
    address: "",
    status: true,
    notes: "",
  })

  // Initialize form data
  useEffect(() => {
    if (client && isEditing) {
      setFormData({
        name: client.name || "",
        type: client.type || "individual",
        document: client.document || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.addresses?.[0]?.street || "",
        status: client.status === "active",
        notes: client.notes || "",
      })
    } else {
      // Reset form for new client
      setFormData({
        name: "",
        type: "individual",
        email: "",
        phone: "",
        address: "",
        status: true,
        notes: "",
      })
    }
  }, [client, isEditing, isOpen])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive",
      })
      return false
    }

    if (!formData.document.trim()) {
      toast({
        title: "Validation Error",
        description: "SSN is required",
        variant: "destructive",
      })
      return false
    }

    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive",
      })
      return false
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Validation Error",
        description: "Phone is required",
        variant: "destructive",
      })
      return false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return
    if (!user?.companyId) {
      toast({
        title: "Error",
        description: "Company information not found",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      if (isEditing && client) {
        // Update existing client
        const updateData: UpdateCustomerRequest = {
          id: client.id!.toString(),
          name: formData.name,
          document: formData.document,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          status: formData.status ? 1 : 0,
          companyId: user.companyId.toString(),
        }

        await customersApi.update(updateData)

        toast({
          title: "Success",
          description: "Client updated successfully",
        })
      } else {
        // Create new client
        const createData: CreateCustomerRequest = {
          name: formData.name,
          document: formData.document,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          status: formData.status ? 1 : 0,
          companyId: user.companyId.toString(),
        }

        await customersApi.create(createData)

        toast({
          title: "Success",
          description: "Client created successfully",
        })
      }

      onSaved?.()
      onClose()
    } catch (error) {
      console.error("Error saving client:", error)
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} client. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a2234] text-white border-[#2a3349] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {isEditing ? "Edit Client" : "Add New Client"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-[#2a3349] border-0 text-white placeholder:text-gray-500 focus-visible:ring-[#06b6d4]"
                placeholder="Enter client name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-white">
                Client Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: "individual" | "business") => handleInputChange("type", value)}
              >
                <SelectTrigger className="bg-[#2a3349] border-0 text-white focus:ring-[#06b6d4]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2a3349] border-[#3a4359] text-white">
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ssn" className="text-gray-300">
                SSN (optional)
              </Label>
              <Input
                id="ssn"
                value={formData.ssn}
                onChange={(e) => handleChange("ssn", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket" className="text-gray-300">
                Ticket (optional)
              </Label>
              <Input
                id="ticket"
                type="number"
                step="0.01"
                value={formData.ticket ?? ""}
                onChange={(e) => handleChange("ticket", e.target.value === "" ? undefined : Number(e.target.value))}
                className="bg-[#0f172a] border-[#2a3349] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-gray-300">
                Frequency (optional)
              </Label>
              <Input
                id="frequency"
                value={formData.frequency}
                onChange={(e) => handleChange("frequency", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-gray-300">
                Payment Method (optional)
              </Label>
              <Input
                id="paymentMethod"
                value={formData.paymentMethod}
                onChange={(e) => handleChange("paymentMethod", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
              />
            </div>
    

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">
                Phone *
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="bg-[#2a3349] border-0 text-white placeholder:text-gray-500 focus-visible:ring-[#06b6d4]"
                placeholder="(00) 00000-0000"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="bg-[#2a3349] border-0 text-white placeholder:text-gray-500 focus-visible:ring-[#06b6d4]"
              placeholder="client@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-white flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-[#06b6d4]" />
              Address
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="bg-[#2a3349] border-0 text-white placeholder:text-gray-500 focus-visible:ring-[#06b6d4]"
              placeholder="Street, City, State, ZIP"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-white">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="bg-[#2a3349] border-0 text-white placeholder:text-gray-500 focus-visible:ring-[#06b6d4] min-h-[80px]"
              placeholder="Additional notes about the client..."
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#2a3349] rounded-lg">
            <div>
              <Label htmlFor="status" className="text-white font-medium">
                Active Status
              </Label>
              <p className="text-sm text-gray-400">
                {formData.status ? "Client is active and can receive services" : "Client is inactive"}
              </p>
            </div>
            <Switch
              id="status"
              checked={formData.status}
              onCheckedChange={(checked) => handleInputChange("status", checked)}
              className="data-[state=checked]:bg-[#06b6d4]"
            />
          </div>

          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-[#2a3349] text-white hover:bg-[#2a3349] bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#06b6d4] hover:bg-[#0891b2] text-white">
              {loading ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Client" : "Create Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
