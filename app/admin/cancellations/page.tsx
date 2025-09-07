"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  User,
  Building2,
  Clock,
  AlertTriangle,
  DollarSign,
  Filter,
  RefreshCw,
} from "lucide-react"
import { CancellationModal } from "@/components/admin/cancellation-modal"
import { CancellationDetailsModal } from "@/components/admin/cancellation-details-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCancellations } from "@/hooks/use-cancellations"
import type { Cancellation, CancellationFormData, CancellationUpdateData } from "@/types/cancellation"
import type { RefundStatus, CancelledByRole } from "@/types/cancellation"

export default function CancellationsPage() {
  const {
    cancellations,
    loading,
    error,
    filters,
    setFilters,
    refreshCancellations,
    createCancellation,
    updateCancellation,
    deleteCancellation,
    processRefund,
    getCancellationById,
    formatDate,
    getRefundStatusColor,
    getRefundStatusLabel,
    getCancelledByRoleLabel,
    getCancelledByRoleColor,
    canProcessRefund,
    RefundStatus: RefundStatusEnum,
    CancelledByRole: CancelledByRoleEnum,
  } = useCancellations()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedCancellation, setSelectedCancellation] = useState<Cancellation | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Additional filters
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [cancelledByFilter, setCancelledByFilter] = useState<string>("all")
  const [refundStatusFilter, setRefundStatusFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  // Apply filters to cancellations
  const filteredCancellations = useMemo(() => {
    let filtered = [...cancellations]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.appointmentId?.toString().includes(searchTerm.toLowerCase()) ||
          c.reason?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter (using refundStatus)
    if (selectedTab !== "all") {
      const statusMap: { [key: string]: RefundStatus } = {
        pending: RefundStatusEnum.Pending,
        processed: RefundStatusEnum.Processed,
        rejected: RefundStatusEnum.Rejected,
        not_applicable: RefundStatusEnum.NotApplicable,
      }
      if (statusMap[selectedTab] !== undefined) {
        filtered = filtered.filter((c) => c.refundStatus === statusMap[selectedTab])
      }
    }

    // Date filter
    if (dateFilter !== "all") {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const lastWeek = new Date(today)
      lastWeek.setDate(lastWeek.getDate() - 7)
      const lastMonth = new Date(today)
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      filtered = filtered.filter((c) => {
        const cancelDate = new Date(c.createdDate)
        switch (dateFilter) {
          case "today":
            return cancelDate.toDateString() === today.toDateString()
          case "yesterday":
            return cancelDate.toDateString() === yesterday.toDateString()
          case "last7days":
            return cancelDate >= lastWeek
          case "last30days":
            return cancelDate >= lastMonth
          default:
            return true
        }
      })
    }

    // Cancelled by filter
    if (cancelledByFilter !== "all") {
      const roleMap: { [key: string]: CancelledByRole } = {
        customer: CancelledByRoleEnum.Customer,
        professional: CancelledByRoleEnum.Professional,
        company: CancelledByRoleEnum.Company,
        admin: CancelledByRoleEnum.Admin,
      }
      if (roleMap[cancelledByFilter] !== undefined) {
        filtered = filtered.filter((c) => c.cancelledByRole === roleMap[cancelledByFilter])
      }
    }

    // Refund status filter
    if (refundStatusFilter !== "all") {
      const statusValue = Number.parseInt(refundStatusFilter)
      if (!isNaN(statusValue)) {
        filtered = filtered.filter((c) => c.refundStatus === statusValue)
      }
    }

    return filtered
  }, [
    cancellations,
    searchTerm,
    selectedTab,
    dateFilter,
    cancelledByFilter,
    refundStatusFilter,
    RefundStatusEnum,
    CancelledByRoleEnum,
  ])

  // Statistics
  const pendingCount = cancellations.filter((c) => c.refundStatus === RefundStatusEnum.Pending).length
  const processedCount = cancellations.filter((c) => c.refundStatus === RefundStatusEnum.Processed).length
  const rejectedCount = cancellations.filter((c) => c.refundStatus === RefundStatusEnum.Rejected).length

  // Update API filters when local filters change
  useEffect(() => {
    const apiFilters: any = {}

    if (searchTerm) apiFilters.search = searchTerm
    if (refundStatusFilter !== "all") apiFilters.refundStatus = Number.parseInt(refundStatusFilter)

    setFilters(apiFilters)
  }, [searchTerm, refundStatusFilter, setFilters])

  const handleAddCancellation = () => {
    setSelectedCancellation(null)
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const handleEditCancellation = async (id: number) => {
    try {
      const cancellation = await getCancellationById(id)
      setSelectedCancellation(cancellation)
      setIsEditing(true)
      setIsModalOpen(true)
    } catch (error) {
      console.error("Error loading cancellation:", error)
    }
  }

  const handleViewDetails = async (id: number) => {
    try {
      const cancellation = await getCancellationById(id)
      setSelectedCancellation(cancellation)
      setIsDetailsModalOpen(true)
    } catch (error) {
      console.error("Error loading cancellation:", error)
    }
  }

  const handleDeleteCancellation = async (id: number) => {
    if (confirm("Are you sure you want to delete this cancellation?")) {
      try {
        await deleteCancellation(id)
      } catch (error) {
        console.error("Error deleting cancellation:", error)
      }
    }
  }

  const handleProcessRefund = async (id: number, status: RefundStatus) => {
    try {
      await processRefund(id, {
        status: status,
        notes: status === RefundStatusEnum.Processed ? "Refund approved" : "Refund rejected",
      })
    } catch (error) {
      console.error("Error processing refund:", error)
    }
  }

  const handleSaveCancellation = async (data: CancellationFormData | CancellationUpdateData) => {
    try {
      if (isEditing && selectedCancellation) {
        await updateCancellation(selectedCancellation.id, data as CancellationUpdateData)
      } else {
        await createCancellation(data as CancellationFormData)
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error saving cancellation:", error)
    }
  }

  const getRefundBadge = (status: RefundStatus) => {
    const colorClass = getRefundStatusColor(status)
    const label = getRefundStatusLabel(status)

    return (
      <Badge variant="outline" className={colorClass}>
        {label}
      </Badge>
    )
  }

  const getCancelledByBadge = (role: CancelledByRole) => {
    const colorClass = getCancelledByRoleColor(role)
    const label = getCancelledByRoleLabel(role)

    return (
      <div className={`flex items-center gap-2 px-2 py-1 rounded-md text-xs ${colorClass}`}>
        {role === CancelledByRoleEnum.Customer && <User className="h-3 w-3" />}
        {role === CancelledByRoleEnum.Professional && <User className="h-3 w-3" />}
        {role === CancelledByRoleEnum.Company && <Building2 className="h-3 w-3" />}
        {role === CancelledByRoleEnum.Admin && <Clock className="h-3 w-3" />}
        {label}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Cancellation Management</h1>
          <Button onClick={refreshCancellations} className="bg-[#06b6d4] hover:bg-[#0891b2]">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <p>Error loading cancellations: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Cancellation Management</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshCancellations}
            disabled={loading}
            className="border-[#2a3349] text-gray-400 hover:text-white hover:bg-[#2a3349] bg-transparent"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleAddCancellation} className="bg-[#06b6d4] hover:bg-[#0891b2]">
            <Plus className="mr-2 h-4 w-4" />
            Add Cancellation
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Pending</CardTitle>
            <CardDescription>Awaiting processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {loading ? (
                <Skeleton className="h-8 w-16 bg-[#2a3349]" />
              ) : (
                <span className="text-3xl font-bold text-white">{pendingCount}</span>
              )}
              <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Action needed
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Processed</CardTitle>
            <CardDescription>Refunds approved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {loading ? (
                <Skeleton className="h-8 w-16 bg-[#2a3349]" />
              ) : (
                <span className="text-3xl font-bold text-white">{processedCount}</span>
              )}
              <Badge variant="outline" className="border-green-500 text-green-500">
                <CheckCircle className="h-4 w-4 mr-1" />
                Completed
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Rejected</CardTitle>
            <CardDescription>Refunds denied</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {loading ? (
                <Skeleton className="h-8 w-16 bg-[#2a3349]" />
              ) : (
                <span className="text-3xl font-bold text-white">{rejectedCount}</span>
              )}
              <Badge variant="outline" className="border-red-500 text-red-500">
                <XCircle className="h-4 w-4 mr-1" />
                Not approved
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Total</CardTitle>
            <CardDescription>All cancellations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {loading ? (
                <Skeleton className="h-8 w-24 bg-[#2a3349]" />
              ) : (
                <span className="text-3xl font-bold text-white">{cancellations.length}</span>
              )}
              <Badge variant="outline" className="border-[#06b6d4] text-[#06b6d4]">
                <DollarSign className="h-4 w-4 mr-1" />
                Overview
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="bg-[#1a2234] border border-[#2a3349]">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#2a3349]">
              All
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-[#2a3349]">
              Pending
            </TabsTrigger>
            <TabsTrigger value="processed" className="data-[state=active]:bg-[#2a3349]">
              Processed
            </TabsTrigger>
            <TabsTrigger value="rejected" className="data-[state=active]:bg-[#2a3349]">
              Rejected
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search cancellation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#1a2234] border-[#2a3349] text-white w-full sm:w-[250px]"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className={`border-[#2a3349] ${showFilters ? "bg-[#2a3349] text-white" : "text-gray-400"} bg-transparent`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <Card className="bg-[#1a2234] border-[#2a3349] p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Period</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                    <SelectValue placeholder="Select a period" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349]">
                    <SelectItem value="all">All periods</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="last7days">Last 7 days</SelectItem>
                    <SelectItem value="last30days">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Cancelled by</label>
                <Select value={cancelledByFilter} onValueChange={setCancelledByFilter}>
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                    <SelectValue placeholder="Select who cancelled" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349]">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Refund Status</label>
                <Select value={refundStatusFilter} onValueChange={setRefundStatusFilter}>
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349] text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349]">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="0">Pending</SelectItem>
                    <SelectItem value="1">Processed</SelectItem>
                    <SelectItem value="2">Rejected</SelectItem>
                    <SelectItem value="3">Not Applicable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}

        <TabsContent value={selectedTab} className="space-y-4">
          <div className="rounded-lg border border-[#2a3349] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#1a2234] hover:bg-[#1a2234]">
                  <TableHead className="text-gray-400">ID</TableHead>
                  <TableHead className="text-gray-400">Appointment</TableHead>
                  <TableHead className="text-gray-400">Customer</TableHead>
                  <TableHead className="text-gray-400">Cancelled At</TableHead>
                  <TableHead className="text-gray-400">Cancelled By</TableHead>
                  <TableHead className="text-gray-400">Refund Status</TableHead>
                  <TableHead className="text-gray-400">Reason</TableHead>
                  <TableHead className="text-gray-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index} className="bg-[#0f172a] hover:bg-[#1a2234] border-b border-[#2a3349]">
                      <TableCell>
                        <Skeleton className="h-4 w-16 bg-[#2a3349]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32 bg-[#2a3349]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24 bg-[#2a3349]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20 bg-[#2a3349]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20 bg-[#2a3349]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16 bg-[#2a3349]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16 bg-[#2a3349]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16 bg-[#2a3349]" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredCancellations.length === 0 ? (
                  <TableRow className="bg-[#0f172a] hover:bg-[#1a2234] border-b border-[#2a3349]">
                    <TableCell colSpan={8} className="text-center py-6 text-gray-400">
                      No cancellations found with the selected filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCancellations.map((cancellation) => (
                    <TableRow
                      key={cancellation.id}
                      className="bg-[#0f172a] hover:bg-[#1a2234] border-b border-[#2a3349]"
                    >
                      <TableCell className="text-white font-medium">#{cancellation.id}</TableCell>
                      <TableCell className="text-white">#{cancellation.appointmentId}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-white">
                            {cancellation.customerName || `Customer #${cancellation.customerId}`}
                          </span>
                          <span className="text-xs text-gray-400">ID: {cancellation.customerId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="h-4 w-4" />
                          {formatDate(cancellation.cancelledAt)}
                        </div>
                      </TableCell>
                      <TableCell>{getCancelledByBadge(cancellation.cancelledByRole)}</TableCell>
                      <TableCell>{getRefundBadge(cancellation.refundStatus)}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate text-white" title={cancellation.reason}>
                          {cancellation.reason}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canProcessRefund(cancellation.refundStatus) && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-green-500 text-green-500 hover:bg-green-500/10 bg-transparent"
                                onClick={() => handleProcessRefund(cancellation.id, RefundStatusEnum.Processed)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-red-500 text-red-500 hover:bg-red-500/10 bg-transparent"
                                onClick={() => handleProcessRefund(cancellation.id, RefundStatusEnum.Rejected)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-gray-400 hover:text-white hover:bg-[#2a3349]"
                            onClick={() => handleViewDetails(cancellation.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-gray-400 hover:text-white hover:bg-[#2a3349]"
                            onClick={() => handleEditCancellation(cancellation.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => handleDeleteCancellation(cancellation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredCancellations.length} of {cancellations.length} cancellations
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled className="border-[#2a3349] text-gray-400 bg-transparent">
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled className="border-[#2a3349] text-gray-400 bg-transparent">
                Next
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <CancellationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        cancellation={selectedCancellation}
        isEditing={isEditing}
        onSave={handleSaveCancellation}
      />

      <CancellationDetailsModal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        cancellation={selectedCancellation}
      />
    </div>
  )
}
