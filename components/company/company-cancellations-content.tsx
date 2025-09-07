"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, Calendar, Clock, Download, Filter, Plus, Search, UserX, Eye, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CompanyCancellationModal } from "@/components/company/company-cancellation-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { RefundStatus, type Cancellation } from "@/types/cancellation"
import { format } from "date-fns"
import { useCompanyCancellationsContext } from "@/contexts/company-cancellations-context"

export function CompanyCancellationsContent() {
  const {
    cancellations,
    loading,
    stats,
    filters,
    setFilters,
    addCancellation,
    updateCancellation,
    deleteCancellation,
    processRefund,
  } = useCompanyCancellationsContext()

  const [selectedTab, setSelectedTab] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedCancellation, setSelectedCancellation] = useState<Cancellation | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const getRefundStatusColor = (status: RefundStatus) => {
    switch (status) {
      case RefundStatus.Pending:
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case RefundStatus.Processed:
        return "text-green-600 bg-green-50 border-green-200"
      case RefundStatus.Rejected:
        return "text-red-600 bg-red-50 border-red-200"
      case RefundStatus.NotApplicable:
        return "text-gray-600 bg-gray-50 border-gray-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getRefundStatusLabel = (status: RefundStatus) => {
    switch (status) {
      case RefundStatus.Pending:
        return "Pending"
      case RefundStatus.Processed:
        return "Processed"
      case RefundStatus.Rejected:
        return "Rejected"
      case RefundStatus.NotApplicable:
        return "Not Applicable"
      default:
        return "Unknown"
    }
  }

  const getCancelledByRoleLabel = (role: number) => {
    switch (role) {
      case 1:
        return "Customer"
      case 2:
        return "Professional"
      case 3:
        return "Company"
      case 4:
        return "Admin"
      default:
        return "Unknown"
    }
  }

  const formatShortDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy")
  }

  // Filter cancellations based on search query and selected tab
  const filteredCancellations = cancellations.filter((cancellation) => {
    const matchesSearch = filters.search
      ? cancellation.customerName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        cancellation.reason.toLowerCase().includes(filters.search.toLowerCase()) ||
        cancellation.notes?.toLowerCase().includes(filters.search.toLowerCase()) ||
        cancellation.id.toString().includes(filters.search)
      : true

    if (selectedTab === "all") return matchesSearch
    if (selectedTab === "pending") return matchesSearch && cancellation.refundStatus === RefundStatus.Pending
    if (selectedTab === "processed") return matchesSearch && cancellation.refundStatus === RefundStatus.Processed
    if (selectedTab === "rejected") return matchesSearch && cancellation.refundStatus === RefundStatus.Rejected
    if (selectedTab === "not_applicable")
      return matchesSearch && cancellation.refundStatus === RefundStatus.NotApplicable

    return matchesSearch
  })

  const handleTabChange = (value: string) => {
    setSelectedTab(value)
    if (value === "all") {
      setFilters({ ...filters, refundStatus: undefined })
    } else {
      const statusMap = {
        pending: RefundStatus.Pending,
        processed: RefundStatus.Processed,
        rejected: RefundStatus.Rejected,
        not_applicable: RefundStatus.NotApplicable,
      }
      setFilters({ ...filters, refundStatus: statusMap[value as keyof typeof statusMap] })
    }
  }

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    try {
      const headers = ["ID", "Customer", "Reason", "Status", "Date", "Notes"]
      const rows = filteredCancellations.map((c) => [
        c.id.toString(),
        c.customerName || "N/A",
        c.reason,
        getRefundStatusLabel(c.refundStatus),
        formatShortDate(c.cancelledAt),
        c.notes || "",
      ])

      const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `cancellations.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting cancellations:", error)
    }
  }

  const handleEdit = (cancellation: Cancellation) => {
    setSelectedCancellation(cancellation)
    setIsEditModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this cancellation?")) {
      try {
        await deleteCancellation(id)
      } catch (error) {
        console.error("Error deleting cancellation:", error)
      }
    }
  }

  if (loading && cancellations.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-[#2a3349]">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-36" />
          </div>
        </div>
        <div className="p-4 flex-1">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#0f172a] via-[#1a2234] to-[#0f172a] min-h-screen">
      <div className="flex items-center justify-between p-6 border-b border-[#2a3349] bg-gradient-to-r from-[#1a2234] to-[#0f172a]">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] bg-clip-text text-transparent">
            Cancellations
          </h1>
          <p className="text-gray-300">Manage service cancellations and refunds with ease</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="border-[#06b6d4]/30 text-[#06b6d4] hover:text-white hover:bg-[#06b6d4]/20 bg-transparent backdrop-blur-sm transition-all duration-300"
            onClick={() => handleExport("csv")}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] hover:from-[#0891b2] hover:to-[#2563eb] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Cancellation
          </Button>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-hidden">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-[#1a2234] to-[#0f172a] border-[#2a3349] hover:border-[#06b6d4]/30 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Cancellations</p>
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                  </div>
                  <div className="p-3 bg-[#06b6d4]/20 rounded-full">
                    <UserX className="h-8 w-8 text-[#06b6d4]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#1a2234] to-[#0f172a] border-[#2a3349] hover:border-yellow-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Pending Refunds</p>
                    <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
                    <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
                  </div>
                  <div className="p-3 bg-yellow-500/20 rounded-full">
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#1a2234] to-[#0f172a] border-[#2a3349] hover:border-green-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Processed</p>
                    <p className="text-3xl font-bold text-green-500">{stats.processed}</p>
                    <p className="text-xs text-gray-500 mt-1">Successfully refunded</p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <Calendar className="h-8 w-8 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#1a2234] to-[#0f172a] border-[#2a3349] hover:border-red-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Rejected</p>
                    <p className="text-3xl font-bold text-red-500">{stats.rejected}</p>
                    <p className="text-xs text-gray-500 mt-1">Refund denied</p>
                  </div>
                  <div className="p-3 bg-red-500/20 rounded-full">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="all" className="h-full flex flex-col" onValueChange={handleTabChange}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
            <TabsList className="bg-[#1a2234] p-1 border border-[#2a3349]">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#06b6d4] data-[state=active]:to-[#3b82f6] data-[state=active]:text-white transition-all duration-300"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white transition-all duration-300"
              >
                Pending
              </TabsTrigger>
              <TabsTrigger
                value="processed"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white transition-all duration-300"
              >
                Processed
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300"
              >
                Rejected
              </TabsTrigger>
              <TabsTrigger
                value="not_applicable"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500 data-[state=active]:to-slate-500 data-[state=active]:text-white transition-all duration-300"
              >
                N/A
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none lg:w-80">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search cancellations..."
                  className="pl-10 bg-[#1a2234] border-[#2a3349] text-white w-full focus:border-[#06b6d4] transition-colors duration-300"
                  value={filters.search || ""}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="border-[#2a3349] text-gray-400 hover:text-[#06b6d4] hover:bg-[#06b6d4]/10 bg-transparent transition-all duration-300"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <Card className="bg-gradient-to-br from-[#1a2234] to-[#0f172a] border-[#2a3349] h-full flex flex-col shadow-xl">
              <CardHeader className="pb-4 border-b border-[#2a3349]">
                <CardTitle className="text-white text-xl bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] bg-clip-text text-transparent">
                  Cancellation Records
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {filteredCancellations.length} cancellations found
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-0">
                <Table>
                  <TableHeader className="bg-[#0f172a] sticky top-0">
                    <TableRow className="hover:bg-[#1a2234] border-[#2a3349]">
                      <TableHead className="text-gray-300 font-semibold">ID</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Customer</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Reason</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Date</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Status</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Cancelled by</TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index} className="hover:bg-[#1a2234] border-[#2a3349]">
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-48" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-8 w-8 ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredCancellations.length === 0 ? (
                      <TableRow className="hover:bg-[#1a2234] border-[#2a3349]">
                        <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="p-4 bg-[#06b6d4]/10 rounded-full">
                              <AlertCircle className="h-12 w-12 text-[#06b6d4]" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-lg font-medium text-white">No cancellations found</p>
                              <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCancellations.map((cancellation) => (
                        <TableRow
                          key={cancellation.id}
                          className="hover:bg-[#1a2234] border-[#2a3349] transition-colors duration-200"
                        >
                          <TableCell className="font-medium text-[#06b6d4]">#{cancellation.id}</TableCell>
                          <TableCell className="text-white">{cancellation.customerName || "N/A"}</TableCell>
                          <TableCell className="max-w-[200px] truncate text-gray-300" title={cancellation.reason}>
                            {cancellation.reason}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-gray-300">{formatShortDate(cancellation.cancelledAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-xs mt-1">
                              <Clock className="h-3 w-3" />
                              <span>{format(new Date(cancellation.cancelledAt), "HH:mm")}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getRefundStatusColor(cancellation.refundStatus)} border-0 shadow-sm`}>
                              {getRefundStatusLabel(cancellation.refundStatus)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {getCancelledByRoleLabel(cancellation.cancelledByRole)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10"
                                onClick={() => handleEdit(cancellation)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10"
                                onClick={() => handleEdit(cancellation)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                                onClick={() => handleDelete(cancellation.id)}
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
              </CardContent>
            </Card>
          </div>
        </Tabs>
      </div>

      {/* Create Cancellation Modal */}
      <CompanyCancellationModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

      {/* Edit Cancellation Modal */}
      {selectedCancellation && (
        <CompanyCancellationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          cancellation={selectedCancellation}
        />
      )}
    </div>
  )
}
