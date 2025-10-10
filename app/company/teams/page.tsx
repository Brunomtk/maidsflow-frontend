"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Users, Calendar, Star, MapPin, Filter, RefreshCw } from "lucide-react"
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
  const [isRefreshing, setIsRefreshing] = useState(false)

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
    await handleRefresh()
  }

  const handleDeleteTeam = async (id: number) => {
    if (confirm("Are you sure you want to delete this team?")) {
      await removeTeam(id.toString())
      await handleRefresh()
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const currentSearch = searchQuery
      const currentStatus = statusFilter
      setSearchQuery("")
      setStatusFilter("all")
      await new Promise((resolve) => setTimeout(resolve, 100))
      setSearchQuery(currentSearch)
      setStatusFilter(currentStatus)
    } finally {
      setIsRefreshing(false)
    }
  }

  const getStatusBadge = (status: number) => {
    return status === 1 ? (
      <Badge className="bg-green-500/20 text-green-500 border-green-500">Active</Badge>
    ) : (
      <Badge className="bg-red-500/20 text-red-500 border-red-500">Inactive</Badge>
    )
  }

  const activeTeams = teams.filter((team) => team.status === 1).length
  const totalServices = teams.reduce((sum, team) => sum + team.completedServices, 0)
  const averageRating = teams.length > 0 ? teams.reduce((sum, team) => sum + team.rating, 0) / teams.length : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Teams</h1>
          <p className="text-muted-foreground">Manage your work teams</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="border-border text-foreground hover:bg-muted bg-transparent"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button className="bg-[#06b6d4] hover:bg-[#0891b2] text-white" onClick={handleCreateTeam}>
            <Plus className="h-4 w-4 mr-2" />
            New Team
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-lg">Active Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-muted p-2 rounded-full">
                  <Users className="h-5 w-5 text-[#06b6d4]" />
                </div>
              </div>
              <span className="text-3xl font-bold text-foreground">{activeTeams}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-lg">Total Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-muted p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-[#06b6d4]" />
                </div>
              </div>
              <span className="text-3xl font-bold text-foreground">{totalServices}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-lg">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-muted p-2 rounded-full">
                  <Star className="h-5 w-5 text-[#06b6d4]" />
                </div>
              </div>
              <span className="text-3xl font-bold text-foreground">{averageRating.toFixed(1)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                className="pl-8 bg-muted border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-[#06b6d4]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filters:</span>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] bg-muted border-0 text-foreground focus:ring-[#06b6d4]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
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
              <div className="text-muted-foreground">Loading teams...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted">
                  <TableHead className="text-muted-foreground">Team Name</TableHead>
                  <TableHead className="text-muted-foreground">Region</TableHead>
                  <TableHead className="text-muted-foreground">Services</TableHead>
                  <TableHead className="text-muted-foreground">Rating</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.length > 0 ? (
                  teams.map((team) => (
                    <TableRow key={team.id} className="border-border hover:bg-muted">
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="bg-muted p-2 rounded-full">
                            <Users className="h-4 w-4 text-[#06b6d4]" />
                          </div>
                          <div>
                            <div>{team.name}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {team.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {team.region}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{team.completedServices}</TableCell>
                      <TableCell>
                        {team.rating > 0 ? (
                          <div className="flex items-center">
                            <div className="bg-muted px-1.5 py-0.5 rounded flex items-center">
                              <span className="text-foreground mr-1">{team.rating.toFixed(1)}</span>
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(team.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-border text-foreground hover:bg-muted bg-transparent"
                            onClick={() => handleViewTeamDetails(team)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-border text-foreground hover:bg-muted bg-transparent"
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
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No teams found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CompanyTeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitTeam}
        team={selectedTeam}
      />

      <CompanyTeamDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={handleEditTeam}
        team={selectedTeam}
      />
    </div>
  )
}
