"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Eye, Edit, Trash2, Calendar } from "lucide-react"
import { ProfessionalModal } from "@/components/admin/professional-modal"
import { ProfessionalDetailsModal } from "@/components/admin/professional-details-modal"
import { useToast } from "@/hooks/use-toast"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// importa fetchApi do seu utils central
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
}

interface Company {
  id: number
  name: string
}

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [professionalToDelete, setProfessionalToDelete] = useState<Professional | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [teamFilter, setTeamFilter] = useState("all")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [teams, setTeams] = useState<Team[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoadingFilters, setIsLoadingFilters] = useState(true)
  const { toast } = useToast()

  // Carrega dados iniciais: profissionais, times e empresas
  useEffect(() => {
    loadInitialData()
  }, [])

  // Recarrega profissionais quando filtros mudam
  useEffect(() => {
    if (!isLoadingFilters) {
      loadProfessionals()
    }
  }, [statusFilter, teamFilter, companyFilter, searchQuery, isLoadingFilters])

  async function loadInitialData() {
    setIsLoading(true)
    setIsLoadingFilters(true)

    try {
      const [profs, tms, cps] = await Promise.all([
        // endpoints em utils já adicionam o baseUrl + "/api"
        fetchApi<Professional[]>("/Professional"),
        fetchApi<{ results: Team[] }>("/Team?page=1&pageSize=100&status=all"),
        fetchApi<Company[]>("/Companies"),
      ])

      setProfessionals(Array.isArray(profs) ? profs : [])
      setTeams(tms.results || [])
      setCompanies(Array.isArray(cps) ? cps : [])
    } catch (error) {
      console.error("Failed to load initial data:", error)
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
      setProfessionals([])
      setTeams([])
      setCompanies([])
    } finally {
      setIsLoading(false)
      setIsLoadingFilters(false)
    }
  }

  async function loadProfessionals() {
    try {
      // você pode incluir query params de filtros aqui também, se quiser
      const all = await fetchApi<Professional[]>("/Professional")
      setProfessionals(Array.isArray(all) ? all : [])
    } catch (error) {
      console.error("Failed to load professionals:", error)
      toast({
        title: "Error",
        description: "Failed to load professionals",
        variant: "destructive",
      })
      setProfessionals([])
    }
  }

  async function handleAddProfessional(data: any) {
    try {
      await fetchApi("/Professional", {
        method: "POST",
        body: JSON.stringify(data),
      })
      toast({ title: "Success", description: "Professional created successfully" })
      setIsModalOpen(false)
      loadProfessionals()
    } catch (error) {
      console.error("Failed to create professional:", error)
      toast({ title: "Error", description: "Failed to create professional", variant: "destructive" })
    }
  }

  async function handleEditProfessional(data: any) {
    if (!selectedProfessional) return
    try {
      await fetchApi(`/Professional/${selectedProfessional.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
      toast({ title: "Success", description: "Professional updated successfully" })
      setSelectedProfessional(null)
      setIsModalOpen(false)
      loadProfessionals()
    } catch (error) {
      console.error("Failed to update professional:", error)
      toast({ title: "Error", description: "Failed to update professional", variant: "destructive" })
    }
  }

  async function handleDeleteProfessional() {
    if (!professionalToDelete) return
    try {
      await fetchApi(`/Professional/${professionalToDelete.id}`, { method: "DELETE" })
      toast({ title: "Success", description: "Professional deleted successfully", variant: "destructive" })
      setProfessionalToDelete(null)
      loadProfessionals()
    } catch (error) {
      console.error("Failed to delete professional:", error)
      toast({ title: "Error", description: "Failed to delete professional", variant: "destructive" })
    }
  }

  const handleViewDetails = (prof: Professional) => {
    setSelectedProfessional(prof)
    setIsDetailsModalOpen(true)
  }

  const handleEdit = (prof: Professional) => {
    setSelectedProfessional(prof)
    setIsModalOpen(true)
  }

  const handleViewSchedule = (prof: Professional) => {
    toast({ title: "Schedule", description: `Viewing schedule for ${prof.name}` })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return { label: "Active", className: "border-green-500 text-green-500" }
      case "Inactive":
        return { label: "Inactive", className: "border-red-500 text-red-500" }
      default:
        return { label: status, className: "border-gray-500 text-gray-500" }
    }
  }

  const getTeamName = (teamId: number) => teams.find((t) => t.id === teamId)?.name || `Team ${teamId}`
  const getCompanyName = (companyId: number) =>
    companies.find((c) => c.id === companyId)?.name || `Company ${companyId}`

  const filteredProfessionals = professionals.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.cpf.includes(searchQuery) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || p.status === statusFilter
    const matchesTeam = teamFilter === "all" || p.teamId.toString() === teamFilter
    const matchesCompany = companyFilter === "all" || p.companyId.toString() === companyFilter
    return matchesSearch && matchesStatus && matchesTeam && matchesCompany
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading professionals...</div>
      </div>
    )
  }
  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Professional Management</h1>
            <p className="text-gray-400">Manage all cleaning professionals in the system.</p>
          </div>
          <Button
            className="bg-[#06b6d4] hover:bg-[#0891b2] text-white"
            onClick={() => {
              setSelectedProfessional(null)
              setIsModalOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Professional
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, CPF or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full lg:w-[300px] bg-[#1a2234] border-[#2a3349] text-white focus-visible:ring-[#06b6d4]"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                className={
                  statusFilter === "all"
                    ? "bg-[#06b6d4] hover:bg-[#0891b2] text-white"
                    : "border-[#2a3349] text-white hover:bg-[#2a3349] hover:text-white bg-transparent"
                }
              >
                All Status
              </Button>
              <Button
                variant={statusFilter === "Active" ? "default" : "outline"}
                onClick={() => setStatusFilter("Active")}
                className={
                  statusFilter === "Active"
                    ? "bg-[#06b6d4] hover:bg-[#0891b2] text-white"
                    : "border-[#2a3349] text-white hover:bg-[#2a3349] hover:text-white bg-transparent"
                }
              >
                Active
              </Button>
              <Button
                variant={statusFilter === "Inactive" ? "default" : "outline"}
                onClick={() => setStatusFilter("Inactive")}
                className={
                  statusFilter === "Inactive"
                    ? "bg-[#06b6d4] hover:bg-[#0891b2] text-white"
                    : "border-[#2a3349] text-white hover:bg-[#2a3349] hover:text-white bg-transparent"
                }
              >
                Inactive
              </Button>
            </div>

            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="px-3 py-2 bg-[#1a2234] border border-[#2a3349] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#06b6d4]"
              disabled={isLoadingFilters}
            >
              <option value="all">All Teams</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id.toString()}>
                  {team.name}
                </option>
              ))}
            </select>

            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="px-3 py-2 bg-[#1a2234] border border-[#2a3349] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#06b6d4]"
              disabled={isLoadingFilters}
            >
              <option value="all">All Companies</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id.toString()}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Debug info */}
        <div className="text-xs text-gray-500">
          Teams loaded: {teams.length} | Companies loaded: {companies.length} | Professionals: {professionals.length} |
          Filtered: {filteredProfessionals.length}
        </div>

        <div className="rounded-md border border-[#2a3349] overflow-hidden">
          <Table>
            <TableHeader className="bg-[#1a2234]">
              <TableRow className="border-[#2a3349] hover:bg-[#2a3349]">
                <TableHead className="text-white">Professional</TableHead>
                <TableHead className="text-white">CPF</TableHead>
                <TableHead className="text-white">Team</TableHead>
                <TableHead className="text-white">Company</TableHead>
                <TableHead className="text-white">Phone</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white text-center">Rating</TableHead>
                <TableHead className="text-white text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfessionals.map((professional) => (
                <TableRow key={professional.id} className="border-[#2a3349] hover:bg-[#1a2234] bg-[#0f172a]">
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-[#2a3349]">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-[#2a3349] text-[#06b6d4]">
                          {professional.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{professional.name}</p>
                        <p className="text-xs text-gray-400">{professional.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-400">{professional.cpf}</TableCell>
                  <TableCell className="text-gray-400">{getTeamName(professional.teamId)}</TableCell>
                  <TableCell className="text-gray-400">{getCompanyName(professional.companyId)}</TableCell>
                  <TableCell className="text-gray-400">{professional.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadge(professional.status).className}>
                      {getStatusBadge(professional.status).label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="text-white">{professional.rating || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(professional)}
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#2a3349]"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Details</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(professional)}
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#2a3349]"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewSchedule(professional)}
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#2a3349]"
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Schedule</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setProfessionalToDelete(professional)}
                            className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-[#2a3349]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing <span className="font-medium text-white">{filteredProfessionals.length}</span> professionals
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-[#2a3349] text-white hover:bg-[#2a3349] hover:text-white bg-transparent"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-[#2a3349] bg-[#2a3349] text-white hover:bg-[#2a3349] hover:text-white"
            >
              1
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-[#2a3349] text-white hover:bg-[#2a3349] hover:text-white bg-transparent"
            >
              2
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-[#2a3349] text-white hover:bg-[#2a3349] hover:text-white bg-transparent"
            >
              3
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-[#2a3349] text-white hover:bg-[#2a3349] hover:text-white bg-transparent"
            >
              Next
            </Button>
          </div>
        </div>

        <ProfessionalModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedProfessional(null)
          }}
          onSubmit={selectedProfessional ? handleEditProfessional : handleAddProfessional}
          professional={selectedProfessional}
        />

        <ProfessionalDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedProfessional(null)
          }}
          professional={selectedProfessional}
        />

        <AlertDialog open={!!professionalToDelete} onOpenChange={() => setProfessionalToDelete(null)}>
          <AlertDialogContent className="bg-[#1a2234] border-[#2a3349] text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                This action cannot be undone. This will permanently delete the professional{" "}
                <span className="font-semibold text-white">{professionalToDelete?.name}</span> from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-[#2a3349] text-white hover:bg-[#2a3349]">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProfessional}
                className="bg-red-600 hover:bg-red-700 text-white border-0"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
