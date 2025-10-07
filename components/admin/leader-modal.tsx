"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { leadersApi } from "@/lib/api/leaders"
import { usersApi } from "@/lib/api/users"
import { useLeadersContext } from "@/contexts/leaders-context"
import { Loader2 } from "lucide-react"
import type { Leader } from "@/types/leader"
import type { User } from "@/types/user"

interface LeaderModalProps {
  isOpen: boolean
  onClose: () => void
  leader?: Leader | null
  mode: "create" | "edit"
}

export function LeaderModal({ isOpen, onClose, leader, mode }: LeaderModalProps) {
  const { dispatch } = useLeadersContext()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    userId: "",
    region: "",
    name: "",
    email: "",
    phone: "",
    status: "Active",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [users, setUsers] = useState<User[]>([])

  // Load users when modal opens
  useEffect(() => {
    if (isOpen && mode === "create") {
      loadUsers()
    }
  }, [isOpen, mode])

  // Reset form when modal opens/closes or leader changes
  useEffect(() => {
    if (mode === "edit" && leader) {
      setFormData({
        userId: leader.userId?.toString() || "",
        region: leader.region || "",
        name: leader.name || "",
        email: leader.email || "",
        phone: leader.phone || "",
        status: leader.status || "Active",
      })
    } else {
      setFormData({
        userId: "",
        region: "",
        name: "",
        email: "",
        phone: "",
        status: "Active",
      })
    }
    setErrors({})
  }, [mode, leader, isOpen])

  const loadUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const response = await usersApi.getAll()
      setUsers(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "Warning",
        description: "Failed to load users list",
        variant: "destructive",
      })
      setUsers([])
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (mode === "create" && !formData.userId) {
      newErrors.userId = "User is required"
    }

    if (mode === "create" && !formData.region.trim()) {
      newErrors.region = "Region is required"
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      if (mode === "create") {
        const leaderData = {
          userId: Number.parseInt(formData.userId),
          region: formData.region,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }

        const newLeader = await leadersApi.create(leaderData)
        dispatch({ type: "ADD_LEADER", payload: newLeader })
        toast({
          title: "Success",
          description: "Leader created successfully",
        })
        onClose()
      } else if (leader) {
        const leaderData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          status: formData.status,
        }

        const updatedLeader = await leadersApi.update(leader.id, leaderData)
        dispatch({ type: "UPDATE_LEADER", payload: updatedLeader })
        toast({
          title: "Success",
          description: "Leader updated successfully",
        })
        onClose()
      }
    } catch (error) {
      console.error("Error saving leader:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save leader",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Leader" : "Edit Leader"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Add a new leader to the system." : "Update leader information."}
          </DialogDescription>
        </DialogHeader>

        {isLoadingUsers && mode === "create" && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading users...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "create" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="userId">User *</Label>
                <Select value={formData.userId} onValueChange={(value) => handleInputChange("userId", value)}>
                  <SelectTrigger className={errors.userId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.userId && <p className="text-sm text-red-500">{errors.userId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region *</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => handleInputChange("region", e.target.value)}
                  placeholder="Enter region (e.g., brasil, north, south)"
                  className={errors.region ? "border-red-500" : ""}
                />
                {errors.region && <p className="text-sm text-red-500">{errors.region}</p>}
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter leader name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter phone number"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            {mode === "edit" && (
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || (isLoadingUsers && mode === "create")}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : mode === "create" ? (
                "Create Leader"
              ) : (
                "Update Leader"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
