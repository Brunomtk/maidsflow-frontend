"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, User, Phone, Clock, Users, Star, Mail } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfessionalModal } from "@/components/company/professional-modal"
import { ProfessionalDetailsModal } from "@/components/company/professional-details-modal"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { fetchApi } from "@/lib/api/utils"

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

export default function ProfessionalsPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [teamFilter, setTeamFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const companyId = user?.companyId || 1

  const fetchProfessionals = async () => {
    if (!companyId) return
    setIsLoading(true)

    try {
      const params = new URLSearchParams({
        CompanyId: companyId.toString(),
        Page: "1",
        PageSize: "100",
      })

      if (activeTab !== "all") params.append("Status", activeTab)
      if (teamFilter !== "all") params.append("TeamId", teamFilter)

      const data = await fetchApi<{ results: Professional[] }>(`/Professional/paged?${params.toString()}`)
      setProfessionals(data.results || [])
    } catch (error) {
      console.error("Error fetching professionals:", error)
      toast({
        title: "Error",
        description: "Failed to fetch professionals",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTeams = async () => {
    if (!companyId) return

    try {
      const params = new URLSearchParams({
        CompanyId: companyId.toString(),
        Page: "1",
        PageSize: "100",
      })

      const data = await fetchApi<{ results: Team[] }>(`/Team/paged?${params.toString()}`)
      setTeams(data.results || [])
    } catch (error) {
      console.error("Error fetching teams:", error)
      toast({
        title: "Error",
        description: "Failed to fetch teams",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (companyId) {
      fetchProfessionals()
      fetchTeams()
    }
  }, [companyId, activeTab, teamFilter])

  const handleOpenDetailsModal = (professional: Professional) => {
    setSelectedProfessional(professional)
    setIsDetailsModalOpen(true)
  }

  const handleOpenEditModal = (professional: Professional | null = null) => {
    setSelectedProfessional(professional)
    setIsEditModalOpen(true)
  }

  const handleSubmitProfessional = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        cpf: data.cpf,
        email: data.email,
        phone: data.phone,
        teamId: Number(data.teamId),
        companyId,
        ...(selectedProfessional && { status: data.status === "Active" ? 1 : 0 }),
      }

      const endpoint = selectedProfessional ? `/Professional/${selectedProfessional.id}` : `/Professional`
      const method = selectedProfessional ? "PUT" : "POST"

      await fetchApi<Professional>(endpoint, {
        method,
        body: JSON.stringify(payload),
      })

      toast({
        title: "Success",
        description: `Professional ${selectedProfessional ? "updated" : "created"} successfully`,
      })
      setIsEditModalOpen(false)
      fetchProfessionals()
    } catch (error) {
      console.error("Error saving professional:", error)
      toast({
        title: "Error",
        description: `Failed to ${selectedProfessional ? "update" : "create"} professional`,
        variant: "destructive",
      })
    }
  }

  const handleDeleteProfessional = async (professionalId: number) => {
    try {
      await fetchApi<void>(`/Professional/${professionalId}`, {
        method: "DELETE",
      })

      toast({
        title: "Success",
        description: "Professional deleted successfully",
      })
      fetchProfessionals()
    } catch (error) {
      console.error("Error deleting professional:", error)
      toast({
        title: "Error",
        description: "Failed to delete professional",
        variant: "destructive",
      })
    }
  }

  const filteredProfessionals = professionals.filter((p) => {
    const term = searchTerm.toLowerCase()
    return (
      p.name.toLowerCase().includes(term) ||
      p.cpf.includes(term) ||
      p.email.toLowerCase().includes(term) ||
      p.phone.includes(term)
    )
  })

  const activeCount = professionals.filter((p) => p.status === "Active").length
  const averageRating =
    professionals.length > 0 ? professionals.reduce((sum, p) => sum + (p.rating || 0), 0) / professionals.length : 0
  const totalCompleted = professionals.reduce((sum, p) => sum + (p.completedServices || 0), 0)

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Professionals</h1>
          <p className="text-sm sm:text-base text-gray-400">
            Manage your cleaning professionals and track their performance
          </p>
        </div>
        <Button
          className="bg-[#06b6d4] hover:bg-[#0891b2] text-white w-full sm:w-auto"
          onClick={() => handleOpenEditModal()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Professional
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm sm:text-lg">Active Professionals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="bg-[#2a3349] p-2 rounded-full">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-[#06b6d4]" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-white">{activeCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm sm:text-lg">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="bg-[#2a3349] p-2 rounded-full">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-[#06b6d4]" />
              </div>
              <div className="flex items-center">
                <span className="text-2xl sm:text-3xl font-bold text-white">{averageRating.toFixed(1)}</span>
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 ml-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm sm:text-lg">Completed Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="bg-[#2a3349] p-2 rounded-full">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#06b6d4]" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-white">{totalCompleted}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1a2234] border-[#2a3349]">
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4 bg-[#0f172a] border border-[#2a3349] w-full">
              <TabsTrigger value="all" className="data-[state=active]:bg-[#2a3349] text-xs sm:text-sm">
                All
              </TabsTrigger>
              <TabsTrigger value="Active" className="data-[state=active]:bg-[#2a3349] text-xs sm:text-sm">
                Active
              </TabsTrigger>
              <TabsTrigger value="Inactive" className="data-[state=active]:bg-[#2a3349] text-xs sm:text-sm">
                Inactive
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search professionals..."
                className="pl-8 bg-[#2a3349] border-0 text-white placeholder:text-gray-500 focus-visible:ring-[#06b6d4]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-[#2a3349] border-0 text-white focus:ring-[#06b6d4]">
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-white">Loading professionals...</div>
            </div>
          ) : (
            <>
              <div className="block sm:hidden">
                <div className="space-y-3 p-4">
                  {filteredProfessionals.length > 0 ? (
                    filteredProfessionals.map((professional) => {
                      const team = teams.find((t) => t.id === professional.teamId)
                      return (
                        <Card key={professional.id} className="bg-[#2a3349] border-[#3a4359]">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={`/placeholder.svg?height=40&width=40&query=${professional.name}`}
                                    alt={professional.name}
                                  />
                                  <AvatarFallback className="bg-[#1a2234] text-[#06b6d4] text-sm">
                                    {professional.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-white text-sm truncate">{professional.name}</div>
                                  <div className="text-xs text-gray-400 truncate">{professional.cpf}</div>
                                </div>
                              </div>
                              <Badge
                                className={
                                  professional.status === "Active"
                                    ? "bg-green-500/20 text-green-500 border-green-500 text-xs"
                                    : "bg-gray-500/20 text-gray-400 border-gray-500 text-xs"
                                }
                              >
                                {professional.status}
                              </Badge>
                            </div>

                            <div className="space-y-2 mb-3">
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Phone className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                <span className="truncate">{professional.phone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Mail className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                <span className="truncate">{professional.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Users className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                <span className="truncate">{team?.name || `Team ${professional.teamId}`}</span>
                              </div>
                              {professional.rating && (
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                                  <span>{professional.rating}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 h-8 text-xs border-[#3a4359] text-white hover:bg-[#3a4359] bg-transparent"
                                onClick={() => handleOpenDetailsModal(professional)}
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 h-8 text-xs border-[#3a4359] text-white hover:bg-[#3a4359] bg-transparent"
                                onClick={() => handleOpenEditModal(professional)}
                              >
                                Edit
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No professionals found matching your search criteria
                    </div>
                  )}
                </div>
              </div>

              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#2a3349] hover:bg-[#2a3349]">
                      <TableHead className="text-gray-400">Professional</TableHead>
                      <TableHead className="text-gray-400">Contact</TableHead>
                      <TableHead className="text-gray-400">Team</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Rating</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfessionals.length > 0 ? (
                      filteredProfessionals.map((professional) => {
                        const team = teams.find((t) => t.id === professional.teamId)
                        return (
                          <TableRow key={professional.id} className="border-[#2a3349] hover:bg-[#2a3349]">
                            <TableCell className="font-medium text-white">
                              <div className="flex items-center gap-2">
                                <Avatar>
                                  <AvatarImage
                                    src={`/placeholder.svg?height=40&width=40&query=${professional.name}`}
                                    alt={professional.name}
                                  />
                                  <AvatarFallback className="bg-[#2a3349] text-[#06b6d4]">
                                    {professional.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div>{professional.name}</div>
                                  <div className="text-xs text-gray-400">{professional.cpf}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-gray-400 text-sm">
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-gray-500" />
                                  {professional.phone}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Mail className="h-3 w-3 text-gray-500" />
                                  {professional.email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-gray-400">
                                <Users className="h-3 w-3 text-gray-500" />
                                {team?.name || `Team ${professional.teamId}`}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  professional.status === "Active"
                                    ? "bg-green-500/20 text-green-500 border-green-500"
                                    : "bg-gray-500/20 text-gray-400 border-gray-500"
                                }
                              >
                                {professional.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span className="text-white font-medium">{professional.rating || "N/A"}</span>
                                {professional.rating && <Star className="h-3 w-3 text-yellow-500 ml-1" />}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 border-[#2a3349] text-white hover:bg-[#2a3349] bg-transparent"
                                  onClick={() => handleOpenDetailsModal(professional)}
                                >
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 border-[#2a3349] text-white hover:bg-[#2a3349] bg-transparent"
                                  onClick={() => handleOpenEditModal(professional)}
                                >
                                  Edit
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-gray-400">
                          No professionals found matching your search criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ProfessionalModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleSubmitProfessional}
        professional={selectedProfessional}
        teams={teams}
      />

      <ProfessionalDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={handleOpenEditModal}
        professional={selectedProfessional}
        teams={teams}
      />
    </div>
  )
}
