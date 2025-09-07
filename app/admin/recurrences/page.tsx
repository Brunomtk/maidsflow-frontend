"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Eye, Edit, Trash2, RefreshCw } from "lucide-react"
import { RecurrenceModal } from "@/components/admin/recurrence-modal"
import { RecurrenceDetailsModal } from "@/components/admin/recurrence-details-modal"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRecurrences } from "@/hooks/use-recurrences"
import type { Recurrence } from "@/types/recurrence"

export default function RecurrencesPage() {
  const {
    recurrences,
    loading,
    selectedRecurrence,
    filters,
    pagination,
    companies,
    customers,
    teams,
    loadingDropdowns,
    handleSearch,
    handleStatusFilter,
    handleTypeFilter,
    handleCompanyFilter,
    addRecurrence,
    editRecurrence,
    removeRecurrence,
    selectRecurrence,
    setPage,
  } = useRecurrences()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [recurrenceToDelete, setRecurrenceToDelete] = useState<Recurrence | null>(null)
  const { toast } = useToast()

  const handleAddRecurrence = async (data: any) => {
    try {
      await addRecurrence(data)
      setIsModalOpen(false)
      toast({
        title: "Recurrence added successfully",
        description: `${data.title} has been scheduled.`,
      })
    } catch (error) {
      console.error("Failed to add recurrence:", error)
    }
  }

  const handleEditRecurrence = async (data: any) => {
    if (selectedRecurrence) {
      try {
        await editRecurrence(selectedRecurrence.id, data)
        setIsModalOpen(false)
        toast({
          title: "Recurrence updated successfully",
          description: `${data.title} has been updated.`,
        })
      } catch (error) {
        console.error("Failed to edit recurrence:", error)
      }
    }
  }

  const handleDeleteRecurrence = async () => {
    if (recurrenceToDelete) {
      try {
        await removeRecurrence(recurrenceToDelete.id)
        setRecurrenceToDelete(null)
        toast({
          title: "Recurrence deleted successfully",
          description: `${recurrenceToDelete.title} has been deleted.`,
        })
      } catch (error) {
        console.error("Failed to delete recurrence:", error)
      }
    }
  }

  const handleViewDetails = (recurrence: Recurrence) => {
    selectRecurrence(recurrence)
    setIsDetailsModalOpen(true)
  }

  const handleEdit = (recurrence: Recurrence) => {
    selectRecurrence(recurrence)
    setIsModalOpen(true)
  }

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

  const getTypeBadge = (type: number) => {
    switch (type) {
      case 1:
        return { label: "Regular", className: "border-blue-400 text-blue-400" }
      case 2:
        return { label: "Deep", className: "border-purple-400 text-purple-400" }
      case 3:
        return { label: "Specialized", className: "border-orange-400 text-orange-400" }
      default:
        return { label: "Unknown", className: "border-gray-400 text-gray-400" }
    }
  }

  const getFrequencyLabel = (frequency: number) => {
    switch (frequency) {
      case 1:
        return "Weekly"
      case 2:
        return "Bi-weekly"
      case 3:
        return "Monthly"
      default:
        return "Unknown"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return "N/A"
    return timeString.substring(0, 5) // HH:MM format
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Recurrence Management</h1>
            <p className="text-gray-400">Manage all recurring services.</p>
          </div>
          <Button
            className="bg-[#06b6d4] hover:bg-[#0891b2] text-white"
            onClick={() => {
              selectRecurrence(null)
              setIsModalOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Recurrence
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by title or customer..."
              value={filters.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-full md:w-[300px] bg-[#1a2234] border-[#2a3349] text-white focus-visible:ring-[#06b6d4]"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Select value={filters.status} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px] bg-[#1a2234] border-[#2a3349] text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                <SelectItem value="all" className="hover:bg-[#2a3349]">
                  All Statuses
                </SelectItem>
                <SelectItem value="active" className="hover:bg-[#2a3349]">
                  Active
                </SelectItem>
                <SelectItem value="inactive" className="hover:bg-[#2a3349]">
                  Inactive
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.type} onValueChange={handleTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px] bg-[#1a2234] border-[#2a3349] text-white">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                <SelectItem value="all" className="hover:bg-[#2a3349]">
                  All Types
                </SelectItem>
                <SelectItem value="regular" className="hover:bg-[#2a3349]">
                  Regular
                </SelectItem>
                <SelectItem value="deep" className="hover:bg-[#2a3349]">
                  Deep
                </SelectItem>
                <SelectItem value="specialized" className="hover:bg-[#2a3349]">
                  Specialized
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border border-[#2a3349] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06b6d4]"></div>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-[#1a2234]">
                <TableRow className="border-[#2a3349] hover:bg-[#2a3349]">
                  <TableHead className="text-white">Service</TableHead>
                  <TableHead className="text-white">Customer</TableHead>
                  <TableHead className="text-white">Company</TableHead>
                  <TableHead className="text-white">Frequency</TableHead>
                  <TableHead className="text-white">Next Execution</TableHead>
                  <TableHead className="text-white">Team</TableHead>
                  <TableHead className="text-white">Type</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recurrences.map((recurrence) => (
                  <TableRow key={recurrence.id} className="border-[#2a3349] hover:bg-[#1a2234] bg-[#0f172a]">
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-2">
                        <div className="bg-[#2a3349] p-1.5 rounded-md">
                          <RefreshCw className="h-4 w-4 text-[#06b6d4]" />
                        </div>
                        {recurrence.title}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400">{recurrence.customer?.name || "N/A"}</TableCell>
                    <TableCell className="text-gray-400">{recurrence.company?.name || "N/A"}</TableCell>
                    <TableCell className="text-gray-400">
                      <div className="flex flex-col">
                        <span>{getFrequencyLabel(recurrence.frequency)}</span>
                        <span className="text-xs">Day {recurrence.day}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {recurrence.nextExecution ? (
                        <div className="flex flex-col">
                          <span>{formatDate(recurrence.nextExecution)}</span>
                          <span className="text-xs">{formatTime(recurrence.time)}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span>{formatDate(recurrence.startDate)}</span>
                          <span className="text-xs">{formatTime(recurrence.time)}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-400">{recurrence.team?.name || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTypeBadge(recurrence.type).className}>
                        {getTypeBadge(recurrence.type).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadge(recurrence.status).className}>
                        {getStatusBadge(recurrence.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(recurrence)}
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
                              onClick={() => handleEdit(recurrence)}
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
                              onClick={() => setRecurrenceToDelete(recurrence)}
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
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing{" "}
            <span className="font-medium text-white">
              {pagination.totalItems > 0 ? (pagination.currentPage - 1) * pagination.pageSize + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-medium text-white">
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}
            </span>{" "}
            of <span className="font-medium text-white">{pagination.totalItems}</span> recurrences
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="border-[#2a3349] text-white hover:bg-[#2a3349] hover:text-white"
            >
              Previous
            </Button>

            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <Button
                  key={pageNum}
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className={`border-[#2a3349] hover:bg-[#2a3349] hover:text-white ${
                    pagination.currentPage === pageNum ? "bg-[#2a3349] text-white" : "text-white"
                  }`}
                >
                  {pageNum}
                </Button>
              )
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="border-[#2a3349] text-white hover:bg-[#2a3349] hover:text-white"
            >
              Next
            </Button>
          </div>
        </div>

        <RecurrenceModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            selectRecurrence(null)
          }}
          onSubmit={selectedRecurrence ? handleEditRecurrence : handleAddRecurrence}
          recurrence={selectedRecurrence}
        />

        <RecurrenceDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false)
            selectRecurrence(null)
          }}
          recurrence={selectedRecurrence}
          onEdit={handleEdit}
          onDelete={setRecurrenceToDelete}
        />

        <AlertDialog open={!!recurrenceToDelete} onOpenChange={() => setRecurrenceToDelete(null)}>
          <AlertDialogContent className="bg-[#1a2234] border-[#2a3349] text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                This action cannot be undone. This will permanently delete the recurring service
                <span className="font-semibold text-white block mt-1">{recurrenceToDelete?.title}</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-[#2a3349] text-white hover:bg-[#2a3349]">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteRecurrence}
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
