"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, Search, Eye, Edit, Check, X, RefreshCw } from "lucide-react"
import { CompanyRescheduleModal } from "@/components/company/company-reschedule-modal"
import { CompanyRescheduleDetailsModal } from "@/components/company/company-reschedule-details-modal"

// Sample data for reschedule requests
const rescheduleData = [
  {
    id: 1,
    requestId: "RSC-001",
    customer: "John Smith",
    originalDate: "2024-01-20",
    originalTime: "09:00 AM",
    requestedDate: "2024-01-25",
    requestedTime: "02:00 PM",
    reason: "Personal emergency",
    status: "pending",
    team: "Team Alpha",
    address: "123 Main St, Suite 100",
    serviceType: "Regular Cleaning",
    requestedAt: "2024-01-15 10:30 AM",
    priority: "high",
  },
  {
    id: 2,
    requestId: "RSC-002",
    customer: "Emma Johnson",
    originalDate: "2024-01-22",
    originalTime: "11:00 AM",
    requestedDate: "2024-01-24",
    requestedTime: "03:00 PM",
    reason: "Schedule conflict with another appointment",
    status: "approved",
    team: "Team Beta",
    address: "456 Oak Ave",
    serviceType: "Deep Cleaning",
    requestedAt: "2024-01-14 02:15 PM",
    priority: "medium",
    approvedBy: "Manager",
    approvedAt: "2024-01-14 04:30 PM",
  },
  {
    id: 3,
    requestId: "RSC-003",
    customer: "Michael Brown",
    originalDate: "2024-01-23",
    originalTime: "02:00 PM",
    requestedDate: "2024-01-26",
    requestedTime: "10:00 AM",
    reason: "Out of town on original date",
    status: "rejected",
    team: "Team Gamma",
    address: "789 Pine Rd",
    serviceType: "Specialized Service",
    requestedAt: "2024-01-13 09:45 AM",
    priority: "low",
    rejectedBy: "Supervisor",
    rejectedAt: "2024-01-13 11:00 AM",
    rejectionReason: "No available slots on requested date",
  },
  {
    id: 4,
    requestId: "RSC-004",
    customer: "Sophia Davis",
    originalDate: "2024-01-24",
    originalTime: "10:00 AM",
    requestedDate: "2024-01-28",
    requestedTime: "01:00 PM",
    reason: "Weather conditions",
    status: "pending",
    team: "Team Delta",
    address: "321 Elm St",
    serviceType: "Regular Cleaning",
    requestedAt: "2024-01-16 08:20 AM",
    priority: "medium",
  },
]

export default function ReschedulePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [selectedTab, setSelectedTab] = useState("all")

  // Modal states
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedReschedule, setSelectedReschedule] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Filter data based on search and filters
  const filteredData = rescheduleData.filter((item) => {
    const matchesSearch =
      item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.address.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || item.status === filterStatus
    const matchesPriority = filterPriority === "all" || item.priority === filterPriority
    const matchesTab = selectedTab === "all" || item.status === selectedTab

    return matchesSearch && matchesStatus && matchesPriority && matchesTab
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500">Pending</Badge>
      case "approved":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-500 border-red-500">Rejected</Badge>
      default:
        return null
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="outline" className="border-red-500 text-red-500">
            High Priority
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            Medium
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="border-gray-500 text-gray-500">
            Low
          </Badge>
        )
      default:
        return null
    }
  }

  const handleAddReschedule = () => {
    setSelectedReschedule(null)
    setIsEditing(false)
    setIsRescheduleModalOpen(true)
  }

  const handleViewDetails = (reschedule: any) => {
    setSelectedReschedule(reschedule)
    setIsDetailsModalOpen(true)
  }

  const handleEditReschedule = (reschedule: any) => {
    setSelectedReschedule(reschedule)
    setIsEditing(true)
    setIsRescheduleModalOpen(true)
    setIsDetailsModalOpen(false)
  }

  const handleApprove = (reschedule: any) => {
    // In a real app, this would call an API
    console.log("Approving reschedule:", reschedule)
  }

  const handleReject = (reschedule: any) => {
    // In a real app, this would call an API
    console.log("Rejecting reschedule:", reschedule)
  }

  // Statistics
  const stats = {
    total: rescheduleData.length,
    pending: rescheduleData.filter((r) => r.status === "pending").length,
    approved: rescheduleData.filter((r) => r.status === "approved").length,
    rejected: rescheduleData.filter((r) => r.status === "rejected").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Reschedule Requests</h1>
          <p className="text-gray-400">Manage and process reschedule requests from customers</p>
        </div>
        <Button onClick={handleAddReschedule} className="bg-[#06b6d4] hover:bg-[#0891b2] text-white">
          <RefreshCw className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Requests</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-[#06b6d4]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Rejected</p>
                <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
              </div>
              <X className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-[#1a2234] border-[#2a3349]">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <Tabs defaultValue="all" onValueChange={setSelectedTab}>
              <TabsList className="bg-[#0f172a] border border-[#2a3349]">
                <TabsTrigger value="all" className="data-[state=active]:bg-[#2a3349] text-white">
                  All Requests
                </TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-[#2a3349] text-white">
                  Pending
                </TabsTrigger>
                <TabsTrigger value="approved" className="data-[state=active]:bg-[#2a3349] text-white">
                  Approved
                </TabsTrigger>
                <TabsTrigger value="rejected" className="data-[state=active]:bg-[#2a3349] text-white">
                  Rejected
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by customer, ID, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#0f172a] border-[#2a3349] text-white placeholder:text-gray-500"
                />
              </div>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-full sm:w-[180px] bg-[#0f172a] border-[#2a3349] text-white">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectItem value="all" className="hover:bg-[#2a3349]">
                    All Priorities
                  </SelectItem>
                  <SelectItem value="high" className="hover:bg-[#2a3349]">
                    High Priority
                  </SelectItem>
                  <SelectItem value="medium" className="hover:bg-[#2a3349]">
                    Medium Priority
                  </SelectItem>
                  <SelectItem value="low" className="hover:bg-[#2a3349]">
                    Low Priority
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reschedule Requests Table */}
      <Card className="bg-[#1a2234] border-[#2a3349]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#2a3349] hover:bg-transparent">
                  <TableHead className="text-gray-400">Request ID</TableHead>
                  <TableHead className="text-gray-400">Customer</TableHead>
                  <TableHead className="text-gray-400">Original Schedule</TableHead>
                  <TableHead className="text-gray-400">Requested Schedule</TableHead>
                  <TableHead className="text-gray-400">Priority</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((reschedule) => (
                  <TableRow key={reschedule.id} className="border-[#2a3349] hover:bg-[#0f172a]">
                    <TableCell className="font-medium text-white">{reschedule.requestId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-white font-medium">{reschedule.customer}</p>
                        <p className="text-sm text-gray-400">{reschedule.serviceType}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>{reschedule.originalDate}</span>
                        <Clock className="h-4 w-4 ml-2" />
                        <span>{reschedule.originalTime}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-white">
                        <Calendar className="h-4 w-4 text-[#06b6d4]" />
                        <span>{reschedule.requestedDate}</span>
                        <Clock className="h-4 w-4 ml-2 text-[#06b6d4]" />
                        <span>{reschedule.requestedTime}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(reschedule.priority)}</TableCell>
                    <TableCell>{getStatusBadge(reschedule.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(reschedule)}
                          className="text-gray-400 hover:text-white hover:bg-[#2a3349]"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {reschedule.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(reschedule)}
                              className="text-green-500 hover:text-green-400 hover:bg-[#2a3349]"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(reschedule)}
                              className="text-red-500 hover:text-red-400 hover:bg-[#2a3349]"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditReschedule(reschedule)}
                          className="text-gray-400 hover:text-white hover:bg-[#2a3349]"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CompanyRescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        onSubmit={(data) => {
          console.log("Submitting reschedule:", data)
          setIsRescheduleModalOpen(false)
        }}
        reschedule={selectedReschedule}
      />

      <CompanyRescheduleDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        reschedule={selectedReschedule}
        onEdit={handleEditReschedule}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}
