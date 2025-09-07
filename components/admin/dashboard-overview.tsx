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
        <Card className="bg-[#1a2234] border-[#2a3349] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Appointment Status</CardTitle>
            <CardDescription className="text-gray-400">Completion rate: {appointmentCompletionRate}%</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-400">Completed</span>
                <span>{stats.appointments.completed}</span>
              </div>
              <Progress value={appointmentCompletionRate} className="h-2 bg-[#0f172a]" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-400">Scheduled</span>
                <span>{stats.appointments.scheduled}</span>
              </div>
              <Progress
                value={
                  stats.appointments.total > 0 ? (stats.appointments.scheduled / stats.appointments.total) * 100 : 0
                }
                className="h-2 bg-[#0f172a]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-400">Cancelled</span>
                <span>{stats.appointments.cancelled}</span>
              </div>
              <Progress
                value={
                  stats.appointments.total > 0 ? (stats.appointments.cancelled / stats.appointments.total) * 100 : 0
                }
                className="h-2 bg-[#0f172a]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payments Chart */}
        <Card className="bg-[#1a2234] border-[#2a3349] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Payment Status</CardTitle>
            <CardDescription className="text-gray-400">Success rate: {paymentSuccessRate}%</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-400">Paid</span>
                <span>
                  {formatCurrency(
                    stats.payments.totalAmount * (stats.payments.paid / Math.max(stats.payments.total, 1)),
                  )}
                </span>
              </div>
              <Progress value={paymentSuccessRate} className="h-2 bg-[#0f172a]" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-yellow-400">Pending</span>
                <span>{stats.payments.pending}</span>
              </div>
              <Progress
                value={stats.payments.total > 0 ? (stats.payments.pending / stats.payments.total) * 100 : 0}
                className="h-2 bg-[#0f172a]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-400">Overdue</span>
                <span>{stats.payments.overdue}</span>
              </div>
              <Progress
                value={stats.payments.total > 0 ? (stats.payments.overdue / stats.payments.total) * 100 : 0}
                className="h-2 bg-[#0f172a]"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
