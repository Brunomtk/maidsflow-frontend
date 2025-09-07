"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Eye, Edit, Trash2, Clock, CheckCircle, XCircle, LogIn, LogOut } from "lucide-react"
import { CheckRecordModal } from "@/components/company/check-record-modal"
import { CheckRecordDetailsModal } from "@/components/company/check-record-details-modal"
import { fetchApi } from "@/lib/api/config"

interface CheckRecord {
  id: number
  professionalId: number
  professionalName: string
  companyId: number
  customerId: number
  customerName: string
  appointmentId: number
  address: string
  teamId: number | null
  teamName: string | null
  checkInTime: string | null
  checkOutTime: string | null
  status: number
  serviceType: string
  notes: string
  createdDate: string
  updatedDate: string
}

interface CheckRecordsResponse {
  results: CheckRecord[]
  currentPage: number
  pageCount: number
  pageSize: number
  totalItems: number
  firstRowOnPage: number
  lastRowOnPage: number
}

const statusMap = {
  0: { label: "Pending", color: "bg-yellow-500", icon: Clock },
  1: { label: "Checked In", color: "bg-blue-500", icon: CheckCircle },
  2: { label: "Completed", color: "bg-green-500", icon: CheckCircle },
  3: { label: "Cancelled", color: "bg-red-500", icon: XCircle },
}

export default function CheckRecordsPage() {
  const { user } = useAuth()
  const [checkRecords, setCheckRecords] = useState<CheckRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<CheckRecord | null>(null)

  const fetchCheckRecords = async () => {
    if (!user?.companyId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        CompanyId: user.companyId.toString(),
        PageNumber: currentPage.toString(),
        PageSize: "10",
      })

      if (searchTerm) params.append("Search", searchTerm)
      if (statusFilter) params.append("Status", statusFilter)
      if (serviceTypeFilter) params.append("ServiceType", serviceTypeFilter)

      const data: CheckRecordsResponse = await fetchApi(`CheckRecord?${params}`)
      setCheckRecords(data.results)
      setTotalPages(data.pageCount)
      setTotalItems(data.totalItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCheckRecords()
  }, [user?.companyId, currentPage, searchTerm, statusFilter, serviceTypeFilter])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value === "all" ? "" : value)
    setCurrentPage(1)
  }

  const handleServiceTypeFilter = (value: string) => {
    setServiceTypeFilter(value === "all" ? "" : value)
    setCurrentPage(1)
  }

  const handleViewDetails = (record: CheckRecord) => {
    setSelectedRecord(record)
    setIsDetailsModalOpen(true)
  }

  const handleEdit = (record: CheckRecord) => {
    setSelectedRecord(record)
    setIsCreateModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!user?.token) return
    if (!confirm("Are you sure you want to delete this check record?")) return

    try {
      await fetchApi(`CheckRecord/${id}`, {
        method: "DELETE",
      })
      fetchCheckRecords()
    } catch (err) {
      console.error("Error deleting check record:", err)
    }
  }

  const handleCheckIn = async (record: CheckRecord) => {
    if (!user?.token) return

    try {
      const checkInData = {
        professionalId: record.professionalId,
        appointmentId: record.appointmentId,
        customerId: record.customerId,
        address: record.address,
        serviceType: record.serviceType,
        notes: record.notes || "",
      }

      await fetchApi("CheckRecord/check-in", {
        method: "POST",
        body: JSON.stringify(checkInData),
      })

      fetchCheckRecords() // Refresh the list
    } catch (err) {
      console.error("Error checking in:", err)
      setError("Failed to check in")
    }
  }

  const handleCheckOut = async (record: CheckRecord) => {
    if (!user?.token || !record.id) return

    try {
      const checkOutData = {
        notes: record.notes || "",
        serviceCompleted: true,
      }

      await fetchApi(`CheckRecord/check-out/${record.id}`, {
        method: "POST",
        body: JSON.stringify(checkOutData),
      })

      fetchCheckRecords() // Refresh the list
    } catch (err) {
      console.error("Error checking out:", err)
      setError("Failed to check out")
    }
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadge = (status: number) => {
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap[0]
    const Icon = statusInfo.icon

    return (
      <Badge className={`${statusInfo.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {statusInfo.label}
      </Badge>
    )
  }

  if (!user?.companyId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to view check records.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Check Records</h1>
          <p className="text-muted-foreground">Manage and track service check records</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Check Record
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search check records..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter || "all"} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="0">Pending</SelectItem>
                <SelectItem value="1">Checked In</SelectItem>
                <SelectItem value="2">Completed</SelectItem>
                <SelectItem value="3">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={serviceTypeFilter || "all"} onValueChange={handleServiceTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Service Types</SelectItem>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Check Records ({totalItems})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-red-500">{error}</p>
            </div>
          ) : checkRecords.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No check records found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Professional</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checkRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.professionalName || "N/A"}</TableCell>
                        <TableCell>{record.customerName || "N/A"}</TableCell>
                        <TableCell className="max-w-xs truncate">{record.address || "N/A"}</TableCell>
                        <TableCell>{record.teamName || "N/A"}</TableCell>
                        <TableCell>{record.serviceType || "N/A"}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>{formatDateTime(record.checkInTime)}</TableCell>
                        <TableCell>{formatDateTime(record.checkOutTime)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {record.status === 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCheckIn(record)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <LogIn className="w-4 h-4" />
                              </Button>
                            )}
                            {record.status === 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCheckOut(record)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <LogOut className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(record)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(record.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems}{" "}
                    results
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CheckRecordModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setSelectedRecord(null)
        }}
        onSuccess={() => {
          fetchCheckRecords()
          setIsCreateModalOpen(false)
          setSelectedRecord(null)
        }}
        record={selectedRecord}
      />

      <CheckRecordDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedRecord(null)
        }}
        record={selectedRecord}
      />
    </div>
  )
}
