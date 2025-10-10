"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Search, Plus, X, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { useCheckRecords } from "@/hooks/use-check-records"
import { CompanyCheckInModal } from "@/components/company/company-check-in-modal"
import { CompanyCheckOutModal } from "@/components/company/company-check-out-modal"
import { CompanyCheckInDetailsModal } from "@/components/company/company-check-in-details-modal"
import { CompanyCheckOutDetailsModal } from "@/components/company/company-check-out-details-modal"
import { CompanyCheckRecordModal } from "@/components/company/company-check-record-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { type CheckRecord, CHECK_RECORD_STATUS } from "@/types/check-record"
import { useAuth } from "@/contexts/auth-context"

export default function CheckManagementPage() {
  const { toast } = useToast()
  const { user } = useAuth()

  const {
    records: checkRecords,
    isLoading,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    checkIn,
    checkOut,
    pagination,
  } = useCheckRecords(user?.companyId ? { companyId: user.companyId, page: 1, pageSize: 10 } : undefined)

  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false)
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false)
  const [isCheckInDetailsModalOpen, setIsCheckInDetailsModalOpen] = useState(false)
  const [isCheckOutDetailsModalOpen, setIsCheckOutDetailsModalOpen] = useState(false)
  const [isCheckRecordModalOpen, setIsCheckRecordModalOpen] = useState(false)
  const [selectedCheckRecord, setSelectedCheckRecord] = useState<CheckRecord | null>(null)
  const [activeTab, setActiveTab] = useState("check-in")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined)
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (user?.companyId) {
      loadCheckRecords()
    }
  }, [currentPage, statusFilter, dateFilter, searchTerm, user?.companyId])

  const loadCheckRecords = async () => {
    if (!user?.companyId) {
      toast({
        title: "Error",
        description: "Company ID not found. Please log in again.",
        variant: "destructive",
      })
      return
    }

    const filters = {
      page: currentPage,
      pageSize: 10,
      search: searchTerm,
      status: statusFilter,
      date: dateFilter ? format(dateFilter, "yyyy-MM-dd") : undefined,
      companyId: user.companyId, // Use actual companyId from logged user
    }

    await fetchRecords(filters)
  }

  const handleRefresh = async () => {
    await loadCheckRecords()
  }

  const handleAddCheckRecord = async (data: any) => {
    const result = await createRecord(data)
    if (result) {
      setIsCheckRecordModalOpen(false)
      await handleRefresh() // Use handleRefresh
      toast({
        title: "Success",
        description: "Check record created successfully",
      })
    }
  }

  const handleCheckIn = async (data: any) => {
    if (selectedCheckRecord) {
      const checkInData = {
        professionalId: selectedCheckRecord.professionalId,
        professionalName: selectedCheckRecord.professionalName,
        companyId: selectedCheckRecord.companyId,
        customerId: selectedCheckRecord.customerId,
        customerName: selectedCheckRecord.customerName,
        appointmentId: selectedCheckRecord.appointmentId,
        address: selectedCheckRecord.address,
        teamId: selectedCheckRecord.teamId,
        teamName: selectedCheckRecord.teamName,
        serviceType: selectedCheckRecord.serviceType,
        notes: data.notes || selectedCheckRecord.notes,
      }

      const result = await checkIn(checkInData)
      if (result) {
        setIsCheckInModalOpen(false)
        setSelectedCheckRecord(null)
        await handleRefresh() // Use handleRefresh
        toast({
          title: "Success",
          description: "Check-in performed successfully",
        })
      }
    }
  }

  const handleCheckOut = async (data: any) => {
    if (selectedCheckRecord) {
      const result = await checkOut(selectedCheckRecord.id.toString())
      if (result) {
        setIsCheckOutModalOpen(false)
        setSelectedCheckRecord(null)
        await handleRefresh() // Use handleRefresh
        toast({
          title: "Success",
          description: "Check-out performed successfully",
        })
      }
    }
  }

  const handleUpdateCheckRecord = async (data: any) => {
    if (selectedCheckRecord) {
      const result = await updateRecord(selectedCheckRecord.id.toString(), data)
      if (result) {
        setIsCheckInModalOpen(false)
        setIsCheckOutModalOpen(false)
        await handleRefresh() // Use handleRefresh
        toast({
          title: "Success",
          description: "Check record updated successfully",
        })
      }
    }
  }

  // Filter records for check-in tab (pending and checked-in)
  const getCheckInRecords = (): CheckRecord[] => {
    if (!Array.isArray(checkRecords)) {
      return []
    }
    return checkRecords.filter(
      (record) => record.status === CHECK_RECORD_STATUS.PENDING || record.status === CHECK_RECORD_STATUS.CHECKED_IN,
    )
  }

  // Filter records for check-out tab (checked-in only)
  const getCheckOutRecords = (): CheckRecord[] => {
    if (!Array.isArray(checkRecords)) {
      return []
    }
    return checkRecords.filter((record) => record.status === CHECK_RECORD_STATUS.CHECKED_IN)
  }

  // Filter records for history tab (completed and cancelled)
  const getHistoryRecords = (): CheckRecord[] => {
    if (!Array.isArray(checkRecords)) {
      return []
    }
    return checkRecords.filter(
      (record) =>
        record.status === CHECK_RECORD_STATUS.COMPLETED ||
        record.status === CHECK_RECORD_STATUS.CANCELLED ||
        record.status === CHECK_RECORD_STATUS.CHECKED_OUT,
    )
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "all" ? undefined : Number.parseInt(value))
    setCurrentPage(1)
  }

  const handleDateFilterChange = (date: Date | undefined) => {
    setDateFilter(date)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter(undefined)
    setDateFilter(undefined)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case CHECK_RECORD_STATUS.PENDING:
        return <Badge className="bg-yellow-500 text-xs">Pending</Badge>
      case CHECK_RECORD_STATUS.CHECKED_IN:
        return <Badge className="bg-blue-500 text-xs">Checked In</Badge>
      case CHECK_RECORD_STATUS.CHECKED_OUT:
        return <Badge className="bg-purple-500 text-xs">Checked Out</Badge>
      case CHECK_RECORD_STATUS.COMPLETED:
        return <Badge className="bg-green-500 text-xs">Completed</Badge>
      case CHECK_RECORD_STATUS.CANCELLED:
        return <Badge className="bg-red-500 text-xs">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-500 text-xs">Unknown</Badge>
    }
  }

  const renderCheckRecordsList = (records: CheckRecord[]) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-foreground">Loading check records...</div>
        </div>
      )
    }

    if (!records.length) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-2" />
          <h3 className="text-base sm:text-lg font-medium text-foreground">No check records found</h3>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or create a new check record.</p>
        </div>
      )
    }

    return (
      <div className="space-y-3 sm:space-y-4">
        {records.map((record) => (
          <Card key={record.id} className="bg-card border-border overflow-hidden">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                    <AvatarImage src="/placeholder-user.jpg" alt={record.professionalName} />
                    <AvatarFallback className="bg-[#06b6d4] text-xs sm:text-sm">
                      {record.professionalName?.charAt(0) || "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{record.professionalName}</p>
                      {getStatusBadge(record.status)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 truncate">{record.address}</div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-1">
                      <div className="text-xs text-muted-foreground">
                        {record.checkInTime
                          ? `Check-in: ${format(new Date(record.checkInTime), "MMM d, HH:mm")}`
                          : "Not checked in"}
                      </div>
                      {record.checkOutTime && (
                        <div className="text-xs text-muted-foreground">
                          Check-out: {format(new Date(record.checkOutTime), "MMM d, HH:mm")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 sm:flex-shrink-0">
                  {record.status === CHECK_RECORD_STATUS.PENDING && (
                    <Button
                      size="sm"
                      className="bg-[#06b6d4] hover:bg-[#0891b2] text-white flex-1 sm:flex-none text-xs"
                      onClick={() => {
                        setSelectedCheckRecord(record)
                        setIsCheckInModalOpen(true)
                      }}
                    >
                      Check-In
                    </Button>
                  )}
                  {record.status === CHECK_RECORD_STATUS.CHECKED_IN && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none text-xs"
                      onClick={() => {
                        setSelectedCheckRecord(record)
                        setIsCheckOutModalOpen(true)
                      }}
                    >
                      Check-Out
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground hover:bg-muted bg-transparent flex-1 sm:flex-none text-xs"
                    onClick={() => {
                      setSelectedCheckRecord(record)
                      if (activeTab === "check-in") {
                        setIsCheckInDetailsModalOpen(true)
                      } else if (activeTab === "check-out") {
                        setIsCheckOutDetailsModalOpen(true)
                      } else {
                        setIsCheckInDetailsModalOpen(true)
                      }
                    }}
                  >
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Pagination */}
        {pagination.pageCount > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
            <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              Showing {pagination.firstRowOnPage || 1} to {pagination.lastRowOnPage || 0} of {pagination.totalItems}{" "}
              records
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="border-border text-foreground hover:bg-muted text-xs"
              >
                Previous
              </Button>
              <span className="text-xs sm:text-sm text-foreground">
                Page {pagination.currentPage} of {pagination.pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= pagination.pageCount}
                className="border-border text-foreground hover:bg-muted text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Check Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage check-ins and check-outs for professionals.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Refresh button */}
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="border-border text-foreground hover:bg-muted bg-transparent"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            className="bg-[#06b6d4] hover:bg-[#0891b2] text-white w-full sm:w-auto"
            onClick={() => {
              setSelectedCheckRecord(null)
              setIsCheckRecordModalOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Check Record
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-foreground text-base sm:text-lg">Check Records</CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                View and manage all check records.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by professional name or address..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-muted border-border text-foreground placeholder-muted-foreground"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="flex-1">
                <Select value={statusFilter?.toString() || "all"} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-full bg-muted border-border text-foreground">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="0">Pending</SelectItem>
                    <SelectItem value="1">Checked In</SelectItem>
                    <SelectItem value="2">Checked Out</SelectItem>
                    <SelectItem value="3">Completed</SelectItem>
                    <SelectItem value="4">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal border-border bg-muted hover:bg-muted ${
                        !dateFilter ? "text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      <span className="truncate">{dateFilter ? format(dateFilter, "PPP") : "Pick a date"}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border">
                    <DatePicker mode="single" selected={dateFilter} onSelect={handleDateFilterChange} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-muted bg-transparent w-full sm:w-auto"
                onClick={clearFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 bg-muted border border-border w-full">
                <TabsTrigger
                  value="check-in"
                  className="data-[state=active]:bg-[#06b6d4] data-[state=active]:text-white text-xs sm:text-sm"
                >
                  Check-In
                </TabsTrigger>
                <TabsTrigger
                  value="check-out"
                  className="data-[state=active]:bg-[#06b6d4] data-[state=active]:text-white text-xs sm:text-sm"
                >
                  Check-Out
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-[#06b6d4] data-[state=active]:text-white text-xs sm:text-sm"
                >
                  History
                </TabsTrigger>
              </TabsList>
              <TabsContent value="check-in" className="mt-4">
                {renderCheckRecordsList(getCheckInRecords())}
              </TabsContent>
              <TabsContent value="check-out" className="mt-4">
                {renderCheckRecordsList(getCheckOutRecords())}
              </TabsContent>
              <TabsContent value="history" className="mt-4">
                {renderCheckRecordsList(getHistoryRecords())}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CompanyCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => {
          setIsCheckInModalOpen(false)
          setSelectedCheckRecord(null)
        }}
        onSubmit={handleCheckIn}
        checkIn={selectedCheckRecord}
      />

      <CompanyCheckOutModal
        isOpen={isCheckOutModalOpen}
        onClose={() => {
          setIsCheckOutModalOpen(false)
          setSelectedCheckRecord(null)
        }}
        onSubmit={handleCheckOut}
        checkOut={selectedCheckRecord}
      />

      <CompanyCheckInDetailsModal
        isOpen={isCheckInDetailsModalOpen}
        onClose={() => {
          setIsCheckInDetailsModalOpen(false)
          setSelectedCheckRecord(null)
        }}
        checkIn={selectedCheckRecord}
        onCheckOut={() => {
          setIsCheckInDetailsModalOpen(false)
          setIsCheckOutModalOpen(true)
        }}
      />

      <CompanyCheckOutDetailsModal
        isOpen={isCheckOutDetailsModalOpen}
        onClose={() => {
          setIsCheckOutDetailsModalOpen(false)
          setSelectedCheckRecord(null)
        }}
        checkOut={selectedCheckRecord}
      />

      <CompanyCheckRecordModal
        isOpen={isCheckRecordModalOpen}
        onClose={() => {
          setIsCheckRecordModalOpen(false)
          setSelectedCheckRecord(null)
        }}
        onSubmit={handleAddCheckRecord}
      />
    </div>
  )
}
