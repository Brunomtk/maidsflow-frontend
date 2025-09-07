"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Mail, Phone, Star, User, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

interface ProfessionalDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  professional: any
}

export function ProfessionalDetailsModal({ isOpen, onClose, professional }: ProfessionalDetailsModalProps) {
  if (!professional) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return { label: "Active", className: "border-green-500 text-green-500" }
      case "in_service":
        return { label: "In Service", className: "border-blue-500 text-blue-500" }
      case "on_leave":
        return { label: "On Leave", className: "border-yellow-500 text-yellow-500" }
      default:
        return { label: status, className: "border-gray-500 text-gray-500" }
    }
  }

  // Sample performance data
  const performanceData = {
    punctuality: 95,
    quality: 92,
    customerSatisfaction: 98,
    attendance: 96,
  }

  // Sample recent services
  const recentServices = [
    {
      id: 1,
      date: "2023-06-05",
      time: "09:00 AM",
      customer: "John Smith",
      address: "123 Main St",
      rating: 5,
    },
    {
      id: 2,
      date: "2023-06-04",
      time: "02:00 PM",
      customer: "Mary Johnson",
      address: "456 Oak Ave",
      rating: 5,
    },
    {
      id: 3,
      date: "2023-06-03",
      time: "10:30 AM",
      customer: "Charles Brown",
      address: "789 Pine St",
      rating: 4,
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-[#1a2234] border-[#2a3349] text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#06b6d4]" />
            Professional Details
          </DialogTitle>
          <DialogDescription className="text-gray-400">Complete information about the professional</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 mt-4">
          <Avatar className="h-20 w-20 border-2 border-[#2a3349]">
            <AvatarImage src={professional.photo || "/placeholder.svg"} />
            <AvatarFallback className="bg-[#2a3349] text-[#06b6d4] text-xl">
              {professional.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{professional.name}</h3>
            <p className="text-gray-400">{professional.team}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={getStatusBadge(professional.status).className}>
                {getStatusBadge(professional.status).label}
              </Badge>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm">{professional.rating}</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="info" className="mt-6">
          <TabsList className="bg-[#0f172a] border border-[#2a3349]">
            <TabsTrigger value="info" className="data-[state=active]:bg-[#2a3349]">
              Information
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-[#2a3349]">
              Performance
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-[#2a3349]">
              Recent Services
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <User className="h-4 w-4" />
                    <span className="text-sm">CPF</span>
                  </div>
                  <p className="font-medium">{professional.cpf}</p>
                </div>

                <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Email</span>
                  </div>
                  <p className="font-medium">{professional.email}</p>
                </div>

                <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">Phone</span>
                  </div>
                  <p className="font-medium">{professional.phone}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Shift</span>
                  </div>
                  <p className="font-medium capitalize">{professional.shift}</p>
                </div>

                <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Weekly Hours</span>
                  </div>
                  <p className="font-medium">{professional.weeklyHours} hours</p>
                </div>

                <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349]">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Completed Services</span>
                  </div>
                  <p className="font-medium">{professional.completedServices}</p>
                </div>
              </div>
            </div>

            {professional.observations && (
              <div className="bg-[#0f172a] p-4 rounded-lg border border-[#2a3349] mt-4">
                <h4 className="font-medium mb-2">Observations</h4>
                <p className="text-sm text-gray-400">{professional.observations}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="performance" className="mt-4">
            <Card className="bg-[#0f172a] border-[#2a3349]">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Performance Metrics</CardTitle>
                <CardDescription className="text-gray-400">Overall performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Punctuality</span>
                    <span className="text-sm font-medium">{performanceData.punctuality}%</span>
                  </div>
                  <Progress value={performanceData.punctuality} className="h-2 bg-[#2a3349]" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Service Quality</span>
                    <span className="text-sm font-medium">{performanceData.quality}%</span>
                  </div>
                  <Progress value={performanceData.quality} className="h-2 bg-[#2a3349]" />
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
                    <span className="text-sm">Attendance</span>
                    <span className="text-sm font-medium">{performanceData.attendance}%</span>
                  </div>
                  <Progress value={performanceData.attendance} className="h-2 bg-[#2a3349]" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="mt-4">
            <Card className="bg-[#0f172a] border-[#2a3349]">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Recent Services</CardTitle>
                <CardDescription className="text-gray-400">Last services performed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 border border-[#2a3349] rounded-md"
                    >
                      <div>
                        <p className="font-medium">{service.customer}</p>
                        <p className="text-sm text-gray-400">
                          {service.date} at {service.time}
                        </p>
                        <p className="text-xs text-gray-500">{service.address}</p>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm">{service.rating}</span>
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
