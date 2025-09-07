"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle, MapPin, Star, Users, Building } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import type { Team } from "@/types"

interface CompanyTeamDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  onEdit: (team: Team) => void
  team: Team | null
}

export function CompanyTeamDetailsModal({ isOpen, onClose, onEdit, team }: CompanyTeamDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!team) return null

  const getStatusBadge = (status: number) => {
    return status === 1 ? (
      <Badge className="bg-green-500/20 text-green-500 border-green-500">Active</Badge>
    ) : (
      <Badge className="bg-red-500/20 text-red-500 border-red-500">Inactive</Badge>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-[#1a2234] border-[#2a3349] text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#06b6d4]" />
            Team Details
          </DialogTitle>
          <DialogDescription className="text-gray-400">Complete team information</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between mt-4">
          <div>
            <h3 className="text-xl font-semibold">{team.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">{team.region}</span>
              </div>
              <span className="text-gray-500">•</span>
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">{team.company?.name || "Company"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(team.status)}
            <Button size="sm" onClick={() => onEdit(team)} className="bg-[#06b6d4] hover:bg-[#0891b2] text-white h-8">
              Edit Team
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <Card className="bg-[#0f172a] border-[#2a3349]">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Star className="h-8 w-8 text-[#06b6d4] mb-2" />
              <span className="text-sm text-gray-400">Rating</span>
              <span className="text-xl font-bold text-white">{team.rating > 0 ? team.rating.toFixed(1) : "N/A"}</span>
            </CardContent>
          </Card>

          <Card className="bg-[#0f172a] border-[#2a3349]">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <CheckCircle className="h-8 w-8 text-[#06b6d4] mb-2" />
              <span className="text-sm text-gray-400">Services</span>
              <span className="text-xl font-bold text-white">{team.completedServices}</span>
            </CardContent>
          </Card>

          <Card className="bg-[#0f172a] border-[#2a3349]">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Calendar className="h-8 w-8 text-[#06b6d4] mb-2" />
              <span className="text-sm text-gray-400">Status</span>
              <span className="text-xl font-bold text-white">{team.status === 1 ? "Active" : "Inactive"}</span>
            </CardContent>
          </Card>
        </div>

        {team.description && (
          <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349] mt-4">
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-gray-400">{team.description}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="bg-[#0f172a] border border-[#2a3349]">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#2a3349]">
              Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <Card className="bg-[#0f172a] border-[#2a3349]">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base">Team Information</CardTitle>
                <CardDescription className="text-gray-400">Basic team data from API</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-400">Name</span>
                    <p className="font-medium">{team.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Region</span>
                    <p className="font-medium">{team.region}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Created at</span>
                    <p className="font-medium">{new Date(team.createdDate).toLocaleDateString("en-US")}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Updated at</span>
                    <p className="font-medium">{new Date(team.updatedDate).toLocaleDateString("en-US")}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Completed Services</span>
                    <p className="font-medium">{team.completedServices}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Rating</span>
                    <p className="font-medium">{team.rating > 0 ? team.rating.toFixed(1) : "Not rated yet"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0f172a] border-[#2a3349]">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base">Additional Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Extended team details are not available through the current API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">
                  Performance metrics, upcoming services, and detailed activity history are not currently available
                  through the API. Only basic team information is displayed from the real data source.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
