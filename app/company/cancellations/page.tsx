"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Search,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Download,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { CompanyCancellationModal } from "@/components/company/company-cancellation-modal"
import { CompanyCancellationsProvider, useCompanyCancellationsContext } from "@/contexts/company-cancellations-context"
import { RefundStatus, type Cancellation } from "@/types/cancellation"
import { toast } from "@/components/ui/use-toast"

function CancellationsContent() {
  const { cancellations, loading, deleteCancellation } = useCompanyCancellationsContext()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [refundFilter, setRefundFilter] = useState("all")
  const [sortField, setSortField] = useState("cancelledAt")
  const [sortDirection, setSortDirection] = useState("desc")
  const [currentTab, setCurrentTab] = useState("all")

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCancellation, setSelectedCancellation] = useState<Cancellation | null>(null)

  // Delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [cancellationToDelete, setCancellationToDelete] = useState<Cancellation | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filter and sort cancellations
  const filteredCancellations = cancellations
    .filter((cancellation) => {
      // Search filter
      const matchesSearch =
        cancellation.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cancellation.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cancellation.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cancellation.appointmentId.toString().includes(searchTerm)

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "recent" &&
          new Date(cancellation.cancelledAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000)

      // Refund filter
      const matchesRefund = refundFilter === "all" || cancellation.refundStatus.toString() === refundFilter

      // Tab filter
      const matchesTab =
        currentTab === "all" ||
        (currentTab === "pending" && cancellation.refundStatus === RefundStatus.Pending) ||
        (currentTab === "processed" && cancellation.refundStatus === RefundStatus.Processed) ||
        (currentTab === "rejected" && cancellation.refundStatus === RefundStatus.Rejected)

      return matchesSearch && matchesStatus && matchesRefund && matchesTab
    })
    .sort((a, b) => {
      if (sortField === "cancelledAt") {
        return sortDirection === "asc"
          ? new Date(a.cancelledAt).getTime() - new Date(b.cancelledAt).getTime()
          : new Date(b.cancelledAt).getTime() - new Date(a.cancelledAt).getTime()
      } else if (sortField === "customerName") {
        const nameA = a.customerName || ""
        const nameB = b.customerName || ""
        return sortDirection === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      }
      return 0
    })

  // Statistics
  const totalCancellations = cancellations.length
  const pendingRefunds = cancellations.filter((c) => c.refundStatus === RefundStatus.Pending).length
  const processedRefunds = cancellations.filter((c) => c.refundStatus === RefundStatus.Processed).length
  const recentCancellations = cancellations.filter(
    (c) => new Date(c.cancelledAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).length

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Handle actions
  const handleAddCancellation = () => {
    setSelectedCancellation(null)
    setIsAddModalOpen(true)
  }

  const handleEditCancellation = (cancellation: Cancellation) => {
    setSelectedCancellation(cancellation)
    setIsEditModalOpen(true)
  }

  const handleDeleteCancellation = (cancellation: Cancellation) => {
    setCancellationToDelete(cancellation)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteCancellation = async () => {
    if (!cancellationToDelete) return

    try {
      setIsDeleting(true)
      await deleteCancellation(cancellationToDelete.id)
      toast({
        title: "Cancellation deleted",
        description: "The cancellation has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting cancellation:", error)
      toast({
        title: "Error",
        description: "Failed to delete cancellation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setCancellationToDelete(null)
    }
  }

  const getRefundStatusBadge = (status: RefundStatus) => {
    switch (status) {
      case RefundStatus.Pending:
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500">Pending</Badge>
      case RefundStatus.Processed:
        return <Badge className="bg-green-500/20 text-green-500 border-green-500">Processed</Badge>
      case RefundStatus.Rejected:
        return <Badge className="bg-red-500/20 text-red-500 border-red-500">Rejected</Badge>
      case RefundStatus.NotApplicable:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500">N/A</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Loading cancellations...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Cancellation Management</h1>
          <p className="text-gray-400">Track and manage service cancellations and refund requests</p>
        </div>
        <Button className="bg-[#06b6d4] hover:bg-[#0891b2] text-white" onClick={handleAddCancellation}>
          <Plus className="h-4 w-4 mr-2" />
          Add Cancellation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-[#06b6d4]" />
              Total Cancellations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalCancellations}</div>
            <p className="text-gray-400 text-sm">All time cancellations</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
              Pending Refunds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{pendingRefunds}</div>
            <p className="text-gray-400 text-sm">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Processed Refunds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{processedRefunds}</div>
            <p className="text-gray-400 text-sm">Successfully processed</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-purple-500" />
              Recent Cancellations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{recentCancellations}</div>
            <p className="text-gray-400 text-sm">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1a2234] border-[#2a3349]">
        <CardHeader>
          <Tabs defaultValue="all" className="w-full" onValueChange={setCurrentTab}>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <TabsList className="bg-[#2a3349]">
                <TabsTrigger value="all" className="data-[state=active]:bg-[#06b6d4] text-white">
                  All Cancellations
                </TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-[#06b6d4] text-white">
                  Pending
                </TabsTrigger>
                <TabsTrigger value="processed" className="data-[state=active]:bg-[#06b6d4] text-white">
                  Processed
                </TabsTrigger>
                <TabsTrigger value="rejected" className="data-[state=active]:bg-[#06b6d4] text-white">
                  Rejected
                </TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search cancellations..."
                    className="pl-8 bg-[#2a3349] border-0 text-white placeholder:text-gray-500 focus-visible:ring-[#06b6d4] w-full sm:w-[200px] md:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={refundFilter} onValueChange={setRefundFilter}>
                  <SelectTrigger className="w-[120px] bg-[#2a3349] border-0 text-white focus:ring-[#06b6d4]">
                    <SelectValue placeholder="Refund" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2a3349] border-[#3a4359]">
                    <SelectItem value="all" className="text-white focus:bg-[#3a4359] focus:text-white">
                      All Refunds
                    </SelectItem>
                    <SelectItem value="0" className="text-white focus:bg-[#3a4359] focus:text-white">
                      Pending
                    </SelectItem>
                    <SelectItem value="1" className="text-white focus:bg-[#3a4359] focus:text-white">
                      Processed
                    </SelectItem>
                    <SelectItem value="2" className="text-white focus:bg-[#3a4359] focus:text-white">
                      Rejected
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  className="border-[#2a3349] bg-[#2a3349] text-white hover:bg-[#3a4359] hover:text-white"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setRefundFilter("all")
                    setCurrentTab("all")
                  }}
                >
                  Clear
                </Button>

                <Button
                  variant="outline"
                  className="border-[#2a3349] bg-[#2a3349] text-white hover:bg-[#3a4359] hover:text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </Tabs>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a3349]">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("appointmentId")}>
                      Appointment
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("customerName")}>
                      Customer
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Reason</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Refund Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("cancelledAt")}>
                      Cancelled At
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCancellations.length > 0 ? (
                  filteredCancellations.map((cancellation) => (
                    <tr key={cancellation.id} className="border-b border-[#2a3349] hover:bg-[#2a3349]">
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">#{cancellation.appointmentId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{cancellation.customerName || "Unknown Customer"}</div>
                        <div className="text-sm text-gray-400">ID: {cancellation.customerId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white">{cancellation.reason}</div>
                        {cancellation.notes && (
                          <div className="text-sm text-gray-400 truncate max-w-[200px]">{cancellation.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">{getRefundStatusBadge(cancellation.refundStatus)}</td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(cancellation.cancelledAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-[#2a3349] text-white hover:bg-[#2a3349] bg-transparent"
                            onClick={() => handleEditCancellation(cancellation)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-[#2a3349] text-white hover:bg-[#2a3349] bg-transparent"
                            onClick={() => handleEditCancellation(cancellation)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-red-500 text-red-500 hover:bg-red-500/10 hover:text-red-500 bg-transparent"
                            onClick={() => handleDeleteCancellation(cancellation)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-400">
                      No cancellations found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Cancellation Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <CompanyCancellationModal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => {
            setIsAddModalOpen(false)
            setIsEditModalOpen(false)
          }}
          cancellation={selectedCancellation}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1a2234] border-[#2a3349]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Cancellation</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this cancellation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-[#2a3349] text-white hover:bg-[#2a3349] bg-transparent"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCancellation}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Cancellation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function CompanyCancellationsPage() {
  return (
    <CompanyCancellationsProvider>
      <CancellationsContent />
    </CompanyCancellationsProvider>
  )
}
