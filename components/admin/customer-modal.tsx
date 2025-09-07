"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useCustomers } from "@/hooks/use-customers"
import { useCompanies } from "@/hooks/use-companies"
import type { Customer } from "@/types/customer"

interface CustomerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer | null
}

export function CustomerModal({ open, onOpenChange, customer }: CustomerModalProps) {
  const { createCustomer, updateCustomer, state } = useCustomers()
  const { companies, fetchCompanies } = useCompanies()

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
    companyId: 0,
    status: 1,
  name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    observations: "",
    companyId: 0,
    status: 1,
  })

  // Load companies when modal opens
  useEffect(() => {
    if (open) {
      fetchCompanies()
    }
  }, [open, fetchCompanies])

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        
        ssn: customer.ssn ?? "",
        ticket: customer.ticket ?? undefined,
        frequency: customer.frequency ?? "",
        paymentMethod: customer.paymentMethod ?? "",

        email: customer.email,
        
        phone: customer.phone || "",
        address: customer.address || "",
        city: customer.city || "",
        state: customer.state || "",
        observations: customer.observations || "",
        companyId: customer.companyId,
        status: customer.status,
      })
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        observations: "",
        companyId: 0,
        status: 1,
      })
    }
  }, [customer, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (customer) {
        await updateCustomer(customer.id, formData)
      } else {
        await createCustomer(formData)
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Error saving customer:", error)
    }
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a2234] border-[#2a3349] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">{customer ? "Edit Customer" : "New Customer"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
                Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
                required
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
                onChange={(e) => handleChange("email", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
                required
              />
            </div>

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
              <Label htmlFor="phone" className="text-gray-300">
                Phone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-gray-300">
                City
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-gray-300">
                State
              </Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-gray-300">
              Address
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="bg-[#0f172a] border-[#2a3349] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyId" className="text-gray-300">
              Company *
            </Label>
            <select
              id="companyId"
              value={formData.companyId}
              onChange={(e) => handleChange("companyId", Number(e.target.value))}
              className="flex h-10 w-full rounded-md border border-[#2a3349] bg-[#0f172a] px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value={0}>Select a company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations" className="text-gray-300">
              Observations
            </Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => handleChange("observations", e.target.value)}
              className="bg-[#0f172a] border-[#2a3349] text-white"
              rows={3}
            />
          </div>

          {customer && (
            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-300">
                Status
              </Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleChange("status", Number(e.target.value))}
                className="flex h-10 w-full rounded-md border border-[#2a3349] bg-[#0f172a] px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-[#0f172a] border-[#2a3349] text-white hover:bg-[#2a3349]"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={state.loading} className="bg-[#06b6d4] hover:bg-[#0891b2]">
              {state.loading ? "Saving..." : customer ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
