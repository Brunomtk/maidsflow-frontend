"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Users, Calendar, Star, MapPin, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CompanyTeamModal } from "@/components/company/company-team-modal"
import { CompanyTeamDetailsModal } from "@/components/company/company-team-details-modal"
import { useCompanyTeams } from "@/hooks/use-company-teams"
import type { Team, CreateTeamRequest, UpdateTeamRequest } from "@/types"

export default function CompanyTeamsPage() {
  const {
    teams,
    isLoading,
    pagination,
    statusFilter,
    searchQuery,
    addTeam,
    editTeam,
    removeTeam,
    setStatusFilter,
    setSearchQuery,
  } = useCompanyTeams()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  const handleCreateTeam = () => {
    setSelectedTeam(null)
    setIsModalOpen(true)
  }

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team)
    setIsModalOpen(true)
    setIsDetailsModalOpen(false)
  }

  const handleViewTeamDetails = (team: Team) => {
    setSelectedTeam(team)
    setIsDetailsModalOpen(true)
  }

  const handleSubmitTeam = async (data: CreateTeamRequest | UpdateTeamRequest) => {
    if (selectedTeam) {
      await editTeam(selectedTeam.id.toString(), data as UpdateTeamRequest)
    } else {
      await addTeam(data as CreateTeamRequest)
    }
    setIsModalOpen(false)
  }

  const handleDeleteTeam = async (id: number) => {
    if (confirm("Are you sure you want to delete this team?")) {
      await removeTeam(id.toString())
    }
  }

  const getStatusBadge = (status: number) => {
    return status === 1 ? (
      <Badge className="bg-green-500/20 text-green-500 border-green-500">Active</Badge>
    ) : (
      <Badge className="bg-red-500/20 text-red-500 border-red-500">Inactive</Badge>
    )
  }

  // Calculate stats
  const activeTeams = teams.filter((team) => team.status === 1).length
  const totalServices = teams.reduce((sum, team) => sum + team.completedServices, 0)
  const averageRating = teams.length > 0 ? teams.reduce((sum, team) => sum + team.rating, 0) / teams.length : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Teams</h1>
          <p className="text-gray-400">Manage your work teams</p>
        </div>
        <Button className="bg-[#06b6d4] hover:bg-[#0891b2] text-white" onClick={handleCreateTeam}>
          <Plus className="h-4 w-4 mr-2" />
          New Team
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Active Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-[#2a3349] p-2 rounded-full">
                  <Users className="h-5 w-5 text-[#06b6d4]" />
                </div>
              </div>
              <span className="text-3xl font-bold text-white">{activeTeams}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Total Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-[#2a3349] p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-[#06b6d4]" />
                </div>
              </div>
              <span className="text-3xl font-bold text-white">{totalServices}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-[#2a3349] p-2 rounded-full">
                  <Star className="h-5 w-5 text-[#06b6d4]" />
                </div>
              </div>
              <span className="text-3xl font-bold text-white">{averageRating.toFixed(1)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1a2234] border-[#2a3349]">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search teams..."
                className="pl-8 bg-[#2a3349] border-0 text-white placeholder:text-gray-500 focus-visible:ring-[#06b6d4]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-400">Filters:</span>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] bg-[#2a3349] border-0 text-white focus:ring-[#06b6d4]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="0">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-400">Loading teams...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#2a3349] hover:bg-[#2a3349]">
                  <TableHead className="text-gray-400">Team Name</TableHead>
                  <TableHead className="text-gray-400">Region</TableHead>
                  <TableHead className="text-gray-400">Services</TableHead>
                  <TableHead className="text-gray-400">Rating</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.length > 0 ? (
                  teams.map((team) => (
                    <TableRow key={team.id} className="border-[#2a3349] hover:bg-[#2a3349]">
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-2">
                          <div className="bg-[#2a3349] p-2 rounded-full">
                            <Users className="h-4 w-4 text-[#06b6d4]" />
                          </div>
                          <div>
                            <div>{team.name}</div>
                            <div className="text-xs text-gray-400 truncate max-w-[200px]">{team.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-gray-400">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          {team.region}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-400">{team.completedServices}</TableCell>
                      <TableCell>
                        {team.rating > 0 ? (
                          <div className="flex items-center">
                            <div className="bg-[#2a3349] px-1.5 py-0.5 rounded flex items-center">
                              <span className="text-white mr-1">{team.rating.toFixed(1)}</span>
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(team.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-[#2a3349] text-white hover:bg-[#2a3349] bg-transparent"
                            onClick={() => handleViewTeamDetails(team)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-[#2a3349] text-white hover:bg-[#2a3349] bg-transparent"
                            onClick={() => handleEditTeam(team)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-red-500 text-red-500 hover:bg-red-500/10 bg-transparent"
                            onClick={() => handleDeleteTeam(team.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-400">
                      No teams found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Team Modal for creating/editing teams */}
      <CompanyTeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitTeam}
        team={selectedTeam}
      />

      {/* Team Details Modal */}
      <CompanyTeamDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={handleEditTeam}
        team={selectedTeam}
      />
    </div>
  )
}
