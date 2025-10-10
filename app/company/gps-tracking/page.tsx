"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Route, Plus, Search, Filter, RefreshCw } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useCompanyGpsTracking } from "@/contexts/company-gps-tracking-context"
import { CompanyGpsTrackingProvider } from "@/contexts/company-gps-tracking-context"
import { GpsTrackingModal } from "@/components/company/company-gps-tracking-modal"
import { GpsTrackingDetailsModal } from "@/components/company/company-gps-tracking-details-modal"
import { GoogleMap } from "@/components/company/google-map"
import type { GPSTracking } from "@/types/gps-tracking"
import { useAuth } from "@/contexts/auth-context"

function CompanyGpsTrackingContent() {
  const {
    gpsRecords,
    selectedGpsRecord,
    isLoading,
    filters,
    pagination,
    fetchGpsRecords,
    fetchGpsRecord,
    createGpsRecord,
    updateGpsRecord,
    deleteGpsRecord,
    updateGpsStatus,
    setFilters,
    resetFilters,
    setSelectedGpsRecord,
  } = useCompanyGpsTracking()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<GPSTracking | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedProfessional, setSelectedProfessional] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { user } = useAuth()
  const companyId = user?.companyId?.toString() || "1"

  useEffect(() => {
    fetchGpsRecords(companyId)
  }, [])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setFilters({
        ...filters,
        searchQuery,
        status: statusFilter === "all" ? "all" : Number.parseInt(statusFilter),
        pageNumber: 1,
      })
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery, statusFilter])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchGpsRecords(companyId)
    setIsRefreshing(false)
  }

  const handleCreateRecord = async (data: any) => {
    try {
      await createGpsRecord(companyId, data)
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error("Error creating GPS tracking record:", error)
    }
  }

  const handleUpdateRecord = async (data: any) => {
    if (!editingRecord) return

    try {
      await updateGpsRecord(companyId, editingRecord.id.toString(), data)
      setIsEditModalOpen(false)
      setEditingRecord(null)
    } catch (error) {
      console.error("Error updating GPS tracking record:", error)
    }
  }

  const handleDeleteRecord = async (id: number) => {
    try {
      await deleteGpsRecord(companyId, id.toString())
    } catch (error) {
      console.error("Error deleting GPS tracking record:", error)
    }
  }

  const handleViewDetails = async (record: GPSTracking) => {
    setSelectedGpsRecord(record)
    setIsDetailsModalOpen(true)
  }

  const handleEditRecord = (record: GPSTracking) => {
    setEditingRecord(record)
    setIsEditModalOpen(true)
  }

  const handleStatusToggle = async (record: GPSTracking) => {
    const newStatus = record.status === 1 ? 2 : 1
    try {
      await updateGpsStatus(companyId, record.id.toString(), newStatus)
    } catch (error) {
      console.error("Error updating GPS tracking status:", error)
    }
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "bg-green-500/20 text-green-500 border-green-500"
      case 2:
        return "bg-red-500/20 text-red-500 border-red-500"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500"
    }
  }

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1:
        return "Active"
      case 2:
        return "Inactive"
      default:
        return "Unknown"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const mapMarkers = gpsRecords.map((record) => ({
    id: record.id,
    position: {
      lat: record.location.latitude,
      lng: record.location.longitude,
    },
    title: record.professionalName || `Professional ${record.professionalId}`,
    address: record.location.address,
    status: getStatusLabel(record.status).toLowerCase(),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">GPS Tracking</h1>
          <p className="text-muted-foreground">Track your cleaning professionals in real-time</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="border-border text-foreground hover:bg-muted bg-transparent"
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#06b6d4] hover:bg-[#0891b2] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add GPS Record
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by professional, vehicle, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted border-0 text-foreground focus:ring-[#06b6d4]"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-muted border-0 text-foreground focus:ring-[#06b6d4]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border text-foreground">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="1">Active</SelectItem>
            <SelectItem value="2">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={resetFilters}
          className="border-border text-foreground hover:bg-muted bg-transparent"
        >
          <Filter className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-card border-border h-[500px]">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">Live Map</CardTitle>
            </CardHeader>
            <CardContent className="h-[420px]">
              <GoogleMap
                markers={mapMarkers}
                zoom={12}
                className="w-full h-full"
                onMarkerClick={(marker) => {
                  const record = gpsRecords.find((r) => r.id === marker.id)
                  if (record) {
                    setSelectedProfessional(record.id)
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">Professionals ({pagination.totalItems})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[420px] overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-6 text-muted-foreground">Loading...</div>
              ) : gpsRecords.length > 0 ? (
                gpsRecords.map((record) => (
                  <div
                    key={record.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedProfessional === record.id
                        ? "bg-muted border border-[#06b6d4]"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                    onClick={() => setSelectedProfessional(record.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src="/placeholder.svg" alt={record.professionalName || "Professional"} />
                          <AvatarFallback className="bg-muted text-[#06b6d4]">
                            {(record.professionalName || "P")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">
                            {record.professionalName || `Professional ${record.professionalId}`}
                          </div>
                          <div className="text-xs text-muted-foreground">{record.vehicle}</div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(record.status)}>{getStatusLabel(record.status)}</Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{record.location.address}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span>Updated {formatDate(record.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Route className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span>
                          {record.speed} km/h • {record.battery}% battery
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewDetails(record)
                        }}
                        className="flex-1 h-8 border-border text-foreground hover:bg-muted/80"
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditRecord(record)
                        }}
                        className="flex-1 h-8 border-border text-foreground hover:bg-muted/80"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">No GPS tracking records found</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <GpsTrackingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateRecord}
      />

      <GpsTrackingModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingRecord(null)
        }}
        onSubmit={handleUpdateRecord}
        gpsData={editingRecord}
      />

      <GpsTrackingDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedGpsRecord(null)
        }}
        gpsData={selectedGpsRecord}
        onEdit={handleEditRecord}
        onDelete={handleDeleteRecord}
        onStatusToggle={handleStatusToggle}
      />
    </div>
  )
}

export default function CompanyGpsTrackingPage() {
  return (
    <CompanyGpsTrackingProvider>
      <CompanyGpsTrackingContent />
    </CompanyGpsTrackingProvider>
  )
}
