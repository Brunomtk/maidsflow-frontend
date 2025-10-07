"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Filter } from "lucide-react"
import { InternalFeedbackModal } from "@/components/admin/internal-feedback-modal"
import { InternalFeedbackDetailsModal } from "@/components/admin/internal-feedback-details-modal"
import { useToast } from "@/hooks/use-toast"
import { internalFeedbackApi } from "@/lib/api/internal-feedback"
import type { InternalFeedback, InternalFeedbackFilters } from "@/types/internal-feedback"

export default function InternalFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<InternalFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [feedbackToDelete, setFeedbackToDelete] = useState<InternalFeedback | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })
  const { toast } = useToast()

  // Load feedbacks
  const loadFeedbacks = async (page = 1) => {
    setLoading(true)
    try {
      const filters: InternalFeedbackFilters = {
        pageNumber: page,
        pageSize: 10,
      }

      // Apply filters
      if (activeTab !== "all") {
        filters.status = Number(activeTab)
      }
      if (selectedCategory !== "all") {
        filters.category = selectedCategory
      }
      if (selectedPriority !== "all") {
        filters.priority = Number(selectedPriority)
      }
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim()
      }

      const { data, error } = await internalFeedbackApi.getRecords(filters)
      if (error) {
        throw new Error(error)
      }

      if (data) {
        setFeedbacks(data.data || [])
        setPagination(data.meta)
      }
    } catch (error) {
      console.error("Error loading feedbacks:", error)
      toast({
        title: "Error",
        description: "Failed to load internal feedbacks",
        variant: "destructive",
      })
      setFeedbacks([])
    } finally {
      setLoading(false)
    }
  }

  // Load data on mount and when filters change
  useEffect(() => {
    loadFeedbacks(1)
  }, [activeTab, selectedCategory, selectedPriority, searchQuery])

  // Handle delete
  const handleDelete = async () => {
    if (!feedbackToDelete) return

    try {
      const { error } = await internalFeedbackApi.delete(feedbackToDelete.id)
      if (error) throw new Error(error)

      toast({
        title: "Success",
        description: "Internal feedback deleted successfully",
      })

      loadFeedbacks(pagination.currentPage)
    } catch (error) {
      console.error("Error deleting feedback:", error)
      toast({
        title: "Error",
        description: "Failed to delete internal feedback",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setFeedbackToDelete(null)
    }
  }

  // Get status badge
  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="secondary">Pending</Badge>
      case 1:
        return (
          <Badge variant="default" className="bg-yellow-600">
            In Progress
          </Badge>
        )
      case 2:
        return (
          <Badge variant="default" className="bg-green-600">
            Resolved
          </Badge>
        )
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  // Get priority badge
  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 0:
        return <Badge variant="outline">Low</Badge>
      case 1:
        return (
          <Badge variant="default" className="bg-[#00D3F3]">
            Medium
          </Badge>
        )
      case 2:
        return <Badge variant="destructive">High</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Count feedbacks by status
  const getStatusCount = (status: number) => {
    return feedbacks.filter((f) => f.status === status).length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Internal Feedback</h1>
          <p className="text-muted-foreground">Manage internal feedback from professionals</p>
        </div>
        <InternalFeedbackModal onSuccess={() => loadFeedbacks(pagination.currentPage)}>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Add Feedback
          </Button>
        </InternalFeedbackModal>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search feedbacks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-input text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-background border-input text-foreground">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Scheduling">Scheduling</SelectItem>
                  <SelectItem value="Customer Info">Customer Info</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                  <SelectItem value="Safety">Safety</SelectItem>
                  <SelectItem value="Sistema">Sistema</SelectItem>
                  <SelectItem value="Acesso">Acesso</SelectItem>
                  <SelectItem value="Usabilidade">Usabilidade</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Priority</label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="bg-background border-input text-foreground">
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="0">Low</SelectItem>
                  <SelectItem value="1">Medium</SelectItem>
                  <SelectItem value="2">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border-border">
          <TabsTrigger value="all" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            All ({pagination.totalItems})
          </TabsTrigger>
          <TabsTrigger value="0" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            Pending ({getStatusCount(0)})
          </TabsTrigger>
          <TabsTrigger value="1" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            In Progress ({getStatusCount(1)})
          </TabsTrigger>
          <TabsTrigger value="2" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            Resolved ({getStatusCount(2)})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                {activeTab === "all"
                  ? "All Feedbacks"
                  : activeTab === "0"
                    ? "Pending Feedbacks"
                    : activeTab === "1"
                      ? "In Progress Feedbacks"
                      : "Resolved Feedbacks"}
              </CardTitle>
              <CardDescription>{loading ? "Loading..." : `${pagination.totalItems} total feedbacks`}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No internal feedbacks found</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-foreground">Title</TableHead>
                        <TableHead className="text-foreground">Professional</TableHead>
                        <TableHead className="text-foreground">Team</TableHead>
                        <TableHead className="text-foreground">Category</TableHead>
                        <TableHead className="text-foreground">Status</TableHead>
                        <TableHead className="text-foreground">Priority</TableHead>
                        <TableHead className="text-foreground">Date</TableHead>
                        <TableHead className="text-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feedbacks.map((feedback) => (
                        <TableRow key={feedback.id} className="border-border">
                          <TableCell className="text-foreground font-medium">{feedback.title}</TableCell>
                          <TableCell className="text-foreground">Professional #{feedback.professionalId}</TableCell>
                          <TableCell className="text-foreground">Team #{feedback.teamId}</TableCell>
                          <TableCell className="text-foreground">{feedback.category}</TableCell>
                          <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                          <TableCell>{getPriorityBadge(feedback.priority)}</TableCell>
                          <TableCell className="text-foreground">
                            {new Date(feedback.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 text-foreground hover:bg-accent">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-popover border-border text-popover-foreground"
                              >
                                <InternalFeedbackDetailsModal feedback={feedback}>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                </InternalFeedbackDetailsModal>
                                <InternalFeedbackModal
                                  feedback={feedback}
                                  onSuccess={() => loadFeedbacks(pagination.currentPage)}
                                >
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                </InternalFeedbackModal>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setFeedbackToDelete(feedback)
                                    setDeleteDialogOpen(true)
                                  }}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{" "}
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{" "}
                    {pagination.totalItems} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadFeedbacks(pagination.currentPage - 1)}
                      disabled={pagination.currentPage <= 1}
                      className="border-border bg-background text-foreground hover:bg-accent"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-foreground">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadFeedbacks(pagination.currentPage + 1)}
                      disabled={pagination.currentPage >= pagination.totalPages}
                      className="border-border bg-background text-foreground hover:bg-accent"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete the internal feedback "
              {feedbackToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-background text-foreground hover:bg-accent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
