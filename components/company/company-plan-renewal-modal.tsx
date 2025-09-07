"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar, CreditCard, Package, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CompanyPlanRenewalModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan: any
}

export function CompanyPlanRenewalModal({ isOpen, onClose, currentPlan }: CompanyPlanRenewalModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [enableAutoRenewal, setEnableAutoRenewal] = useState(currentPlan?.autoRenew || false)
  const [renewalPeriod, setRenewalPeriod] = useState("1-year")

  // Calculate renewal price based on period
  const renewalPrices = {
    "1-month": currentPlan?.price,
    "6-months": currentPlan?.price * 6 * 0.95, // 5% discount
    "1-year": currentPlan?.price * 12 * 0.9, // 10% discount
    "2-years": currentPlan?.price * 24 * 0.85, // 15% discount
  }

  const selectedPrice = renewalPrices[renewalPeriod as keyof typeof renewalPrices]
  const discountPercentage =
    renewalPeriod === "1-month" ? 0 : renewalPeriod === "6-months" ? 5 : renewalPeriod === "1-year" ? 10 : 15

  // Calculate new expiry date
  const calculateNewExpiryDate = () => {
    const currentExpiryDate = new Date(currentPlan?.expiryDate)
    const newExpiryDate = new Date(currentExpiryDate)

    if (renewalPeriod === "1-month") {
      newExpiryDate.setMonth(newExpiryDate.getMonth() + 1)
    } else if (renewalPeriod === "6-months") {
      newExpiryDate.setMonth(newExpiryDate.getMonth() + 6)
    } else if (renewalPeriod === "1-year") {
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1)
    } else if (renewalPeriod === "2-years") {
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 2)
    }

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(newExpiryDate)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Renewing plan:", currentPlan?.name)
    console.log("Renewal period:", renewalPeriod)
    console.log("Auto-renewal:", enableAutoRenewal)
    console.log("Payment method:", paymentMethod)

    // In a real app, this would process the payment and renew the plan
    alert(`Plan renewed successfully until ${calculateNewExpiryDate()}!`)
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
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Renew Your Plan
          </DialogTitle>
          <DialogDescription>Renew your {currentPlan?.name} plan to continue using all features.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border rounded-lg p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">{currentPlan?.name} Plan</h3>
                </div>
                <p className="text-sm text-muted-foreground">{currentPlan?.description}</p>
              </div>
              <div className="text-right">
                <div className="font-bold">R$ {currentPlan?.price.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">per month</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Renewal Period</Label>
              <RadioGroup
                defaultValue={renewalPeriod}
                onValueChange={setRenewalPeriod}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center justify-between border rounded-md p-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1-month" id="1-month" />
                    <Label htmlFor="1-month" className="font-normal">
                      1 Month
                    </Label>
                  </div>
                  <div className="text-sm font-medium">R$ {renewalPrices["1-month"].toFixed(2)}</div>
                </div>
                <div className="flex items-center justify-between border rounded-md p-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="6-months" id="6-months" />
                    <Label htmlFor="6-months" className="font-normal">
                      6 Months
                    </Label>
                    <Badge className="bg-green-500 text-xs">Save 5%</Badge>
                  </div>
                  <div className="text-sm font-medium">R$ {renewalPrices["6-months"].toFixed(2)}</div>
                </div>
                <div className="flex items-center justify-between border rounded-md p-3 border-primary bg-primary/5">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1-year" id="1-year" />
                    <Label htmlFor="1-year" className="font-normal">
                      1 Year
                    </Label>
                    <Badge className="bg-green-500 text-xs">Save 10%</Badge>
                  </div>
                  <div className="text-sm font-medium">R$ {renewalPrices["1-year"].toFixed(2)}</div>
                </div>
                <div className="flex items-center justify-between border rounded-md p-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2-years" id="2-years" />
                    <Label htmlFor="2-years" className="font-normal">
                      2 Years
                    </Label>
                    <Badge className="bg-green-500 text-xs">Save 15%</Badge>
                  </div>
                  <div className="text-sm font-medium">R$ {renewalPrices["2-years"].toFixed(2)}</div>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2 border rounded-md p-3">
              <Switch id="auto-renewal" checked={enableAutoRenewal} onCheckedChange={setEnableAutoRenewal} />
              <div className="space-y-0.5">
                <Label htmlFor="auto-renewal">Enable Auto-Renewal</Label>
                <p className="text-sm text-muted-foreground">
                  Your plan will automatically renew at the end of each period.
                </p>
              </div>
            </div>

            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertTitle>New Expiry Date</AlertTitle>
              <AlertDescription>
                Your plan will be extended until <strong>{calculateNewExpiryDate()}</strong>.
              </AlertDescription>
            </Alert>

            <Separator />

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
                    {currentPlan?.name} Plan ({renewalPeriod.replace("-", " ")})
                  </span>
                  <span>
                    R${" "}
                    {(
                      currentPlan?.price *
                      (renewalPeriod === "1-month"
                        ? 1
                        : renewalPeriod === "6-months"
                          ? 6
                          : renewalPeriod === "1-year"
                            ? 12
                            : 24)
                    ).toFixed(2)}
                  </span>
                </div>
                {discountPercentage > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Discount ({discountPercentage}%)</span>
                    <span className="text-green-600">
                      - R${" "}
                      {(
                        currentPlan?.price *
                        (renewalPeriod === "1-month"
                          ? 1
                          : renewalPeriod === "6-months"
                            ? 6
                            : renewalPeriod === "1-year"
                              ? 12
                              : 24) *
                        (discountPercentage / 100)
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total Due Today</span>
                  <span>R$ {selectedPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Renew Plan (R$ {selectedPrice.toFixed(2)})</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
