import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Search, Star, StarHalf, ThumbsUp } from "lucide-react"
import { CompanyReviewModal } from "@/components/company/company-review-modal"
import { CompanyReviewDetailsModal } from "@/components/company/company-review-details-modal"

export default function CompanyReviewsPage() {
  return (
    <div className="flex flex-col space-y-4 sm:space-y-6 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Reviews</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage and respond to customer reviews for your services.
        </p>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search reviews..." className="h-10 pl-10" />
            </div>
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10 sm:w-auto sm:px-3 bg-transparent">
            <CalendarIcon className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Filter by date</span>
          </Button>
        </div>
        <div className="flex justify-center sm:justify-start">
          <CompanyReviewModal
            trigger={<Button className="bg-cyan-600 hover:bg-cyan-700 w-full sm:w-auto">Add Response</Button>}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 grid grid-cols-5 w-full">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All
          </TabsTrigger>
          <TabsTrigger value="positive" className="text-xs sm:text-sm">
            Positive
          </TabsTrigger>
          <TabsTrigger value="neutral" className="text-xs sm:text-sm">
            Neutral
          </TabsTrigger>
          <TabsTrigger value="negative" className="text-xs sm:text-sm">
            Negative
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs sm:text-sm">
            Pending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <ReviewSummaryCard />
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base">Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positive" className="space-y-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {reviews
                  .filter((review) => review.rating >= 4)
                  .map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="neutral" className="space-y-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {reviews
                  .filter((review) => review.rating === 3)
                  .map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="negative" className="space-y-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {reviews
                  .filter((review) => review.rating < 3)
                  .map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {reviews
                  .filter((review) => !review.response)
                  .map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ReviewSummaryCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm sm:text-lg">Overall Rating</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <div className="text-2xl sm:text-3xl font-bold">4.7</div>
          <div className="flex text-yellow-500">
            <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
            <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
            <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
            <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
            <StarHalf className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
          </div>
        </div>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Based on 128 reviews</p>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-xs sm:text-sm w-2">5</div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div className="h-2 w-[70%] rounded-full bg-yellow-500"></div>
            </div>
            <div className="text-xs sm:text-sm w-8">70%</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs sm:text-sm w-2">4</div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div className="h-2 w-[20%] rounded-full bg-yellow-500"></div>
            </div>
            <div className="text-xs sm:text-sm w-8">20%</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs sm:text-sm w-2">3</div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div className="h-2 w-[5%] rounded-full bg-yellow-500"></div>
            </div>
            <div className="text-xs sm:text-sm w-8">5%</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs sm:text-sm w-2">2</div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div className="h-2 w-[3%] rounded-full bg-yellow-500"></div>
            </div>
            <div className="text-xs sm:text-sm w-8">3%</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs sm:text-sm w-2">1</div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div className="h-2 w-[2%] rounded-full bg-yellow-500"></div>
            </div>
            <div className="text-xs sm:text-sm w-8">2%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ReviewCard({ review }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="border-b p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-muted flex-shrink-0">
                <img
                  src={review.customerAvatar || "/placeholder.svg"}
                  alt={review.customerName}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm sm:text-base truncate">{review.customerName}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{review.date}</div>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-yellow-500 self-start sm:self-center">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 sm:h-4 sm:w-4 ${i < review.rating ? "fill-current" : "text-muted"}`}
                  />
                ))}
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs sm:text-sm">{review.comment}</p>
          </div>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 px-2 w-full sm:w-auto justify-start">
              <ThumbsUp className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Helpful ({review.helpfulCount})</span>
            </Button>
            <CompanyReviewDetailsModal
              review={review}
              trigger={
                <Button variant="ghost" size="sm" className="h-8 px-2 w-full sm:w-auto">
                  <span className="text-xs sm:text-sm">View Details</span>
                </Button>
              }
            />
          </div>
        </div>

        {review.response && (
          <div className="bg-muted/30 p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-cyan-600 flex-shrink-0">
                <img src="/logo.png" alt="Company Logo" className="h-full w-full rounded-full object-cover p-1" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium">Your Response</div>
                <div className="text-xs text-muted-foreground">{review.responseDate}</div>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs sm:text-sm">{review.response}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Sample data
const reviews = [
  {
    id: 1,
    customerName: "Sarah Johnson",
    customerAvatar: "/placeholder.svg?height=40&width=40",
    date: "May 15, 2023",
    rating: 5,
    comment:
      "Excellent service! The team was professional, thorough, and left my home spotless. Will definitely use again.",
    helpfulCount: 12,
    response:
      "Thank you for your kind words, Sarah! We're thrilled to hear you were satisfied with our service. Looking forward to serving you again soon!",
    responseDate: "May 16, 2023",
    service: "Deep Cleaning",
    professional: "Maria Rodriguez",
    location: "123 Main St, Apt 4B",
  },
  {
    id: 2,
    customerName: "Michael Chen",
    customerAvatar: "/placeholder.svg?height=40&width=40",
    date: "May 10, 2023",
    rating: 4,
    comment:
      "Good service overall. They did miss a few spots under the furniture, but when I pointed it out, they immediately fixed it.",
    helpfulCount: 8,
    response:
      "Thank you for your feedback, Michael. We appreciate you bringing those missed spots to our attention. We're always looking to improve, and your input helps us do that!",
    responseDate: "May 11, 2023",
    service: "Regular Cleaning",
    professional: "John Smith",
    location: "456 Oak Ave",
  },
  {
    id: 3,
    customerName: "Emily Wilson",
    customerAvatar: "/placeholder.svg?height=40&width=40",
    date: "May 5, 2023",
    rating: 2,
    comment:
      "Disappointed with the service. The cleaner arrived late and rushed through the job. Several areas were not cleaned properly.",
    helpfulCount: 15,
    response: null,
    service: "Regular Cleaning",
    professional: "David Brown",
    location: "789 Pine St",
  },
  {
    id: 4,
    customerName: "Robert Taylor",
    customerAvatar: "/placeholder.svg?height=40&width=40",
    date: "May 3, 2023",
    rating: 5,
    comment: "Outstanding service! The attention to detail was impressive. My kitchen has never looked so clean.",
    helpfulCount: 10,
    response:
      "We're delighted to hear about your positive experience, Robert! Our team takes great pride in their attention to detail. Thank you for choosing our services!",
    responseDate: "May 4, 2023",
    service: "Kitchen Deep Clean",
    professional: "Maria Rodriguez",
    location: "101 Maple Dr",
  },
  {
    id: 5,
    customerName: "Jessica Martinez",
    customerAvatar: "/placeholder.svg?height=40&width=40",
    date: "April 28, 2023",
    rating: 3,
    comment: "Average service. Did the basics well but nothing exceptional for the premium price.",
    helpfulCount: 7,
    response: null,
    service: "Premium Cleaning",
    professional: "John Smith",
    location: "202 Elm St",
  },
]
