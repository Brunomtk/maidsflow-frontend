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
} from "lucide-react"
import { useState, useEffect } from "react"
import { useProfessionalFeedback } from "@/hooks/use-professional-feedback"
import { useToast } from "@/hooks/use-toast"
import type { InternalFeedback } from "@/types/internal-feedback"

export default function ProfessionalFeedback() {
  const { feedbacks, isLoading, createFeedback, fetchFeedbacks, addComment } = useProfessionalFeedback()
  const { toast } = useToast()

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
        status: 0, // Pending
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
          <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-50">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case 1:
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">
            <AlertCircle className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        )
      case 2:
        return (
          <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
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
          <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
            <Flag className="w-3 h-3 mr-1" />
            Low
          </Badge>
        )
      case 1:
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-50">
            <Flag className="w-3 h-3 mr-1" />
            Medium
          </Badge>
        )
      case 2:
        return (
          <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50">
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Internal Feedback</h2>
        <p className="text-muted-foreground">
          Submit feedback about issues, suggestions, or improvements to help us serve you better.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressCount}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resolvedCount}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="submit" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submit" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Submit Feedback
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            My Feedback History
          </TabsTrigger>
        </TabsList>

        {/* Submit New Feedback Tab */}
        <TabsContent value="submit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Submit New Feedback
              </CardTitle>
              <CardDescription>
                Help us improve by sharing your feedback about any issues, suggestions, or improvements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitFeedback} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      <span className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Title *
                      </span>
                    </Label>
                    <Input
                      id="title"
                      value={newFeedback.title}
                      onChange={(e) => setNewFeedback({ ...newFeedback, title: e.target.value })}
                      placeholder="Brief description of your feedback"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">
                      <span className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Category *
                      </span>
                    </Label>
                    <Select
                      value={newFeedback.category}
                      onValueChange={(value) => setNewFeedback({ ...newFeedback, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Equipment">Equipment Issues</SelectItem>
                        <SelectItem value="Scheduling">Scheduling Problems</SelectItem>
                        <SelectItem value="Customer Info">Customer Information</SelectItem>
                        <SelectItem value="Training">Training Needs</SelectItem>
                        <SelectItem value="Safety">Safety Concerns</SelectItem>
                        <SelectItem value="Sistema">System Issues</SelectItem>
                        <SelectItem value="Acesso">Access Problems</SelectItem>
                        <SelectItem value="Usabilidade">Usability Improvements</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">
                    <span className="flex items-center gap-2">
                      <Flag className="h-4 w-4" />
                      Priority Level
                    </span>
                  </Label>
                  <Select
                    value={newFeedback.priority}
                    onValueChange={(value) => setNewFeedback({ ...newFeedback, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Low - Minor issue or suggestion</SelectItem>
                      <SelectItem value="1">Medium - Affects my work efficiency</SelectItem>
                      <SelectItem value="2">High - Urgent issue that blocks my work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Description *
                    </span>
                  </Label>
                  <Textarea
                    id="description"
                    value={newFeedback.description}
                    onChange={(e) => setNewFeedback({ ...newFeedback, description: e.target.value })}
                    placeholder="Please provide detailed information about your feedback. Include steps to reproduce if it's an issue, or specific suggestions for improvements."
                    rows={6}
                    required
                  />
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your feedback will be reviewed by our team and you'll receive updates on its progress. Please
                    provide as much detail as possible to help us understand and address your feedback effectively.
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
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Your Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search your feedback..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="0">Pending</SelectItem>
                      <SelectItem value="1">In Progress</SelectItem>
                      <SelectItem value="2">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="0">Low</SelectItem>
                      <SelectItem value="1">Medium</SelectItem>
                      <SelectItem value="2">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
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

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setStatusFilter("all")
                      setPriorityFilter("all")
                      setCategoryFilter("all")
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Feedback History ({filteredFeedbacks.length})</CardTitle>
              <CardDescription>Track the status and progress of all your submitted feedback</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading your feedback...</span>
                </div>
              ) : filteredFeedbacks.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No feedback found</p>
                  <p className="text-muted-foreground">
                    {feedbacks.length === 0
                      ? "You haven't submitted any feedback yet."
                      : "No feedback matches your current filters."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFeedbacks.map((feedback) => (
                    <div key={feedback.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold mb-2">{feedback.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(feedback.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Tag className="h-4 w-4" />
                              {feedback.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(feedback.status)}
                          {getPriorityBadge(feedback.priority)}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{feedback.description}</p>

                      <Separator className="my-4" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {feedback.comments && feedback.comments.length > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {feedback.comments.length} comment{feedback.comments.length !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFeedback(feedback)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </div>

                      {/* Comments Section */}
                      {feedback.comments && feedback.comments.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <h5 className="font-medium mb-3 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Comments & Updates
                          </h5>
                          <div className="space-y-3">
                            {feedback.comments.map((comment, index) => (
                              <div key={index} className="bg-muted/50 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium text-sm flex items-center gap-2">
                                    <User className="h-3 w-3" />
                                    {comment.author}
                                  </span>
                                  <span className="text-xs text-muted-foreground">{formatDate(comment.date)}</span>
                                </div>
                                <p className="text-sm">{comment.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feedback Details Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{selectedFeedback.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(selectedFeedback.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      {selectedFeedback.category}
                    </span>
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFeedback(null)}>
                  ×
                </Button>
              </div>
              <div className="flex gap-2 mt-4">
                {getStatusBadge(selectedFeedback.status)}
                {getPriorityBadge(selectedFeedback.priority)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {selectedFeedback.description}
                </p>
              </div>

              {selectedFeedback.comments && selectedFeedback.comments.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Comments & Updates ({selectedFeedback.comments.length})
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedFeedback.comments.map((comment, index) => (
                      <div key={index} className="bg-muted/50 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm flex items-center gap-2">
                            <User className="h-3 w-3" />
                            {comment.author}
                          </span>
                          <span className="text-xs text-muted-foreground">{formatDate(comment.date)}</span>
                        </div>
                        <p className="text-sm">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Comment Form */}
              <div>
                <h4 className="font-medium mb-3">Add a Comment</h4>
                <form onSubmit={handleAddComment} className="space-y-3">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add additional information or ask for updates..."
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={!newComment.trim() || isLoading}>
                      <Send className="h-4 w-4 mr-2" />
                      Add Comment
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setSelectedFeedback(null)}>
                      Close
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
