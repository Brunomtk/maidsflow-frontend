"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Calendar, UserIcon, LinkIcon } from "lucide-react"

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

interface UserDetails {
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

interface CompanyUserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserDetails | null
  professionals: Professional[]
}

export function CompanyUserDetailsModal({ isOpen, onClose, user, professionals }: CompanyUserDetailsModalProps) {
  if (!user) return null

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return { label: "Active", className: "border-green-500 text-green-500" }
      case 0:
        return { label: "Inactive", className: "border-red-500 text-red-500" }
      default:
        return { label: "Unknown", className: "border-gray-500 text-gray-500" }
    }
  }

  const linkedProfessional = user.professionalId ? professionals.find((p) => p.id === user.professionalId) : null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary/30 shadow-md">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-xl">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground">{user.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="border-primary text-primary">
                  Professional
                </Badge>
                <Badge variant="outline" className={getStatusBadge(user.status).className}>
                  {getStatusBadge(user.status).label}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <UserIcon className="h-4 w-4" />
                <div>
                  <p className="text-xs text-muted-foreground">User ID</p>
                  <p className="text-sm text-foreground">#{user.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <div>
                  <p className="text-xs text-muted-foreground">Created Date</p>
                  <p className="text-sm text-foreground">{new Date(user.createdDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <LinkIcon className="h-4 w-4" />
                <div>
                  <p className="text-xs text-muted-foreground">Linked Professional</p>
                  {linkedProfessional ? (
                    <div>
                      <p className="text-sm text-foreground font-medium">{linkedProfessional.name}</p>
                      <p className="text-xs text-muted-foreground">{linkedProfessional.cpf}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not linked</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm text-foreground">{new Date(user.updatedDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {linkedProfessional && (
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">Professional Information</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="text-foreground">{linkedProfessional.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="text-foreground">{linkedProfessional.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge
                    variant="outline"
                    className={
                      linkedProfessional.status === "Active"
                        ? "border-green-500 text-green-500"
                        : "border-red-500 text-red-500"
                    }
                  >
                    {linkedProfessional.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
