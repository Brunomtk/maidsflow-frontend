"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  Building2,
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Home,
  MapPin,
  MessageSquare,
  Package,
  Settings,
  Star,
  Users,
  UserCog,
  X,
  Flame,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea as UIScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"

type SidebarContextType = {
  isOpen: boolean
  toggleSidebar: () => void
  isMobile: boolean
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return <SidebarContext.Provider value={{ isOpen, toggleSidebar, isMobile }}>{children}</SidebarContext.Provider>
}

export function AdminSidebar() {
  const { isOpen, toggleSidebar, isMobile } = useSidebar()
  const { user } = useAuth()
  const pathname = usePathname()

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/admin/users", label: "Users", icon: UserCog },
    { href: "/admin/companies", label: "Companies", icon: Building2 },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/professionals", label: "Professionals", icon: Users },
    { href: "/admin/teams", label: "Teams", icon: Users },
    { href: "/admin/appointments", label: "Appointments", icon: Calendar },
    { href: "/admin/recurrences", label: "Recurrences", icon: ClipboardList },
    { href: "/admin/check-in", label: "Check-in/Check-out", icon: CheckSquare },
    { href: "/admin/gps-tracking", label: "GPS Tracking", icon: MapPin },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/feedback", label: "Internal Feedback", icon: MessageSquare },
    { href: "/admin/cancellations", label: "Cancellations", icon: ClipboardList },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/plans", label: "Plans", icon: Package },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/settings", label: "Profile", icon: Settings },
  ]

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

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={toggleSidebar} />
            <div className="fixed left-0 top-0 h-full w-72 bg-card border-r border-border flex flex-col shadow-2xl">
              <div className="flex h-16 items-center justify-between px-6 border-b border-border">
                <Link href="/admin/dashboard" className="flex items-center space-x-3" onClick={toggleSidebar}>
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <Flame className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-bold text-foreground">Maids Flow</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <UIScrollArea className="flex-1 px-4">
                <div className="space-y-1 py-4">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={toggleSidebar}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </UIScrollArea>

              <div className="border-t border-border p-4">
                <Link
                  href="/admin/settings"
                  onClick={toggleSidebar}
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
        )}
      </>
    )
  }

  return (
    <div
      className={cn(
        "relative flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
        isOpen ? "w-72" : "w-20",
      )}
    >
      <div className="flex h-16 items-center justify-between px-6 border-b border-border">
        {!isOpen ? (
          <Link href="/admin/dashboard" className="flex items-center justify-center w-full">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
          </Link>
        ) : (
          <Link href="/admin/dashboard" className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Maids Flow</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="absolute right-[-12px] top-8 h-6 w-6 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent z-10 shadow-md"
        >
          {isOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </Button>
      </div>

      <UIScrollArea className="flex-1 px-4">
        <div className="space-y-1 py-4">
          {navItems.map((item) => {
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
                  !isOpen && "justify-center px-0",
                )}
                title={!isOpen ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </div>
      </UIScrollArea>

      <div className="border-t border-border p-4">
        <Link
          href="/admin/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent",
            !isOpen && "justify-center",
          )}
          title={!isOpen ? user?.name || "Profile" : undefined}
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
          {isOpen && user && (
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
