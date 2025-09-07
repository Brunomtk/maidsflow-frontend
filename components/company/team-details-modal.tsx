"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { BarChart, Calendar, CheckCircle, Clock, MapPin, Star, Users, User } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface TeamDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  onEdit: (team: any) => void
  team: any
}

export function TeamDetailsModal({ isOpen, onClose, onEdit, team }: TeamDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!team) return null

  // Sample team members
  const teamMembers = team.members || [
    {
      id: 1,
      name: "Maria Silva",
      role: "Team Leader",
      experience: "5 years",
      rating: 4.8,
    },
    {
      id: 2,
      name: "João Oliveira",
      role: "Senior Cleaner",
      experience: "3 years",
      rating: 4.7,
    },
    {
      id: 3,
      name: "Ana Santos",
      role: "Cleaner",
      experience: "2 years",
      rating: 4.9,
    },
    {
      id: 4,
      name: "Carlos Pereira",
      role: "Cleaner",
      experience: "1 year",
      rating: 4.5,
    },
  ]

  // Sample performance data
  const performanceData = {
    onTimeCompletion: 96,
    customerSatisfaction: 94,
    qualityScore: 92,
    efficiency: 89,
  }

  // Sample upcoming services
  const upcomingServices = [
    {
      id: 1,
      date: "2023-06-10",
      time: "09:00 AM",
      customer: "Tech Solutions Ltd",
      address: "123 Main St",
      type: "Commercial Cleaning",
    },
    {
      id: 2,
      date: "2023-06-11",
      time: "02:00 PM",
      customer: "ABC Consulting",
      address: "456 Oak Ave",
      type: "Deep Cleaning",
    },
    {
      id: 3,
      date: "2023-06-12",
      time: "10:30 AM",
      customer: "XYZ Commerce",
      address: "789 Pine St",
      type: "Regular Cleaning",
    },
  ]

  // Sample completed services
  const completedServices = [
    {
      id: 101,
      date: "2023-06-05",
      customer: "Global Tech Inc",
      type: "Commercial Cleaning",
      rating: 5,
      revenue: "$350",
    },
    {
      id: 102,
      date: "2023-06-03",
      customer: "Riverside Apartments",
      type: "Deep Cleaning",
      rating: 4,
      revenue: "$280",
    },
    {
      id: 103,
      date: "2023-06-01",
      customer: "Smith Family",
      type: "Residential Cleaning",
      rating: 5,
      revenue: "$150",
    },
    {
      id: 104,
      date: "2023-05-28",
      customer: "Downtown Office",
      type: "Commercial Cleaning",
      rating: 4,
      revenue: "$320",
    },
  ]

  // Service types the team can perform
  const serviceTypes = team.serviceTypes || [
    "Regular Cleaning",
    "Deep Cleaning",
    "Commercial Cleaning",
    "Post-Construction Cleaning",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-[#1a2234] border-[#2a3349] text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#06b6d4]" />
            Team Details
          </DialogTitle>
          <DialogDescription className="text-gray-400">Complete information about the team</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between mt-4">
          <div>
            <h3 className="text-xl font-semibold">{team.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">{team.supervisor}</span>
              </div>
              <span className="text-gray-500">•</span>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">{team.shift}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={team.status === "active" ? "border-green-500 text-green-500" : "border-red-500 text-red-500"}
            >
              {team.status === "active" ? "Active" : "Inactive"}
            </Badge>
            <Button size="sm" onClick={() => onEdit(team)} className="bg-[#06b6d4] hover:bg-[#0891b2] text-white h-8">
              Edit Team
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <Card className="bg-[#0f172a] border-[#2a3349]">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Users className="h-8 w-8 text-[#06b6d4] mb-2" />
              <span className="text-sm text-gray-400">Members</span>
              <span className="text-xl font-bold text-white">{teamMembers.length}</span>
            </CardContent>
          </Card>

          <Card className="bg-[#0f172a] border-[#2a3349]">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <CheckCircle className="h-8 w-8 text-[#06b6d4] mb-2" />
              <span className="text-sm text-gray-400">Completed</span>
              <span className="text-xl font-bold text-white">{completedServices.length}</span>
            </CardContent>
          </Card>

          <Card className="bg-[#0f172a] border-[#2a3349]">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Calendar className="h-8 w-8 text-[#06b6d4] mb-2" />
              <span className="text-sm text-gray-400">Upcoming</span>
              <span className="text-xl font-bold text-white">{upcomingServices.length}</span>
            </CardContent>
          </Card>
        </div>

        {team.description && (
          <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349] mt-4">
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-gray-400">{team.description}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="bg-[#0f172a] border border-[#2a3349]">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#2a3349]">
              Overview
            </TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:bg-[#2a3349]">
              Team Members
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-[#2a3349]">
              Performance
            </TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-[#2a3349]">
              Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <Card className="bg-[#0f172a] border-[#2a3349]">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base">Service Types</CardTitle>
                <CardDescription className="text-gray-400">Services this team can perform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {serviceTypes.map((type) => (
                    <Badge key={type} className="bg-[#2a3349] text-white hover:bg-[#3a4359]">
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0f172a] border-[#2a3349]">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base">Recent Activity</CardTitle>
                <CardDescription className="text-gray-400">Latest services completed by this team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedServices.slice(0, 3).map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-2 border border-[#2a3349] rounded-md"
                    >
                      <div>
                        <p className="font-medium text-sm">{service.customer}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{service.date}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-400">{service.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          <span className="text-xs font-medium">{service.rating}</span>
                        </div>
                        <span className="text-sm font-medium text-green-500">{service.revenue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0f172a] border-[#2a3349]">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base">Team Stats</CardTitle>
                <CardDescription className="text-gray-400">Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">On-time Completion</span>
                      <span className="text-xs font-medium">{performanceData.onTimeCompletion}%</span>
                    </div>
                    <Progress value={performanceData.onTimeCompletion} className="h-1.5 bg-[#2a3349]" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Customer Satisfaction</span>
                      <span className="text-xs font-medium">{performanceData.customerSatisfaction}%</span>
                    </div>
                    <Progress value={performanceData.customerSatisfaction} className="h-1.5 bg-[#2a3349]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="mt-4">
            <Card className="bg-[#0f172a] border-[#2a3349]">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Team Members</CardTitle>
                <CardDescription className="text-gray-400">All professionals in this team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border border-[#2a3349] rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-[#2a3349]">
                          <AvatarFallback className="bg-[#2a3349] text-[#06b6d4]">
                            {member.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{member.role}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-400">{member.experience}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm">{member.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="mt-4">
            <Card className="bg-[#0f172a] border-[#2a3349]">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Team Performance</CardTitle>
                <CardDescription className="text-gray-400">Performance metrics for this team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">On-time Completion</span>
                    <span className="text-sm font-medium">{performanceData.onTimeCompletion}%</span>
                  </div>
                  <Progress value={performanceData.onTimeCompletion} className="h-2 bg-[#2a3349]" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Customer Satisfaction</span>
                    <span className="text-sm font-medium">{performanceData.customerSatisfaction}%</span>
                  </div>
                  <Progress value={performanceData.customerSatisfaction} className="h-2 bg-[#2a3349]" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Quality Score</span>
                    <span className="text-sm font-medium">{performanceData.qualityScore}%</span>
                  </div>
                  <Progress value={performanceData.qualityScore} className="h-2 bg-[#2a3349]" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Efficiency</span>
                    <span className="text-sm font-medium">{performanceData.efficiency}%</span>
                  </div>
                  <Progress value={performanceData.efficiency} className="h-2 bg-[#2a3349]" />
                </div>

                <div className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-[#06b6d4]" />
                      <span className="font-medium">Performance Summary</span>
                    </div>
                    <Badge variant="outline" className="border-[#06b6d4] text-[#06b6d4]">
                      Excellent
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    This team consistently performs above average in all metrics, with exceptional customer satisfaction
                    scores.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="mt-4">
            <Card className="bg-[#0f172a] border-[#2a3349]">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Upcoming Services</CardTitle>
                <CardDescription className="text-gray-400">Next scheduled services for this team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 border border-[#2a3349] rounded-md"
                    >
                      <div>
                        <p className="font-medium">{service.customer}</p>
                        <p className="text-sm text-gray-400">
                          {service.date} at {service.time}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">{service.address}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-[#06b6d4] text-[#06b6d4]">
                        {service.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0f172a] border-[#2a3349] mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Completed Services</CardTitle>
                <CardDescription className="text-gray-400">Recent services completed by this team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 border border-[#2a3349] rounded-md"
                    >
                      <div>
                        <p className="font-medium">{service.customer}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-400">{service.date}</p>
                          <span className="text-xs text-gray-500">•</span>
                          <p className="text-sm text-gray-400">{service.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm">{service.rating}</span>
                        </div>
                        <span className="text-sm font-medium text-green-500">{service.revenue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
