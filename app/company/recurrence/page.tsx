"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Eye, Edit, Trash2, Calendar, Clock, Users, MapPin } from "lucide-react"
import { CompanyRecurrenceModal } from "@/components/company/company-recurrence-modal"
import { CompanyRecurrenceDetailsModal } from "@/components/company/company-recurrence-details-modal"
import { CompanyRecurrenceProvider, useCompanyRecurrenceContext } from "@/contexts/company-recurrence-context"
import type { CompanyRecurrence } from "@/types/company-recurrence"
import { useAuth } from "@/contexts/auth-context"

function CompanyRecurrenceContent() {
  const {
    recurrences,
    isLoading,
    error,
    filters,
    pagination,
    fetchRecurrences,
    createRecurrence,
    updateRecurrence,
    deleteRecurrence,
    fetchCustomers,
    fetchTeams,
    setFilters,
    clearFilters,
  } = useCompanyRecurrenceContext()

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedRecurrence, setSelectedRecurrence] = useState<CompanyRecurrence | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const { user } = useAuth()
  const companyId = user?.companyId || 1

  useEffect(() => {
    fetchRecurrences(companyId)
    fetchCustomers(companyId)
    fetchTeams(companyId)
  }, [])

  const handleSearch = () => {
    const newFilters = {
      search: searchTerm || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      type: typeFilter !== "all" ? typeFilter : undefined,
      pageNumber: 1,
    }
    setFilters(newFilters)
    fetchRecurrences(companyId, newFilters)
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setTypeFilter("all")
    clearFilters()
    fetchRecurrences(companyId)
  }

  const handleAddRecurrence = () => {
    setSelectedRecurrence(null)
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const handleViewDetails = (recurrence: CompanyRecurrence) => {
    setSelectedRecurrence(recurrence)
    setIsDetailsModalOpen(true)
  }

  const handleEditRecurrence = (recurrence: CompanyRecurrence) => {
    setSelectedRecurrence(recurrence)
    setIsEditing(true)
    setIsModalOpen(true)
    setIsDetailsModalOpen(false)
  }

  const handleDeleteRecurrence = async (recurrence: CompanyRecurrence) => {
    if (window.confirm("Are you sure you want to delete this recurrence?")) {
      await deleteRecurrence(recurrence.id)
    }
  }

  const handleSubmitRecurrence = async (data: any) => {
    if (isEditing && selectedRecurrence) {
      await updateRecurrence(selectedRecurrence.id, data)
    } else {
      await createRecurrence({ ...data, companyId })
    }
    setIsModalOpen(false)
    fetchRecurrences(companyId)
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
      case 0:
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Inactive</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Unknown</Badge>
    }
  }

  const getTypeBadge = (type: number) => {
    switch (type) {
      case 1:
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Regular</Badge>
      case 2:
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Deep Cleaning</Badge>
      case 3:
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Specialized</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Unknown</Badge>
    }
  }

  const getFrequencyText = (frequency: number) => {
    switch (frequency) {
      case 1:
        return "Weekly"
      case 2:
        return "Biweekly"
      case 3:
        return "Monthly"
      case 4:
        return "Quarterly"
      case 5:
        return "Yearly"
      default:
        return "Custom"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading recurrences...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Recurrences</h1>
          <p className="text-gray-400">Manage your recurring service schedules</p>
        </div>
        <Button onClick={handleAddRecurrence} className="bg-[#06b6d4] hover:bg-[#0891b2] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Recurrence
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-[#1a2234] border-[#2a3349]">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search recurrences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#0f172a] border-[#2a3349] text-white placeholder:text-gray-400"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-[#0f172a] border-[#2a3349] text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                <SelectItem value="all" className="hover:bg-[#2a3349]">
                  All Status
                </SelectItem>
                <SelectItem value="1" className="hover:bg-[#2a3349]">
                  Active
                </SelectItem>
                <SelectItem value="0" className="hover:bg-[#2a3349]">
                  Inactive
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-[#0f172a] border-[#2a3349] text-white">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                <SelectItem value="all" className="hover:bg-[#2a3349]">
                  All Types
                </SelectItem>
                <SelectItem value="1" className="hover:bg-[#2a3349]">
                  Regular
                </SelectItem>
                <SelectItem value="2" className="hover:bg-[#2a3349]">
                  Deep Cleaning
                </SelectItem>
                <SelectItem value="3" className="hover:bg-[#2a3349]">
                  Specialized
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="bg-[#06b6d4] hover:bg-[#0891b2] text-white">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="border-[#2a3349] text-white hover:bg-[#2a3349] bg-transparent"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recurrences Table */}
      <Card className="bg-[#1a2234] border-[#2a3349]">
        <CardHeader>
          <CardTitle className="text-white">Recurrences ({pagination.totalItems})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#2a3349] hover:bg-[#2a3349]/50">
                  <TableHead className="text-gray-300">Title</TableHead>
                  <TableHead className="text-gray-300">Customer</TableHead>
                  <TableHead className="text-gray-300">Team</TableHead>
                  <TableHead className="text-gray-300">Frequency</TableHead>
                  <TableHead className="text-gray-300">Time</TableHead>
                  <TableHead className="text-gray-300">Type</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recurrences.map((recurrence) => (
                  <TableRow key={recurrence.id} className="border-[#2a3349] hover:bg-[#2a3349]/50">
                    <TableCell className="text-white">
                      <div>
                        <div className="font-medium">{recurrence.title}</div>
                        <div className="text-sm text-gray-400 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {recurrence.address}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      <div>
                        <div className="font-medium">{recurrence.customer?.name}</div>
                        <div className="text-sm text-gray-400">{recurrence.customer?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        {recurrence.team?.name || "No team assigned"}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {getFrequencyText(recurrence.frequency)}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {recurrence.time} ({recurrence.duration}min)
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(recurrence.type)}</TableCell>
                    <TableCell>{getStatusBadge(recurrence.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDetails(recurrence)}
                          className="text-gray-400 hover:text-white hover:bg-[#2a3349]"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditRecurrence(recurrence)}
                          className="text-gray-400 hover:text-white hover:bg-[#2a3349]"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteRecurrence(recurrence)}
                          className="text-gray-400 hover:text-red-400 hover:bg-[#2a3349]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {recurrences.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No recurrences found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CompanyRecurrenceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitRecurrence}
        recurrence={selectedRecurrence}
        isEditing={isEditing}
      />

      <CompanyRecurrenceDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        recurrence={selectedRecurrence}
        onEdit={handleEditRecurrence}
        onDelete={handleDeleteRecurrence}
      />
    </div>
  )
}

export default function CompanyRecurrencePage() {
  return (
    <CompanyRecurrenceProvider>
      <CompanyRecurrenceContent />
    </CompanyRecurrenceProvider>
  )
}
