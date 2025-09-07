"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Eye, Edit, Trash2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { GpsTrackingModal } from "@/components/admin/gps-tracking-modal"
import { GpsTrackingDetailsModal } from "@/components/admin/gps-tracking-details-modal"
import { gpsTrackingApi } from "@/lib/api/gps-tracking"
import type {
  GPSTracking,
  GPSTrackingCreateRequest,
  GPSTrackingUpdateRequest,
  GPSTrackingFilters,
} from "@/types/gps-tracking"

export default function GpsTrackingPage() {
  const [gpsData, setGpsData] = useState<GPSTracking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedGps, setSelectedGps] = useState<GPSTracking | null>(null)
  const [gpsToDelete, setGpsToDelete] = useState<GPSTracking | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | number>("all")
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })
  const { toast } = useToast()

  const fetchGpsData = async () => {
    try {
      setIsLoading(true)
      const filters: GPSTrackingFilters = {
        searchQuery: searchQuery || undefined,
        status: statusFilter === "all" ? undefined : Number(statusFilter),
        pageNumber: pagination.currentPage,
        pageSize: pagination.itemsPerPage,
      }

      const { data: response, error } = await gpsTrackingApi.getRecords(filters)

      if (error) {
        throw new Error(error)
      }

      if (response) {
        setGpsData(response.data)
        setPagination(response.meta)
      }
    } catch (error) {
      console.error("Error fetching GPS data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch GPS tracking records",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGpsData()
  }, [searchQuery, statusFilter, pagination.currentPage])

  const handleAddGps = async (data: GPSTrackingCreateRequest) => {
    try {
      const { data: newRecord, error } = await gpsTrackingApi.create(data)

      if (error) {
        throw new Error(error)
      }

      setIsModalOpen(false)
      fetchGpsData()
      toast({
        title: "GPS tracking added successfully",
        description: `GPS tracking for ${data.professionalName || `Professional ${data.professionalId}`} has been added.`,
      })
    } catch (error) {
      console.error("Error creating GPS record:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create GPS tracking record",
        variant: "destructive",
      })
    }
  }

  const handleEditGps = async (data: GPSTrackingUpdateRequest) => {
    if (!selectedGps) return

    try {
      const { data: updatedRecord, error } = await gpsTrackingApi.update(selectedGps.id, data)

      if (error) {
        throw new Error(error)
      }

      setSelectedGps(null)
      setIsModalOpen(false)
      fetchGpsData()
      toast({
        title: "GPS tracking updated successfully",
        description: `GPS tracking for ${data.professionalName || `Professional ${data.professionalId}`} has been updated.`,
      })
    } catch (error) {
      console.error("Error updating GPS record:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update GPS tracking record",
        variant: "destructive",
      })
    }
  }

  const handleDeleteGps = async () => {
    if (!gpsToDelete) return

    try {
      const { success, error } = await gpsTrackingApi.delete(gpsToDelete.id)

      if (error) {
        throw new Error(error)
      }

      fetchGpsData()
      toast({
        title: "GPS tracking deleted successfully",
        description: `GPS tracking for ${gpsToDelete.professionalName || `Professional ${gpsToDelete.professionalId}`} has been removed.`,
        variant: "destructive",
      })
      setGpsToDelete(null)
    } catch (error) {
      console.error("Error deleting GPS record:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete GPS tracking record",
        variant: "destructive",
      })
    }
  }

  const handleViewDetails = (gps: GPSTracking) => {
    setSelectedGps(gps)
    setIsDetailsModalOpen(true)
  }

  const handleEdit = (gps: GPSTracking) => {
    setSelectedGps(gps)
    setIsModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusText = (status: number) => {
    return status === 1 ? "Active" : "Inactive"
  }

  const getStatusColor = (status: number) => {
    return status === 1 ? "border-green-500 text-green-500" : "border-red-500 text-red-500"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading GPS tracking records...</div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">GPS Tracking</h1>
            <p className="text-gray-400">Monitor and manage GPS tracking for all professionals across companies.</p>
          </div>
          <Button
            className="bg-[#06b6d4] hover:bg-[#0891b2] text-white"
            onClick={() => {
              setSelectedGps(null)
              setIsModalOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add GPS Tracking
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by professional, address, or vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full md:w-[300px] bg-[#1a2234] border-[#2a3349] text-white focus-visible:ring-[#06b6d4]"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              className={
                statusFilter === "all"
                  ? "bg-[#06b6d4] hover:bg-[#0891b2] text-white"
                  : "border-[#2a3349] text-white hover:bg-[#2a3349] hover:text-white bg-transparent"
              }
            >
              All
            </Button>
            <Button
              variant={statusFilter === 1 ? "default" : "outline"}
              onClick={() => setStatusFilter(1)}
              className={
                statusFilter === 1
                  ? "bg-[#06b6d4] hover:bg-[#0891b2] text-white"
                  : "border-[#2a3349] text-white hover:bg-[#2a3349] hover:text-white bg-transparent"
              }
            >
              Active
            </Button>
            <Button
              variant={statusFilter === 2 ? "default" : "outline"}
              onClick={() => setStatusFilter(2)}
              className={
                statusFilter === 2
                  ? "bg-[#06b6d4] hover:bg-[#0891b2] text-white"
                  : "border-[#2a3349] text-white hover:bg-[#2a3349] hover:text-white bg-transparent"
              }
            >
              Inactive
            </Button>
          </div>
        </div>

        <div className="rounded-md border border-[#2a3349] overflow-hidden">
          <Table>
            <TableHeader className="bg-[#1a2234]">
              <TableRow className="border-[#2a3349] hover:bg-[#2a3349]">
                <TableHead className="text-white">Professional</TableHead>
                <TableHead className="text-white">Company</TableHead>
                <TableHead className="text-white">Location</TableHead>
                <TableHead className="text-white">Speed</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Last Update</TableHead>
                <TableHead className="text-white text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gpsData.length === 0 ? (
                <TableRow className="border-[#2a3349] bg-[#0f172a]">
                  <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                    No GPS tracking records found
                  </TableCell>
                </TableRow>
              ) : (
                gpsData.map((gps) => (
                  <TableRow key={gps.id} className="border-[#2a3349] hover:bg-[#1a2234] bg-[#0f172a]">
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-2">
                        <div className="bg-[#2a3349] p-1.5 rounded-md">
                          <MapPin className="h-4 w-4 text-[#06b6d4]" />
                        </div>
                        <div>
                          <div>{gps.professionalName || `Professional ${gps.professionalId}`}</div>
                          <div className="text-xs text-gray-400">{gps.vehicle}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400">{gps.companyName || `Company ${gps.companyId}`}</TableCell>
                    <TableCell className="text-gray-400">
                      <div className="max-w-[200px]">
                        <div className="truncate">{gps.location.address}</div>
                        <div className="text-xs">
                          {gps.location.latitude.toFixed(4)}, {gps.location.longitude.toFixed(4)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400">{gps.speed} km/h</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(gps.status)}>
                        {getStatusText(gps.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-400">{formatDate(gps.timestamp)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(gps)}
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
                              onClick={() => handleEdit(gps)}
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
                              onClick={() => setGpsToDelete(gps)}
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
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing <span className="font-medium text-white">{gpsData.length}</span> of{" "}
            <span className="font-medium text-white">{pagination.totalItems}</span> GPS tracking records
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination((prev) => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
              disabled={pagination.currentPage <= 1}
              className="border-[#2a3349] text-white hover:bg-[#2a3349] hover:text-white bg-transparent"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-[#2a3349] bg-[#2a3349] text-white hover:bg-[#2a3349] hover:text-white"
            >
              {pagination.currentPage}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))
              }
              disabled={pagination.currentPage >= pagination.totalPages}
              className="border-[#2a3349] text-white hover:bg-[#2a3349] hover:text-white bg-transparent"
            >
              Next
            </Button>
          </div>
        </div>

        <GpsTrackingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedGps(null)
          }}
          onSubmit={selectedGps ? handleEditGps : handleAddGps}
          gpsData={selectedGps}
        />

        <GpsTrackingDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedGps(null)
          }}
          gpsData={selectedGps}
        />

        <AlertDialog open={!!gpsToDelete} onOpenChange={() => setGpsToDelete(null)}>
          <AlertDialogContent className="bg-[#1a2234] border-[#2a3349] text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                This action cannot be undone. This will permanently delete the GPS tracking record for{" "}
                <span className="font-semibold text-white">
                  {gpsToDelete?.professionalName || `Professional ${gpsToDelete?.professionalId}`}
                </span>
                .
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-[#2a3349] text-white hover:bg-[#2a3349]">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteGps} className="bg-red-600 hover:bg-red-700 text-white border-0">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
