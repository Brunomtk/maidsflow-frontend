"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { usePlansContext } from "@/contexts/plans-context" // Changed to usePlansContext
import type { Plan, PlanFormData } from "@/types/plan"

interface PlanModalProps {
  isOpen: boolean
  onClose: () => void
  planToEdit?: Plan | null
}

export function PlanModal({ isOpen, onClose, planToEdit }: PlanModalProps) {
  const { addPlan, editPlan, loading } = usePlansContext() // Changed to usePlansContext
  const [formData, setFormData] = useState<PlanFormData>({
    name: "",
    price: 0,
    features: [],
    professionalsLimit: 1,
    teamsLimit: 1,
    customersLimit: 10,
    appointmentsLimit: 100,
    duration: 30,
    status: 1,
  })
  const [newFeature, setNewFeature] = useState("")

  useEffect(() => {
    if (planToEdit) {
      setFormData({
        name: planToEdit.name,
        price: planToEdit.price,
        features: planToEdit.features,
        professionalsLimit: planToEdit.professionalsLimit,
        teamsLimit: planToEdit.teamsLimit,
        customersLimit: planToEdit.customersLimit,
        appointmentsLimit: planToEdit.appointmentsLimit,
        duration: planToEdit.duration,
        status: planToEdit.status,
      })
    } else {
      setFormData({
        name: "",
        price: 0,
        features: [],
        professionalsLimit: 1,
        teamsLimit: 1,
        customersLimit: 10,
        appointmentsLimit: 100,
        duration: 30,
        status: 1,
      })
    }
  }, [planToEdit, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let success = false
    if (planToEdit) {
      success = await editPlan(planToEdit.id.toString(), formData)
    } else {
      success = await addPlan(formData)
    }

    if (success) {
      onClose()
    }
  }

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }))
      setNewFeature("")
    }
  }

  const removeFeature = (featureToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((feature) => feature !== featureToRemove),
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addFeature()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{planToEdit ? "Edit Plan" : "Create New Plan"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter plan name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days)</Label>
              <Select
                value={formData.duration.toString()}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, duration: Number.parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days (Monthly)</SelectItem>
                  <SelectItem value="365">365 days (Annual)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status.toString()}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: Number.parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="0">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="professionalsLimit">Professionals Limit</Label>
              <Input
                id="professionalsLimit"
                type="number"
                min="1"
                value={formData.professionalsLimit}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, professionalsLimit: Number.parseInt(e.target.value) || 1 }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamsLimit">Teams Limit</Label>
              <Input
                id="teamsLimit"
                type="number"
                min="1"
                value={formData.teamsLimit}
                onChange={(e) => setFormData((prev) => ({ ...prev, teamsLimit: Number.parseInt(e.target.value) || 1 }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customersLimit">Customers Limit</Label>
              <Input
                id="customersLimit"
                type="number"
                min="1"
                value={formData.customersLimit}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, customersLimit: Number.parseInt(e.target.value) || 1 }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointmentsLimit">Appointments Limit</Label>
              <Input
                id="appointmentsLimit"
                type="number"
                min="1"
                value={formData.appointmentsLimit}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, appointmentsLimit: Number.parseInt(e.target.value) || 1 }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Features</Label>
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add a feature"
                onKeyPress={handleKeyPress}
              />
              <Button type="button" onClick={addFeature} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {feature}
                  <button type="button" onClick={() => removeFeature(feature)} className="ml-1 hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : planToEdit ? "Update Plan" : "Create Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
