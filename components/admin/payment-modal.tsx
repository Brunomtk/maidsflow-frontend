"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePaymentsContext } from "@/contexts/payments-context"
import type { Payment, PaymentFormData } from "@/types/payment"
import { fetchApi } from "@/lib/api/utils"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "create" | "edit"
  payment?: Payment | null
}

interface Company {
  id: number
  name: string
}

interface Plan {
  id: number
  name: string
}

const INITIAL_FORM_DATA: PaymentFormData = {
  companyId: 0,
  amount: 0,
  dueDate: "",
  paymentDate: "",
  status: 0,
  method: 0,
  reference: "",
  planId: 0,
}

export function PaymentModal({ isOpen, onClose, mode, payment }: PaymentModalProps) {
  const { addPayment, editPayment } = usePaymentsContext()
  const [formData, setFormData] = useState<PaymentFormData>(INITIAL_FORM_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadDropdownData = async () => {
    setIsLoading(true)
    try {
      // Load companies
      const companiesRes = await fetchApi<{ result: Company[] }>("/Companies/paged")
      setCompanies(companiesRes?.result || [])

      // Load plans
      const plansRes = await fetchApi<{ results: Plan[] }>("/Plan/paged")
      setPlans(plansRes?.results || [])
    } catch (error) {
      console.error("Error loading dropdown data:", error)
      setCompanies([])
      setPlans([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadDropdownData()
    }
  }, [isOpen])

  useEffect(() => {
    if (mode === "edit" && payment) {
      setFormData({
        companyId: payment.companyId,
        amount: payment.amount,
        dueDate: payment.dueDate.split("T")[0],
        paymentDate: payment.paymentDate ? payment.paymentDate.split("T")[0] : "",
        status: payment.status,
        method: payment.method,
        reference: payment.reference,
        planId: payment.planId,
      })
    } else {
      setFormData(INITIAL_FORM_DATA)
    }
  }, [mode, payment, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const submitData = {
      ...formData,
      dueDate: new Date(formData.dueDate).toISOString(),
      paymentDate: formData.paymentDate ? new Date(formData.paymentDate).toISOString() : undefined,
    }

    let success = false
    if (mode === "create") {
      success = await addPayment(submitData)
    } else if (mode === "edit" && payment) {
      success = await editPayment(payment.id, submitData)
    }

    if (success) {
      onClose()
    }
    setIsSubmitting(false)
  }

  const handleInputChange = (field: keyof PaymentFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Payment" : "Edit Payment"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Add a new payment record." : "Update the payment information."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyId">Company * ({companies.length} loaded)</Label>
              <Select
                value={formData.companyId.toString()}
                onValueChange={(v) => handleInputChange("companyId", Number(v))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="planId">Plan * ({plans.length} loaded)</Label>
              <Select
                value={formData.planId.toString()}
                onValueChange={(v) => handleInputChange("planId", Number(v))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) => handleInputChange("reference", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => handleInputChange("paymentDate", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status.toString()} onValueChange={(v) => handleInputChange("status", Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Pending</SelectItem>
                  <SelectItem value="1">Paid</SelectItem>
                  <SelectItem value="2">Overdue</SelectItem>
                  <SelectItem value="3">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">Payment Method</Label>
              <Select value={formData.method.toString()} onValueChange={(v) => handleInputChange("method", Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Credit Card</SelectItem>
                  <SelectItem value="1">Debit Card</SelectItem>
                  <SelectItem value="2">Bank Transfer</SelectItem>
                  <SelectItem value="3">PIX</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
