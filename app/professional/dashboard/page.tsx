"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  RefreshCw,
  User,
  FileText,
  ClipboardList,
  Phone,
  Mail,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { fetchApi } from "@/lib/api/utils"
import { format } from "date-fns"

interface Appointment {
  id: number
  title: string
  customerId: number
  customer?: {
    id: number
    name: string
    email: string
    phone: string
  }
  address: string
  start: string
  end: string
  status: string | number
  professionalId?: number
  companyId: number
  notes?: string
  createdDate: string
  updatedDate: string
}

interface CheckRecord {
  id: number
  professionalId: number
  professionalName: string
  customerId: number
  customerName: string
  address: string
  checkInTime?: string
  checkOutTime?: string
  status: number
  serviceType: string
  notes?: string
  createdDate: string
  updatedDate: string
}

interface InternalFeedback {
  id: number
  title: string
  description: string
  category: string
  priority: number
  status: number
  professionalId: number
  assignedToId?: number
  date: string
  createdDate: string
  updatedDate: string
}

export default function ProfessionalDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    todayAppointments: 0,
    completedServices: 0,
    pendingCheckIns: 0,
    openFeedbacks: 0,
  })
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [checkRecords, setCheckRecords] = useState<CheckRecord[]>([])
  const [feedbacks, setFeedbacks] = useState<InternalFeedback[]>([])
  const [appointmentStatus, setAppointmentStatus] = useState({
    scheduled: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  })
  const [checkRecordStatus, setCheckRecordStatus] = useState({
    pending: 0,
    "in-progress": 0,
    completed: 0,
    cancelled: 0,
  })
  const { user } = useAuth()

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.professionalId) return

      setIsLoading(true)
      try {
        const professionalId = user.professionalId.toString()
        const today = new Date()
        const startDate = format(today, "yyyy-MM-dd")
        const endDate = format(today, "yyyy-MM-dd")

        const [appointmentsRes, checkRecordsRes, feedbacksRes] = await Promise.allSettled([
          fetchApi<{ results: Appointment[] }>(`Appointment?ProfessionalId=${professionalId}&PageSize=100`),
          fetchApi<{ results: CheckRecord[] }>(`CheckRecord?ProfessionalId=${professionalId}&PageSize=100`),
          fetchApi<{ data: InternalFeedback[] }>(
            `InternalFeedback/paged?ProfessionalId=${professionalId}&PageSize=100`,
          ),
        ])

        const appointments =
          appointmentsRes.status === "fulfilled" && appointmentsRes.value?.results ? appointmentsRes.value.results : []
        const checkRecords =
          checkRecordsRes.status === "fulfilled" && checkRecordsRes.value?.results ? checkRecordsRes.value.results : []
        const feedbacks = feedbacksRes.status === "fulfilled" && feedbacksRes.value?.data ? feedbacksRes.value.data : []

        const todayAppointments = appointments.filter((apt) => {
          const aptDate = new Date(apt.start)
          return aptDate.toDateString() === today.toDateString()
        })

        setAppointments(todayAppointments)
        setCheckRecords(checkRecords.slice(0, 10))
        setFeedbacks(feedbacks.slice(0, 5))

        setStats({
          todayAppointments: todayAppointments.length,
          completedServices: checkRecords.filter((record) => record.status === 2 || record.status === "completed")
            .length,
          pendingCheckIns: checkRecords.filter((record) => record.status === 0 || record.status === "pending").length,
          openFeedbacks: feedbacks.filter((feedback) => feedback.status === 0 || feedback.status === "pending").length,
        })

        const appointmentStatusCounts = appointments.reduce(
          (acc, apt) => {
            let status = "scheduled"

            if (typeof apt.status === "number") {
              switch (apt.status) {
                case 0:
                case 1:
                  status = "scheduled"
                  break
                case 2:
                  status = "confirmed"
                  break
                case 3:
                  status = "completed"
                  break
                case 4:
                  status = "cancelled"
                  break
                default:
                  status = "scheduled"
              }
            } else if (typeof apt.status === "string") {
              status = apt.status.toLowerCase()
            }

            if (status in acc) {
              acc[status as keyof typeof acc]++
            }
            return acc
          },
          { scheduled: 0, confirmed: 0, completed: 0, cancelled: 0 },
        )

        setAppointmentStatus(appointmentStatusCounts)

        const checkRecordStatusCounts = checkRecords.reduce(
          (acc, record) => {
            let status = "pending"

            if (typeof record.status === "number") {
              switch (record.status) {
                case 0:
                  status = "pending"
                  break
                case 1:
                  status = "in-progress"
                  break
                case 2:
                  status = "completed"
                  break
                case 3:
                  status = "cancelled"
                  break
                default:
                  status = "pending"
              }
            } else if (typeof record.status === "string") {
              status = record.status.toLowerCase()
            }

            if (status in acc) {
              acc[status as keyof typeof acc]++
            }
            return acc
          },
          { pending: 0, "in-progress": 0, completed: 0, cancelled: 0 },
        )

        setCheckRecordStatus(checkRecordStatusCounts)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [user?.professionalId, toast])

  const getStatusBadge = (status: number, type: "appointment" | "check" | "feedback") => {
    if (type === "check") {
      switch (status) {
        case 0:
          return <Badge variant="outline">Pending</Badge>
        case 1:
          return <Badge className="bg-blue-500">Checked In</Badge>
        case 2:
          return <Badge className="bg-green-500">Completed</Badge>
        default:
          return <Badge variant="outline">Unknown</Badge>
      }
    }

    if (type === "feedback") {
      switch (status) {
        case 0:
          return <Badge variant="destructive">Open</Badge>
        case 1:
          return <Badge className="bg-yellow-500">In Progress</Badge>
        case 2:
          return <Badge className="bg-green-500">Resolved</Badge>
        default:
          return <Badge variant="outline">Unknown</Badge>
      }
    }

    return <Badge variant="outline">Status {status}</Badge>
  }

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 0:
        return <Badge variant="outline">Low</Badge>
      case 1:
        return <Badge className="bg-yellow-500">Medium</Badge>
      case 2:
        return <Badge variant="destructive">High</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-6 md:h-8 bg-gray-300 rounded w-32 md:w-48 mb-2"></div>
          <div className="h-3 md:h-4 bg-gray-300 rounded w-48 md:w-64"></div>
        </div>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 md:h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600">Welcome back! Here's your professional overview.</p>
          {user && (
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4 text-xs md:text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3 md:h-4 md:w-4" />
                <span className="truncate">{user.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3 md:h-4 md:w-4" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3 md:h-4 md:w-4" />
                <span className="truncate">{user.phone}</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <Button
            onClick={() => setIsLoading(true)}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="w-full md:w-auto"
          >
            {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
          <Button asChild size="sm" className="w-full md:w-auto">
            <Link href="/professional/check-in">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Check-in/out
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Pending Check-ins</CardTitle>
            <Clock className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.pendingCheckIns}</div>
            <p className="text-xs text-muted-foreground">Awaiting check-in</p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Completed Services</CardTitle>
            <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.completedServices}</div>
            <p className="text-xs text-muted-foreground">Services completed</p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Open Feedbacks</CardTitle>
            <FileText className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.openFeedbacks}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <span className="flex items-center gap-2 text-sm md:text-base">
                <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                Appointment Status
              </span>
              <Button asChild variant="outline" size="sm" className="w-full md:w-auto bg-transparent">
                <Link href="/professional/history">View All</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs md:text-sm">Scheduled</span>
                </div>
                <span className="text-sm md:text-base font-semibold">{appointmentStatus.scheduled}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs md:text-sm">Confirmed</span>
                </div>
                <span className="text-sm md:text-base font-semibold">{appointmentStatus.confirmed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gray-500"></div>
                  <span className="text-xs md:text-sm">Completed</span>
                </div>
                <span className="text-sm md:text-base font-semibold">{appointmentStatus.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs md:text-sm">Cancelled</span>
                </div>
                <span className="text-sm md:text-base font-semibold">{appointmentStatus.cancelled}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <ClipboardList className="h-4 w-4 md:h-5 md:w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
              <Button
                asChild
                variant="outline"
                className="h-auto p-3 md:p-4 flex flex-col items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200"
              >
                <Link href="/professional/check-in">
                  <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                  <div className="text-center">
                    <div className="text-sm md:text-base font-semibold text-blue-900">Check-in/out</div>
                    <div className="text-xs text-blue-700">Track attendance</div>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto p-3 md:p-4 flex flex-col items-center gap-2 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200"
              >
                <Link href="/professional/chat">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                  <div className="text-center">
                    <div className="text-sm md:text-base font-semibold text-green-900">Chat</div>
                    <div className="text-xs text-green-700">Team communication</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm md:text-base">Today's Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-6 md:py-8 text-muted-foreground text-sm">No appointments for today</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs md:text-sm">Service</TableHead>
                    <TableHead className="text-xs md:text-sm">Customer</TableHead>
                    <TableHead className="text-xs md:text-sm">Time</TableHead>
                    <TableHead className="text-xs md:text-sm min-w-[120px]">Address</TableHead>
                    <TableHead className="text-xs md:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium text-xs md:text-sm">{appointment.title}</TableCell>
                      <TableCell className="text-xs md:text-sm">{appointment.customer?.name || "N/A"}</TableCell>
                      <TableCell className="text-xs md:text-sm whitespace-nowrap">
                        {format(new Date(appointment.start), "HH:mm")} - {format(new Date(appointment.end), "HH:mm")}
                      </TableCell>
                      <TableCell className="max-w-[120px] md:max-w-xs truncate text-xs md:text-sm">
                        {appointment.address}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" asChild className="text-xs">
                          <Link href="/professional/check-in">Check-in</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm md:text-base">Recent Check Records</CardTitle>
        </CardHeader>
        <CardContent>
          {checkRecords.length === 0 ? (
            <div className="text-center py-6 md:py-8 text-muted-foreground text-sm">No check records found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs md:text-sm">Customer</TableHead>
                    <TableHead className="text-xs md:text-sm min-w-[120px]">Address</TableHead>
                    <TableHead className="text-xs md:text-sm">Check-in</TableHead>
                    <TableHead className="text-xs md:text-sm">Check-out</TableHead>
                    <TableHead className="text-xs md:text-sm">Status</TableHead>
                    <TableHead className="text-xs md:text-sm">Service Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium text-xs md:text-sm">{record.customerName}</TableCell>
                      <TableCell className="max-w-[120px] md:max-w-xs truncate text-xs md:text-sm">
                        {record.address}
                      </TableCell>
                      <TableCell className="text-xs md:text-sm whitespace-nowrap">
                        {record.checkInTime ? format(new Date(record.checkInTime), "MM/dd HH:mm") : "-"}
                      </TableCell>
                      <TableCell className="text-xs md:text-sm whitespace-nowrap">
                        {record.checkOutTime ? format(new Date(record.checkOutTime), "MM/dd HH:mm") : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status, "check")}</TableCell>
                      <TableCell className="text-xs md:text-sm">{record.serviceType}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm md:text-base">Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {feedbacks.length === 0 ? (
            <div className="text-center py-6 md:py-8 text-muted-foreground text-sm">No feedback found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs md:text-sm">Title</TableHead>
                    <TableHead className="text-xs md:text-sm">Category</TableHead>
                    <TableHead className="text-xs md:text-sm">Priority</TableHead>
                    <TableHead className="text-xs md:text-sm">Status</TableHead>
                    <TableHead className="text-xs md:text-sm">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell className="font-medium text-xs md:text-sm">{feedback.title}</TableCell>
                      <TableCell className="text-xs md:text-sm">{feedback.category}</TableCell>
                      <TableCell>{getPriorityBadge(feedback.priority)}</TableCell>
                      <TableCell>{getStatusBadge(feedback.status, "feedback")}</TableCell>
                      <TableCell className="text-xs md:text-sm whitespace-nowrap">
                        {format(new Date(feedback.date), "MM/dd/yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
