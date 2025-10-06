"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Bell,
  XCircle,
  CreditCard,
  Package,
  CheckSquare,
  MessageSquare,
  X,
  Flame,
  UserCog,
} from "lucide-react"
import { useCompanySidebar } from "./company-sidebar-context"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"

const menuItems = [
  { title: "Dashboard", href: "/company/dashboard", icon: LayoutDashboard },
  { title: "Schedule", href: "/company/schedule", icon: Calendar },
  { title: "Check Management", href: "/company/check-management", icon: CheckSquare },
  { title: "Clients", href: "/company/clients", icon: Users },
  { title: "Teams", href: "/company/teams", icon: Users },
  { title: "Professionals", href: "/company/professionals", icon: UserCheck },
  { title: "Users", href: "/company/users", icon: UserCog },
  { title: "Payments", href: "/company/payments", icon: CreditCard },
  { title: "Plan", href: "/company/plan", icon: Package },
  { title: "Cancellations", href: "/company/cancellations", icon: XCircle },
  { title: "Feedback", href: "/company/feedback", icon: MessageSquare },
  { title: "GPS Tracking", href: "/company/gps-tracking", icon: MapPin },
  { title: "Notifications", href: "/company/notifications", icon: Bell },
]

export function CompanySidebar() {
  const pathname = usePathname()
  const { collapsed, setCollapsed, isMobileOpen, setIsMobileOpen } = useCompanySidebar()
  const { user } = useAuth()

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleDisplayName = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "Administrator"
      case "company":
        return "Company"
      case "professional":
        return "Professional"
      case "operador":
        return "Operator"
      default:
        return role || "User"
    }
  }

  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname, setIsMobileOpen])

  const handleMobileClose = () => {
    setIsMobileOpen(false)
  }

  if (isMobileOpen) {
    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={handleMobileClose} />
        <div className="fixed left-0 top-0 h-full w-72 bg-card border-r border-border flex flex-col shadow-2xl">
          <div className="flex h-16 items-center justify-between px-6 border-b border-border">
            <Link href="/company/dashboard" className="flex items-center space-x-3" onClick={handleMobileClose}>
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Flame className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">Maids Flow</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMobileClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 px-4">
            <div className="space-y-1 py-4">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleMobileClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
            </div>
          </ScrollArea>

          <div className="border-t border-border p-4">
            <Link
              href="/company/profile"
              onClick={handleMobileClose}
              className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-lg">
                {user?.avatar ? (
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  getUserInitials(user?.name || "User")
                )}
              </div>
              {user && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{getRoleDisplayName(user.role)}</p>
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-20" : "w-72",
      )}
    >
      <div className="flex h-16 items-center justify-between px-6 border-b border-border">
        {!collapsed ? (
          <Link href="/company/dashboard" className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Maids Flow</span>
          </Link>
        ) : (
          <Link href="/company/dashboard" className="flex items-center justify-center w-full">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute right-[-12px] top-8 h-6 w-6 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent z-10 shadow-md"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  collapsed && "justify-center px-0",
                )}
                title={collapsed ? item.title : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <Link
          href="/company/profile"
          className={cn(
            "flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent",
            collapsed && "justify-center",
          )}
          title={collapsed ? user?.name || "Profile" : undefined}
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-lg">
            {user?.avatar ? (
              <img
                src={user.avatar || "/placeholder.svg"}
                alt={user.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              getUserInitials(user?.name || "User")
            )}
          </div>
          {!collapsed && user && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{getRoleDisplayName(user.role)}</p>
            </div>
          )}
        </Link>
      </div>
    </div>
  )
}
