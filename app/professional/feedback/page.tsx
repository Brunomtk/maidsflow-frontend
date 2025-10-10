"use client"

import { Input } from "@/components/ui/input"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  Plus,
  Eye,
  Calendar,
  User,
  Tag,
  Flag,
  RefreshCw,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useProfessionalFeedback } from "@/hooks/use-professional-feedback"
import { useToast } from "@/hooks/use-toast"
import type { InternalFeedback } from "@/types/internal-feedback"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ProfessionalFeedback() {
  const { feedbacks, isLoading, createFeedback, fetchFeedbacks, addComment } = useProfessionalFeedback()
  const { toast } = useToast()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Form state for new feedback
  const [newFeedback, setNewFeedback] = useState({
    title: "",
    category: "",
    description: "",
    priority: "1",
  })

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Selected feedback for details
  const [selectedFeedback, setSelectedFeedback] = useState<InternalFeedback | null>(null)
  const [newComment, setNewComment] = useState("")

  useEffect(() => {
    fetchFeedbacks({
      search: searchTerm,
      status: statusFilter !== "all" ? statusFilter : undefined,
      priority: priorityFilter !== "all" ? priorityFilter : undefined,
      category: categoryFilter !== "all" ? categoryFilter : undefined,
    })
  }, [searchTerm, statusFilter, priorityFilter, categoryFilter, fetchFeedbacks])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchFeedbacks({
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
      })
      toast({
        title: "Refreshed",
        description: "Feedback list has been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh feedback.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newFeedback.title || !newFeedback.category || !newFeedback.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      await createFeedback({
        title: newFeedback.title,
        category: newFeedback.category,
        description: newFeedback.description,
        priority: Number.parseInt(newFeedback.priority),
        status: 0,
      })

      setNewFeedback({
        title: "",
        category: "",
        description: "",
        priority: "1",
      })

      toast({
        title: "Success",
        description: "Your feedback has been submitted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFeedback || !newComment.trim()) {
      return
    }

    try {
      await addComment(selectedFeedback.id as number, newComment)
      setNewComment("")
      toast({
        title: "Success",
        description: "Comment added successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-700 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-300"
          >
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case 1:
        return (
          <Badge
            variant="outline"
            className="border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-300"
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        )
      case 2:
        return (
          <Badge
            variant="outline"
            className="border-green-500 text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-300"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Resolved
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 0:
        return (
          <Badge
            variant="outline"
            className="border-green-500 text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-300"
          >
            <Flag className="w-3 h-3 mr-1" />
            Low
          </Badge>
        )
      case 1:
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-700 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-300"
          >
            <Flag className="w-3 h-3 mr-1" />
            Medium
          </Badge>
        )
      case 2:
        return (
          <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50 dark:bg-red-950 dark:text-red-300">
            <Flag className="w-3 h-3 mr-1" />
            High
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || feedback.status.toString() === statusFilter
    const matchesPriority = priorityFilter === "all" || feedback.priority.toString() === priorityFilter
    const matchesCategory = categoryFilter === "all" || feedback.category === categoryFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  const pendingCount = feedbacks.filter((f) => f.status === 0).length
  const inProgressCount = feedbacks.filter((f) => f.status === 1).length
  const resolvedCount = feedbacks.filter((f) => f.status === 2).length

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-6 px-4 md:px-0">
      <div className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Internal Feedback</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Submit feedback about issues, suggestions, or improvements
        </p>
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-3">
        <Card className="border-yellow-200 dark:border-yellow-900">
          <CardContent className="p-3 md:p-6">
            <div className="flex flex-col items-center text-center space-y-1 md:space-y-2">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-950 rounded-full">
                <Clock className="h-4 w-4 md:h-6 md:w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <p className="text-xl md:text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-900">
          <CardContent className="p-3 md:p-6">
            <div className="flex flex-col items-center text-center space-y-1 md:space-y-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-full">
                <AlertCircle className="h-4 w-4 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xl md:text-2xl font-bold">{inProgressCount}</p>
              <p className="text-xs md:text-sm text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-900">
          <CardContent className="p-3 md:p-6">
            <div className="flex flex-col items-center text-center space-y-1 md:space-y-2">
              <div className="p-2 bg-green-100 dark:bg-green-950 rounded-full">
                <CheckCircle className="h-4 w-4 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xl md:text-2xl font-bold">{resolvedCount}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Resolved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="submit" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submit" className="flex items-center gap-2 text-xs md:text-sm">
            <Plus className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Submit</span> Feedback
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 text-xs md:text-sm">
            <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">My</span> History
          </TabsTrigger>
        </TabsList>

        {/* Submit New Feedback Tab */}
        <TabsContent value="submit" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Send className="h-4 w-4 md:h-5 md:w-5" />
                Submit New Feedback
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Help us improve by sharing your feedback about any issues or suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitFeedback} className="space-y-4 md:space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm">
                      <span className="flex items-center gap-2">
                        <Tag className="h-3 w-3 md:h-4 md:w-4" />
                        Title *
                      </span>
                    </Label>
                    <Input
                      id="title"
                      value={newFeedback.title}
                      onChange={(e) => setNewFeedback({ ...newFeedback, title: e.target.value })}
                      placeholder="Brief description"
                      required
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm">
                      <span className="flex items-center gap-2">
                        <Filter className="h-3 w-3 md:h-4 md:w-4" />
                        Category *
                      </span>
                    </Label>
                    <Select
                      value={newFeedback.category}
                      onValueChange={(value) => setNewFeedback({ ...newFeedback, category: value })}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Equipment">Equipment Issues</SelectItem>
                        <SelectItem value="Scheduling">Scheduling Problems</SelectItem>
                        <SelectItem value="Customer Info">Customer Information</SelectItem>
                        <SelectItem value="Training">Training Needs</SelectItem>
                        <SelectItem value="Safety">Safety Concerns</SelectItem>
                        <SelectItem value="Sistema">System Issues</SelectItem>
                        <SelectItem value="Acesso">Access Problems</SelectItem>
                        <SelectItem value="Usabilidade">Usability</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm">
                    <span className="flex items-center gap-2">
                      <Flag className="h-3 w-3 md:h-4 md:w-4" />
                      Priority Level
                    </span>
                  </Label>
                  <Select
                    value={newFeedback.priority}
                    onValueChange={(value) => setNewFeedback({ ...newFeedback, priority: value })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Low - Minor issue</SelectItem>
                      <SelectItem value="1">Medium - Affects efficiency</SelectItem>
                      <SelectItem value="2">High - Urgent issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
                      Description *
                    </span>
                  </Label>
                  <Textarea
                    id="description"
                    value={newFeedback.description}
                    onChange={(e) => setNewFeedback({ ...newFeedback, description: e.target.value })}
                    placeholder="Provide detailed information about your feedback..."
                    rows={5}
                    required
                    className="text-sm resize-none"
                  />
                </div>

                <Alert className="border-blue-200 dark:border-blue-900">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs md:text-sm">
                    Your feedback will be reviewed by our team. Provide as much detail as possible.
                  </AlertDescription>
                </Alert>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Filter className="h-4 w-4 md:h-5 md:w-5" />
                  Filters
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-8 px-2 md:px-3"
                >
                  <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span className="ml-1 hidden sm:inline text-xs md:text-sm">Refresh</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="search" className="text-xs md:text-sm">
                    Search
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-7 md:pl-8 text-xs md:text-sm h-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs md:text-sm">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="text-xs md:text-sm h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="0">Pending</SelectItem>
                      <SelectItem value="1">In Progress</SelectItem>
                      <SelectItem value="2">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs md:text-sm">Priority</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="text-xs md:text-sm h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="0">Low</SelectItem>
                      <SelectItem value="1">Medium</SelectItem>
                      <SelectItem value="2">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs md:text-sm">Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="text-xs md:text-sm h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Scheduling">Scheduling</SelectItem>
                      <SelectItem value="Customer Info">Customer Info</SelectItem>
                      <SelectItem value="Training">Training</SelectItem>
                      <SelectItem value="Safety">Safety</SelectItem>
                      <SelectItem value="Sistema">System</SelectItem>
                      <SelectItem value="Acesso">Access</SelectItem>
                      <SelectItem value="Usabilidade">Usability</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setPriorityFilter("all")
                  setCategoryFilter("all")
                }}
                className="w-full mt-3 text-xs md:text-sm h-9"
                size="sm"
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">Your Feedback ({filteredFeedbacks.length})</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Track the status of all your submitted feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="mt-2 text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : filteredFeedbacks.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-base md:text-lg font-medium">No feedback found</p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    {feedbacks.length === 0
                      ? "You haven't submitted any feedback yet"
                      : "No feedback matches your filters"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredFeedbacks.map((feedback) => (
                    <Card key={feedback.id} className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
                      <CardContent className="p-3 md:p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm md:text-base font-semibold line-clamp-1 flex-1">{feedback.title}</h4>
                            <div className="flex gap-1 flex-shrink-0">{getStatusBadge(feedback.status)}</div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(feedback.date)}
                            </span>
                            <Separator orientation="vertical" className="h-3" />
                            <span className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {feedback.category}
                            </span>
                            <Separator orientation="vertical" className="h-3" />
                            {getPriorityBadge(feedback.priority)}
                          </div>

                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                            {feedback.description}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t">
                            {feedback.comments && feedback.comments.length > 0 && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MessageSquare className="h-3 w-3" />
                                {feedback.comments.length}
                              </span>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedFeedback(feedback)}
                              className="ml-auto text-xs h-8"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedFeedback && (
        <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
          <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] p-0">
            <DialogHeader className="p-4 md:p-6 pb-3">
              <div className="space-y-3">
                <DialogTitle className="text-base md:text-xl pr-8">{selectedFeedback.title}</DialogTitle>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(selectedFeedback.date)}
                  </span>
                  <Separator orientation="vertical" className="h-3" />
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {selectedFeedback.category}
                  </span>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(selectedFeedback.status)}
                  {getPriorityBadge(selectedFeedback.priority)}
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="max-h-[calc(90vh-200px)] px-4 md:px-6">
              <div className="space-y-4 pb-4">
                <div>
                  <h4 className="font-medium mb-2 text-sm">Description</h4>
                  <p className="text-xs md:text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg leading-relaxed">
                    {selectedFeedback.description}
                  </p>
                </div>

                {selectedFeedback.comments && selectedFeedback.comments.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2 text-sm">
                      <MessageSquare className="h-4 w-4" />
                      Comments ({selectedFeedback.comments.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedFeedback.comments.map((comment, index) => (
                        <div key={index} className="bg-muted/50 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-xs flex items-center gap-2">
                              <User className="h-3 w-3" />
                              {comment.author}
                            </span>
                            <span className="text-xs text-muted-foreground">{formatDate(comment.date)}</span>
                          </div>
                          <p className="text-xs md:text-sm">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-3 text-sm">Add Comment</h4>
                  <form onSubmit={handleAddComment} className="space-y-3">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add additional information..."
                      rows={3}
                      className="text-sm resize-none"
                    />
                    <div className="flex gap-2">
                      <Button type="submit" disabled={!newComment.trim() || isLoading} size="sm" className="text-xs">
                        <Send className="h-3 w-3 mr-1" />
                        Add Comment
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedFeedback(null)}
                        size="sm"
                        className="text-xs"
                      >
                        Close
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
