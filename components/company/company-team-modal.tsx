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
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Users } from "lucide-react"
import type { Team, CreateTeamRequest, UpdateTeamRequest } from "@/types"

interface CompanyTeamModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateTeamRequest | UpdateTeamRequest) => void
  team?: Team | null
}

export function CompanyTeamModal({ isOpen, onClose, onSubmit, team }: CompanyTeamModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    region: "",
    description: "",
    leaderId: 1, // Default leader ID
  })

  // Sample regions
  const regions = ["North", "Northeast", "Central-West", "Southeast", "South", "National"]

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || "",
        region: team.region || "",
        description: team.description || "",
        leaderId: team.leaderId || 1,
      })
    } else {
      setFormData({
        name: "",
        region: "",
        description: "",
        leaderId: 1,
      })
    }
  }, [team])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (team) {
        // Update team
        const updateData: UpdateTeamRequest = {
          id: team.id,
          createdDate: team.createdDate,
          updatedDate: new Date().toISOString(),
          name: formData.name,
          region: formData.region,
          description: formData.description,
          rating: team.rating,
          completedServices: team.completedServices,
          status: team.status,
          companyId: team.companyId,
          leaderId: formData.leaderId,
        }
        onSubmit(updateData)
      } else {
        // Create team
        const createData: CreateTeamRequest = {
          name: formData.name,
          region: formData.region,
          description: formData.description,
          leaderId: formData.leaderId,
          companyId: 0, // Will be set by context
        }
        onSubmit(createData)
      }
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
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#06b6d4]" />
            {team ? "Edit Team" : "New Team"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {team ? "Update the team information below." : "Fill in the information to create a new team."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white"
                placeholder="Enter team name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="region">Region</Label>
              <Select value={formData.region} onValueChange={(value) => handleChange("region", value)}>
                <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  {regions.map((region) => (
                    <SelectItem key={region} value={region} className="hover:bg-[#2a3349]">
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white min-h-[80px]"
                placeholder="Describe the team's responsibilities and specialties"
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
              ) : team ? (
                "Update Team"
              ) : (
                "Create Team"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
