"use client"

import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PlanLimitBarProps {
  currentCount: number
  maxLimit: number
  planName?: string
  onUpgrade?: () => void
}

export function PlanLimitBar({ currentCount, maxLimit, planName = "Current Plan", onUpgrade }: PlanLimitBarProps) {
  const percentage = (currentCount / maxLimit) * 100
  const isAtLimit = currentCount >= maxLimit
  const isNearLimit = percentage >= 80 && !isAtLimit

  return (
    <div className="space-y-3 p-4 rounded-lg border border-border bg-gradient-to-br from-card via-card to-muted/20 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Professional Users Limit</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{planName}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">
            {currentCount}
            <span className="text-sm text-muted-foreground font-normal">/{maxLimit}</span>
          </p>
          <p className="text-xs text-muted-foreground">professionals</p>
        </div>
      </div>

      <div className="space-y-2">
        <Progress
          value={percentage}
          className="h-3"
          indicatorClassName={
            isAtLimit
              ? "bg-gradient-to-r from-red-500 to-red-600"
              : isNearLimit
                ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                : "bg-gradient-to-r from-primary to-cyan-500"
          }
        />
        <p className="text-xs text-muted-foreground text-center">{percentage.toFixed(0)}% of plan capacity used</p>
      </div>

      {isAtLimit && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-sm text-foreground">
            <div className="flex items-center justify-between gap-4">
              <span>
                You've reached your plan limit. Upgrade to add more professionals and unlock additional features.
              </span>
              {onUpgrade && (
                <Button
                  size="sm"
                  onClick={onUpgrade}
                  className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-600 text-white shrink-0"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Upgrade Plan
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isNearLimit && !isAtLimit && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm text-foreground">
            You're approaching your plan limit. Consider upgrading to avoid interruptions.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
