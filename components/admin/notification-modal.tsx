"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { Notification, NotificationFormData, NotificationUpdateData } from "@/types/notification"
import { fetchApi } from "@/lib/api/utils"

interface Company {
  id: number
  name: string
  cnpj: string
  responsible: string
  email: string
  phone: string
  planId: number
  status: number
}

interface User {
  id: number
  name: string
  email: string
  role: number
}

interface CompaniesResponse {
  result: Company[]
  currentPage: number
  pageCount: number
  pageSize: number
  totalItems: number
}

interface UsersResponse {
  data: User[]
  currentPage: number
  pageCount: number
  pageSize: number
  totalItems: number
}

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  notificationToEdit?: Notification | null
  onSubmit: (data: NotificationFormData | NotificationUpdateData, id?: number) => Promise<void>
}

export function NotificationModal({ isOpen, onClose, notificationToEdit, onSubmit }: NotificationModalProps) {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [type, setType] = useState("1")
  const [recipientRole, setRecipientRole] = useState("2")
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([])
  const [isBroadcast, setIsBroadcast] = useState(false)
  const [companyId, setCompanyId] = useState<number | undefined>(undefined)
  const [status, setStatus] = useState("0")
  const [loading, setLoading] = useState(false)

  const [companies, setCompanies] = useState<Company[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loadingData, setLoadingData] = useState(false)

  const loadDropdownData = async () => {
    setLoadingData(true)
    try {
      // Load companies
      const companiesRes = await fetchApi<CompaniesResponse>("/Companies/paged?PageSize=100")
      setCompanies(Array.isArray(companiesRes?.result) ? companiesRes.result : [])

      // Load users for recipients
      const usersRes = await fetchApi<UsersResponse>("/Users/paged?PageSize=100")
      setUsers(Array.isArray(usersRes?.data) ? usersRes.data : [])
    } catch (error) {
      console.error("Failed to load dropdown data:", error)
      setCompanies([])
      setUsers([])
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadDropdownData()
    }
  }, [isOpen])

  useEffect(() => {
    if (notificationToEdit) {
      setTitle(notificationToEdit.title || "")
      setMessage(notificationToEdit.message || "")
      setType(notificationToEdit.type?.toString() || "1")
      setRecipientRole(notificationToEdit.recipientRole?.toString() || "2")
      setSelectedRecipients([notificationToEdit.recipientId])
      setIsBroadcast(false)
      setCompanyId(notificationToEdit.companyId)
      setStatus(notificationToEdit.status?.toString() || "0")
    } else {
      // Reset form for new notification
      setTitle("")
      setMessage("")
      setType("1")
      setRecipientRole("2")
      setSelectedRecipients([])
      setIsBroadcast(false)
      setCompanyId(undefined)
      setStatus("0")
    }
  }, [notificationToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (notificationToEdit) {
        // Update existing notification
        const updateData: NotificationUpdateData = {
          title,
          message,
          type,
          status,
          readAt: status === "1" ? new Date().toISOString() : undefined,
        }
        await onSubmit(updateData, notificationToEdit.id)
      } else {
        // Create new notification
        const notificationData: NotificationFormData = {
          title,
          message,
          type,
          recipientRole,
          recipientIds: isBroadcast ? undefined : selectedRecipients,
          isBroadcast,
          companyId,
        }
        await onSubmit(notificationData)
      }

      onClose()
    } catch (error) {
      console.error("Failed to submit notification:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecipients = users.filter((user) => user.role.toString() === recipientRole)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{notificationToEdit ? "Edit Notification" : "New Notification"}</DialogTitle>
          <DialogDescription>
            {notificationToEdit
              ? "Update the notification information below."
              : "Fill in the information to create a new notification."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="message" className="text-right pt-2">
                Message
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="col-span-3"
                rows={5}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <div className="col-span-3">
                <Select value={type} onValueChange={setType} required>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">System</SelectItem>
                    <SelectItem value="2">Appointment</SelectItem>
                    <SelectItem value="3">Message</SelectItem>
                    <SelectItem value="4">Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {notificationToEdit && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <div className="col-span-3">
                  <Select value={status} onValueChange={setStatus} required>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Unread</SelectItem>
                      <SelectItem value="1">Read</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {!notificationToEdit && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="recipient-role" className="text-right">
                    Recipient Role
                  </Label>
                  <div className="col-span-3">
                    <Select value={recipientRole} onValueChange={setRecipientRole} required>
                      <SelectTrigger id="recipient-role">
                        <SelectValue placeholder="Select recipient role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Admin</SelectItem>
                        <SelectItem value="2">Company</SelectItem>
                        <SelectItem value="3">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="is-broadcast" className="text-right">
                    Broadcast
                  </Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Switch id="is-broadcast" checked={isBroadcast} onCheckedChange={setIsBroadcast} />
                    <Label htmlFor="is-broadcast">
                      {isBroadcast ? "Send to all users of selected role" : "Send to specific recipients"}
                    </Label>
                  </div>
                </div>

                {!isBroadcast && (
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Recipients</Label>
                    <div className="col-span-3 space-y-2 border rounded-md p-4 max-h-40 overflow-y-auto">
                      {filteredRecipients.map((recipient) => (
                        <div key={recipient.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`recipient-${recipient.id}`}
                            checked={selectedRecipients.includes(recipient.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedRecipients([...selectedRecipients, recipient.id])
                              } else {
                                setSelectedRecipients(selectedRecipients.filter((id) => id !== recipient.id))
                              }
                            }}
                          />
                          <Label htmlFor={`recipient-${recipient.id}`}>{recipient.name}</Label>
                        </div>
                      ))}
                      {filteredRecipients.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          {loadingData ? "Loading recipients..." : "No recipients available for selected role"}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="company-id" className="text-right">
                    Company * ({companies.length} loaded)
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={companyId?.toString() || "0"}
                      onValueChange={(value) => setCompanyId(value ? Number.parseInt(value) : undefined)}
                    >
                      <SelectTrigger id="company-id">
                        <SelectValue placeholder={loadingData ? "Loading companies..." : "Select company (optional)"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No Company</SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || loadingData}>
              {loading ? "Saving..." : notificationToEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
