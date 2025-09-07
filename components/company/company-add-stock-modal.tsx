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

interface CompanyAddStockModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  material?: Material | null
  onSuccess?: () => void
}

export function CompanyAddStockModal({ open, onOpenChange, material, onSuccess }: CompanyAddStockModalProps) {
  const { user } = useAuth()
  const companyId = user?.companyId || 1
  const { addStock, formatQuantity, formatCurrency } = useCompanyMaterialsUtils(companyId)

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    quantity: 1,
    unitPrice: 0,
    reason: "",
    supplier: "",
    invoiceNumber: "",
    notes: "",
  })

  // Reset form when modal opens/closes or material changes
  useEffect(() => {
    if (open && material) {
      setFormData({
        quantity: 1,
        unitPrice: material.unitPrice,
        reason: "",
        supplier: material.supplier,
        invoiceNumber: "",
        notes: "",
      })
    }
  }, [open, material])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!material) return

    setLoading(true)

    try {
      await addStock({
        materialId: material.id,
        quantity: formData.quantity,
        unitPrice: formData.unitPrice,
        reason: formData.reason,
        supplier: formData.supplier,
        invoiceNumber: formData.invoiceNumber,
        notes: formData.notes,
      })

      onSuccess?.()
    } catch (error) {
      console.error("Error adding stock:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const totalValue = formData.quantity * formData.unitPrice

  if (!material) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Stock</DialogTitle>
          <DialogDescription>Add new stock to your inventory.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Material</Label>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium">{material.name}</div>
              <div className="text-sm text-muted-foreground">Current Stock: {formatQuantity(material)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity to Add *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", Number.parseInt(e.target.value) || 1)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price (R$) *</Label>
              <Input
                id="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => handleInputChange("unitPrice", Number.parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Total Value</Label>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium">{formatCurrency(totalValue)}</div>
              <div className="text-sm text-muted-foreground">
                {formData.quantity} × {formatCurrency(formData.unitPrice)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Source/Reason *</Label>
            <Select value={formData.reason} onValueChange={(value) => handleInputChange("reason", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select source or reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purchase">New Purchase</SelectItem>
                <SelectItem value="return">Returned from Job</SelectItem>
                <SelectItem value="transfer">Transfer from Another Location</SelectItem>
                <SelectItem value="adjustment">Inventory Adjustment</SelectItem>
                <SelectItem value="donation">Donation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => handleInputChange("supplier", e.target.value)}
              placeholder="Supplier name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
              placeholder="Invoice or reference number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Additional notes about this stock addition"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add to Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
