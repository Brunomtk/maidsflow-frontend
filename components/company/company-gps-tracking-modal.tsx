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
import type { GPSTracking } from "@/types/gps-tracking"

interface GpsTrackingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  gpsData?: GPSTracking | null
}

export function GpsTrackingModal({ isOpen, onClose, onSubmit, gpsData }: GpsTrackingModalProps) {
  const [formData, setFormData] = useState({
    professionalId: "",
    professionalName: "",
    companyName: "",
    vehicle: "",
    latitude: "",
    longitude: "",
    address: "",
    accuracy: "",
    speed: "",
    status: "1",
    battery: "",
    notes: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (gpsData) {
      setFormData({
        professionalId: gpsData.professionalId.toString(),
        professionalName: gpsData.professionalName,
        companyName: gpsData.companyName,
        vehicle: gpsData.vehicle,
        latitude: gpsData.location.latitude.toString(),
        longitude: gpsData.location.longitude.toString(),
        address: gpsData.location.address,
        accuracy: gpsData.location.accuracy.toString(),
        speed: gpsData.speed.toString(),
        status: gpsData.status.toString(),
        battery: gpsData.battery.toString(),
        notes: gpsData.notes,
      })
    } else {
      setFormData({
        professionalId: "",
        professionalName: "",
        companyName: "",
        vehicle: "",
        latitude: "",
        longitude: "",
        address: "",
        accuracy: "",
        speed: "",
        status: "1",
        battery: "",
        notes: "",
      })
    }
  }, [gpsData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const submitData = {
        professionalId: Number.parseInt(formData.professionalId),
        professionalName: formData.professionalName,
        companyName: formData.companyName,
        vehicle: formData.vehicle,
        latitude: Number.parseFloat(formData.latitude),
        longitude: Number.parseFloat(formData.longitude),
        address: formData.address,
        accuracy: Number.parseInt(formData.accuracy),
        speed: Number.parseInt(formData.speed),
        status: Number.parseInt(formData.status),
        battery: Number.parseInt(formData.battery),
        notes: formData.notes,
        timestamp: new Date().toISOString(),
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error("Error submitting GPS tracking data:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a2234] border-[#2a3349] text-white">
        <DialogHeader>
          <DialogTitle>{gpsData ? "Edit GPS Tracking" : "Add GPS Tracking"}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {gpsData ? "Update the GPS tracking information." : "Add new GPS tracking information."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="professionalId">Professional ID</Label>
              <Input
                id="professionalId"
                type="number"
                value={formData.professionalId}
                onChange={(e) => handleInputChange("professionalId", e.target.value)}
                className="bg-[#2a3349] border-0 text-white focus:ring-[#06b6d4]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="professionalName">Professional Name</Label>
              <Input
                id="professionalName"
                value={formData.professionalName}
                onChange={(e) => handleInputChange("professionalName", e.target.value)}
                className="bg-[#2a3349] border-0 text-white focus:ring-[#06b6d4]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                className="bg-[#2a3349] border-0 text-white focus:ring-[#06b6d4]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle</Label>
              <Input
                id="vehicle"
                value={formData.vehicle}
                onChange={(e) => handleInputChange("vehicle", e.target.value)}
                className="bg-[#2a3349] border-0 text-white focus:ring-[#06b6d4]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => handleInputChange("latitude", e.target.value)}
                className="bg-[#2a3349] border-0 text-white focus:ring-[#06b6d4]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => handleInputChange("longitude", e.target.value)}
                className="bg-[#2a3349] border-0 text-white focus:ring-[#06b6d4]"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="bg-[#2a3349] border-0 text-white focus:ring-[#06b6d4]"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accuracy">Accuracy</Label>
              <Input
                id="accuracy"
                type="number"
                value={formData.accuracy}
                onChange={(e) => handleInputChange("accuracy", e.target.value)}
                className="bg-[#2a3349] border-0 text-white focus:ring-[#06b6d4]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="speed">Speed (km/h)</Label>
              <Input
                id="speed"
                type="number"
                value={formData.speed}
                onChange={(e) => handleInputChange("speed", e.target.value)}
                className="bg-[#2a3349] border-0 text-white focus:ring-[#06b6d4]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="battery">Battery (%)</Label>
              <Input
                id="battery"
                type="number"
                min="0"
                max="100"
                value={formData.battery}
                onChange={(e) => handleInputChange("battery", e.target.value)}
                className="bg-[#2a3349] border-0 text-white focus:ring-[#06b6d4]"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger className="bg-[#2a3349] border-0 text-white focus:ring-[#06b6d4]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                <SelectItem value="1">Active</SelectItem>
                <SelectItem value="2">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="bg-[#2a3349] border-0 text-white focus:ring-[#06b6d4]"
              rows={3}
            />
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
            <Button type="submit" disabled={isSubmitting} className="bg-[#06b6d4] hover:bg-[#0891b2] text-white">
              {isSubmitting ? "Saving..." : gpsData ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
