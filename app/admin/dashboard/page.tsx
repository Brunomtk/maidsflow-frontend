"use client"

import { DashboardProvider, useDashboardContext } from "@/contexts/dashboard-context"
import { DashboardOverview } from "@/components/admin/dashboard-overview"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, BarChart, RefreshCw, Building2, UserCheck, ClipboardCheck } from "lucide-react"
import { useRouter } from "next/navigation"

function DashboardContent() {
  const { refresh, isLoading } = useDashboardContext()
  const router = useRouter()

  const quickActions = [
    {
      icon: Calendar,
      label: "New Appointment",
      path: "/admin/appointments",
      color: "text-[#00D3F3]",
      bgGradient: "from-[#00D3F3]/20 via-[#00D3F3]/10 to-transparent",
      borderColor: "border-[#00D3F3]/30",
      hoverShadow: "hover:shadow-[#00D3F3]/20",
    },
    {
      icon: Building2,
      label: "New Company",
      path: "/admin/companies",
      color: "text-purple-500",
      bgGradient: "from-purple-500/20 via-purple-500/10 to-transparent",
      borderColor: "border-purple-500/30",
      hoverShadow: "hover:shadow-purple-500/20",
    },
    {
      icon: UserCheck,
      label: "New Customer",
      path: "/admin/customers",
      color: "text-green-500",
      bgGradient: "from-green-500/20 via-green-500/10 to-transparent",
      borderColor: "border-green-500/30",
      hoverShadow: "hover:shadow-green-500/20",
    },
    {
      icon: BarChart,
      label: "Reports",
      path: "/admin/reports",
      color: "text-orange-500",
      bgGradient: "from-orange-500/20 via-orange-500/10 to-transparent",
      borderColor: "border-orange-500/30",
      hoverShadow: "hover:shadow-orange-500/20",
    },
    {
      icon: Users,
      label: "New Team",
      path: "/admin/teams",
      color: "text-[#00D3F3]",
      bgGradient: "from-[#00D3F3]/20 via-[#00D3F3]/10 to-transparent",
      borderColor: "border-[#00D3F3]/30",
      hoverShadow: "hover:shadow-[#00D3F3]/20",
    },
    {
      icon: ClipboardCheck,
      label: "Check-in",
      path: "/admin/check-in",
      color: "text-pink-500",
      bgGradient: "from-pink-500/20 via-pink-500/10 to-transparent",
      borderColor: "border-pink-500/30",
      hoverShadow: "hover:shadow-pink-500/20",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
        <Button
          variant="outline"
          size="default"
          className="w-full sm:w-auto bg-transparent"
          onClick={refresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {/* Main Dashboard Overview */}
      <DashboardOverview />

      <Card className="border-border bg-gradient-to-br from-card via-card to-muted/20 shadow-lg">
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-foreground mb-1">Quick Actions</h3>
            <p className="text-muted-foreground text-sm">Quick access to frequently used features</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => router.push(action.path)}
                className={`group relative overflow-hidden rounded-2xl border ${action.borderColor} bg-gradient-to-br ${action.bgGradient} backdrop-blur-sm hover:scale-105 transition-all duration-300 p-6 flex flex-col items-center justify-center text-center min-h-[140px] ${action.hoverShadow} hover:shadow-xl`}
              >
                <div
                  className={`h-14 w-14 rounded-xl bg-gradient-to-br ${action.bgGradient} border ${action.borderColor} flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
                >
                  <action.icon className={`h-7 w-7 ${action.color}`} />
                </div>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  )
}
