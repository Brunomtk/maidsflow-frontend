"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Users, Calendar, Building2, Clock, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { fetchApi } from "@/lib/api/utils"

interface Plan {
  id: number
  name: string
  price: number
  features: string[]
  professionalsLimit: number
  teamsLimit: number
  customersLimit: number
  appointmentsLimit: number
  duration: number
  status: number
  createdDate: string
  updatedDate: string
}

export default function CompanyPlanPage() {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getCompanyId, isAuthenticated, isLoading: authLoading } = useAuth()

  const fetchPlanData = async () => {
    setLoading(true)
    setError(null)

    try {
      const companyId = getCompanyId()
      if (!companyId) {
        throw new Error("No company ID found")
      }

      // 1) buscar o planId associado à empresa
      const planId = await fetchApi<number>(`/Companies/${companyId}/plan-id`)

      if (!planId) {
        throw new Error("No plan ID found for this company")
      }

      // 2) buscar detalhes do plano
      const planData = await fetchApi<Plan>(`/Plan/${planId}`)
      setPlan(planData)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load plan data"
      console.error("Error fetching plan data:", err)
      setError(msg)
      toast.error("Failed to load your current plan. Please refresh or contact support.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchPlanData()
    }
  }, [authLoading, isAuthenticated])

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your plan details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Error</p>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
            <Button onClick={fetchPlanData} className="mt-4 bg-transparent" variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Plan Found</h3>
              <p className="text-muted-foreground">No active plan found for your company.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Current Plan</h1>
          <p className="text-muted-foreground">Manage your subscription and view plan details</p>
        </div>
        <Badge variant={plan.status === 1 ? "default" : "secondary"}>
          {plan.status === 1 ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Plan Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {plan.name}
            </CardTitle>
            <CardDescription>Your current subscription plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">R$ {plan.price.toFixed(2)}</span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{plan.duration} days</span>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold">Features included:</h4>
              <ul className="space-y-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Plan Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Limits</CardTitle>
            <CardDescription>Current usage limits for your plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Professionals</span>
                </div>
                <Badge variant="outline">{plan.professionalsLimit}</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">Teams</span>
                </div>
                <Badge variant="outline">{plan.teamsLimit}</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Customers</span>
                </div>
                <Badge variant="outline">{plan.customersLimit}</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Appointments</span>
                </div>
                <Badge variant="outline">{plan.appointmentsLimit}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Management</CardTitle>
          <CardDescription>Upgrade, downgrade, or manage your subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button>Upgrade Plan</Button>
            <Button variant="outline">Change Plan</Button>
            <Button variant="outline">Billing History</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
