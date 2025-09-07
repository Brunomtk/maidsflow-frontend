"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Package, Check, Users, Building, Calendar, DollarSign, Edit } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface PlanDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  plan: any
}

export function PlanDetailsModal({ isOpen, onClose, plan }: PlanDetailsModalProps) {
  // Mock data for companies using this plan
  const mockCompanies = [
    { id: "COMP-001", name: "CleanTech Solutions" },
    { id: "COMP-002", name: "Sparkle Cleaning Co." },
    { id: "COMP-003", name: "Fresh & Clean Services" },
  ].slice(0, plan.companiesCount > 3 ? 3 : plan.companiesCount)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Plan Details
          </DialogTitle>
          <DialogDescription>Detailed information about the plan.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground">
                {plan.isActive ? (
                  <Badge className="bg-green-500">Active</Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">$ {plan.price.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">{plan.billingCycle === "monthly" ? "Monthly" : "Annual"}</p>
            </div>
          </div>

          <p className="text-sm">{plan.description}</p>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Included Features</h4>
            <ul className="space-y-1">
              {plan.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <Users className="h-4 w-4" /> Subscriber Companies
              </h4>
              <Badge variant="outline">{plan.companiesCount}</Badge>
            </div>
            {plan.companiesCount > 0 && (
              <div className="bg-muted p-3 rounded-md space-y-2">
                {mockCompanies.map((company) => (
                  <div key={company.id} className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{company.name}</span>
                  </div>
                ))}
                {plan.companiesCount > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    + {plan.companiesCount - 3} other companies
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Billing Cycle
              </p>
              <p className="text-sm">{plan.billingCycle === "monthly" ? "Monthly" : "Annual"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium flex items-center gap-1">
                <DollarSign className="h-4 w-4" /> Total Value
              </p>
              <p className="text-sm">
                $ {plan.price.toFixed(2)}
                {plan.billingCycle === "monthly" ? "/month" : "/year"}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="default">
            <Edit className="h-4 w-4 mr-2" />
            Edit Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
