"use client"

import type React from "react"

import { useState } from "react"
import { ArrowDownToLine, Check, Clock, Download, FileText, Mail, Printer, RefreshCw, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NoahLogo } from "@/components/noah-logo"
import { useCompanyPayments } from "@/hooks/use-company-payments"
import type { Payment } from "@/types/payment"

interface PaymentDetailsModalProps {
  children: React.ReactNode
  paymentId: string
  paymentData: Payment
}

export function CompanyPaymentDetailsModal({ children, paymentId, paymentData }: PaymentDetailsModalProps) {
  const [open, setOpen] = useState(false)
  const { formatCurrency, formatDate, getStatusColor, getStatusLabel, getMethodLabel } = useCompanyPayments()

  // Added null check for paymentData
  if (!paymentData) {
    return null
  }

  const getStatusIcon = (status: Payment["status"]) => {
    switch (status) {
      case 1: // Paid
        return <Check className="h-4 w-4 mr-1" />
      case 0: // Pending
        return <Clock className="h-4 w-4 mr-1" />
      case 2: // Overdue
        return <X className="h-4 w-4 mr-1" />
      case 3: // Cancelled
        return <X className="h-4 w-4 mr-1" />
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-[#1a2234] border-[#2a3349] text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Payment Details</DialogTitle>
            {paymentData.status !== undefined && (
              <Badge variant="outline" className={getStatusColor(paymentData.status)}>
                <div className="flex items-center">
                  {getStatusIcon(paymentData.status)}
                  {getStatusLabel(paymentData.status)}
                </div>
              </Badge>
            )}
          </div>
          <DialogDescription className="text-gray-400">
            View and manage payment information for reference {paymentData.reference || paymentId}.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4 bg-[#0f172a]">
            <TabsTrigger value="details" className="data-[state=active]:bg-[#2a3349]">
              Details
            </TabsTrigger>
            <TabsTrigger value="invoice" className="data-[state=active]:bg-[#2a3349]">
              Invoice
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-[#2a3349]">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-[#0f172a] border-[#2a3349]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID:</span>
                    <span>{paymentData.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reference:</span>
                    <span>{paymentData.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="font-semibold">{formatCurrency(paymentData.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Due Date:</span>
                    <span>{formatDate(paymentData.dueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Date:</span>
                    <span>{paymentData.paymentDate ? formatDate(paymentData.paymentDate) : "Not paid"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Method:</span>
                    <span>{getMethodLabel(paymentData.method)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0f172a] border-[#2a3349]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Plan Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plan ID:</span>
                    <span>{paymentData.planId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plan Name:</span>
                    <span>{paymentData.planName || `Plan ${paymentData.planId}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Company:</span>
                    <span>{paymentData.companyName || `Company ${paymentData.companyId}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created:</span>
                    <span>{formatDate(paymentData.createdDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Updated:</span>
                    <span>{formatDate(paymentData.updatedDate)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#0f172a] border-[#2a3349]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Payment Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  {paymentData.status === 1
                    ? "Payment was processed successfully. Receipt has been sent to the client."
                    : paymentData.status === 0
                      ? "Payment is pending processing. Will be updated once the transaction is complete."
                      : paymentData.status === 2
                        ? "Payment is overdue. Please follow up with the client."
                        : "Payment has been cancelled."}
                </p>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" className="bg-[#0f172a] border-[#2a3349]">
                <Mail className="h-4 w-4 mr-2" />
                Send Receipt
              </Button>
              <Button variant="outline" size="sm" className="bg-[#0f172a] border-[#2a3349]">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button size="sm" className="bg-[#06b6d4] hover:bg-[#0891b2]">
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="invoice" className="space-y-4">
            <Card className="bg-[#0f172a] border-[#2a3349]">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-2">
                    <NoahLogo className="h-8 w-8" />
                    <div>
                      <h3 className="font-bold text-lg">Noah Platform</h3>
                      <p className="text-sm text-gray-400">Professional Services</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-bold">INVOICE</h2>
                    <p className="text-[#06b6d4]">{paymentData.reference}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-gray-400">Bill To:</h4>
                    <p className="font-medium">{paymentData.companyName || `Company ${paymentData.companyId}`}</p>
                    <p className="text-sm text-gray-400">123 Business St.</p>
                    <p className="text-sm text-gray-400">New York, NY 10001</p>
                    <p className="text-sm text-gray-400">contact@company.com</p>
                  </div>
                  <div className="text-right">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Invoice Date:</span>
                      <span>{formatDate(paymentData.createdDate)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Due Date:</span>
                      <span>{formatDate(paymentData.dueDate)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Status:</span>
                      <span
                        className={
                          paymentData.status === 1
                            ? "text-green-500"
                            : paymentData.status === 0
                              ? "text-amber-500"
                              : paymentData.status === 2
                                ? "text-red-500"
                                : "text-gray-500"
                        }
                      >
                        {getStatusLabel(paymentData.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <table className="w-full mb-8">
                  <thead>
                    <tr className="border-b border-[#2a3349] text-left">
                      <th className="py-2 text-gray-400">Description</th>
                      <th className="py-2 text-gray-400 text-right">Quantity</th>
                      <th className="py-2 text-gray-400 text-right">Rate</th>
                      <th className="py-2 text-gray-400 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#2a3349]">
                      <td className="py-3">{paymentData.planName || `Plan ${paymentData.planId}`}</td>
                      <td className="py-3 text-right">1</td>
                      <td className="py-3 text-right">{formatCurrency(paymentData.amount)}</td>
                      <td className="py-3 text-right">{formatCurrency(paymentData.amount)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2}></td>
                      <td className="py-3 text-right text-gray-400">Subtotal:</td>
                      <td className="py-3 text-right">{formatCurrency(paymentData.amount)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2}></td>
                      <td className="py-1 text-right text-gray-400">Tax (0%):</td>
                      <td className="py-1 text-right">$0.00</td>
                    </tr>
                    <tr>
                      <td colSpan={2}></td>
                      <td className="py-3 text-right font-semibold">Total:</td>
                      <td className="py-3 text-right font-bold">{formatCurrency(paymentData.amount)}</td>
                    </tr>
                  </tfoot>
                </table>

                <div className="border-t border-[#2a3349] pt-4">
                  <h4 className="text-sm font-semibold mb-2">Payment Method</h4>
                  <p className="text-sm text-gray-400">{getMethodLabel(paymentData.method)}</p>

                  <h4 className="text-sm font-semibold mt-4 mb-2">Notes</h4>
                  <p className="text-sm text-gray-400">Thank you for your business!</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t border-[#2a3349] py-4">
                <Button variant="outline" size="sm" className="bg-[#0f172a] border-[#2a3349]">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm" className="bg-[#0f172a] border-[#2a3349]">
                  <ArrowDownToLine className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm" className="bg-[#0f172a] border-[#2a3349]">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Invoice
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="bg-[#0f172a] border-[#2a3349]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Payment Timeline</CardTitle>
                <CardDescription className="text-gray-400">
                  History of all activities related to this payment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="w-px h-full bg-[#2a3349] my-1"></div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Payment Created</h4>
                        <Badge variant="outline" className="border-gray-500 text-gray-400">
                          System
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">Payment {paymentData.reference} was created.</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(paymentData.createdDate)}</p>
                    </div>
                  </div>

                  {paymentData.status === 1 && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                          <Check className="h-4 w-4" />
                        </div>
                        <div className="w-px h-full bg-[#2a3349] my-1"></div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Payment Received</h4>
                          <Badge variant="outline" className="border-gray-500 text-gray-400">
                            System
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          Payment of {formatCurrency(paymentData.amount)} was received via{" "}
                          {getMethodLabel(paymentData.method)}.
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {paymentData.paymentDate
                            ? formatDate(paymentData.paymentDate)
                            : formatDate(paymentData.updatedDate)}
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentData.status === 0 && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                          <Clock className="h-4 w-4" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Payment Pending</h4>
                          <Badge variant="outline" className="border-gray-500 text-gray-400">
                            System
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">Awaiting payment confirmation.</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(paymentData.updatedDate)}</p>
                      </div>
                    </div>
                  )}

                  {paymentData.status === 2 && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                          <X className="h-4 w-4" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Payment Overdue</h4>
                          <Badge variant="outline" className="border-gray-500 text-gray-400">
                            System
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">Payment is past due date. Reminder sent to client.</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(paymentData.updatedDate)}</p>
                      </div>
                    </div>
                  )}

                  {paymentData.status === 3 && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-500/20 flex items-center justify-center text-gray-500">
                          <X className="h-4 w-4" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Payment Cancelled</h4>
                          <Badge variant="outline" className="border-gray-500 text-gray-400">
                            System
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">Payment has been cancelled.</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(paymentData.updatedDate)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
