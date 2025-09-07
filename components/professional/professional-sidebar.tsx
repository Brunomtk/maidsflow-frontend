"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, CheckCircle, Home, MessageSquare, TrendingUp, User, Bell, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const navigation = [
  {
    name: "Dashboard",
    href: "/professional/dashboard",
    icon: Home,
  },
  {
    name: "Schedule",
    href: "/professional/schedule",
    icon: Calendar,
  },
  {
    name: "Check-in/out",
    href: "/professional/check",
    icon: CheckCircle,
  },
  {
    name: "Performance",
    href: "/professional/performance",
    icon: TrendingUp,
  },
  {
    name: "Feedback",
    href: "/professional/feedback",
    icon: MessageSquare,
  },
  {
    name: "Notifications",
    href: "/professional/notifications",
    icon: Bell,
  },
  {
    name: "Profile",
    href: "/professional/profile",
    icon: User,
  },
]

interface ProfessionalSidebarProps {
  onClose?: () => void
}

export function ProfessionalSidebar({ onClose }: ProfessionalSidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleLabel = (role: string) => {
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

  return (
    <div className="flex h-full w-64 flex-col bg-background border-r">
      {onClose && (
        <div className="flex justify-end p-3 md:hidden">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* User Info */}
      <div className="p-4 md:p-6">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8 md:h-10 md:w-10">
            <AvatarImage src={user?.avatar || ""} alt={user?.name || ""} />
            <AvatarFallback className="text-xs">{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-foreground truncate">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
            <Badge variant="secondary" className="mt-1 text-xs">
              {getRoleLabel(user?.role || "")}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 md:p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Button
              key={item.name}
              asChild
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-sm h-9 md:h-10",
                isActive && "bg-secondary text-secondary-foreground",
              )}
              onClick={handleLinkClick}
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                {item.name}
              </Link>
            </Button>
          )
        })}
      </nav>
    </div>
  )
}
