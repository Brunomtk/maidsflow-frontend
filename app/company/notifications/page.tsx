"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePickerWithRange } from "@/components/admin/date-range-picker"
import { CompanyNotificationModal } from "@/components/company/company-notification-modal"
import { CompanyNotificationDetailsModal } from "@/components/company/company-notification-details-modal"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, Bell, Eye, PenSquare, Search, Trash2, Users } from "lucide-react"
import { useCompanyNotifications } from "@/hooks/use-company-notifications"

export default function CompanyNotificationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("all")

  // Use the company notifications hook
  const {
    notifications,
    loading,
    stats,
    fetchCompanyNotifications,
    deleteCompanyNotification,
    markCompanyNotificationAsRead,
    setFilters,
  } = useCompanyNotifications()

  // Load notifications on component mount
  useEffect(() => {
    fetchCompanyNotifications()
  }, [fetchCompanyNotifications])

  // Update filters when search or priority changes (debounced)
  const updateFilters = useCallback(() => {
    setFilters({
      search: searchQuery || undefined,
      type: selectedPriority === "all" ? undefined : selectedPriority,
      status: activeTab === "all" ? undefined : activeTab,
    })
  }, [searchQuery, selectedPriority, activeTab, setFilters])

  useEffect(() => {
    const timeoutId = setTimeout(updateFilters, 300) // Debounce
    return () => clearTimeout(timeoutId)
  }, [updateFilters])

  const handleOpenDetailsModal = (notification: any) => {
    setSelectedNotification(notification)
    setIsDetailsModalOpen(true)
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markCompanyNotificationAsRead(notificationId)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleDelete = async (notificationId: string) => {
    if (confirm(`Are you sure you want to delete this notification?`)) {
      try {
        await deleteCompanyNotification(notificationId)
      } catch (error) {
        console.error("Error:", error)
      }
    }
  }

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
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 2:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 1:
        return <Bell className="h-4 w-4 text-[#06b6d4]" />
      case 4:
        return <Bell className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button
          onClick={() => {
            setSelectedNotification(null)
            setIsNotificationModalOpen(true)
          }}
          className="bg-[#06b6d4] hover:bg-[#0891b2]"
        >
          <PenSquare className="h-4 w-4 mr-2" />
          Create Notification
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent}</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Read</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.read}</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unread}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search notifications..."
              className="pl-8 bg-white dark:bg-gray-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-gray-800">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="1">Info</SelectItem>
              <SelectItem value="2">Warning</SelectItem>
              <SelectItem value="3">Error</SelectItem>
              <SelectItem value="4">Success</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DatePickerWithRange dateRange={{}} onDateRangeChange={() => {}} className="w-full sm:w-auto" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white dark:bg-gray-800 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-0 p-0">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-0 overflow-auto">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Title</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Read Rate</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Attachments</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                          Loading notifications...
                        </TableCell>
                      </TableRow>
                    ) : notifications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                          No notifications found
                        </TableCell>
                      </TableRow>
                    ) : (
                      notifications.map((notification) => (
                        <TableRow key={notification.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {getPriorityIcon(notification.type)}
                              <span className="truncate max-w-[200px]">{notification.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getPriorityBadge(notification.type)}</TableCell>
                          <TableCell>{getStatusBadge(notification.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />1
                            </div>
                          </TableCell>
                          <TableCell>
                            {notification.status === 1 ? (
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                100%
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{new Date(notification.createdDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">-</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDetailsModal(notification)}
                                className="h-8 px-2 text-xs"
                              >
                                View
                              </Button>
                              {notification.status === 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id.toString())}
                                  className="h-8 px-2 text-xs"
                                >
                                  Mark Read
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-xs text-destructive hover:text-destructive bg-transparent"
                                onClick={() => handleDelete(notification.id.toString())}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CompanyNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notificationToEdit={selectedNotification}
      />

      {selectedNotification && (
        <CompanyNotificationDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          notification={selectedNotification}
        />
      )}
    </div>
  )
}
