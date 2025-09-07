"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Payment } from "@/types/payment"
import { CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react"

interface PaymentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  payment: Payment | null
}

export function PaymentDetailsModal({ isOpen, onClose, payment }: PaymentDetailsModalProps) {
  if (!payment) return null

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount)
  const formatDate = (dateString: string | null) =>
    dateString ? new Date(dateString).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "N/A"

  const getStatusInfo = (status: Payment["status"]) => {
    switch (status) {
      case 1:
        return {
          label: "Paid",
          icon: <CheckCircle className="h-4 w-4" />,
          color: "bg-green-100 text-green-800",
        }
      case 0:
        return { label: "Pending", icon: <Clock className="h-4 w-4" />, color: "bg-yellow-100 text-yellow-800" }
      case 2:
        return {
          label: "Overdue",
          icon: <AlertCircle className="h-4 w-4" />,
          color: "bg-red-100 text-red-800",
        }
      case 3:
        return { label: "Cancelled", icon: <XCircle className="h-4 w-4" />, color: "bg-gray-100 text-gray-800" }
      default:
        return { label: "Unknown", icon: <Clock className="h-4 w-4" />, color: "bg-gray-100 text-gray-800" }
    }
  }

  const getMethodLabel = (method?: Payment["method"]) => {
    const methods = { 0: "Credit Card", 1: "Debit Card", 2: "Bank Transfer", 3: "PIX" }
    return method !== undefined ? methods[method as keyof typeof methods] : "N/A"
  }

  const statusInfo = getStatusInfo(payment.status)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>Complete information for payment {payment.reference}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Amount</h4>
              <p className="text-lg font-semibold">{formatCurrency(payment.amount)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
              <Badge className={statusInfo.color}>
                <div className="flex items-center gap-1">
                  {statusInfo.icon}
                  {statusInfo.label}
                </div>
              </Badge>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Company</h4>
              <p className="text-sm">{payment.companyName || `ID: ${payment.companyId}`}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Plan</h4>
              <p className="text-sm">{payment.planName || `ID: ${payment.planId}`}</p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Due Date</h4>
              <p className="text-sm">{formatDate(payment.dueDate)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Payment Date</h4>
              <p className="text-sm">{formatDate(payment.paymentDate)}</p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Payment Method</h4>
              <p className="text-sm">{getMethodLabel(payment.method)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Reference</h4>
              <p className="text-sm font-mono">{payment.reference}</p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Created At</h4>
              <p className="text-sm">{formatDate(payment.createdDate)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Last Updated</h4>
              <p className="text-sm">{formatDate(payment.updatedDate)}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
