import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DashboardStatsProps {
  title: string
  value: string
  change: string
  icon: LucideIcon
  trend: "up" | "down" | "neutral"
}

export function DashboardStats({ title, value, change, icon: Icon, trend }: DashboardStatsProps) {
  return (
    <Card className="bg-[#1a2234] border-[#2a3349] text-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className="bg-[#0f172a] p-2 rounded-md">
            <Icon className="h-5 w-5 text-[#06b6d4]" />
          </div>
        </div>
        <div className="mt-4">
          <span
            className={cn(
              "text-xs font-medium",
              trend === "up" && "text-green-500",
              trend === "down" && "text-red-500",
              trend === "neutral" && "text-gray-400",
            )}
          >
            {change}
          </span>
          <span className="text-xs text-gray-400 ml-1">desde a semana passada</span>
        </div>
      </CardContent>
    </Card>
  )
}
