"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePickerWithRange } from "@/components/admin/date-range-picker"
import { NotificationModal } from "@/components/admin/notification-modal"
import { NotificationDetailsModal } from "@/components/admin/notification-details-modal"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bell, BellRing, CheckCheck, Clock, Eye, Search, Send, Users, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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

export default function NotificationsPage() {
  const {
    notifications,
    selectedNotification,
    loading,
    error,
    filters,
    fetchNotifications,
    fetchNotificationById,
    addNotification,
    updateNotificationById,
    removeNotification,
    markAsRead,
    updateFilters,
    resetFilters,
    setSelectedNotification,
    getNotificationTypeLabel,
    getRecipientRoleLabel,
    getStatusLabel,
  } = useNotifications()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedRole, setSelectedRole] = useState("all")
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [notificationToEdit, setNotificationToEdit] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("all")

  // Filter notifications based on search query, type, role, and tab
  const filteredNotifications = notifications.filter((notification) => {
    // Safely check if properties exist before calling methods on them
    const title = notification?.title || ""
    const message = notification?.message || ""

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.toLowerCase().includes(searchQuery.toLowerCase())

    const notificationType = notification?.type?.toString() || ""
    const matchesType = selectedType === "all" || notificationType === selectedType

    const recipientRole = notification?.recipientRole?.toString() || ""
    const matchesRole = selectedRole === "all" || recipientRole === selectedRole

    const status = notification?.status
    const matchesTab =
      activeTab === "all" || (activeTab === "unread" && status === 0) || (activeTab === "read" && status === 1)

    return matchesSearch && matchesType && matchesRole && matchesTab
  })

  const handleOpenDetailsModal = async (notification: any) => {
    try {
      await fetchNotificationById(notification.id)
      setIsDetailsModalOpen(true)
    } catch (error) {
      console.error("Failed to fetch notification details:", error)
    }
  }

  const handleEditNotification = async (notification: any) => {
    try {
      await fetchNotificationById(notification.id)
      setNotificationToEdit(selectedNotification)
      setIsNotificationModalOpen(true)
    } catch (error) {
      console.error("Failed to fetch notification for editing:", error)
    }
  }

  const handleDeleteNotification = async (id: number) => {
    try {
      await removeNotification(id)
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id)
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
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

  const getTypeIcon = (type: number) => {
    switch (type) {
      case 1:
        return <Bell className="h-4 w-4 text-blue-500" />
      case 2:
        return <Clock className="h-4 w-4 text-green-500" />
      case 3:
        return <BellRing className="h-4 w-4 text-purple-500" />
      case 4:
        return <CheckCheck className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  // Stats calculation with safe checks
  const stats = {
    total: notifications?.length || 0,
    unread: notifications?.filter((n) => n?.status === 0)?.length || 0,
    read: notifications?.filter((n) => n?.status === 1)?.length || 0,
    averageReadRate:
      notifications?.length > 0
        ? Math.round((notifications.filter((n) => n?.status === 1)?.length / notifications.length) * 100)
        : 0,
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    updateFilters({ search: value })
  }

  const handleTypeFilter = (value: string) => {
    setSelectedType(value)
    updateFilters({ type: value === "all" ? undefined : value })
  }

  const handleRoleFilter = (value: string) => {
    setSelectedRole(value)
    updateFilters({ recipientRole: value === "all" ? undefined : value })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notification Management</h1>
        <Button
          onClick={() => {
            setNotificationToEdit(null)
            setIsNotificationModalOpen(true)
          }}
        >
          <Send className="h-4 w-4 mr-2" />
          New Notification
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unread}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Read</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.read}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Read Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageReadRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search notifications..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Select value={selectedType} onValueChange={handleTypeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="1">System</SelectItem>
              <SelectItem value="2">Appointment</SelectItem>
              <SelectItem value="3">Message</SelectItem>
              <SelectItem value="4">Alert</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedRole} onValueChange={handleRoleFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="1">Admin</SelectItem>
              <SelectItem value="2">Company</SelectItem>
              <SelectItem value="3">Professional</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DatePickerWithRange dateRange={{}} onDateRangeChange={() => {}} />
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Loading notifications...
                      </TableCell>
                    </TableRow>
                  ) : filteredNotifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No notifications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell className="font-medium">{notification.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getTypeIcon(notification.type)}
                            <span>{getNotificationTypeLabel(notification.type)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {getRecipientRoleLabel(notification.recipientRole)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(notification.status)}</TableCell>
                        <TableCell>
                          {notification.sentAt ? new Date(notification.sentAt).toLocaleDateString("en-US") : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDetailsModal(notification)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {notification.status === 0 && (
                                <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                                  <CheckCheck className="mr-2 h-4 w-4" />
                                  Mark as Read
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleEditNotification(notification)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
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
                                    <AlertDialogAction onClick={() => handleDeleteNotification(notification.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => {
          setIsNotificationModalOpen(false)
          setNotificationToEdit(null)
        }}
        notificationToEdit={notificationToEdit}
        onSubmit={notificationToEdit ? updateNotificationById : addNotification}
      />

      {selectedNotification && (
        <NotificationDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedNotification(null)
          }}
          notification={selectedNotification}
          onMarkAsRead={handleMarkAsRead}
          onEdit={handleEditNotification}
          onDelete={handleDeleteNotification}
        />
      )}
    </div>
  )
}
