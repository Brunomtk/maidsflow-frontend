"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, Building2, User, MapPin, Calendar, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getApiUrl } from "@/lib/api/utils"

interface Company {
  id: number
  name: string
  cnpj: string
  responsible: string
  email: string
  phone: string
  status: number
}

interface Leader {
  id: number
  userId: number
  name: string
  email: string
  phone: string
  region: string
  status: number
  createdDate: string
  updatedDate: string
}

interface Team {
  id?: number
  name: string
  region: string
  description: string
  rating?: number
  completedServices?: number
  status: number
  companyId: number
  company?: any
  leaderId?: number
  leader?: any
  createdDate?: string
  updatedDate?: string
}

interface TeamModalProps {
  isOpen: boolean
  team?: Team | null
  companies: Company[]
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function TeamModal({ isOpen, team, companies, onSubmit, onCancel }: TeamModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    region: "",
    description: "",
    companyId: "",
    leaderId: "",
    status: "1",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [leaders, setLeaders] = useState<Leader[]>([])
  const [loadingLeaders, setLoadingLeaders] = useState(false)
  const { toast } = useToast()

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

  // Load leaders when modal opens
  useEffect(() => {
    if (isOpen) {
      loadLeaders()
    }
  }, [isOpen])

  const loadLeaders = async () => {
    setLoadingLeaders(true)
    try {
      console.log("Loading leaders from API...")
      const response = await fetch(`${getApiUrl()}/Leader`, {
        method: "GET",
        headers: createHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Leaders loaded successfully:", data)

        // The API returns an array directly
        const leadersData = Array.isArray(data) ? data : []
        setLeaders(leadersData)
      } else {
        console.error("Failed to load leaders:", response.status, response.statusText)
        toast({
          title: "Warning",
          description: "Failed to load leaders. You can still create the team without assigning a leader.",
          variant: "destructive",
        })
        setLeaders([])
      }
    } catch (error) {
      console.error("Error loading leaders:", error)
      toast({
        title: "Warning",
        description: "Failed to load leaders. You can still create the team without assigning a leader.",
        variant: "destructive",
      })
      setLeaders([])
    } finally {
      setLoadingLeaders(false)
    }
  }

  // Initialize form data when team prop changes
  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || "",
        region: team.region || "",
        description: team.description || "",
        companyId: team.companyId?.toString() || "",
        leaderId: team.leaderId?.toString() || "",
        status: team.status?.toString() || "1",
      })
    } else {
      setFormData({
        name: "",
        region: "",
        description: "",
        companyId: "",
        leaderId: "",
        status: "1",
      })
    }
  }, [team])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Team name is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.companyId) {
      toast({
        title: "Validation Error",
        description: "Please select a company",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const teamData = {
        name: formData.name.trim(),
        region: formData.region.trim(),
        description: formData.description.trim(),
        companyId: Number.parseInt(formData.companyId),
        leaderId: formData.leaderId ? Number.parseInt(formData.leaderId) : null,
        status: Number.parseInt(formData.status),
      }

      await onSubmit(teamData)
    } catch (error) {
      console.error("Error submitting team:", error)
      toast({
        title: "Error",
        description: "Failed to save team",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSelectedCompany = () => {
    return companies.find((company) => company.id.toString() === formData.companyId)
  }

  const getSelectedLeader = () => {
    return leaders.find((leader) => leader.id.toString() === formData.leaderId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {team ? "Edit Team" : "Create New Team"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="px-6 py-4 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    {team ? "Update the team's basic information" : "Enter the basic information for the new team"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Team Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter team name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="region">Region</Label>
                      <Input
                        id="region"
                        value={formData.region}
                        onChange={(e) => handleInputChange("region", e.target.value)}
                        placeholder="Enter region"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="0">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                            Inactive
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Enter team description (optional)"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Company Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Company Assignment
                  </CardTitle>
                  <CardDescription>Select which company this team belongs to</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <Select value={formData.companyId} onValueChange={(value) => handleInputChange("companyId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.length === 0 ? (
                          <SelectItem value="no-companies" disabled>
                            No companies available
                          </SelectItem>
                        ) : (
                          companies.map((company) => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">{company.name}</span>
                                <span className="text-sm text-muted-foreground">{company.cnpj}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Selected Company Info */}
                  {getSelectedCompany() && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium">{getSelectedCompany()?.name}</h4>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>CNPJ: {getSelectedCompany()?.cnpj}</p>
                            <p>Responsible: {getSelectedCompany()?.responsible}</p>
                            <p>Email: {getSelectedCompany()?.email}</p>
                          </div>
                        </div>
                        <Badge variant={getSelectedCompany()?.status === 1 ? "default" : "secondary"}>
                          {getSelectedCompany()?.status === 1 ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Team Leader */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Team Leader
                  </CardTitle>
                  <CardDescription>Assign a team leader (optional)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="leader">Team Leader</Label>
                    <Select
                      value={formData.leaderId}
                      onValueChange={(value) => handleInputChange("leaderId", value)}
                      disabled={loadingLeaders}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingLeaders
                              ? "Loading leaders..."
                              : leaders.length === 0
                                ? "No leaders available"
                                : "Select a team leader"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <span className="text-muted-foreground">No leader assigned</span>
                        </SelectItem>
                        {leaders.map((leader) => (
                          <SelectItem key={leader.id} value={leader.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{leader.name}</span>
                              <span className="text-sm text-muted-foreground">{leader.email}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Selected Leader Info */}
                  {getSelectedLeader() && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium">{getSelectedLeader()?.name}</h4>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Email: {getSelectedLeader()?.email}</p>
                            <p>Phone: {getSelectedLeader()?.phone}</p>
                            <p>Region: {getSelectedLeader()?.region}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{getSelectedLeader()?.status === 1 ? "Active" : "Inactive"}</Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Team Summary */}
              {team && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Team Summary
                    </CardTitle>
                    <CardDescription>Current team information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <div className="text-2xl font-bold">{team.rating?.toFixed(1) || "0.0"}</div>
                        <div className="text-sm text-muted-foreground">Rating</div>
                      </div>

                      <div className="text-center p-3 bg-muted rounded-lg">
                        <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <div className="text-2xl font-bold">{team.completedServices || 0}</div>
                        <div className="text-sm text-muted-foreground">Services</div>
                      </div>

                      <div className="text-center p-3 bg-muted rounded-lg">
                        <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <div className="text-sm font-medium">Status</div>
                        <Badge variant={team.status === 1 ? "default" : "secondary"} className="mt-1">
                          {team.status === 1 ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </form>
          </div>
        </ScrollArea>

        {/* Footer with Action Buttons */}
        <div className="px-6 py-4 border-t bg-background">
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {team ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{team ? "Update Team" : "Create Team"}</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
