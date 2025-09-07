"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, Users, Star, Calendar, MapPin, Edit, Clock, Award } from "lucide-react"

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

interface ProfessionalDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  onEdit: (professional: Professional) => void
  professional: Professional | null
  teams: Team[]
}

export function ProfessionalDetailsModal({
  isOpen,
  onClose,
  onEdit,
  professional,
  teams,
}: ProfessionalDetailsModalProps) {
  if (!professional) return null

  const team = teams.find((t) => t.id === professional.teamId)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a2234] border-[#2a3349] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            Professional Details
            <Button
              size="sm"
              onClick={() => onEdit(professional)}
              className="bg-[#06b6d4] hover:bg-[#0891b2] text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Professional Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={`/placeholder.svg?height=80&width=80&query=${professional.name}`}
                alt={professional.name}
              />
              <AvatarFallback className="bg-[#2a3349] text-[#06b6d4] text-xl">
                {professional.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{professional.name}</h2>
              <p className="text-gray-400">{professional.cpf}</p>
              <Badge
                className={
                  professional.status === "Active"
                    ? "bg-green-500/20 text-green-500 border-green-500 mt-2"
                    : "bg-gray-500/20 text-gray-400 border-gray-500 mt-2"
                }
              >
                {professional.status}
              </Badge>
            </div>
          </div>

          <Separator className="bg-[#2a3349]" />

          {/* Contact Information */}
          <Card className="bg-[#2a3349] border-[#3a4359]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5 text-[#06b6d4]" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">{professional.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">{professional.phone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Team Information */}
          {team && (
            <Card className="bg-[#2a3349] border-[#3a4359]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#06b6d4]" />
                  Team Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-white">{team.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{team.region}</span>
                </div>
                <div className="text-gray-300 text-sm">{team.description}</div>
              </CardContent>
            </Card>
          )}

          {/* Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-[#2a3349] border-[#3a4359]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-400">Rating</p>
                    <p className="text-xl font-bold text-white">
                      {professional.rating ? professional.rating.toFixed(1) : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#2a3349] border-[#3a4359]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#06b6d4]" />
                  <div>
                    <p className="text-sm text-gray-400">Completed Services</p>
                    <p className="text-xl font-bold text-white">{professional.completedServices || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#2a3349] border-[#3a4359]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <p className="text-xl font-bold text-white">{professional.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <Card className="bg-[#2a3349] border-[#3a4359]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#06b6d4]" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Created Date</p>
                  <p className="text-white">{formatDate(professional.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Last Updated</p>
                  <p className="text-white">{formatDate(professional.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[#2a3349] text-white hover:bg-[#2a3349] bg-transparent"
            >
              Close
            </Button>
            <Button onClick={() => onEdit(professional)} className="bg-[#06b6d4] hover:bg-[#0891b2] text-white">
              <Edit className="h-4 w-4 mr-2" />
              Edit Professional
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
