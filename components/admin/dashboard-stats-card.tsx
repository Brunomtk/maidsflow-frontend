"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardStatsCardProps {
  title: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "neutral"
  icon: LucideIcon
  loading?: boolean
}

export function DashboardStatsCard({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  loading,
}: DashboardStatsCardProps) {
  if (loading) {
    return (
      <Card className="bg-[#1a2234] border-[#2a3349]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">
            <Skeleton className="h-4 w-20 bg-gray-600" />
          </CardTitle>
          <Skeleton className="h-4 w-4 bg-gray-600" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-16 bg-gray-600 mb-1" />
          <Skeleton className="h-3 w-24 bg-gray-600" />
        </CardContent>
      </Card>
    )
  }

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

  return (
    <Card className="bg-[#1a2234] border-[#2a3349] text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
        <Icon className="h-4 w-4 text-[#06b6d4]" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {change && (
          <div className="flex items-center text-xs text-gray-400">
            <TrendIcon
              className={cn(
                "mr-1 h-3 w-3",
                trend === "up" && "text-green-500",
                trend === "down" && "text-red-500",
                trend === "neutral" && "text-gray-500",
              )}
            />
            {change}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
