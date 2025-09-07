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
import { Loader2 } from "lucide-react"
import type { Company, Plan } from "@/types"
import { fetchApi } from "@/lib/api/utils"

interface CompanyModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  company?: Company | null
}

export function CompanyModal({ isOpen, onClose, onSubmit, company }: CompanyModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPlans, setIsLoadingPlans] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    planId: "",
    responsible: "",
    email: "",
    phone: "",
  })

  // Load plans when modal opens
  useEffect(() => {
    if (isOpen) {
      loadPlans()
    }
  }, [isOpen])

  // Set form data when company changes
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        cnpj: company.cnpj || "",
        planId: company.planId?.toString() || "",
        responsible: company.responsible || "",
        email: company.email || "",
        phone: company.phone || "",
      })
    } else {
      setFormData({
        name: "",
        cnpj: "",
        planId: "",
        responsible: "",
        email: "",
        phone: "",
      })
    }
  }, [company])

  const loadPlans = async () => {
    setIsLoadingPlans(true)
    try {
      const response = await fetchApi("/Plan")
      if (Array.isArray(response)) {
        setPlans(response)
      } else {
        setPlans([])
      }
    } catch (error) {
      console.error("Failed to load plans:", error)
      setPlans([])
    } finally {
      setIsLoadingPlans(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit({
        ...formData,
        planId: Number.parseInt(formData.planId),
      })
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#1a2234] border-[#2a3349] text-white">
        <DialogHeader>
          <DialogTitle>{company ? "Edit Company" : "New Company"}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {company ? "Update the company information below." : "Fill in the information to register a new company."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => handleChange("cnpj", e.target.value)}
                placeholder="00.000.000/0000-00"
                className="bg-[#0f172a] border-[#2a3349] text-white"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="plan">Plan</Label>
              {isLoadingPlans ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-400">Loading plans...</span>
                </div>
              ) : (
                <Select value={formData.planId} onValueChange={(value) => handleChange("planId", value)}>
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id.toString()} className="hover:bg-[#2a3349]">
                        {plan.name} - R$ {plan.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="responsible">Responsible</Label>
              <Input
                id="responsible"
                value={formData.responsible}
                onChange={(e) => handleChange("responsible", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="(00) 00000-0000"
                className="bg-[#0f172a] border-[#2a3349] text-white"
                required
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
