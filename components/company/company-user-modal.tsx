"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"

interface Professional {
  id: number
  name: string
  cpf: string
  email: string
  phone: string
  teamId: number
  companyId: number
  status: string
}

interface User {
  id: number
  name: string
  email: string
  role: string
  status: number
  avatar?: string
  companyId?: number
  professionalId?: number
  createdDate: string
  updatedDate: string
}

interface CompanyUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  user?: User | null
  professionals: Professional[]
}

export function CompanyUserModal({ isOpen, onClose, onSubmit, user, professionals }: CompanyUserModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm()

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setValue("name", user.name)
      setValue("email", user.email)
      setValue("professionalId", user.professionalId?.toString() || "0")
      setValue("status", user.status.toString())
    } else {
      reset()
      setValue("status", "1") // Default to Active
    }
  }, [user, setValue, reset])

  const onSubmitForm = async (data: any) => {
    setIsLoading(true)
    try {
      const payload = {
        ...data,
        status: Number(data.status),
        professionalId: data.professionalId ? Number(data.professionalId) : undefined,
      }
      await onSubmit(payload)
      reset()
      onClose()
    } catch (error) {
      console.error("Error submitting user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">{user ? "Edit User" : "Add New User"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Name
            </Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              className="bg-muted border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              placeholder="Enter user name"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className="bg-muted border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              placeholder="Enter email address"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message as string}</p>}
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                {...register("password", {
                  required: !user ? "Password is required" : false,
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className="bg-muted border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                placeholder="Enter password"
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message as string}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="professionalId" className="text-foreground">
              Link to Professional (Optional)
            </Label>
            <Select value={watch("professionalId")} onValueChange={(value) => setValue("professionalId", value)}>
              <SelectTrigger className="bg-muted border-0 text-foreground focus:ring-primary">
                <SelectValue placeholder="Select a professional" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="0">None</SelectItem>
                {professionals.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id.toString()}>
                    {prof.name} - {prof.cpf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-foreground">
              Status
            </Label>
            <Select value={watch("status")} onValueChange={(value) => setValue("status", value)}>
              <SelectTrigger className="bg-muted border-0 text-foreground focus:ring-primary">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="1">Active</SelectItem>
                <SelectItem value="0">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border text-foreground hover:bg-muted bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? "Saving..." : user ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
