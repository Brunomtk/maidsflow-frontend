"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Check, CreditCard, Package, ArrowRight, Calendar } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CompanyPlanUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan: any
  selectedPlan: any
}

export function CompanyPlanUpgradeModal({ isOpen, onClose, currentPlan, selectedPlan }: CompanyPlanUpgradeModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [billingCycle, setBillingCycle] = useState(selectedPlan?.billingCycle || "monthly")

  // Calculate price difference
  const isUpgrade = selectedPlan?.price > currentPlan?.price
  const priceDifference = Math.abs(selectedPlan?.price - currentPlan?.price)

  // Calculate prorated amount (simplified for demo)
  const today = new Date()
  const expiryDate = new Date(currentPlan?.expiryDate)
  const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const daysInMonth = 30 // Simplified
  const proratedAmount = (priceDifference * (daysRemaining / daysInMonth)).toFixed(2)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Upgrading plan to:", selectedPlan?.name)
    console.log("Payment method:", paymentMethod)
    console.log("Billing cycle:", billingCycle)

    // In a real app, this would process the payment and upgrade the plan
    alert(`Plan ${isUpgrade ? "upgraded" : "downgraded"} to ${selectedPlan?.name} successfully!`)
    onClose()
  }

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  // Format card expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }
    return v
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isUpgrade ? "Upgrade" : "Change"} Your Plan
          </DialogTitle>
          <DialogDescription>
            {isUpgrade
              ? "Upgrade your plan to get more features and benefits."
              : "Change your plan to better suit your needs."}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="plan-details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plan-details">Plan Details</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="plan-details" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 border rounded-lg p-4">
                <h3 className="font-medium text-sm text-muted-foreground">Current Plan</h3>
                <h4 className="font-semibold">{currentPlan?.name}</h4>
                <p className="text-sm">{currentPlan?.description}</p>
                <div className="flex items-baseline mt-2">
                  <span className="text-lg font-bold">R$ {currentPlan?.price.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground ml-1">/ {currentPlan?.billingCycle}</span>
                </div>
              </div>

              <div className="space-y-2 border rounded-lg p-4 border-primary bg-primary/5">
                <h3 className="font-medium text-sm text-muted-foreground">New Plan</h3>
                <h4 className="font-semibold">{selectedPlan?.name}</h4>
                <p className="text-sm">{selectedPlan?.description}</p>
                <div className="flex items-baseline mt-2">
                  <span className="text-lg font-bold">R$ {selectedPlan?.price.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground ml-1">/ {billingCycle}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Billing Cycle</Label>
              <RadioGroup
                defaultValue={billingCycle}
                onValueChange={setBillingCycle}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="font-normal">
                    Monthly
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="annual" id="annual" />
                  <Label htmlFor="annual" className="font-normal">
                    Annual (Save 10%)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-medium">Plan Comparison</h3>
              <div className="space-y-2">
                {selectedPlan?.features.map((feature: string, index: number) => {
                  const isNewFeature = !currentPlan?.features.includes(feature)
                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-2 text-sm ${isNewFeature ? "text-primary font-medium" : ""}`}
                    >
                      <Check className={`h-4 w-4 mt-0.5 ${isNewFeature ? "text-primary" : "text-green-500"}`} />
                      <span>
                        {feature} {isNewFeature && "(New)"}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {isUpgrade && (
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertTitle>Prorated Billing</AlertTitle>
                <AlertDescription>
                  You'll be charged the prorated amount of R$ {proratedAmount} for the remaining {daysRemaining} days of
                  your current billing cycle.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button onClick={() => (document.getElementById("payment-tab") as HTMLButtonElement)?.click()}>
                Continue to Payment <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4 py-4">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <RadioGroup
                    defaultValue={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <Label htmlFor="credit-card" className="font-normal flex items-center">
                        <CreditCard className="mr-2 h-4 w-4" /> Credit or Debit Card
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                      <Label htmlFor="bank-transfer" className="font-normal">
                        Bank Transfer
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {paymentMethod === "credit-card" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input
                          id="card-number"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          maxLength={19}
                          required
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="card-name">Cardholder Name</Label>
                        <Input
                          id="card-name"
                          placeholder="John Doe"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="card-expiry">Expiry Date</Label>
                        <Input
                          id="card-expiry"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiryDate(e.target.value))}
                          maxLength={5}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="card-cvc">CVC</Label>
                        <Input
                          id="card-cvc"
                          placeholder="123"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/g, ""))}
                          maxLength={3}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "bank-transfer" && (
                  <div className="space-y-2 border rounded-md p-4">
                    <h3 className="font-medium">Bank Transfer Details</h3>
                    <p className="text-sm">Please transfer the amount to the following account:</p>
                    <div className="space-y-1 mt-2">
                      <p className="text-sm">
                        <span className="font-medium">Bank:</span> Banco do Brasil
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Account Name:</span> Noah Platform
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Account Number:</span> 12345-6
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Agency:</span> 1234
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">CNPJ:</span> 12.345.678/0001-90
                      </p>
                    </div>
                    <p className="text-sm mt-2">
                      After making the transfer, please send the receipt to finance@noahplatform.com
                    </p>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-medium">Order Summary</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>
                        {selectedPlan?.name} Plan ({billingCycle})
                      </span>
                      <span>R$ {selectedPlan?.price.toFixed(2)}</span>
                    </div>
                    {isUpgrade && (
                      <div className="flex justify-between text-sm">
                        <span>Prorated Credit (Current Plan)</span>
                        <span className="text-green-600">- R$ {proratedAmount}</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total Due Today</span>
                      <span>
                        R$ {isUpgrade ? (selectedPlan?.price - Number.parseFloat(proratedAmount)).toFixed(2) : "0.00"}
                      </span>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTitle>Important Information</AlertTitle>
                  <AlertDescription>
                    By proceeding, you agree to our terms of service and authorize us to charge your payment method for
                    the amount shown above.
                  </AlertDescription>
                </Alert>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isUpgrade ? "Upgrade" : "Change"} Plan (R${" "}
                  {isUpgrade ? (selectedPlan?.price - Number.parseFloat(proratedAmount)).toFixed(2) : "0.00"})
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
