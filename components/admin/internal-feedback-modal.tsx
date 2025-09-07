"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { internalFeedbackApi } from "@/lib/api/internal-feedback"
import { fetchApi } from "@/lib/api/utils"
import type { InternalFeedback } from "@/types/internal-feedback"

interface Professional {
  id: number
  name: string
}

interface Team {
  id: number
  name: string
}

interface User {
  id: number
  name: string
  firstName?: string
  lastName?: string
}

interface InternalFeedbackModalProps {
  children: React.ReactNode
  feedback?: InternalFeedback
  onSuccess?: () => void
}

export function InternalFeedbackModal({ children, feedback, onSuccess }: InternalFeedbackModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])
  const { toast } = useToast()
  const isEditing = !!feedback

  const [formData, setFormData] = useState({
    title: "",
    professionalId: "",
    teamId: "",
    category: "",
    status: "0",
    description: "",
    priority: "1",
    assignedToId: "",
  })

  const getUserDisplayName = (user: User) =>
    user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || `User ${user.id}`

  const loadData = async () => {
    setDataLoading(true)
    try {
      // Professionals
      const profRes = await fetchApi<any>("/Professional")
      const profArray = Array.isArray(profRes) ? profRes : profRes?.results || profRes?.data || []
      setProfessionals(profArray)

      // Teams - handle paginated response
      const teamRes = await fetchApi<any>("/Team")
      const teamArray = Array.isArray(teamRes) ? teamRes : teamRes?.results || teamRes?.data || []
      setTeams(teamArray)

      // Users
      const userRes = await fetchApi<any>("/Users")
      const userArray = Array.isArray(userRes) ? userRes : userRes?.results || userRes?.data || []
      setUsers(userArray)
    } catch (err) {
      console.error("Error loading data:", err)
      toast({
        title: "Error",
        description: "Failed to load dropdown data. Some fields may be empty.",
        variant: "destructive",
      })
      setProfessionals([])
      setTeams([])
      setUsers([])
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadData()
      if (isEditing && feedback) {
        setFormData({
          title: feedback.title,
          professionalId: feedback.professionalId.toString(),
          teamId: feedback.teamId.toString(),
          category: feedback.category,
          status: feedback.status.toString(),
          description: feedback.description,
          priority: feedback.priority.toString(),
          assignedToId: feedback.assignedToId.toString(),
        })
      } else {
        setFormData({
          title: "",
          professionalId: "",
          teamId: "",
          category: "",
          status: "0",
          description: "",
          priority: "1",
          assignedToId: "",
        })
      }
    }
  }, [open, isEditing, feedback])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        title: formData.title,
        professionalId: Number(formData.professionalId),
        teamId: Number(formData.teamId),
        category: formData.category,
        status: Number(formData.status),
        description: formData.description,
        priority: Number(formData.priority),
        assignedToId: Number(formData.assignedToId),
        date: new Date().toISOString(),
      }

      if (isEditing && feedback) {
        const { error } = await internalFeedbackApi.update(feedback.id, data)
        if (error) throw new Error(error)
        toast({ title: "Success", description: "Internal feedback updated successfully." })
      } else {
        const { error } = await internalFeedbackApi.create(data)
        if (error) throw new Error(error)
        toast({ title: "Success", description: "Internal feedback created successfully." })
      }

      setOpen(false)
      onSuccess?.()
      setFormData({
        title: "",
        professionalId: "",
        teamId: "",
        category: "",
        status: "0",
        description: "",
        priority: "1",
        assignedToId: "",
      })
    } catch (err) {
      console.error("Error saving internal feedback:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save internal feedback",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#1a2234] border-[#2a3349] text-white">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Internal Feedback" : "Add New Internal Feedback"}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing
              ? "Make changes to the internal feedback here."
              : "Fill in the details to create a new internal feedback."}
          </DialogDescription>
        </DialogHeader>

        {dataLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06b6d4]"></div>
            <span className="ml-2">Loading data...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-[#0f172a] border-[#2a3349] text-white"
                  placeholder="Enter feedback title"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="professionalId">Professional * ({professionals.length} loaded)</Label>
                  <Select
                    value={formData.professionalId}
                    onValueChange={(v) => setFormData({ ...formData, professionalId: v })}
                    required
                  >
                    <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                      <SelectValue placeholder="Select professional" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                      {professionals.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">No professionals available</div>
                      ) : (
                        professionals.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamId">Team * ({teams.length} loaded)</Label>
                  <Select
                    value={formData.teamId}
                    onValueChange={(v) => setFormData({ ...formData, teamId: v })}
                    required
                  >
                    <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                      {teams.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">No teams available</div>
                      ) : (
                        teams.map((t) => (
                          <SelectItem key={t.id} value={t.id.toString()}>
                            {t.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                    required
                  >
                    <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Scheduling">Scheduling</SelectItem>
                      <SelectItem value="Customer Info">Customer Info</SelectItem>
                      <SelectItem value="Training">Training</SelectItem>
                      <SelectItem value="Safety">Safety</SelectItem>
                      <SelectItem value="Sistema">Sistema</SelectItem>
                      <SelectItem value="Acesso">Acesso</SelectItem>
                      <SelectItem value="Usabilidade">Usabilidade</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                      <SelectItem value="0">Pending</SelectItem>
                      <SelectItem value="1">In Progress</SelectItem>
                      <SelectItem value="2">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                    <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                      <SelectItem value="0">Low</SelectItem>
                      <SelectItem value="1">Medium</SelectItem>
                      <SelectItem value="2">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedToId">Assigned To * ({users.length} loaded)</Label>
                  <Select
                    value={formData.assignedToId}
                    onValueChange={(v) => setFormData({ ...formData, assignedToId: v })}
                    required
                  >
                    <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                      {users.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">No users available</div>
                      ) : (
                        users.map((u) => (
                          <SelectItem key={u.id} value={u.id.toString()}>
                            {getUserDisplayName(u)}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="bg-[#0f172a] border-[#2a3349] text-white resize-none"
                  placeholder="Describe the feedback in detail..."
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-[#2a3349] bg-[#0f172a] text-white hover:bg-[#2a3349]"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#06b6d4] hover:bg-[#0891b2] text-white"
                disabled={
                  loading ||
                  !formData.title ||
                  !formData.professionalId ||
                  !formData.teamId ||
                  !formData.category ||
                  !formData.description ||
                  !formData.assignedToId
                }
              >
                {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Feedback"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
