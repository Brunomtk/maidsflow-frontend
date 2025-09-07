"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CheckCheck, Edit, Trash2 } from "lucide-react"
import type { Notification } from "@/types/notification"
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

interface NotificationDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  notification: Notification
  onMarkAsRead: (id: number) => Promise<void>
  onEdit: (notification: Notification) => void
  onDelete: (id: number) => Promise<void>
}

export function NotificationDetailsModal({
  isOpen,
  onClose,
  notification,
  onMarkAsRead,
  onEdit,
  onDelete,
}: NotificationDetailsModalProps) {
  const getNotificationTypeLabel = (type: number): string => {
    switch (type) {
      case 1:
        return "System"
      case 2:
        return "Appointment"
      case 3:
        return "Message"
      case 4:
        return "Alert"
      default:
        return "Unknown"
    }
  }

  const getRecipientRoleLabel = (role: number): string => {
    switch (role) {
      case 1:
        return "Admin"
      case 2:
        return "Company"
      case 3:
        return "Professional"
      default:
        return "Unknown"
    }
  }

  const getStatusLabel = (status: number): string => {
    switch (status) {
      case 0:
        return "Unread"
      case 1:
        return "Read"
      default:
        return "Unknown"
    }
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="destructive">Unread</Badge>
      case 1:
        return <Badge className="bg-green-500">Read</Badge>
      default:
        return <Badge variant="outline">{getStatusLabel(status)}</Badge>
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "PPpp")
    } catch (error) {
      return "Invalid date"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Notification Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">{notification.title}</h3>
            {getStatusBadge(notification.status)}
          </div>

          <div className="bg-muted p-4 rounded-md">
            <p className="whitespace-pre-wrap">{notification.message}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p>{getNotificationTypeLabel(notification.type)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recipient Role</p>
              <p>{getRecipientRoleLabel(notification.recipientRole)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recipient ID</p>
              <p>{notification.recipientId}</p>
            </div>
            {notification.companyId && (
              <div>
                <p className="text-sm text-muted-foreground">Company ID</p>
                <p>{notification.companyId}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Sent At</p>
              <p>{formatDate(notification.sentAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Read At</p>
              <p>{formatDate(notification.readAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p>{formatDate(notification.createdDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Updated</p>
              <p>{formatDate(notification.updatedDate)}</p>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex gap-2">
            {notification.status === 0 && (
              <Button onClick={() => onMarkAsRead(notification.id)}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark as Read
              </Button>
            )}
            <Button variant="outline" onClick={() => onEdit(notification)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the notification.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(notification.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
