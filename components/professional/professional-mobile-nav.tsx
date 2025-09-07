"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CheckCircle, Home, MessageSquare, TrendingUp, User } from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/professional/dashboard",
    icon: Home,
    label: "Home",
  },
  {
    name: "Check-in/out",
    href: "/professional/check",
    icon: CheckCircle,
    label: "Check",
  },
  {
    name: "Feedback",
    href: "/professional/feedback",
    icon: MessageSquare,
    label: "Feedback",
  },
  {
    name: "Performance",
    href: "/professional/performance",
    icon: TrendingUp,
    label: "Stats",
  },
  {
    name: "Profile",
    href: "/professional/profile",
    icon: User,
    label: "Profile",
  },
]

export function ProfessionalMobileNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <nav className="flex items-center justify-around px-2 py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href)
          return (
            <Button
              key={item.name}
              asChild
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center justify-center h-12 w-full gap-1 rounded-lg",
                isActive && "text-primary bg-primary/10",
              )}
            >
              <Link href={item.href}>
                <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                <span className={cn("text-xs font-medium", isActive && "text-primary")}>{item.label}</span>
              </Link>
            </Button>
          )
        })}
      </nav>
    </div>
  )
}
