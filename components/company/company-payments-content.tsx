"use client"

import { useState } from "react"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import { Calendar, CreditCard, DollarSign, FileText, Plus, RefreshCw, Search, Edit, Trash2, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useCompanyPaymentsContext } from "@/contexts/company-payments-context"
import { CompanyPaymentModal } from "./company-payment-modal"
import { CompanyPaymentDetailsModal } from "./company-payment-details-modal"
import type { Payment } from "@/types/payment"

export function CompanyPaymentsContent() {
  const { payments, isLoading, error, statistics, fetchPayments, deletePayment } = useCompanyPaymentsContext()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment)
  }

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsEditModalOpen(true)
  }

  const handleDeletePayment = async (payment: Payment) => {
    if (window.confirm(`Are you sure you want to delete payment ${payment.reference}?`)) {
      try {
        await deletePayment(payment.id)
        // No need to call fetchPayments() as deletePayment already updates the context
      } catch (error) {
        console.error("Failed to delete payment:", error)
      }
    }
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setMethodFilter("all")
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="secondary">Pending</Badge>
      case 1:
        return <Badge variant="default">Paid</Badge>
      case 2:
        return <Badge variant="destructive">Overdue</Badge>
      case 3:
        return <Badge variant="outline">Cancelled</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getMethodBadge = (method: number) => {
    switch (method) {
      case 0:
        return <Badge variant="outline">Credit Card</Badge>
      case 1:
        return <Badge variant="outline">Debit Card</Badge>
      case 2:
        return <Badge variant="outline">Bank Transfer</Badge>
      case 3:
        return <Badge variant="outline">PIX</Badge>
      default:
        return <Badge variant="outline">Other</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      searchTerm === "" ||
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.planName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || payment.status.toString() === statusFilter
    const matchesMethod = methodFilter === "all" || payment.method.toString() === methodFilter

    return matchesSearch && matchesStatus && matchesMethod
  })

  const totalAmount = statistics?.totalAmount || 0
  const paidAmount = statistics?.completedAmount || 0
  const pendingAmount = statistics?.pendingAmount || 0

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading payments: {error.message}</p>
          <Button onClick={() => fetchPayments()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Manage your company payments and invoices</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => fetchPayments()} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Payment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">All payments combined</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</div>
            <p className="text-xs text-muted-foreground">Successfully received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter payments by status, method and search terms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by reference, company, plan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="0">Pending</SelectItem>
                  <SelectItem value="1">Paid</SelectItem>
                  <SelectItem value="2">Overdue</SelectItem>
                  <SelectItem value="3">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="method">Payment Method</Label>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="0">Credit Card</SelectItem>
                  <SelectItem value="1">Debit Card</SelectItem>
                  <SelectItem value="2">Bank Transfer</SelectItem>
                  <SelectItem value="3">PIX</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>A list of all payments for your company</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No payments found</p>
                        <Button onClick={() => setIsCreateModalOpen(true)} variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Create First Payment
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.reference}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{getMethodBadge(payment.method)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        {payment.dueDate
                          ? format(new Date(payment.dueDate), "MMM dd, yyyy", { locale: enUS })
                          : "No due date"}
                      </TableCell>
                      <TableCell>
                        {payment.paymentDate
                          ? format(new Date(payment.paymentDate), "MMM dd, yyyy", { locale: enUS })
                          : "Not paid"}
                      </TableCell>
                      <TableCell>{format(new Date(payment.createdDate), "MMM dd, yyyy", { locale: enUS })}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <CompanyPaymentDetailsModal paymentId={payment.id} paymentData={payment}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View details</span>
                            </Button>
                          </CompanyPaymentDetailsModal>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditPayment(payment)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit payment</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => handleDeletePayment(payment)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete payment</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CompanyPaymentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          // No need to call fetchPayments() as addPayment already updates the context
        }}
      />

      {selectedPayment && (
        <CompanyPaymentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedPayment(null)
          }}
          onSuccess={() => {
            setIsEditModalOpen(false)
            setSelectedPayment(null)
            // No need to call fetchPayments() as editPayment already updates the context
          }}
          editPayment={selectedPayment}
        />
      )}
    </div>
  )
}
