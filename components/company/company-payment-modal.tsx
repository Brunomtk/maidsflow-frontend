"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AlertCircle, Check, CreditCard, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useCompanyPaymentsContext } from "@/contexts/company-payments-context"
import { useAuth } from "@/contexts/auth-context"
import type { Payment } from "@/types/payment"

interface CompanyPaymentModalProps {
  children?: React.ReactNode
  isOpen?: boolean
  onClose?: () => void
  onSuccess?: () => void
  editPayment?: Payment
}

export function CompanyPaymentModal({ children, isOpen, onClose, onSuccess, editPayment }: CompanyPaymentModalProps) {
  const { addPayment, editPayment: updatePayment } = useCompanyPaymentsContext()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [companyPlan, setCompanyPlan] = useState<{ id: number; name: string } | null>(null)

  const modalOpen = isOpen !== undefined ? isOpen : open
  const setModalOpen = (newOpen: boolean) => {
    if (onClose && !newOpen) {
      onClose()
    } else {
      setOpen(newOpen)
    }
  }

  const [amount, setAmount] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [paymentDate, setPaymentDate] = useState("")
  const [status, setStatus] = useState<0 | 1 | 2 | 3>(0)
  const [method, setMethod] = useState<0 | 1 | 2 | 3>(0)
  const [reference, setReference] = useState(`REF-PAY-${Date.now()}`)
  const [planId, setPlanId] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    const loadCompanyPlan = async () => {
      if (user?.companyId) {
        try {
          const plan = { id: user.companyId, name: `Company Plan ${user.companyId}` }
          setCompanyPlan(plan)

          if (!editPayment) {
            setPlanId(plan.id.toString())
          }
        } catch (error) {
          console.error("Failed to load company plan:", error)
        }
      }
    }

    loadCompanyPlan()
  }, [user?.companyId, editPayment])

  useEffect(() => {
    if (editPayment) {
      setAmount(editPayment.amount.toString())
      setDueDate(editPayment.dueDate ? editPayment.dueDate.split("T")[0] : "")
      setPaymentDate(editPayment.paymentDate ? editPayment.paymentDate.split("T")[0] : "")
      setStatus(editPayment.status as 0 | 1 | 2 | 3)
      setMethod(editPayment.method as 0 | 1 | 2 | 3)
      setReference(editPayment.reference || "")
      setPlanId(editPayment.planId?.toString() || "")
    } else {
      setAmount("")
      setDueDate("")
      setPaymentDate("")
      setStatus(0)
      setMethod(0)
      setReference(`REF-PAY-${Date.now()}`)
      if (companyPlan) {
        setPlanId(companyPlan.id.toString())
      }
      setNotes("")
    }
  }, [editPayment, companyPlan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !dueDate || !planId) return

    setIsSubmitting(true)
    try {
      const paymentData = {
        amount: Number.parseFloat(amount),
        dueDate,
        paymentDate: paymentDate || undefined,
        status,
        method,
        reference,
        planId: Number.parseInt(planId),
      }

      if (editPayment) {
        await updatePayment(editPayment.id, paymentData)
      } else {
        await addPayment(paymentData)
      }

      setAmount("")
      setDueDate("")
      setPaymentDate("")
      setStatus(0)
      setMethod(0)
      setReference(`REF-PAY-${Date.now()}`)
      if (companyPlan) {
        setPlanId(companyPlan.id.toString())
      }
      setNotes("")

      if (onSuccess) {
        onSuccess()
      }

      setModalOpen(false)
    } catch (error) {
      console.error("Error saving payment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateReference = () => {
    setReference(`REF-PAY-${Date.now()}`)
  }

  const setDueDateToday = () => {
    const today = new Date()
    setDueDate(today.toISOString().split("T")[0])
  }

  const setDueDatePlus30 = () => {
    const today = new Date()
    const plus30 = new Date(today)
    plus30.setDate(today.getDate() + 30)
    setDueDate(plus30.toISOString().split("T")[0])
  }

  const DialogComponent = children ? (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#1a2234] border-[#2a3349] text-white">
        <DialogHeader>
          <DialogTitle>{editPayment ? "Edit Payment" : "Create New Payment"}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {editPayment
              ? "Update the payment details below."
              : "Enter the payment details below to create a new payment record."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4 bg-[#0f172a]">
              <TabsTrigger value="details" className="data-[state=active]:bg-[#2a3349]">
                Payment Details
              </TabsTrigger>
              <TabsTrigger value="options" className="data-[state=active]:bg-[#2a3349]">
                Options
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reference">
                    Reference <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="reference"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="bg-[#0f172a] border-[#2a3349]"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={generateReference}
                      className="bg-[#0f172a] border-[#2a3349]"
                    >
                      <CreditCard className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Amount <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8 bg-[#0f172a] border-[#2a3349]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="due-date">
                      Due Date <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={setDueDateToday}
                        className="h-6 text-xs bg-[#0f172a] border-[#2a3349]"
                      >
                        Today
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={setDueDatePlus30}
                        className="h-6 text-xs bg-[#0f172a] border-[#2a3349]"
                      >
                        +30 days
                      </Button>
                    </div>
                  </div>
                  <Input
                    id="due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-[#0f172a] border-[#2a3349]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-date">Payment Date</Label>
                  <Input
                    id="payment-date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="bg-[#0f172a] border-[#2a3349]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-id">
                  Plan <span className="text-red-500">*</span>
                </Label>
                <div className="p-3 bg-[#0f172a] border border-[#2a3349] rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {companyPlan ? companyPlan.name : "Loading company plan..."}
                    </span>
                    <span className="text-xs text-gray-400">Auto-selected</span>
                  </div>
                </div>
                <input type="hidden" value={planId} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-method">
                  Payment Method <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={method.toString()}
                  onValueChange={(value) => setMethod(Number.parseInt(value) as 0 | 1 | 2 | 3)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="credit_card" className="border-[#2a3349]" />
                    <Label htmlFor="credit_card" className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" /> Credit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="debit_card" className="border-[#2a3349]" />
                    <Label htmlFor="debit_card" className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" /> Debit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="bank_transfer" className="border-[#2a3349]" />
                    <Label htmlFor="bank_transfer" className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" /> Bank Transfer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="pix" className="border-[#2a3349]" />
                    <Label htmlFor="pix" className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" /> PIX
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={status.toString()}
                  onValueChange={(value) => setStatus(Number.parseInt(value) as 0 | 1 | 2 | 3)}
                  required
                >
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349]">
                    <SelectItem value="0">Pending</SelectItem>
                    <SelectItem value="1">Paid</SelectItem>
                    <SelectItem value="2">Overdue</SelectItem>
                    <SelectItem value="3">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {status === 0 && (
                <Alert className="bg-[#0f172a] border-amber-500/50 text-amber-500">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>This payment will be marked as pending and can be updated later.</AlertDescription>
                </Alert>
              )}

              {status === 1 && (
                <Alert className="bg-[#0f172a] border-green-500/50 text-green-500">
                  <Check className="h-4 w-4" />
                  <AlertDescription>This payment will be marked as completed.</AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="options" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter notes about the payment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px] bg-[#0f172a] border-[#2a3349]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="send-receipt" className="border-[#2a3349] data-[state=checked]:bg-[#06b6d4]" />
                <Label htmlFor="send-receipt">Send receipt to customer</Label>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="bg-[#0f172a] border-[#2a3349]"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#06b6d4] hover:bg-[#0891b2]" disabled={isSubmitting}>
              {isSubmitting
                ? editPayment
                  ? "Updating..."
                  : "Creating..."
                : editPayment
                  ? "Update Payment"
                  : "Create Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  ) : (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a2234] border-[#2a3349] text-white">
        <DialogHeader>
          <DialogTitle>{editPayment ? "Edit Payment" : "Create New Payment"}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {editPayment
              ? "Update the payment details below."
              : "Enter the payment details below to create a new payment record."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4 bg-[#0f172a]">
              <TabsTrigger value="details" className="data-[state=active]:bg-[#2a3349]">
                Payment Details
              </TabsTrigger>
              <TabsTrigger value="options" className="data-[state=active]:bg-[#2a3349]">
                Options
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reference">
                    Reference <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="reference"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="bg-[#0f172a] border-[#2a3349]"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={generateReference}
                      className="bg-[#0f172a] border-[#2a3349]"
                    >
                      <CreditCard className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Amount <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8 bg-[#0f172a] border-[#2a3349]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="due-date">
                      Due Date <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={setDueDateToday}
                        className="h-6 text-xs bg-[#0f172a] border-[#2a3349]"
                      >
                        Today
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={setDueDatePlus30}
                        className="h-6 text-xs bg-[#0f172a] border-[#2a3349]"
                      >
                        +30 days
                      </Button>
                    </div>
                  </div>
                  <Input
                    id="due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-[#0f172a] border-[#2a3349]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-date">Payment Date</Label>
                  <Input
                    id="payment-date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="bg-[#0f172a] border-[#2a3349]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-id">
                  Plan <span className="text-red-500">*</span>
                </Label>
                <div className="p-3 bg-[#0f172a] border border-[#2a3349] rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {companyPlan ? companyPlan.name : "Loading company plan..."}
                    </span>
                    <span className="text-xs text-gray-400">Auto-selected</span>
                  </div>
                </div>
                <input type="hidden" value={planId} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-method">
                  Payment Method <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={method.toString()}
                  onValueChange={(value) => setMethod(Number.parseInt(value) as 0 | 1 | 2 | 3)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="credit_card" className="border-[#2a3349]" />
                    <Label htmlFor="credit_card" className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" /> Credit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="debit_card" className="border-[#2a3349]" />
                    <Label htmlFor="debit_card" className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" /> Debit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="bank_transfer" className="border-[#2a3349]" />
                    <Label htmlFor="bank_transfer" className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" /> Bank Transfer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="pix" className="border-[#2a3349]" />
                    <Label htmlFor="pix" className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" /> PIX
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={status.toString()}
                  onValueChange={(value) => setStatus(Number.parseInt(value) as 0 | 1 | 2 | 3)}
                  required
                >
                  <SelectTrigger className="bg-[#0f172a] border-[#2a3349]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2a3349]">
                    <SelectItem value="0">Pending</SelectItem>
                    <SelectItem value="1">Paid</SelectItem>
                    <SelectItem value="2">Overdue</SelectItem>
                    <SelectItem value="3">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {status === 0 && (
                <Alert className="bg-[#0f172a] border-amber-500/50 text-amber-500">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>This payment will be marked as pending and can be updated later.</AlertDescription>
                </Alert>
              )}

              {status === 1 && (
                <Alert className="bg-[#0f172a] border-green-500/50 text-green-500">
                  <Check className="h-4 w-4" />
                  <AlertDescription>This payment will be marked as completed.</AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="options" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter notes about the payment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px] bg-[#0f172a] border-[#2a3349]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="send-receipt" className="border-[#2a3349] data-[state=checked]:bg-[#06b6d4]" />
                <Label htmlFor="send-receipt">Send receipt to customer</Label>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="bg-[#0f172a] border-[#2a3349]"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#06b6d4] hover:bg-[#0891b2]" disabled={isSubmitting}>
              {isSubmitting
                ? editPayment
                  ? "Updating..."
                  : "Creating..."
                : editPayment
                  ? "Update Payment"
                  : "Create Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  return DialogComponent
}
