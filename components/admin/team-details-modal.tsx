"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  Building2,
  Calendar,
  Mail,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Phone,
  User,
} from "lucide-react"

interface Team {
  id: number
  name: string
  region: string
  description: string
  rating: number
  completedServices: number
  status: number
  companyId: number
  company?: {
    id: number
    name: string
    cnpj: string
    responsible: string
    email: string
    phone: string
    planId: number
    status: number
    createdDate: string
    updatedDate: string
  }
  leaderId?: number
  leader?: {
    id: number
    userId: number
    name: string
    email: string
    phone: string
    region: string
    status: number
    createdDate: string
    updatedDate: string
  }
  createdDate: string
  updatedDate: string
}

interface TeamDetailsModalProps {
  isOpen: boolean
  team: Team | null
  onClose: () => void
  onEdit: (team: Team) => void
  onDelete: (team: Team) => void
}

export function TeamDetailsModal({ isOpen, team, onClose, onEdit, onDelete }: TeamDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!team) return null

  // Mock data for demonstration - in real app this would come from API
  const mockMembers = [
    {
      id: 1,
      name: "João Silva",
      email: "joao@example.com",
      phone: "(11) 99999-9999",
      role: "Cleaner",
      rating: 4.8,
      completedTasks: 45,
      avatar: "/placeholder-user.jpg",
      status: "active",
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria@example.com",
      phone: "(11) 88888-8888",
      role: "Supervisor",
      rating: 4.9,
      completedTasks: 32,
      avatar: "/placeholder-user.jpg",
      status: "active",
    },
    {
      id: 3,
      name: "Pedro Costa",
      email: "pedro@example.com",
      phone: "(11) 77777-7777",
      role: "Cleaner",
      rating: 4.6,
      completedTasks: 38,
      avatar: "/placeholder-user.jpg",
      status: "active",
    },
  ]

  const mockActivities = [
    {
      id: 1,
      type: "task_completed",
      description: "Team completed cleaning at Office Building A",
      timestamp: "2024-01-10T14:30:00Z",
      user: "João Silva",
    },
    {
      id: 2,
      type: "member_added",
      description: "Pedro Costa joined the team",
      timestamp: "2024-01-09T10:15:00Z",
      user: "System",
    },
    {
      id: 3,
      type: "task_assigned",
      description: "New cleaning task assigned to team",
      timestamp: "2024-01-08T09:00:00Z",
      user: "Maria Santos",
    },
    {
      id: 4,
      type: "rating_updated",
      description: "Team rating updated to 4.7 stars",
      timestamp: "2024-01-07T16:20:00Z",
      user: "System",
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task_completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "member_added":
        return <Users className="h-4 w-4 text-blue-500" />
      case "task_assigned":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case "rating_updated":
        return <Star className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))
  }

  const getStatusBadge = (status: number) => {
    return (
      <Badge variant={status === 1 ? "default" : "secondary"} className="bg-green-500">
        {status === 1 ? "Active" : "Inactive"}
      </Badge>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">{team.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">{team.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  {team.region && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {team.region}
                    </div>
                  )}
                  {getStatusBadge(team.status)}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(team)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(team)} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-6">
            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{mockMembers.length}</p>
                      <p className="text-sm text-muted-foreground">Members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold">{team.rating.toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{team.completedServices}</p>
                      <p className="text-sm text-muted-foreground">Services</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">95%</p>
                      <p className="text-sm text-muted-foreground">Efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Team Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Team Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Company:</span>
                        <span className="font-medium">{team.company?.name || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Leader:</span>
                        <span className="font-medium">{team.leader?.name || "Not assigned"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Region:</span>
                        <span className="font-medium">{team.region || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Members:</span>
                        <span className="font-medium">{mockMembers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        {getStatusBadge(team.status)}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Company Details */}
                  {team.company && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          Company Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{team.company.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CNPJ:</span>
                          <span className="font-medium">{team.company.cnpj}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Responsible:</span>
                          <span className="font-medium">{team.company.responsible}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">{team.company.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="font-medium">{team.company.phone}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Leader Details */}
                  {team.leader && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Team Leader
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{team.leader.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">{team.leader.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="font-medium">{team.leader.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Region:</span>
                          <span className="font-medium">{team.leader.region}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant={team.leader.status === 1 ? "default" : "secondary"}>
                            {team.leader.status === 1 ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium">
                          {team.createdDate ? new Date(team.createdDate).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span className="font-medium">
                          {team.updatedDate ? new Date(team.updatedDate).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Since:</span>
                        <span className="font-medium">
                          {team.createdDate
                            ? `${Math.floor((Date.now() - new Date(team.createdDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                            : "N/A"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="members" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>All members of this team</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage src={member.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{member.name}</h4>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {member.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {member.phone}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <Badge variant={member.status === "active" ? "default" : "secondary"}>
                              {member.status === "active" ? "Active" : "Inactive"}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span>{member.rating}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{member.completedTasks} tasks completed</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                      <CardDescription>Key performance indicators for this team</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Task Completion Rate</span>
                          <span className="text-sm font-medium">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Customer Satisfaction</span>
                          <span className="text-sm font-medium">88%</span>
                        </div>
                        <Progress value={88} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">On-Time Performance</span>
                          <span className="text-sm font-medium">95%</span>
                        </div>
                        <Progress value={95} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Quality Score</span>
                          <span className="text-sm font-medium">90%</span>
                        </div>
                        <Progress value={90} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Stats</CardTitle>
                      <CardDescription>Performance data for this month</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Services Completed:</span>
                        <span className="font-medium">{team.completedServices}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Average Rating:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{team.rating.toFixed(1)}</span>
                          <Star className="h-4 w-4 text-yellow-500" />
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Hours:</span>
                        <span className="font-medium">180h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Efficiency:</span>
                        <span className="font-medium">95%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Team Size:</span>
                        <span className="font-medium">{mockMembers.length} members</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest team activities and updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockActivities.map((activity, index) => (
                        <div key={activity.id}>
                          <div className="flex items-start gap-3">
                            {getActivityIcon(activity.type)}
                            <div className="flex-1">
                              <p className="text-sm">{activity.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(activity.timestamp).toLocaleString()}
                                </span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">{activity.user}</span>
                              </div>
                            </div>
                          </div>
                          {index < mockActivities.length - 1 && <Separator className="my-4" />}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
