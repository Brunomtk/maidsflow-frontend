"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Users, Building2, RefreshCw, Eye } from "lucide-react"
import { TeamModal } from "@/components/admin/team-modal"
import { TeamDetailsModal } from "@/components/admin/team-details-modal"
import { useToast } from "@/hooks/use-toast"
import { getApiUrl } from "@/lib/api/utils"

interface Team {
  id: number
  name: string
  region: string
  description: string
  rating: number
  completedServices: number
  status: number
  companyId: number
  company?: {
    id: number
    name: string
    cnpj: string
    responsible: string
    email: string
    phone: string
    planId: number
    status: number
    createdDate: string
    updatedDate: string
  }
  leaderId?: number
  leader?: {
    id: number
    userId: number
    name: string
    email: string
    phone: string
    region: string
    status: number
    createdDate: string
    updatedDate: string
  }
  createdDate: string
  updatedDate: string
}

interface Company {
  id: number
  name: string
  cnpj: string
  responsible: string
  email: string
  phone: string
  status: number
}

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null)
  const { toast } = useToast()

  // Helper function to make API calls
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = getApiUrl()
    const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

    const token = localStorage.getItem("noah_token")
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const data = await apiCall("/Team/paged")

      // Handle the paged response format
      const teamsArray = data.results || []
      setTeams(teamsArray)
      console.log("Teams loaded:", teamsArray)
    } catch (error) {
      console.error("Error fetching teams:", error)
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive",
      })
      setTeams([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const data = await apiCall("/Companies")
      const companiesArray = data.results || data.result || data.data || data || []
      const companies = Array.isArray(companiesArray) ? companiesArray : []
      setCompanies(companies)
      console.log("Companies loaded:", companies)
    } catch (error) {
      console.error("Error fetching companies:", error)
      setCompanies([])
    }
  }

  const handleCreateTeam = async (teamData: any) => {
    try {
      const payload = {
        name: teamData.name,
        leaderId: teamData.leaderId || null,
        region: teamData.region || "",
        description: teamData.description,
        companyId: teamData.companyId,
      }

      console.log("Creating team with payload:", payload)

      await apiCall("/Team", {
        method: "POST",
        body: JSON.stringify(payload),
      })

      toast({
        title: "Success",
        description: "Team created successfully",
      })

      setIsCreateModalOpen(false)
      await fetchTeams()
    } catch (error) {
      console.error("Error creating team:", error)
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTeam = async (teamData: any) => {
    if (!selectedTeam) return

    try {
      const payload = {
        id: selectedTeam.id,
        createdDate: selectedTeam.createdDate,
        updatedDate: new Date().toISOString(),
        name: teamData.name,
        region: teamData.region || selectedTeam.region,
        description: teamData.description,
        rating: selectedTeam.rating,
        completedServices: selectedTeam.completedServices,
        status: teamData.status,
        companyId: teamData.companyId,
        company: selectedTeam.company,
        leaderId: teamData.leaderId || null,
        leader: selectedTeam.leader,
      }

      console.log("Updating team with payload:", payload)

      await apiCall(`/Team/${selectedTeam.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      })

      toast({
        title: "Success",
        description: "Team updated successfully",
      })

      setIsEditModalOpen(false)
      setSelectedTeam(null)
      await fetchTeams()
    } catch (error) {
      console.error("Error updating team:", error)
      toast({
        title: "Error",
        description: "Failed to update team",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return

    try {
      const response = await fetch(`${getApiUrl()}/Team/${teamToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("noah_token")}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        await response.json()
      }

      toast({
        title: "Success",
        description: "Team deleted successfully",
      })

      setIsDeleteDialogOpen(false)
      setTeamToDelete(null)
      await fetchTeams()
    } catch (error) {
      console.error("Error deleting team:", error)
      toast({
        title: "Error",
        description: "Failed to delete team",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge className="bg-green-500">Active</Badge>
      case 0:
        return <Badge variant="secondary">Inactive</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const filteredTeams = teams.filter(
    (team) =>
      team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.leader?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  useEffect(() => {
    fetchTeams()
    fetchCompanies()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 md:py-6 px-4 md:px-0 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Teams Management</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage teams and their members</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchTeams} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Team
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-[#00D3F3]/10 via-card to-[#00D3F3]/5 border-[#00D3F3]/30 shadow-lg hover:shadow-[#00D3F3]/20 hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-card-foreground">Total Teams</CardTitle>
            <Users className="h-3 w-3 md:h-4 md:w-4 text-[#00D3F3]" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-[#00D3F3]">{teams.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 via-card to-green-500/5 border-green-500/30 shadow-lg hover:shadow-green-500/20 hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-card-foreground">Active Teams</CardTitle>
            <Users className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-green-500">
              {teams.filter((t) => t.status === 1).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 via-card to-purple-500/5 border-purple-500/30 shadow-lg hover:shadow-purple-500/20 hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-card-foreground">Companies</CardTitle>
            <Building2 className="h-3 w-3 md:h-4 md:w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-purple-500">{companies.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 via-card to-orange-500/5 border-orange-500/30 shadow-lg hover:shadow-orange-500/20 hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-card-foreground">Inactive Teams</CardTitle>
            <Users className="h-3 w-3 md:h-4 md:w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-orange-500">
              {teams.filter((t) => t.status === 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="block md:hidden">
        <Card className="bg-gradient-to-br from-muted/50 via-muted/30 to-transparent border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-card-foreground text-lg">Teams List</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">Manage and organize teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-3">
              {filteredTeams.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    {searchTerm ? "No teams found matching your search." : "No teams found."}
                  </p>
                </div>
              ) : (
                filteredTeams.map((team) => (
                  <Card
                    key={team.id}
                    className="bg-gradient-to-br from-muted/50 via-muted/30 to-transparent border-border shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-foreground text-sm">{team.name}</div>
                          {team.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {team.description}
                            </div>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTeam(team)
                                setIsDetailsModalOpen(true)
                              }}
                              className="text-card-foreground hover:bg-border hover:text-foreground text-xs"
                            >
                              <Eye className="mr-2 h-3 w-3" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTeam(team)
                                setIsEditModalOpen(true)
                              }}
                              className="text-card-foreground hover:bg-border hover:text-foreground text-xs"
                            >
                              <Edit className="mr-2 h-3 w-3" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setTeamToDelete(team)
                                setIsDeleteDialogOpen(true)
                              }}
                              className="text-red-500 hover:bg-border hover:text-red-400 text-xs"
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className="text-xs">{team.company?.name || "N/A"}</Badge>
                        {getStatusBadge(team.status)}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Leader: {team.leader?.name || "No leader assigned"}
                      </div>
                      <div className="text-xs text-muted-foreground">Region: {team.region || "N/A"}</div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="hidden md:block">
        <Card className="bg-gradient-to-br from-card via-card to-muted/20 border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-card-foreground">Teams List</CardTitle>
            <CardDescription className="text-muted-foreground">Manage and organize teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Company</TableHead>
                    <TableHead className="text-muted-foreground">Leader</TableHead>
                    <TableHead className="text-muted-foreground">Region</TableHead>
                    <TableHead className="text-muted-foreground">Rating</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Created</TableHead>
                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeams.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? "No teams found matching your search." : "No teams found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTeams.map((team) => (
                      <TableRow key={team.id} className="border-border">
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">{team.name}</div>
                            {team.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-xs">{team.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">{team.company?.name || "N/A"}</TableCell>
                        <TableCell className="text-foreground">{team.leader?.name || "No leader assigned"}</TableCell>
                        <TableCell className="text-foreground">{team.region || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-foreground">{team.rating.toFixed(1)}</span>
                            <span className="text-yellow-500">★</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(team.status)}</TableCell>
                        <TableCell className="text-foreground">
                          {team.createdDate ? new Date(team.createdDate).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedTeam(team)
                                  setIsDetailsModalOpen(true)
                                }}
                                className="text-card-foreground hover:bg-border hover:text-foreground"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedTeam(team)
                                  setIsEditModalOpen(true)
                                }}
                                className="text-card-foreground hover:bg-border hover:text-foreground"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setTeamToDelete(team)
                                  setIsDetailsModalOpen(false)
                                  setIsDeleteDialogOpen(true)
                                }}
                                className="text-red-500 hover:bg-border hover:text-red-400"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <TeamModal
        isOpen={isCreateModalOpen}
        companies={companies}
        onSubmit={handleCreateTeam}
        onCancel={() => setIsCreateModalOpen(false)}
      />

      <TeamModal
        isOpen={isEditModalOpen}
        team={selectedTeam}
        companies={companies}
        onSubmit={handleUpdateTeam}
        onCancel={() => {
          setIsEditModalOpen(false)
          setSelectedTeam(null)
        }}
      />

      <TeamDetailsModal
        isOpen={isDetailsModalOpen}
        team={selectedTeam}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedTeam(null)
        }}
        onEdit={(team) => {
          setSelectedTeam(team)
          setIsDetailsModalOpen(false)
          setIsEditModalOpen(true)
        }}
        onDelete={(team) => {
          setTeamToDelete(team)
          setIsDetailsModalOpen(false)
          setIsDeleteDialogOpen(true)
        }}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-card-foreground">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete the team "{teamToDelete?.name}" and remove all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTeamToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTeam} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
