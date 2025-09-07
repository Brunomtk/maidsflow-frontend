"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, Star, Bell, Info } from "lucide-react"
import {
  getProfessionalNotifications,
  getProfessionalUnreadNotificationsCount,
  getProfessionalNotificationStats,
  filterNotificationsByType,
  getNotificationTypeLabel,
  getNotificationTypeColor,
  formatNotificationDate,
} from "@/lib/api/professional-notifications"
import type { Notification } from "@/types/notification"

export default function ProfessionalNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    important: 0,
    thisWeek: 0,
    thisMonth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const [notificationsData, unreadCountData, statsData] = await Promise.all([
        getProfessionalNotifications(),
        getProfessionalUnreadNotificationsCount(),
        getProfessionalNotificationStats(),
      ])

      setNotifications(notificationsData)
      setUnreadCount(unreadCountData)
      setStats(statsData)
    } catch (error) {
      console.error("Error loading notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const getNotificationIcon = (type: number) => {
    switch (type) {
      case 1:
        return <Info className="h-5 w-5" />
      case 2:
        return <AlertTriangle className="h-5 w-5" />
      case 3:
        return <AlertTriangle className="h-5 w-5" />
      case 4:
        return <CheckCircle className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getNotificationBadgeVariant = (type: number) => {
    switch (type) {
      case 1:
        return "outline"
      case 2:
        return "secondary"
      case 3:
        return "destructive"
      case 4:
        return "default"
      default:
        return "outline"
    }
  }

  const filteredNotifications = filterNotificationsByType(notifications, activeTab)

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground">
          {stats.total} notifications • {stats.unread} unread
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({stats.unread})</TabsTrigger>
              <TabsTrigger value="important">Important ({stats.important})</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" onClick={loadNotifications}>
              Refresh
            </Button>
          </div>

          <TabsContent value="all" className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                  <p className="text-muted-foreground text-center">You don't have any notifications at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={notification.status === 0 ? "border-l-4 border-l-blue-500" : ""}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              getNotificationTypeColor(notification.type) === "blue"
                                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                                : getNotificationTypeColor(notification.type) === "yellow"
                                  ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400"
                                  : getNotificationTypeColor(notification.type) === "red"
                                    ? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400"
                                    : getNotificationTypeColor(notification.type) === "green"
                                      ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                                      : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant={getNotificationBadgeVariant(notification.type)}>
                                {getNotificationTypeLabel(notification.type)}
                              </Badge>
                              {notification.status === 0 && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatNotificationDate(notification.createdDate)}
                            </span>
                            {notification.status === 0 && (
                              <Button variant="ghost" size="sm" className="h-8">
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            {filterNotificationsByType(notifications, "unread").length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                  <p className="text-muted-foreground text-center">You don't have any unread notifications.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterNotificationsByType(notifications, "unread").map((notification) => (
                  <Card key={notification.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              getNotificationTypeColor(notification.type) === "blue"
                                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                                : getNotificationTypeColor(notification.type) === "yellow"
                                  ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400"
                                  : getNotificationTypeColor(notification.type) === "red"
                                    ? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400"
                                    : getNotificationTypeColor(notification.type) === "green"
                                      ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                                      : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant={getNotificationBadgeVariant(notification.type)}>
                                {getNotificationTypeLabel(notification.type)}
                              </Badge>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                New
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatNotificationDate(notification.createdDate)}
                            </span>
                            <Button variant="ghost" size="sm" className="h-8">
                              Mark as read
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="important" className="space-y-4">
            {filterNotificationsByType(notifications, "important").length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Star className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No important notifications</h3>
                  <p className="text-muted-foreground text-center">
                    You don't have any important notifications at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterNotificationsByType(notifications, "important").map((notification) => (
                  <Card key={notification.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              getNotificationTypeColor(notification.type) === "yellow"
                                ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400"
                                : "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400"
                            }`}
                          >
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant={getNotificationBadgeVariant(notification.type)}>
                                {getNotificationTypeLabel(notification.type)}
                              </Badge>
                              {notification.status === 0 && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatNotificationDate(notification.createdDate)}
                            </span>
                            {notification.status === 0 && (
                              <Button variant="ghost" size="sm" className="h-8">
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
