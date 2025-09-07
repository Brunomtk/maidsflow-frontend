"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCompanyMaterialsUtils } from "@/hooks/use-company-materials"
import type { Material } from "@/types/material"
import { useAuth } from "@/contexts/auth-context"

interface CompanyUseMaterialModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  material?: Material | null
  onSuccess?: () => void
}

export function CompanyUseMaterialModal({ open, onOpenChange, material, onSuccess }: CompanyUseMaterialModalProps) {
  const { user } = useAuth()
  const companyId = user?.companyId || 1
  const { useMaterial, formatQuantity } = useCompanyMaterialsUtils(companyId)

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    quantity: 1,
    reason: "",
    professionalId: undefined as number | undefined,
    appointmentId: undefined as number | undefined,
    notes: "",
  })

  // Ensure useMaterial is always called at the top level
  const materialUsageFunction = useMaterial

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!material) return

    setLoading(true)

    try {
      await materialUsageFunction({
        materialId: material.id,
        quantity: formData.quantity,
        reason: formData.reason,
        professionalId: formData.professionalId,
        appointmentId: formData.appointmentId,
        notes: formData.notes,
      })

      onSuccess?.()
    } catch (error) {
      console.error("Error using material:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        quantity: 1,
        reason: "",
        professionalId: undefined,
        appointmentId: undefined,
        notes: "",
      })
    }
  }, [open])

  if (!material) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Use Material</DialogTitle>
          <DialogDescription>Record material consumption for your appointment or task.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Material</Label>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium">{material.name}</div>
              <div className="text-sm text-muted-foreground">Available: {formatQuantity(material)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity to Use *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={material.currentStock}
              value={formData.quantity}
              onChange={(e) => handleInputChange("quantity", Number.parseInt(e.target.value) || 1)}
              required
            />
            <div className="text-xs text-muted-foreground">
              Maximum available: {material.currentStock} {material.unit}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Select value={formData.reason} onValueChange={(value) => handleInputChange("reason", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason for usage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appointment">Used in Appointment</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="damaged">Damaged/Defective</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="transfer">Transfer to Another Location</SelectItem>
                <SelectItem value="sample">Sample/Testing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="appointmentId">Related Appointment (Optional)</Label>
            <Select
              value={formData.appointmentId?.toString() || ""}
              onValueChange={(value) => handleInputChange("appointmentId", value ? Number.parseInt(value) : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select appointment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Residential Cleaning #1242</SelectItem>
                <SelectItem value="2">Office Cleaning #1243</SelectItem>
                <SelectItem value="3">Deep Cleaning #1244</SelectItem>
                <SelectItem value="4">Solar Panel Installation #1245</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="professionalId">Professional (Optional)</Label>
            <Select
              value={formData.professionalId?.toString() || ""}
              onValueChange={(value) => handleInputChange("professionalId", value ? Number.parseInt(value) : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select professional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">João Silva</SelectItem>
                <SelectItem value="2">Maria Santos</SelectItem>
                <SelectItem value="3">Pedro Oliveira</SelectItem>
                <SelectItem value="4">Ana Costa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Additional notes about this usage"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || formData.quantity > material.currentStock}>
              {loading ? "Recording..." : "Record Usage"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
