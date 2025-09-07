"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Bell, Calendar, User } from "lucide-react"
import type { Notification } from "@/types/notification"

interface CompanyNotificationDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  notification: Notification
}

export function CompanyNotificationDetailsModal({
  isOpen,
  onClose,
  notification,
}: CompanyNotificationDetailsModalProps) {
  const getPriorityBadge = (type: number) => {
    switch (type) {
      case 1:
        return <Badge className="bg-[#06b6d4]">Info</Badge>
      case 2:
        return <Badge className="bg-yellow-500">Warning</Badge>
      case 3:
        return <Badge className="bg-red-500">Error</Badge>
      case 4:
        return <Badge className="bg-green-500">Success</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge className="bg-green-500">Read</Badge>
      case 0:
        return <Badge variant="outline">Unread</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPriorityIcon = (type: number) => {
    switch (type) {
      case 3:
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 2:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 1:
        return <Bell className="h-5 w-5 text-[#06b6d4]" />
      case 4:
        return <Bell className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getPriorityIcon(notification.type)}
            {notification.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {getPriorityBadge(notification.type)}
            {getStatusBadge(notification.status)}
          </div>

          <Separator />

          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Message</h4>
              <p className="text-sm">{notification.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Created
                </h4>
                <p className="text-sm">{formatDate(notification.createdDate)}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Recipient
                </h4>
                <p className="text-sm">
                  {notification.recipientId === 0 ? "All Professionals" : `Professional #${notification.recipientId}`}
                </p>
              </div>
            </div>

            {notification.sentAt && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Sent At</h4>
                <p className="text-sm">{formatDate(notification.sentAt)}</p>
              </div>
            )}

            {notification.readAt && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Read At</h4>
                <p className="text-sm">{formatDate(notification.readAt)}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Company ID</h4>
              <p className="text-sm">{notification.companyId}</p>
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Last Updated</h4>
              <p className="text-sm">{formatDate(notification.updatedDate)}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
