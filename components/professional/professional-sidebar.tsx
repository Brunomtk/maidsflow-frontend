"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Calendar,
  CheckCircle,
  Home,
  MessageSquare,
  TrendingUp,
  User,
  Bell,
  X,
  Flame,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"

const navigation = [
  { name: "Dashboard", href: "/professional/dashboard", icon: Home },
  { name: "Schedule", href: "/professional/schedule", icon: Calendar },
  { name: "Check-in/out", href: "/professional/check", icon: CheckCircle },
  { name: "Performance", href: "/professional/performance", icon: TrendingUp },
  { name: "Feedback", href: "/professional/feedback", icon: MessageSquare },
  { name: "Notifications", href: "/professional/notifications", icon: Bell },
  { name: "Profile", href: "/professional/profile", icon: User },
]

interface ProfessionalSidebarProps {
  onClose?: () => void
}

export function ProfessionalSidebar({ onClose }: ProfessionalSidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setCollapsed(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleDisplayName = (role: string) => {
    switch (role?.toLowerCase()) {
      case "professional":
        return "Professional"
      case "admin":
        return "Administrator"
      case "company":
        return "Company"
      default:
        return role || "User"
    }
  }

  const handleLinkClick = () => {
    if (onClose) {
      onClose()
    }
  }

  if (isMobile && onClose) {
    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
        <div className="fixed left-0 top-0 h-full w-72 bg-card border-r border-border flex flex-col shadow-2xl">
          <div className="flex h-16 items-center justify-between px-6 border-b border-border">
            <Link href="/professional/dashboard" className="flex items-center space-x-3" onClick={handleLinkClick}>
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Flame className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">Maids Flow</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 px-4">
            <div className="space-y-1 py-4">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </ScrollArea>

          <div className="border-t border-border p-4">
            <Link
              href="/professional/profile"
              onClick={handleLinkClick}
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
          <Link href="/professional/dashboard" className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Maids Flow</span>
          </Link>
        ) : (
          <Link href="/professional/dashboard" className="flex items-center justify-center w-full">
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
          {navigation.map((item) => {
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
                title={collapsed ? item.name : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <Link
          href="/professional/profile"
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
