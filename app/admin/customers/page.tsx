"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Eye, Edit, Trash2, RefreshCw } from "lucide-react"
import { CustomerModal } from "@/components/admin/customer-modal"
import { CustomerDetailsModal } from "@/components/admin/customer-details-modal"
import { useCustomers } from "@/hooks/use-customers"
import { useCompanies } from "@/hooks/use-companies"
import type { Customer } from "@/types/customer"

export default function CustomersPage() {
  const { state, setFilters, deleteCustomer, fetchCustomers } = useCustomers()
  const { companies, fetchCompanies } = useCompanies()

  const [modalOpen, setModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [companyFilter, setCompanyFilter] = useState<string>("all")

  // Load companies only once
  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const normalizePhone = (raw?: string | null) => {
    const digits = (raw || "").replace(/\D/g, "")
    if (!digits) return null
    let d = digits.replace(/^0+/, "")
    if (!d.startsWith("55") && d.length <= 12) d = "55" + d
    return d
  }

  const buildOnMyWayMessage = (customer: any) => {
    const name = customer?.name || ""
    const companyName =
      customer?.company?.name || (typeof window !== "undefined" ? localStorage.getItem("company_name") || "our" : "our")
    const etaText = "a few minutes" // fixed text, no prompt
    return `Hi ${name}, hope your having a nice day. Your ${companyName} team is on the way, ${etaText} from your house`
  }

  const handleOnMyWay = (customer: any) => {
    const phone = normalizePhone(customer?.phone)
    if (!phone) {
      alert("Client phone not available.")
      return
    }
    const message = buildOnMyWayMessage(customer)
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    if (typeof window !== "undefined") window.open(url, "_blank")
  }

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setFilters({
        search: searchTerm,
        status: statusFilter,
        companyId: companyFilter === "all" ? undefined : Number(companyFilter),
      })
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm, statusFilter, companyFilter, setFilters])

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setModalOpen(true)
  }

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer)
    setDetailsModalOpen(true)
  }

  const handleDelete = (customer: Customer) => {
    setCustomerToDelete(customer)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (customerToDelete) {
      await deleteCustomer(customerToDelete.id)
      setDeleteDialogOpen(false)
      setCustomerToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedCustomer(null)
  }

  const handleDetailsModalClose = () => {
    setDetailsModalOpen(false)
    setSelectedCustomer(null)
  }

  const handleRefresh = () => {
    fetchCustomers()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage system customers</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={() => {
              setSelectedCustomer(null)
              setModalOpen(true)
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Customer
          </Button>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-card via-card to-muted/20 border-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-card-foreground">Filters</CardTitle>
          <CardDescription className="text-muted-foreground">
            Use the filters below to find specific customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, document or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-[200px] flex h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All companies</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-[150px] flex h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card via-card to-muted/20 border-border shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/50">
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">SSN</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Phone</TableHead>
                <TableHead className="text-muted-foreground">Company</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Created at</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : state.error ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-destructive">
                    Error: {state.error}
                  </TableCell>
                </TableRow>
              ) : state.customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                state.customers.map((customer) => (
                  <TableRow key={customer.id} className="border-border hover:bg-muted/50">
                    <TableCell className="text-foreground font-medium">{customer.name}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.ssn || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.phone || "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.company?.name || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={customer.status === 1 ? "default" : "secondary"}>
                        {customer.status === 1 ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(customer.createdDate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleView(customer)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(customer)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(customer)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CustomerModal open={modalOpen} onOpenChange={handleModalClose} customer={selectedCustomer} />

      <CustomerDetailsModal
        open={detailsModalOpen}
        onOpenChange={handleDetailsModalClose}
        customer={selectedCustomer}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-card-foreground">Confirm deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete the customer "{customerToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
