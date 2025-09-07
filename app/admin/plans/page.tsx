"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlanModal } from "@/components/admin/plan-modal"
import { PlanDetailsModal } from "@/components/admin/plan-details-modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, Edit, Plus, Search, Trash, Users } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { usePlansContext } from "@/contexts/plans-context" // Changed to usePlansContext

export default function PlansPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showInactive, setShowInactive] = useState(false)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)

  const { plans, loading, addPlan, editPlan, removePlan, activatePlan, deactivatePlan, fetchPlans } = usePlansContext() // Changed to usePlansContext and added fetchPlans

  // Helper function to format duration (moved from usePlans hook)
  const formatDuration = (duration: number) => {
    if (duration === 30) return "Monthly"
    if (duration === 365) return "Annual"
    return `${duration} days`
  }

  // Filter plans based on search query and active status
  const searchLower = searchQuery.toLowerCase()

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchLower) ||
      plan.features.some((feature) => feature.toLowerCase().includes(searchLower))
    const matchesStatus = showInactive ? true : plan.status === 1

    return matchesSearch && matchesStatus
  })

  // Atualizar as estatísticas para usar os dados reais
  const statsData = {
    totalPlans: plans.length,
    activePlans: plans.filter((plan) => plan.status === 1).length,
    totalCompanies: 0, // Será implementado quando tivermos o endpoint de subscribers
    averagePrice: plans.length > 0 ? plans.reduce((acc, plan) => acc + plan.price, 0) / plans.length : 0,
  }

  const handleOpenDetailsModal = (plan: any) => {
    setSelectedPlan(plan)
    setIsDetailsModalOpen(true)
  }

  const handleEditPlan = (plan: any) => {
    setSelectedPlan(plan)
    setIsPlanModalOpen(true)
  }

  const handleDeletePlan = async (planId: number) => {
    const success = await removePlan(planId.toString())
    if (success) {
      // Refresh será feito automaticamente pelo contexto
    }
  }

  const handleTogglePlanStatus = async (planId: number, currentStatus: number) => {
    if (currentStatus === 1) {
      await deactivatePlan(planId.toString())
    } else {
      await activatePlan(planId.toString())
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Plan Management</h1>
        <Button
          onClick={() => {
            setSelectedPlan(null)
            setIsPlanModalOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.totalPlans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.activePlans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Subscriber Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.totalCompanies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {statsData.averagePrice.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search plans..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
          <Label htmlFor="show-inactive">Show inactive plans</Label>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Companies</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No plans found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{plan.description}</TableCell>
                    <TableCell>R$ {plan.price.toFixed(2)}</TableCell>
                    <TableCell>{formatDuration(plan.duration)}</TableCell>
                    <TableCell>
                      {plan.status === 1 ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {plan.subscriptions?.length || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenDetailsModal(plan)}>
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditPlan(plan)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePlanStatus(plan.id, plan.status)}
                        >
                          {plan.status === 1 ? (
                            <>
                              <Trash className="h-4 w-4 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                        {/* {plan.companiesCount === 0 && ( */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 bg-transparent"
                          onClick={() => handleDeletePlan(plan.id)}
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        {/* )} */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PlanModal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} planToEdit={selectedPlan} />

      {selectedPlan && (
        <PlanDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          plan={selectedPlan}
        />
      )}
    </div>
  )
}
