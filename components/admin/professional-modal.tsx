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
import { Loader2, Upload } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getApiUrl } from "@/lib/api/utils"
import type { Professional, CreateProfessionalRequest, UpdateProfessionalRequest } from "@/types"

interface ProfessionalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateProfessionalRequest | UpdateProfessionalRequest) => void
  professional?: Professional
}

export function ProfessionalModal({ isOpen, onClose, onSubmit, professional }: ProfessionalModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false)
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([])
  const [teams, setTeams] = useState<{ id: number; name: string }[]>([])
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    email: "",
    phone: "",
    teamId: "",
    companyId: "",
    status: "Active" as "Active" | "Inactive",
    observations: "",
    photo: "",
  })

  // Helper function to get auth token
  const getAuthToken = (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("noah_token")
    }
    return null
  }

  // Helper function to create headers
  const createHeaders = (): HeadersInit => {
    const token = getAuthToken()
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // Load companies and teams when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log("Modal opened, loading companies and teams...")
      loadCompanies()
      loadTeams()
    }
  }, [isOpen])

  // Set form data when professional changes
  useEffect(() => {
    if (professional) {
      setFormData({
        name: professional.name || "",
        cpf: professional.cpf || "",
        email: professional.email || "",
        phone: professional.phone || "",
        teamId: professional.teamId?.toString() || "",
        companyId: professional.companyId?.toString() || "",
        status: professional.status || "Active",
        observations: "",
        photo: "",
      })
    } else {
      setFormData({
        name: "",
        cpf: "",
        email: "",
        phone: "",
        teamId: "",
        companyId: "",
        status: "Active",
        observations: "",
        photo: "",
      })
    }
  }, [professional])

  const loadCompanies = async () => {
    console.log("Loading companies...")
    setIsLoadingCompanies(true)
    try {
      const response = await fetch(`${getApiUrl()}/Companies`, {
        method: "GET",
        headers: createHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Companies response:", data)

      if (Array.isArray(data)) {
        const companiesData = data.map((company: any) => ({
          id: company.id,
          name: company.name,
        }))
        console.log("Setting companies:", companiesData)
        setCompanies(companiesData)
      } else {
        console.error("Companies API returned non-array data:", data)
        setCompanies([])
      }
    } catch (error) {
      console.error("Failed to load companies:", error)
      setCompanies([])
    } finally {
      setIsLoadingCompanies(false)
    }
  }

  const loadTeams = async () => {
    console.log("Loading teams...")
    setIsLoadingTeams(true)
    try {
      const response = await fetch(`${getApiUrl()}/Team?page=1&pageSize=100&status=all`, {
        method: "GET",
        headers: createHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Teams response:", data)

      if (data.results && Array.isArray(data.results)) {
        const teamsData = data.results.map((team: any) => ({
          id: team.id,
          name: team.name,
        }))
        console.log("Setting teams:", teamsData)
        setTeams(teamsData)
      } else {
        console.error("Teams API returned unexpected format:", data)
        setTeams([])
      }
    } catch (error) {
      console.error("Failed to load teams:", error)
      setTeams([])
    } finally {
      setIsLoadingTeams(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.cpf || !formData.email || !formData.phone || !formData.teamId) {
        alert("Please fill in all required fields")
        return
      }

      if (!professional && !formData.companyId) {
        alert("Please select a company")
        return
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (professional) {
        // Update professional
        const updateData: UpdateProfessionalRequest = {
          name: formData.name,
          cpf: formData.cpf,
          email: formData.email,
          phone: formData.phone,
          teamId: Number.parseInt(formData.teamId),
          status: formData.status === "Active" ? 1 : 0,
        }
        onSubmit(updateData)
      } else {
        // Create professional
        const createData: CreateProfessionalRequest = {
          name: formData.name,
          cpf: formData.cpf,
          email: formData.email,
          phone: formData.phone,
          teamId: Number.parseInt(formData.teamId),
          companyId: Number.parseInt(formData.companyId),
        }
        onSubmit(createData)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you would upload the file to a server
      // For now, we'll just create a local URL
      const photoUrl = URL.createObjectURL(file)
      handleChange("photo", photoUrl)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a2234] border-[#2a3349] text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{professional ? "Edit Professional" : "New Professional"}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {professional
              ? "Update the professional information below."
              : "Fill in the information to register a new professional."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-[#2a3349]">
                  <AvatarImage src={formData.photo || "/placeholder.svg"} />
                  <AvatarFallback className="bg-[#2a3349] text-[#06b6d4] text-2xl">
                    {formData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="photo-upload"
                  className="absolute bottom-0 right-0 bg-[#06b6d4] hover:bg-[#0891b2] p-1.5 rounded-full cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4 text-white" />
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="bg-[#0f172a] border-[#2a3349] text-white"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleChange("cpf", e.target.value)}
                  placeholder="000.000.000-00"
                  className="bg-[#0f172a] border-[#2a3349] text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
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
                <Label htmlFor="phone">Phone *</Label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="company">Company {!professional && "*"}</Label>
                <Select
                  value={formData.companyId}
                  onValueChange={(value) => handleChange("companyId", value)}
                  disabled={isLoadingCompanies || !!professional} // Disable for edit mode
                >
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                    <SelectValue
                      placeholder={
                        isLoadingCompanies
                          ? "Loading companies..."
                          : companies.length === 0
                            ? "No companies available"
                            : "Select a company"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                    {isLoadingCompanies ? (
                      <div className="p-2 text-center text-gray-400 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading companies...
                      </div>
                    ) : companies.length === 0 ? (
                      <div className="p-2 text-center text-gray-400">No companies found</div>
                    ) : (
                      companies.map((company) => (
                        <SelectItem key={company.id} value={company.id.toString()} className="hover:bg-[#2a3349]">
                          {company.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {companies.length > 0 && <p className="text-xs text-gray-400">Found {companies.length} companies</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="team">Team *</Label>
                <Select value={formData.teamId} onValueChange={(value) => handleChange("teamId", value)}>
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                    <SelectValue
                      placeholder={
                        isLoadingTeams
                          ? "Loading teams..."
                          : teams.length === 0
                            ? "No teams available"
                            : "Select a team"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                    {isLoadingTeams ? (
                      <div className="p-2 text-center text-gray-400 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading teams...
                      </div>
                    ) : teams.length === 0 ? (
                      <div className="p-2 text-center text-gray-400">No teams found</div>
                    ) : (
                      teams.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()} className="hover:bg-[#2a3349]">
                          {team.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {teams.length > 0 && <p className="text-xs text-gray-400">Found {teams.length} teams</p>}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectItem value="Active" className="hover:bg-[#2a3349]">
                    Active
                  </SelectItem>
                  <SelectItem value="Inactive" className="hover:bg-[#2a3349]">
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="observations">Observations</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => handleChange("observations", e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white min-h-[80px]"
                placeholder="Additional information about the professional"
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
              disabled={isLoading || isLoadingCompanies || isLoadingTeams}
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
