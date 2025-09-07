"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, MessageSquare, Star, User } from "lucide-react"
import { CompanyReviewModal } from "./company-review-modal"

export function CompanyReviewDetailsModal({ trigger, review }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>Detailed information about this review</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="service">Service</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-10 w-10 rounded-full bg-muted">
                      <img
                        src={review.customerAvatar || "/placeholder.svg"}
                        alt={review.customerName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{review.customerName}</div>
                      <div className="text-sm text-muted-foreground">{review.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge variant={getRatingVariant(review.rating)} className="mr-2">
                      {review.rating}/5
                    </Badge>
                    <div className="flex text-yellow-500">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-muted"}`} />
                        ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium">Review</h4>
                  <p className="mt-1 text-sm">{review.comment}</p>
                </div>

                {review.response ? (
                  <div className="mt-4 rounded-md bg-muted/30 p-3">
                    <h4 className="text-sm font-medium">Your Response</h4>
                    <p className="mt-1 text-sm">{review.response}</p>
                    <div className="mt-2 text-xs text-muted-foreground">Responded on {review.responseDate}</div>
                    <div className="mt-3">
                      <CompanyReviewModal
                        reviewToRespond={review}
                        trigger={
                          <Button variant="outline" size="sm">
                            Edit Response
                          </Button>
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <CompanyReviewModal
                      reviewToRespond={review}
                      trigger={<Button className="bg-cyan-600 hover:bg-cyan-700">Respond to Review</Button>}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 text-sm font-medium">Review Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Helpful votes:</span>
                      <span className="font-medium">{review.helpfulCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Views:</span>
                      <span className="font-medium">124</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant="outline">{review.response ? "Responded" : "Pending"}</Badge>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 text-sm font-medium">Review Timeline</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Submitted: {review.date}</span>
                    </div>
                    {review.response && (
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Responded: {review.responseDate}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Last updated: {review.responseDate || review.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="customer" className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-16 w-16 rounded-full bg-muted">
                    <img
                      src={review.customerAvatar || "/placeholder.svg"}
                      alt={review.customerName}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{review.customerName}</h3>
                    <p className="text-sm text-muted-foreground">Customer since January 2023</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Contact Information</h4>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">customer@example.com</p>
                      <p className="text-sm">(555) 123-4567</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium">Customer History</h4>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">Total services: 8</p>
                      <p className="text-sm">Average rating: 4.2/5</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium">Recent Services</h4>
                  <div className="mt-2 space-y-2">
                    <div className="rounded-md bg-muted/30 p-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{review.service}</span>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      <div className="mt-1 flex items-center space-x-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{review.professional}</span>
                      </div>
                    </div>
                    <div className="rounded-md bg-muted/30 p-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Regular Cleaning</span>
                        <span className="text-sm text-muted-foreground">April 15, 2023</span>
                      </div>
                      <div className="mt-1 flex items-center space-x-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{review.professional}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="service" className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-medium">{review.service}</h3>
                <div className="mt-2 flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{review.date}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Service Details</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Professional:</span>
                        <span className="text-sm">{review.professional}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Duration:</span>
                        <span className="text-sm">2 hours</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Completed
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium">Location</h4>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{review.location}</span>
                      </div>
                    </div>
                    <div className="mt-2 h-20 rounded-md bg-muted">
                      <div className="flex h-full items-center justify-center">
                        <span className="text-xs text-muted-foreground">Map preview</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium">Service Notes</h4>
                  <p className="mt-2 text-sm">
                    Standard {review.service.toLowerCase()} service was performed according to our checklist. All rooms
                    were cleaned and sanitized as requested by the customer.
                  </p>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium">Professional Feedback</h4>
                  <div className="mt-2 rounded-md bg-muted/30 p-3">
                    <p className="text-sm italic">
                      "The customer was very friendly and the space was well-prepared for our service. I completed all
                      requested tasks and the customer seemed satisfied at checkout."
                    </p>
                    <div className="mt-1 text-right text-xs text-muted-foreground">- {review.professional}</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function getRatingVariant(rating) {
  if (rating >= 4) return "success"
  if (rating === 3) return "warning"
  return "destructive"
}
