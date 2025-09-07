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
import { Loader2, MapPin, Clock } from "lucide-react"

interface CompanyCheckInModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  checkIn?: any
}

export function CompanyCheckInModal({ isOpen, onClose, onSubmit, checkIn }: CompanyCheckInModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    checkInTime: "",
    status: "on-time",
    gpsVerified: false,
    notes: "",
  })

  useEffect(() => {
    if (checkIn) {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
      setFormData({
        checkInTime: `${hours}:${minutes}`,
        status: "on-time",
        gpsVerified: false,
        notes: checkIn.notes || "",
      })
    }
  }, [checkIn])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("[v0] Error during check-in:", error)
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
          <DialogTitle>Manual Check-in</DialogTitle>
          <DialogDescription className="text-gray-400">
            Record check-in for {checkIn?.professionalName} at {checkIn?.address}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="checkInTime">Check-in Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="checkInTime"
                  type="time"
                  value={formData.checkInTime}
                  onChange={(e) => handleChange("checkInTime", e.target.value)}
                  className="pl-10 bg-[#0f172a] border-[#2a3349] text-white"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Check-in Status</Label>
              <RadioGroup value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="on-time" id="on-time" />
                  <Label htmlFor="on-time" className="font-normal cursor-pointer">
                    On Time
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="late" id="late" />
                  <Label htmlFor="late" className="font-normal cursor-pointer">
                    Late
                  </Label>
                </div>
              </RadioGroup>
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

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Any additional information..."
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
                "Record Check-in"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
