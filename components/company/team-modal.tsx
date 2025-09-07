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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, Trash2, Users } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

interface TeamModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  team?: any
}

export function TeamModal({ isOpen, onClose, onSubmit, team }: TeamModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [formData, setFormData] = useState({
    name: "",
    supervisor: "",
    shift: "",
    status: "active",
    description: "",
    members: [] as any[],
    serviceTypes: [] as string[],
  })

  // Sample professionals for the team members selection
  const availableProfessionals = [
    { id: 1, name: "Maria Silva", role: "Cleaner", experience: "5 years", rating: 4.8, available: true },
    { id: 2, name: "João Oliveira", role: "Senior Cleaner", experience: "3 years", rating: 4.7, available: true },
    { id: 3, name: "Ana Santos", role: "Cleaner", experience: "2 years", rating: 4.9, available: false },
    { id: 4, name: "Carlos Pereira", role: "Cleaner", experience: "1 year", rating: 4.5, available: true },
    { id: 5, name: "Fernanda Lima", role: "Cleaner", experience: "4 years", rating: 4.8, available: true },
    { id: 6, name: "Roberto Alves", role: "Senior Cleaner", experience: "6 years", rating: 4.6, available: true },
    { id: 7, name: "Patricia Costa", role: "Cleaner", experience: "2 years", rating: 4.4, available: false },
  ]

  // Sample service types
  const availableServiceTypes = [
    "Regular Cleaning",
    "Deep Cleaning",
    "Post-Construction Cleaning",
    "Commercial Cleaning",
    "Residential Cleaning",
    "Window Cleaning",
    "Carpet Cleaning",
  ]

  // Sample supervisors
  const availableSupervisors = [
    "Maria Silva",
    "João Santos",
    "Ana Oliveira",
    "Carlos Mendes",
    "Patricia Costa",
    "Roberto Alves",
    "Fernanda Lima",
  ]

  // Sample shifts
  const shifts = ["Morning (6AM-2PM)", "Afternoon (2PM-10PM)", "Evening (10PM-6AM)", "Flexible"]

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || "",
        supervisor: team.supervisor || "",
        shift: team.shift || "",
        status: team.status || "active",
        description: team.description || "",
        members: team.members || [],
        serviceTypes: team.serviceTypes || [],
      })
    } else {
      setFormData({
        name: "",
        supervisor: "",
        shift: "",
        status: "active",
        description: "",
        members: [],
        serviceTypes: [],
      })
    }
  }, [team])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onSubmit(formData)
    setIsLoading(false)
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddMember = (professional: any) => {
    if (!formData.members.some((member) => member.id === professional.id)) {
      setFormData((prev) => ({
        ...prev,
        members: [...prev.members, professional],
      }))
    }
  }

  const handleRemoveMember = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((member) => member.id !== id),
    }))
  }

  const handleToggleServiceType = (type: string) => {
    if (formData.serviceTypes.includes(type)) {
      setFormData((prev) => ({
        ...prev,
        serviceTypes: prev.serviceTypes.filter((t) => t !== type),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        serviceTypes: [...prev.serviceTypes, type],
      }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a2234] border-[#2a3349] text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{team ? "Edit Team" : "New Team"}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {team ? "Update the team information below." : "Fill in the information to create a new team."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4 bg-[#0f172a] border border-[#2a3349]">
              <TabsTrigger value="general" className="data-[state=active]:bg-[#2a3349]">
                General
              </TabsTrigger>
              <TabsTrigger value="members" className="data-[state=active]:bg-[#2a3349]">
                Members
              </TabsTrigger>
              <TabsTrigger value="services" className="data-[state=active]:bg-[#2a3349]">
                Services
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Team Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="bg-[#0f172a] border-[#2a3349] text-white"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="supervisor">Team Supervisor</Label>
                  <Select value={formData.supervisor} onValueChange={(value) => handleChange("supervisor", value)}>
                    <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                      <SelectValue placeholder="Select a supervisor" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white max-h-[200px]">
                      {availableSupervisors.map((supervisor) => (
                        <SelectItem key={supervisor} value={supervisor} className="hover:bg-[#2a3349]">
                          {supervisor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="shift">Shift</Label>
                  <Select value={formData.shift} onValueChange={(value) => handleChange("shift", value)}>
                    <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                      <SelectValue placeholder="Select a shift" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                      {shifts.map((shift) => (
                        <SelectItem key={shift} value={shift} className="hover:bg-[#2a3349]">
                          {shift}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="status">Status</Label>
                    <Switch
                      id="status"
                      checked={formData.status === "active"}
                      onCheckedChange={(checked) => handleChange("status", checked ? "active" : "inactive")}
                    />
                  </div>
                  <p className="text-sm text-gray-400">
                    {formData.status === "active"
                      ? "This team is active and can be assigned to services."
                      : "This team is inactive and cannot be assigned to services."}
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="bg-[#0f172a] border-[#2a3349] text-white min-h-[80px]"
                    placeholder="Team description and specializations"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label className="mb-2 block">Current Team Members</Label>
                  {formData.members.length > 0 ? (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                      {formData.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2 bg-[#0f172a] border border-[#2a3349] rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 border border-[#2a3349]">
                              <AvatarFallback className="bg-[#2a3349] text-[#06b6d4]">
                                {member.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className="text-xs text-gray-400">{member.role}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMember(member.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 bg-[#0f172a] border border-[#2a3349] rounded-md">
                      <Users className="h-10 w-10 text-gray-500 mb-2" />
                      <p className="text-gray-400">No team members added yet</p>
                      <p className="text-xs text-gray-500">Add members from the list below</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block">Available Professionals</Label>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {availableProfessionals
                      .filter((p) => p.available && !formData.members.some((m) => m.id === p.id))
                      .map((professional) => (
                        <div
                          key={professional.id}
                          className="flex items-center justify-between p-2 bg-[#0f172a] border border-[#2a3349] rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 border border-[#2a3349]">
                              <AvatarFallback className="bg-[#2a3349] text-[#06b6d4]">
                                {professional.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{professional.name}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-400">{professional.role}</p>
                                <span className="text-xs text-gray-500">•</span>
                                <p className="text-xs text-gray-400">{professional.experience}</p>
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddMember(professional)}
                            className="h-8 border-[#2a3349] text-white hover:bg-[#2a3349]"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label className="mb-2 block">Service Types</Label>
                  <p className="text-sm text-gray-400 mb-3">Select the types of services this team can perform</p>

                  <div className="grid grid-cols-2 gap-2">
                    {availableServiceTypes.map((type) => (
                      <div
                        key={type}
                        className={`flex items-center justify-between p-2 border rounded-md cursor-pointer ${
                          formData.serviceTypes.includes(type)
                            ? "bg-[#06b6d4]/10 border-[#06b6d4]"
                            : "bg-[#0f172a] border-[#2a3349] hover:bg-[#2a3349]/50"
                        }`}
                        onClick={() => handleToggleServiceType(type)}
                      >
                        <span className="text-sm">{type}</span>
                        {formData.serviceTypes.includes(type) && (
                          <Badge className="bg-[#06b6d4] text-white">Selected</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#2a3349] text-white hover:bg-[#2a3349]"
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
