"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { usersApi } from "@/lib/api/users"
import { useUsersContext } from "@/contexts/users-context"
import { Loader2 } from "lucide-react"
import type { User, RegisterUserData } from "@/types/user"

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  user?: User | null
  mode: "create" | "edit"
}

interface DropdownOption {
  id: number
  name: string
}

export function UserModal({ isOpen, onClose, user, mode }: UserModalProps) {
  const { dispatch } = useUsersContext()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "professional",
    status: 1,
    companyId: "",
    professionalId: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [companies, setCompanies] = useState<DropdownOption[]>([])
  const [professionals, setProfessionals] = useState<DropdownOption[]>([])

  // Load dropdown data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDropdownData()
    }
  }, [isOpen])

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (mode === "edit" && user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "professional",
        status: user.status || 1,
        companyId: user.companyId?.toString() || "",
        professionalId: user.professionalId?.toString() || "",
      })
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "professional",
        status: 1,
        companyId: "",
        professionalId: "",
      })
    }
    setErrors({})
  }, [mode, user, isOpen])

  const loadDropdownData = async () => {
    setIsLoadingDropdowns(true)
    try {
      // Load companies and professionals in parallel
      const [companiesResponse, professionalsResponse] = await Promise.all([
        usersApi.getCompaniesForDropdown(),
        usersApi.getProfessionalsForDropdown(),
      ])

      if (companiesResponse.data) {
        setCompanies(companiesResponse.data)
      } else {
        console.error("Failed to load companies:", companiesResponse.error)
      }

      if (professionalsResponse.data) {
        setProfessionals(professionalsResponse.data)
      } else {
        console.error("Failed to load professionals:", professionalsResponse.error)
      }
    } catch (error) {
      console.error("Error loading dropdown data:", error)
      toast({
        title: "Warning",
        description: "Failed to load companies and professionals list",
        variant: "destructive",
      })
    } finally {
      setIsLoadingDropdowns(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (mode === "create" && !formData.password.trim()) {
      newErrors.password = "Password is required"
    }

    if (mode === "create" && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.role) {
      newErrors.role = "Role is required"
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
        const userData: RegisterUserData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          status: formData.status,
          companyId: formData.companyId ? Number.parseInt(formData.companyId) : undefined,
          professionalId: formData.professionalId ? Number.parseInt(formData.professionalId) : undefined,
        }

        console.log("Creating user with data:", userData)
        const response = await usersApi.createUser(userData)
        console.log("Create user response:", response)

        // Check if the operation was successful (status 200/201 or response is true)
        if (response.status === 200 || response.status === 201 || response.data === true || response === true) {
          const newUser: User = {
            id: 0, // Backend will assign proper ID
            name: formData.name,
            email: formData.email,
            role: formData.role,
            status: formData.status,
            companyId: formData.companyId ? Number.parseInt(formData.companyId) : undefined,
            professionalId: formData.professionalId ? Number.parseInt(formData.professionalId) : undefined,
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString(),
          }

          // dispatch({ type: "ADD_USER", payload: newUser })
          toast({
            title: "Success",
            description: "User created successfully. Refreshing list...",
          })
          onClose()
          // Trigger a page refresh to get updated data from server
          window.location.reload()
        } else {
          console.error("Create user failed:", response)
          throw new Error(response.error || "Failed to create user")
        }
      } else if (user) {
        const userData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status,
          companyId: formData.companyId ? Number.parseInt(formData.companyId) : undefined,
          professionalId: formData.professionalId ? Number.parseInt(formData.professionalId) : undefined,
        }

        if (formData.password) {
          ;(userData as any).password = formData.password
        }

        console.log("Updating user with data:", userData)
        const response = await usersApi.updateUser(user.id.toString(), userData)
        console.log("Update user response:", response)

        // Check if the operation was successful (status 200 or response is true)
        if (response.status === 200 || response.data === true || response === true) {
          // Create updated user object since API might not return the updated user
          const updatedUser =
            response.data && typeof response.data === "object"
              ? response.data
              : {
                  ...user,
                  ...userData,
                  updatedDate: new Date().toISOString(),
                }

          dispatch({ type: "UPDATE_USER", payload: updatedUser })
          toast({
            title: "Success",
            description: "User updated successfully",
          })
          onClose()
        } else {
          console.error("Update user failed:", response)
          throw new Error(response.error || "Failed to update user")
        }
      }
    } catch (error) {
      console.error("Error saving user:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create User" : "Edit User"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Add a new user to the system." : "Update user information."}
          </DialogDescription>
        </DialogHeader>

        {isLoadingDropdowns && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading companies and professionals...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter user name"
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

          <div className="space-y-2">
            <Label htmlFor="password">Password {mode === "create" ? "*" : "(leave blank to keep current)"}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder={mode === "create" ? "Enter password" : "Enter new password"}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="operador">Operator</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="status"
                  checked={formData.status === 1}
                  onCheckedChange={(checked) => handleInputChange("status", checked ? 1 : 0)}
                />
                <Label htmlFor="status">Active</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyId">Company</Label>
              <Select value={formData.companyId} onValueChange={(value) => handleInputChange("companyId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No company</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="professionalId">Professional</Label>
              <Select
                value={formData.professionalId}
                onValueChange={(value) => handleInputChange("professionalId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select professional (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No professional</SelectItem>
                  {professionals.map((professional) => (
                    <SelectItem key={professional.id} value={professional.id.toString()}>
                      {professional.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isLoadingDropdowns}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : mode === "create" ? (
                "Create User"
              ) : (
                "Update User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
