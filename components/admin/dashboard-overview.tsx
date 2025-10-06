"use client"

import { useDashboardContext } from "@/contexts/dashboard-context"
import { DashboardStatsCard } from "./dashboard-stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Building2, Users, Calendar, ClipboardCheck, CreditCard } from "lucide-react"

export function DashboardOverview() {
  const { stats, isLoading } = useDashboardContext()

  // Calculate percentages safely
  const appointmentCompletionRate =
    stats.appointments.total > 0 ? Math.round((stats.appointments.completed / stats.appointments.total) * 100) : 0

  const paymentSuccessRate =
    stats.payments.total > 0 ? Math.round((stats.payments.paid / stats.payments.total) * 100) : 0

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardStatsCard
          title="Active Companies"
          value={stats.companies.active}
          change={`${stats.companies.total} total`}
          trend="up"
          icon={Building2}
          loading={stats.companies.loading}
        />

        <DashboardStatsCard
          title="Active Customers"
          value={stats.customers.active}
          change={`${stats.customers.total} total`}
          trend="up"
          icon={Users}
          loading={stats.customers.loading}
        />

        <DashboardStatsCard
          title="Appointments"
          value={stats.appointments.total}
          change={`${stats.appointments.scheduled} scheduled`}
          trend="up"
          icon={Calendar}
          loading={stats.appointments.loading}
        />

        <DashboardStatsCard
          title="Check-ins"
          value={stats.checkRecords.checkedIn}
          change={`${stats.checkRecords.total} total`}
          trend="up"
          icon={ClipboardCheck}
          loading={stats.checkRecords.loading}
        />

        <DashboardStatsCard
          title="Payments"
          value={formatCurrency(stats.payments.totalAmount)}
          change={`${stats.payments.paid} paid`}
          trend="up"
          icon={CreditCard}
          loading={stats.payments.loading}
        />
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Appointment Status</CardTitle>
            <CardDescription>Completion rate: {appointmentCompletionRate}%</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Completed
                </span>
                <span className="font-semibold text-foreground">{stats.appointments.completed}</span>
              </div>
              <Progress value={appointmentCompletionRate} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  Scheduled
                </span>
                <span className="font-semibold text-foreground">{stats.appointments.scheduled}</span>
              </div>
              <Progress
                value={
                  stats.appointments.total > 0 ? (stats.appointments.scheduled / stats.appointments.total) * 100 : 0
                }
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  Cancelled
                </span>
                <span className="font-semibold text-foreground">{stats.appointments.cancelled}</span>
              </div>
              <Progress
                value={
                  stats.appointments.total > 0 ? (stats.appointments.cancelled / stats.appointments.total) * 100 : 0
                }
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payments Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Payment Status</CardTitle>
            <CardDescription>Success rate: {paymentSuccessRate}%</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Paid
                </span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(
                    stats.payments.totalAmount * (stats.payments.paid / Math.max(stats.payments.total, 1)),
                  )}
                </span>
              </div>
              <Progress value={paymentSuccessRate} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  Pending
                </span>
                <span className="font-semibold text-foreground">{stats.payments.pending}</span>
              </div>
              <Progress
                value={stats.payments.total > 0 ? (stats.payments.pending / stats.payments.total) * 100 : 0}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  Overdue
                </span>
                <span className="font-semibold text-foreground">{stats.payments.overdue}</span>
              </div>
              <Progress
                value={stats.payments.total > 0 ? (stats.payments.overdue / stats.payments.total) * 100 : 0}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
