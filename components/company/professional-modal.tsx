"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"

interface Team {
  id: number
  name: string
  region: string
  description: string
  rating: number
  completedServices: number
  status: number
  companyId: number
  leaderId: number
  createdDate: string
  updatedDate: string
}

interface Professional {
  id: number
  name: string
  cpf: string
  email: string
  phone: string
  teamId: number
  companyId: number
  status: string
  rating: number | null
  completedServices: number | null
  createdAt: string
  updatedAt: string
}

interface ProfessionalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  professional?: Professional | null
  teams: Team[]
}

export function ProfessionalModal({ isOpen, onClose, onSubmit, professional, teams }: ProfessionalModalProps) {
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
    if (professional) {
      setValue("name", professional.name)
      setValue("cpf", professional.cpf)
      setValue("email", professional.email)
      setValue("phone", professional.phone)
      setValue("teamId", professional.teamId.toString())
      setValue("status", professional.status)
    } else {
      reset()
    }
  }, [professional, setValue, reset])

  const onSubmitForm = async (data: any) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      reset()
      onClose()
    } catch (error) {
      console.error("Error submitting professional:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {professional ? "Edit Professional" : "Add New Professional"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Name
            </Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              className="bg-muted border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-[#06b6d4]"
              placeholder="Enter professional name"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf" className="text-foreground">
              Document
            </Label>
            <Input
              id="cpf"
              {...register("cpf", { required: "Document is required" })}
              className="bg-muted border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-[#06b6d4]"
              placeholder="Enter document number"
            />
            {errors.cpf && <p className="text-red-500 text-sm">{errors.cpf.message as string}</p>}
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
              className="bg-muted border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-[#06b6d4]"
              placeholder="Enter email address"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground">
              Phone
            </Label>
            <Input
              id="phone"
              {...register("phone", { required: "Phone is required" })}
              className="bg-muted border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-[#06b6d4]"
              placeholder="Enter phone number"
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamId" className="text-foreground">
              Team
            </Label>
            <Select value={watch("teamId")} onValueChange={(value) => setValue("teamId", value)}>
              <SelectTrigger className="bg-muted border-0 text-foreground focus:ring-[#06b6d4]">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.name} - {team.region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.teamId && <p className="text-red-500 text-sm">Team is required</p>}
          </div>

          {professional && (
            <div className="space-y-2">
              <Label htmlFor="status" className="text-foreground">
                Status
              </Label>
              <Select value={watch("status")} onValueChange={(value) => setValue("status", value)}>
                <SelectTrigger className="bg-muted border-0 text-foreground focus:ring-[#06b6d4]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border text-foreground hover:bg-muted bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-[#06b6d4] hover:bg-[#0891b2] text-white">
              {isLoading ? "Saving..." : professional ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
