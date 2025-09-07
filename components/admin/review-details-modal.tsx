"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Star, User, Building, Calendar, MessageSquare, Briefcase } from "lucide-react"

interface ReviewDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  review: any
}

export function ReviewDetailsModal({ isOpen, onClose, review }: ReviewDetailsModalProps) {
  if (!review) return null

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-5 w-5 ${index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating}/5</span>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a2234] border-[#2a3349] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-[#06b6d4]" />
            Review Details
          </DialogTitle>
          <DialogDescription className="text-gray-400">Complete information about review {review.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">{review.customer}</h3>
            <Badge
              variant="outline"
              className={
                review.status === "published"
                  ? "border-green-500 text-green-500"
                  : review.status === "pending"
                    ? "border-yellow-500 text-yellow-500"
                    : "border-red-500 text-red-500"
              }
            >
              {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Professional</span>
                </div>
                <p className="font-medium">{review.professional}</p>
              </div>

              <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Building className="h-4 w-4" />
                  <span className="text-sm">Company</span>
                </div>
                <p className="font-medium">{review.company}</p>
              </div>

              <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Review Date</span>
                </div>
                <p className="font-medium">{formatDate(review.date)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Star className="h-4 w-4" />
                  <span className="text-sm">Rating</span>
                </div>
                <div className="mt-1">{renderStars(review.rating)}</div>
              </div>

              <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-sm">Service</span>
                </div>
                <p className="font-medium">{review.service}</p>
              </div>

              <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <span className="text-sm">Review ID</span>
                </div>
                <p className="font-medium">{review.id}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">Customer Review</span>
            </div>
            <p className="text-sm whitespace-pre-line">{review.comment}</p>
          </div>

          {review.response && (
            <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">Company Response</span>
              </div>
              <p className="text-sm whitespace-pre-line">{review.response}</p>
              {review.responseDate && (
                <p className="text-xs text-gray-400 mt-2">Responded on: {formatDate(review.responseDate)}</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
