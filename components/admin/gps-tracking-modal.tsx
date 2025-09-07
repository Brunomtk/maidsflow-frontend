"use client"

import React, { useEffect, useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import type { GPSTracking, GPSTrackingCreateRequest, GPSTrackingUpdateRequest } from "@/types/gps-tracking"
import type { Professional } from "@/types/professional"
import type { Company } from "@/types/company"
import { fetchApi } from "@/lib/api/utils"

interface GpsTrackingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: GPSTrackingCreateRequest | GPSTrackingUpdateRequest) => void
  gpsData?: GPSTracking
}

export function GpsTrackingModal({
  isOpen,
  onClose,
  onSubmit,
  gpsData,
}: GpsTrackingModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [formData, setFormData] = useState({
    professionalId: "",
    companyId: "",
    latitude: "",
    longitude: "",
    address: "",
    speed: "0",
    status: "1",
    vehicle: "",
    battery: "100",
    accuracy: "5",
    notes: "",
  })

  // Load professionals and companies when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = async () => {
    setIsLoadingData(true)
    try {
      // Fetch all professionals
      const profs = await fetchApi<Professional[]>("/Professional")
      setProfessionals(profs || [])

      // Fetch all companies
      const comps = await fetchApi<Company[]>("/Companies")
      setCompanies(comps || [])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  // Populate form when editing
  useEffect(() => {
    if (gpsData) {
      setFormData({
        professionalId: gpsData.professionalId?.toString() || "",
        companyId: gpsData.companyId?.toString() || "",
        latitude: gpsData.location?.latitude?.toString() || "",
        longitude: gpsData.location?.longitude?.toString() || "",
        address: gpsData.location?.address || "",
        speed: gpsData.speed?.toString() || "0",
        status: gpsData.status?.toString() || "1",
        vehicle: gpsData.vehicle || "",
        battery: gpsData.battery?.toString() || "100",
        accuracy: gpsData.location?.accuracy?.toString() || "5",
        notes: gpsData.notes || "",
      })
    } else {
      setFormData({
        professionalId: "",
        companyId: "",
        latitude: "",
        longitude: "",
        address: "",
        speed: "0",
        status: "1",
        vehicle: "",
        battery: "100",
        accuracy: "5",
        notes: "",
      })
    }
  }, [gpsData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const selectedProfessional = professionals.find(
        (p) => p.id === Number(formData.professionalId)
      )
      const selectedCompany = companies.find(
        (c) => c.id === Number(formData.companyId)
      )

      const submitData: GPSTrackingCreateRequest | GPSTrackingUpdateRequest = {
        professionalId: Number(formData.professionalId),
        professionalName: selectedProfessional?.name || "",
        companyId: Number(formData.companyId),
        companyName: selectedCompany?.name || "",
        vehicle: formData.vehicle,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        address: formData.address,
        accuracy: Number(formData.accuracy),
        speed: Number(formData.speed),
        status: Number(formData.status),
        battery: Number(formData.battery),
        notes: formData.notes,
        timestamp: new Date().toISOString(),
      }

      await onSubmit(submitData)
      onClose()
    } catch (error) {
      console.error("Error submitting GPS tracking data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (isLoadingData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] bg-[#1a2234] border-[#2a3349] text-white">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#06b6d4]" />
            <span className="ml-2 text-gray-400">Loading data...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a2234] border-[#2a3349] text-white">
        <DialogHeader>
          <DialogTitle>{gpsData ? "Edit GPS Tracking" : "New GPS Tracking"}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {gpsData
              ? "Update the GPS tracking information below."
              : "Fill in the information to add a new GPS tracking record."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Professional & Company */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="professionalId">Professional</Label>
                <Select
                  value={formData.professionalId}
                  onValueChange={(v) => handleChange("professionalId", v)}
                >
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                    <SelectValue placeholder="Select professional" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white max-h-[200px]">
                    {professionals.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="companyId">Company</Label>
                <Select
                  value={formData.companyId}
                  onValueChange={(v) => handleChange("companyId", v)}
                >
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white max-h-[200px]">
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={(e) => handleChange("latitude", e.target.value)}
                  className="bg-[#0f172a] border-[#2a3349] text-white"
                  placeholder="e.g., -23.550520"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={(e) => handleChange("longitude", e.target.value)}
                  className="bg-[#0f172a] border-[#2a3349] text-white"
                  placeholder="e.g., -46.633309"
                  required
                />
              </div>
            </div>

            {/* Address & Vehicle */}
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
                placeholder="Full address"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vehicle">Vehicle</Label>
              <Input
                value={formData.vehicle}
                onChange={(e) => handleChange("vehicle", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
                placeholder="e.g., Toyota Corolla"
                required
              />
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => handleChange("status", v)}
              >
                <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">  
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="2">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Speed, Battery, Accuracy */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="speed">Speed (km/h)</Label>
                <Input
                  type="number"
                  min="0"
                  max="200"
                  value={formData.speed}
                  onChange={(e) => handleChange("speed", e.target.value)}
                  className="bg-[#0f172a] border-[#2a3349] text-white"
                  placeholder="0"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="battery">Battery (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.battery}
                  onChange={(e) => handleChange("battery", e.target.value)}
                  className="bg-[#0f172a] border-[#2a3349] text-white"
                  placeholder="100"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="accuracy">Accuracy (m)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.accuracy}
                  onChange={(e) => handleChange("accuracy", e.target.value)}
                  className="bg-[#0f172a] border-[#2a3349] text-white"
                  placeholder="5"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white min-h-[80px]"
                placeholder="Additional observations..."
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
            <Button
              type="submit"
              disabled={isLoading || !formData.professionalId || !formData.companyId}
              className="bg-[#06b6d4] hover:bg-[#0891b2] text-white"
            >
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
