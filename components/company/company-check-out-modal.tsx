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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, MapPin, Clock, CheckSquare } from "lucide-react"

interface CompanyCheckOutModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  checkOut?: any
}

export function CompanyCheckOutModal({ isOpen, onClose, onSubmit, checkOut }: CompanyCheckOutModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    checkOutTime: "",
    status: "completed",
    gpsVerified: false,
    tasksCompleted: false,
    notes: "",
  })

  useEffect(() => {
    if (checkOut) {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
      setFormData({
        checkOutTime: `${hours}:${minutes}`,
        status: "completed",
        gpsVerified: false,
        tasksCompleted: false,
        notes: checkOut.notes || "",
      })
    }
  }, [checkOut])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("[v0] Error during check-out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#1a2234] border-[#2a3349] text-white">
        <DialogHeader>
          <DialogTitle>Record Check-out</DialogTitle>
          <DialogDescription className="text-gray-400">
            Complete check-out for {checkOut?.professionalName} at {checkOut?.address}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="checkOutTime">Check-out Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="checkOutTime"
                  type="time"
                  value={formData.checkOutTime}
                  onChange={(e) => handleChange("checkOutTime", e.target.value)}
                  className="pl-10 bg-[#0f172a] border-[#2a3349] text-white"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Check-out Status</Label>
              <RadioGroup value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="completed" id="completed" />
                  <Label htmlFor="completed" className="font-normal cursor-pointer">
                    Completed
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="early-departure" id="early-departure" />
                  <Label htmlFor="early-departure" className="font-normal cursor-pointer">
                    Early Departure
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tasksCompleted"
                  checked={formData.tasksCompleted}
                  onCheckedChange={(checked) => handleChange("tasksCompleted", checked)}
                />
                <Label htmlFor="tasksCompleted" className="font-normal cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    All tasks completed
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gpsVerified"
                  checked={formData.gpsVerified}
                  onCheckedChange={(checked) => handleChange("gpsVerified", checked)}
                />
                <Label htmlFor="gpsVerified" className="font-normal cursor-pointer">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    GPS location verified
                  </div>
                </Label>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Any additional information about the work session..."
                className="bg-[#0f172a] border-[#2a3349] text-white resize-none"
                rows={3}
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
                  Recording...
                </>
              ) : (
                "Record Check-out"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
