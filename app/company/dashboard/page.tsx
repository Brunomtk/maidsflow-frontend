"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  CreditCard,
  Users,
  RefreshCw,
  Building2,
  Phone,
  Mail,
  UserCheck,
  ClipboardList,
  UserPlus,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
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
  createdDate: string
  updatedDate: string
}

interface Customer {
  id: number
  name: string
  email: string
  phone: string
  address: string
  companyId: number
  status: number
  createdDate: string
  updatedDate: string
}

interface Appointment {
  id: number
  title: string
  customerId: number
  customer?: Customer
  address: string
  scheduledDate: string
  startTime: string
  endTime: string
  status: string | number
  professionalId?: number
  companyId: number
  notes?: string
  createdDate: string
  updatedDate: string
}

interface Payment {
  id: number
  amount: number
  dueDate: string
  paymentDate?: string
  status: string | number
  description: string
  method: string
  companyId: number
  planId?: number
  createdDate: string
  updatedDate: string
}

interface Professional {
  id: number
  name: string
  email: string
  phone: string
  status: string
  companyId: number
  createdDate: string
  updatedDate: string
}

interface Team {
  id: number
  name: string
  region: string
  description: string
  rating: number
  completedServices: number
  status: number
  companyId: number
  leaderId: number
  createdDate: string
  updatedDate: string
}

interface Plan {
  id: number
  name: string
  description: string
  price: number
  features: string[]
  maxUsers: number
  maxStorage: number
  isActive: boolean
  createdDate: string
  updatedDate: string
}

interface DashboardData {
  company: Company | null
  customers: Customer[]
  appointments: Appointment[]
  payments: Payment[]
  professionals: Professional[]
  teams: Team[]
  plan: Plan | null
}

export default function CompanyDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    activeProfessionals: 0,
    activeTeams: 0,
  })
  const [appointmentStatus, setAppointmentStatus] = useState({
    scheduled: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  })
  const [paymentStatus, setPaymentStatus] = useState({
    paid: 0,
    pending: 0,
    overdue: 0,
    failed: 0,
  })
  const { user } = useAuth()

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.companyId) return

      setIsLoading(true)
      try {
        const companyId = user.companyId.toString()

        const [customersRes, appointmentsRes, paymentsRes, professionalsRes, teamsRes] = await Promise.allSettled([
          fetchApi<{ results: Customer[] }>(`/Customer?CompanyId=${companyId}&PageSize=100`),
          fetchApi<{ results: Appointment[] }>(`/Appointment?CompanyId=${companyId}&PageSize=100`),
          fetchApi<{ results: Payment[] }>(`/Payments?CompanyId=${companyId}&PageSize=100`),
          fetchApi<{ results: Professional[] }>(`/Professional/paged?CompanyId=${companyId}&PageSize=100`),
          fetchApi<{ results: Team[] }>(`/Team/paged?CompanyId=${companyId}&PageSize=100`),
        ])

        const customers =
          customersRes.status === "fulfilled" && customersRes.value?.results ? customersRes.value.results : []
        const appointments =
          appointmentsRes.status === "fulfilled" && appointmentsRes.value?.results ? appointmentsRes.value.results : []
        const payments =
          paymentsRes.status === "fulfilled" && paymentsRes.value?.results ? paymentsRes.value.results : []
        const professionals =
          professionalsRes.status === "fulfilled" && professionalsRes.value?.results
            ? professionalsRes.value.results
            : []
        const teams = teamsRes.status === "fulfilled" && teamsRes.value?.results ? teamsRes.value.results : []

        setStats({
          totalCustomers: customers.length,
          totalAppointments: appointments.length,
          totalRevenue: payments.reduce((sum, payment) => sum + (payment.amount || 0), 0),
          activeProfessionals: professionals.filter((p) => p.status?.toLowerCase() === "active").length,
          activeTeams: teams.filter((t) => t.status === 1).length,
        })

        const appointmentStatusCounts = appointments.reduce(
          (acc, apt) => {
            // Map numeric status to string status
            let status = "scheduled" // default
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
                // If status is already a string, use it directly
                if (typeof apt.status === "string") {
                  status = apt.status.toLowerCase()
                }
            }

            if (status in acc) {
              acc[status]++
            }
            return acc
          },
          { scheduled: 0, confirmed: 0, completed: 0, cancelled: 0 },
        )
        setAppointmentStatus(appointmentStatusCounts)

        const getPaymentStatusName = (status: number | string): string => {
          if (typeof status === "string") {
            return status.toLowerCase()
          }

          // Map integer status codes to status names
          const statusMap: { [key: number]: string } = {
            0: "pending",
            1: "paid",
            2: "overdue",
            3: "failed",
          }

          return statusMap[status] || "pending"
        }

        const paymentStatusCounts = payments.reduce(
          (acc, payment) => {
            const status = getPaymentStatusName(payment.status)
            if (status in acc) {
              acc[status]++
            }
            return acc
          },
          { paid: 0, pending: 0, overdue: 0, failed: 0 },
        )
        setPaymentStatus(paymentStatusCounts)
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
  }, [user?.companyId, toast])

  if (isLoading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-300 rounded w-32 sm:w-48 mb-2"></div>
          <div className="h-3 sm:h-4 bg-gray-300 rounded w-48 sm:w-64"></div>
        </div>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 sm:h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Welcome back! Here's what's happening with your business.
          </p>
          {user?.company && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center gap-1 min-w-0">
                <Building2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">{user.company.name}</span>
              </div>
              <div className="flex items-center gap-1 min-w-0">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">{user.company.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>{user.company.phone}</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            onClick={() => setIsLoading(true)}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm"
          >
            {isLoading ? (
              <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            )}
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button asChild size="sm" className="text-xs sm:text-sm">
            <Link href="/company/schedule">
              <Calendar className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Schedule</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Active customer base</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">All time appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Teams</CardTitle>
            <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{stats.activeTeams}</div>
            <p className="text-xs text-muted-foreground">Working teams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Professionals</CardTitle>
            <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{stats.activeProfessionals}</div>
            <p className="text-xs text-muted-foreground">Available staff</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm sm:text-base">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                Appointment Status
              </span>
              <Button asChild variant="outline" size="sm" className="text-xs w-full sm:w-auto bg-transparent">
                <Link href="/company/schedule">View All</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs sm:text-sm">Scheduled</span>
                </div>
                <span className="font-semibold text-sm sm:text-base">{appointmentStatus.scheduled}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs sm:text-sm">Confirmed</span>
                </div>
                <span className="font-semibold text-sm sm:text-base">{appointmentStatus.confirmed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-500"></div>
                  <span className="text-xs sm:text-sm">Completed</span>
                </div>
                <span className="font-semibold text-sm sm:text-base">{appointmentStatus.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs sm:text-sm">Cancelled</span>
                </div>
                <span className="font-semibold text-sm sm:text-base">{appointmentStatus.cancelled}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm sm:text-base">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                Payment Status
              </span>
              <Button asChild variant="outline" size="sm" className="text-xs w-full sm:w-auto bg-transparent">
                <Link href="/company/payments">View All</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs sm:text-sm">Paid</span>
                </div>
                <span className="font-semibold text-sm sm:text-base">{paymentStatus.paid}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs sm:text-sm">Pending</span>
                </div>
                <span className="font-semibold text-sm sm:text-base">{paymentStatus.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs sm:text-sm">Overdue</span>
                </div>
                <span className="font-semibold text-sm sm:text-base">{paymentStatus.overdue}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-500"></div>
                  <span className="text-xs sm:text-sm">Failed</span>
                </div>
                <span className="font-semibold text-sm sm:text-base">{paymentStatus.failed}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <Button
              asChild
              variant="outline"
              className="h-auto p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200"
            >
              <Link href="/company/schedule">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <div className="text-center">
                  <div className="font-semibold text-blue-900 text-xs sm:text-sm">Schedule</div>
                  <div className="text-xs text-blue-700 hidden sm:block">Manage appointments</div>
                </div>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-auto p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200"
            >
              <Link href="/company/clients">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                <div className="text-center">
                  <div className="font-semibold text-green-900 text-xs sm:text-sm">Clients</div>
                  <div className="text-xs text-green-700 hidden sm:block">Customer management</div>
                </div>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-auto p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200"
            >
              <Link href="/company/payments">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                <div className="text-center">
                  <div className="font-semibold text-purple-900 text-xs sm:text-sm">Payments</div>
                  <div className="text-xs text-purple-700 hidden sm:block">Billing & invoices</div>
                </div>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-auto p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-orange-200"
            >
              <Link href="/company/check-management">
                <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                <div className="text-center">
                  <div className="font-semibold text-orange-900 text-xs sm:text-sm">Check Records</div>
                  <div className="text-xs text-orange-700 hidden sm:block">Track attendance</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
