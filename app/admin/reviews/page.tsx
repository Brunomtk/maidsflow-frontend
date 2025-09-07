"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Search, Plus, Eye, Edit, Trash2, MessageSquare } from "lucide-react"
import { ReviewModal } from "@/components/admin/review-modal"
import { ReviewDetailsModal } from "@/components/admin/review-details-modal"
import { useReviews } from "@/contexts/reviews-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

export default function ReviewsPage() {
  const {
    reviews,
    filters,
    pagination,
    isLoading,
    error,
    selectedReview,
    setFilters,
    setCurrentPage,
    createReview,
    updateReview,
    deleteReview,
    addResponse,
    setSelectedReview,
    clearError,
  } = useReviews()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null)

  const handleCreateReview = async (data: any) => {
    try {
      await createReview(data)
      setIsCreateModalOpen(false)
      toast.success("Review created successfully")
    } catch (error) {
      toast.error("Failed to create review")
    }
  }

  const handleUpdateReview = async (data: any) => {
    if (selectedReview) {
      try {
        await updateReview(selectedReview.id, data)
        setIsEditModalOpen(false)
        setSelectedReview(null)
        toast.success("Review updated successfully")
      } catch (error) {
        toast.error("Failed to update review")
      }
    }
  }

  const handleDeleteReview = async (id: number) => {
    try {
      await deleteReview(id)
      setReviewToDelete(null)
      toast.success("Review deleted successfully")
    } catch (error) {
      toast.error("Failed to delete review")
    }
  }

  const handleAddResponse = async (id: number, response: string) => {
    try {
      await addResponse(id, response)
      toast.success("Response added successfully")
    } catch (error) {
      toast.error("Failed to add response")
    }
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="secondary">Pending</Badge>
      case 1:
        return <Badge variant="default">Published</Badge>
      case 2:
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="text-muted-foreground">Manage customer reviews and responses</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Review
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter reviews by status, rating, or search query</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={filters.searchQuery || ""}
                onChange={(e) => setFilters({ searchQuery: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select value={filters.status || "all"} onValueChange={(value) => setFilters({ status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="0">Pending</SelectItem>
                <SelectItem value="1">Published</SelectItem>
                <SelectItem value="2">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.rating || "all"} onValueChange={(value) => setFilters({ rating: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setFilters({ status: "all", rating: "all", searchQuery: "" })}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading reviews...</p>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={clearError} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">No reviews found</p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Review
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-muted-foreground">({review.rating}/5)</span>
                      </div>
                      {getStatusBadge(review.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="font-medium">Customer:</span>
                        <p className="text-muted-foreground">{review.customerName}</p>
                      </div>
                      <div>
                        <span className="font-medium">Professional:</span>
                        <p className="text-muted-foreground">{review.professionalName}</p>
                      </div>
                      <div>
                        <span className="font-medium">Company:</span>
                        <p className="text-muted-foreground">{review.companyName}</p>
                      </div>
                      <div>
                        <span className="font-medium">Service:</span>
                        <p className="text-muted-foreground">{review.serviceType}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">Comment:</p>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>

                    {review.response && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1">Company Response:</p>
                        <p className="text-sm text-muted-foreground">{review.response}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReview(review)
                        setIsDetailsModalOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReview(review)
                        setIsEditModalOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!review.response && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const response = prompt("Enter response:")
                          if (response) {
                            handleAddResponse(review.id, response)
                          }
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Review</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this review? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteReview(review.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{" "}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{" "}
            {pagination.totalItems} reviews
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ReviewModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateReview}
        mode="create"
      />

      <ReviewModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedReview(null)
        }}
        onSubmit={handleUpdateReview}
        review={selectedReview}
        mode="edit"
      />

      <ReviewDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedReview(null)
        }}
        review={selectedReview}
      />
    </div>
  )
}
