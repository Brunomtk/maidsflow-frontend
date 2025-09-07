"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useCompanyNotifications } from "@/hooks/use-company-notifications"
import type { Notification } from "@/types/notification"

interface CompanyNotificationModalProps {
  isOpen: boolean
  onClose: () => void
  notificationToEdit?: Notification | null
}

export function CompanyNotificationModal({ isOpen, onClose, notificationToEdit }: CompanyNotificationModalProps) {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [type, setType] = useState("1")
  const [isBroadcast, setIsBroadcast] = useState(true)
  const [recipientIds, setRecipientIds] = useState("")
  const [loading, setLoading] = useState(false)

  const { createCompanyNotification, updateCompanyNotification } = useCompanyNotifications()

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (notificationToEdit) {
        setTitle(notificationToEdit.title)
        setMessage(notificationToEdit.message)
        setType(notificationToEdit.type.toString())
        setIsBroadcast(notificationToEdit.recipientId === 0)
        setRecipientIds(notificationToEdit.recipientId === 0 ? "" : notificationToEdit.recipientId.toString())
      } else {
        setTitle("")
        setMessage("")
        setType("1")
        setIsBroadcast(true)
        setRecipientIds("")
      }
    }
  }, [isOpen, notificationToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const recipientIdsArray = isBroadcast
        ? []
        : recipientIds
            .split(",")
            .map((id) => Number.parseInt(id.trim()))
            .filter((id) => !isNaN(id))

      if (notificationToEdit) {
        await updateCompanyNotification(notificationToEdit.id.toString(), {
          title,
          message,
          type,
        })
      } else {
        await createCompanyNotification({
          title,
          message,
          type,
          recipientRole: "2", // Professional
          recipientIds: recipientIdsArray,
          isBroadcast,
          companyId: 1, // This will be overridden by the API using token
        })
      }

      onClose()
    } catch (error) {
      console.error("Error saving notification:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{notificationToEdit ? "Edit Notification" : "Create New Notification"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select notification type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Info</SelectItem>
                <SelectItem value="2">Warning</SelectItem>
                <SelectItem value="3">Error</SelectItem>
                <SelectItem value="4">Success</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="broadcast" checked={isBroadcast} onCheckedChange={setIsBroadcast} />
            <Label htmlFor="broadcast">Broadcast to all professionals</Label>
          </div>

          {!isBroadcast && (
            <div className="space-y-2">
              <Label htmlFor="recipients">Recipient IDs</Label>
              <Input
                id="recipients"
                value={recipientIds}
                onChange={(e) => setRecipientIds(e.target.value)}
                placeholder="Enter recipient IDs separated by commas (e.g., 1, 2, 3)"
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#06b6d4] hover:bg-[#0891b2]">
              {loading ? "Saving..." : notificationToEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
