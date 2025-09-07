"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Eye, Edit, Trash2, Filter, Download, AlertCircle } from "lucide-react"
import { usePaymentsContext } from "@/contexts/payments-context"
import { PaymentModal } from "@/components/admin/payment-modal"
import { PaymentDetailsModal } from "@/components/admin/payment-details-modal"
import type { Payment } from "@/types/payment"
import { Skeleton } from "@/components/ui/skeleton"

export default function PaymentsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const {
    payments,
    isLoading,
    error,
    pagination,
    filters,
    selectedPayment,
    fetchPayments,
    setFilters,
    selectPayment,
    removePayment,
  } = usePaymentsContext()

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleViewDetails = (payment: Payment) => {
    selectPayment(payment)
    setIsDetailsModalOpen(true)
  }

  const handleEdit = (payment: Payment) => {
    selectPayment(payment)
    setIsEditModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      removePayment(id)
    }
  }

  const getStatusBadge = (status: number) => {
    const statuses = {
      0: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300" },
      1: { label: "Paid", className: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" },
      2: { label: "Overdue", className: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300" },
      3: { label: "Cancelled", className: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" },
    }
    const { label, className } = statuses[status as keyof typeof statuses] || {
      label: "Unknown",
      className: "bg-gray-200",
    }
    return <Badge className={className}>{label}</Badge>
  }

  const getMethodLabel = (method: number) => {
    const methods = { 0: "Credit Card", 1: "Debit Card", 2: "Bank Transfer", 3: "PIX" }
    return methods[method as keyof typeof methods] || "Unknown"
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount)
  const formatDate = (dateString: string | null) =>
    dateString ? new Date(dateString).toLocaleDateString("pt-BR") : "N/A"

  const TableSkeleton = () => (
    <TableBody>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Manage payment records and transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Payment
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by reference, company..."
                value={filters.search || ""}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.status?.toString() || "all"}
              onValueChange={(v) => setFilters({ status: v === "all" ? undefined : Number(v) })}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="0">Pending</SelectItem>
                <SelectItem value="1">Paid</SelectItem>
                <SelectItem value="2">Overdue</SelectItem>
                <SelectItem value="3">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
          <CardDescription>
            {pagination.totalItems > 0
              ? `Showing ${pagination.firstRowOnPage}-${pagination.lastRowOnPage} of ${pagination.totalItems} payments`
              : "No payments found"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              {isLoading ? (
                <TableSkeleton />
              ) : error ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <AlertCircle className="mx-auto h-6 w-6 text-red-500 mb-2" />
                      <p className="text-red-500">Error: {error.message}</p>
                      <Button variant="outline" size="sm" className="mt-4 bg-transparent" onClick={fetchPayments}>
                        Try Again
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : payments.length > 0 ? (
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.reference}</TableCell>
                      <TableCell>{payment.companyName || `ID: ${payment.companyId}`}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                      <TableCell>{getMethodLabel(payment.method)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleViewDetails(payment)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(payment)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(payment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No payments found.
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </div>
          {pagination.pageCount > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.pageCount}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ page: pagination.currentPage - 1 })}
                  disabled={pagination.currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ page: pagination.currentPage + 1 })}
                  disabled={pagination.currentPage === pagination.pageCount}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <PaymentModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} mode="create" />
      {isEditModalOpen && selectedPayment && (
        <PaymentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          mode="edit"
          payment={selectedPayment}
        />
      )}
      {isDetailsModalOpen && selectedPayment && (
        <PaymentDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          payment={selectedPayment}
        />
      )}
    </div>
  )
}
