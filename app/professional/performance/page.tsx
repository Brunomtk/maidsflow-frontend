"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Clock, CheckCircle, MessageSquare } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import {
  getProfessionalReviews,
  respondToReview,
  getCurrentPerformanceMetrics,
} from "@/lib/api/professional-performance"
import { useToast } from "@/hooks/use-toast"

interface Review {
  id: number
  customerId: string
  customerName: string
  professionalId: string
  professionalName: string
  teamId: string
  teamName: string
  companyId: string
  companyName: string
  appointmentId: string
  rating: number
  comment: string
  date: string
  serviceType: string
  status: number
  response?: string
  responseDate?: string
  createdDate: string
  updatedDate: string
}

interface PerformanceMetrics {
  totalReviews: number
  averageRating: number
  weeklyReviews: number
  monthlyReviews: number
  recentReviews: Review[]
}

export default function ProfessionalPerformance() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [responseText, setResponseText] = useState("")
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [reviewsData, metricsData] = await Promise.all([
        getProfessionalReviews({ pageSize: 50 }),
        getCurrentPerformanceMetrics(""),
      ])

      setReviews(reviewsData.data)
      setMetrics(metricsData)
    } catch (error) {
      console.error("Error loading performance data:", error)
      toast({
        title: "Error",
        description: "Error loading performance data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRespondToReview = async () => {
    if (!selectedReview || !responseText.trim()) return

    try {
      await respondToReview(selectedReview.id, responseText)
      toast({
        title: "Success",
        description: "Response sent successfully!",
      })
      setIsResponseDialogOpen(false)
      setResponseText("")
      setSelectedReview(null)
      loadData() // Reload data
    } catch (error) {
      console.error("Error responding to review:", error)
      toast({
        title: "Error",
        description: "Error sending response",
        variant: "destructive",
      })
    }
  }

  const openResponseDialog = (review: Review) => {
    setSelectedReview(review)
    setResponseText(review.response || "")
    setIsResponseDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <div className="space-y-1 md:space-y-2">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">My Performance</h2>
        <p className="text-sm md:text-base text-muted-foreground">Track your metrics and reviews</p>
      </div>

      <div className="grid gap-3 grid-cols-1 md:grid-cols-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Reviews</CardTitle>
            <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{metrics?.totalReviews || 0}</div>
            <p className="text-xs text-muted-foreground">All reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{metrics?.averageRating || 0}</div>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 md:h-4 md:w-4 ${star <= (metrics?.averageRating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">This Week</CardTitle>
            <Clock className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{metrics?.weeklyReviews || 0}</div>
            <p className="text-xs text-muted-foreground">Reviews received</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reviews" className="space-y-3 md:space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reviews" className="text-sm">
            Reviews
          </TabsTrigger>
          <TabsTrigger value="summary" className="text-sm">
            Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-3 md:space-y-4">
          <Card>
            <CardHeader className="px-4 md:px-6 py-3 md:py-4">
              <CardTitle className="text-base md:text-lg">Received Reviews</CardTitle>
              <CardDescription className="text-xs md:text-sm">Client feedback about your services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4 px-4 md:px-6">
              {reviews.length === 0 ? (
                <div className="text-center py-6 md:py-8">
                  <p className="text-muted-foreground text-sm">No reviews found</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="p-3 md:p-4 border rounded-lg">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-2">
                      <div className="space-y-1">
                        <h4 className="text-sm md:text-base font-semibold">{review.serviceType}</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Client: {review.customerName}</p>
                      </div>
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 md:h-4 md:w-4 ${star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openResponseDialog(review)}
                          className="w-full md:w-auto text-xs"
                        >
                          <MessageSquare className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          {review.response ? "Edit Response" : "Respond"}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground mb-2">"{review.comment}"</p>
                    {review.response && (
                      <div className="mt-3 p-2 md:p-3 bg-muted rounded-md">
                        <p className="text-xs md:text-sm font-medium">Your response:</p>
                        <p className="text-xs md:text-sm">{review.response}</p>
                        {review.responseDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Responded on: {new Date(review.responseDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-muted-foreground">
                      {new Date(review.date).toLocaleDateString()} - {new Date(review.date).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-3 md:space-y-4">
          <Card>
            <CardHeader className="px-4 md:px-6 py-3 md:py-4">
              <CardTitle className="text-base md:text-lg">Performance Summary</CardTitle>
              <CardDescription className="text-xs md:text-sm">Overview of your reviews</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 md:px-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm font-medium">Client Satisfaction</span>
                  <span className="text-xs md:text-sm">{Math.round(((metrics?.averageRating || 0) / 5) * 100)}%</span>
                </div>
                <Progress value={((metrics?.averageRating || 0) / 5) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm font-medium">Reviews This Month</span>
                  <span className="text-xs md:text-sm">{metrics?.monthlyReviews || 0}</span>
                </div>
                <Progress value={Math.min(((metrics?.monthlyReviews || 0) / 20) * 100, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground">Goal: 20 reviews/month</p>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-xs md:text-sm font-medium mb-2">Statistics</h4>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="text-center p-2 md:p-3 bg-muted rounded-md">
                    <div className="text-lg md:text-2xl font-bold">{metrics?.totalReviews || 0}</div>
                    <div className="text-xs text-muted-foreground">Total Reviews</div>
                  </div>
                  <div className="text-center p-2 md:p-3 bg-muted rounded-md">
                    <div className="text-lg md:text-2xl font-bold">{metrics?.averageRating || 0}</div>
                    <div className="text-xs text-muted-foreground">Average Rating</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="mx-4 max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">Respond to Review</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Respond to {selectedReview?.customerName}'s review
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-2 md:p-3 bg-muted rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 md:h-4 md:w-4 ${star <= (selectedReview?.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-xs md:text-sm font-medium">{selectedReview?.rating}/5</span>
              </div>
              <p className="text-xs md:text-sm">"{selectedReview?.comment}"</p>
            </div>
            <Textarea
              placeholder="Type your response..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={4}
              className="text-sm resize-none"
            />
          </div>
          <DialogFooter className="flex-col gap-2 md:flex-row md:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsResponseDialogOpen(false)}
              className="w-full md:w-auto text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRespondToReview}
              disabled={!responseText.trim()}
              className="w-full md:w-auto text-sm"
            >
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
