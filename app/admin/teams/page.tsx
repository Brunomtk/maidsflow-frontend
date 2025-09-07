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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Users, Building2, RefreshCw } from "lucide-react"
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
      fetchTeams()
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
      fetchTeams()
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
      await apiCall(`/Team/${teamToDelete.id}`, {
        method: "DELETE",
      })

      toast({
        title: "Success",
        description: "Team deleted successfully",
      })

      setIsDeleteDialogOpen(false)
      setTeamToDelete(null)
      fetchTeams()
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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams Management</h1>
          <p className="text-gray-600">Manage teams and their members</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchTeams} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Team
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.filter((t) => t.status === 1).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teams.length > 0 ? (teams.reduce((sum, team) => sum + team.rating, 0) / teams.length).toFixed(1) : "0.0"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Teams</CardTitle>
          <CardDescription>Manage and organize teams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Teams Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Leader</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                    <TableRow key={team.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{team.name}</div>
                          {team.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">{team.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{team.company?.name || "N/A"}</TableCell>
                      <TableCell>{team.leader?.name || "No leader assigned"}</TableCell>
                      <TableCell>{team.region || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{team.rating.toFixed(1)}</span>
                          <span className="text-yellow-500">★</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(team.status)}</TableCell>
                      <TableCell>
                        {team.createdDate ? new Date(team.createdDate).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTeam(team)
                                setIsDetailsModalOpen(true)
                              }}
                            >
                              <Users className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTeam(team)
                                setIsEditModalOpen(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setTeamToDelete(team)
                                setIsDeleteDialogOpen(true)
                              }}
                              className="text-red-600"
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

      {/* Create Team Modal */}
      <TeamModal
        isOpen={isCreateModalOpen}
        companies={companies}
        onSubmit={handleCreateTeam}
        onCancel={() => setIsCreateModalOpen(false)}
      />

      {/* Edit Team Modal */}
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

      {/* Team Details Modal */}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
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
