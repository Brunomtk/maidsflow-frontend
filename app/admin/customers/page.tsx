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
import { MoreHorizontal, Plus, Search, Eye, Edit, Trash2, RefreshCw } from "lucide-react"
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

  const handleOnMyWay = (customer: any) => {
    const phone = normalizePhone(customer.phone)
    if (!phone) {
      alert("Client phone not available."); 
      return
    }
    const companyName = customer.company?.name || (typeof window !== "undefined" ? (localStorage.getItem("company_name") || "our") : "our")
    const eta = typeof window !== "undefined" ? (window.prompt("Inform the ETA (e.g., 15 minutes):") || "") : ""
    const name = customer.name || ""
    const message = `Hi ${name}, hope your having a nice day. Your ${companyName} team is on the way, ${eta} from your house`
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    if (typeof window !== "undefined") window.open(url, "_blank")
  }
// Handle filter changes with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setFilters({
        search: searchTerm,
        status: statusFilter,
        companyId: companyFilter === "all" ? undefined : Number(companyFilter),
      })
    }, 500)

    
  const normalizePhone = (raw?: string | null) => {
    const digits = (raw || "").replace(/\D/g, "")
    if (!digits) return null
    let d = digits.replace(/^0+/, "")
    if (!d.startsWith("55") && d.length <= 12) d = "55" + d
    return d
  }

  const buildOnMyWayMessage = (customer: any) => {
    const name = customer?.name || ""
    const companyName = customer?.company?.name || (typeof window !== "undefined" ? (localStorage.getItem("company_name") || "our") : "our")
    const etaText = "a few minutes" // fixed text, no prompt
    return `Hi ${name}, hope your having a nice day. Your ${companyName} team is on the way, ${etaText} from your house`
  }

  const handleOnMyWay = (customer: any) => {
    const phone = normalizePhone(customer?.phone)
    if (!phone) { alert("Client phone not available."); return }
    const message = buildOnMyWayMessage(customer)
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    if (typeof window !== "undefined") window.open(url, "_blank")
  }
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
          <h1 className="text-3xl font-bold text-white">Customers</h1>
          <p className="text-gray-400">Manage system customers</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="bg-[#0f172a] border-[#2a3349] text-white hover:bg-[#2a3349]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={() => {
              setSelectedCustomer(null)
              setModalOpen(true)
            }}
            className="bg-[#06b6d4] hover:bg-[#0891b2]"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Customer
          </Button>
        </div>
      </div>

      <Card className="bg-[#1a2234] border-[#2a3349]">
        <CardHeader>
          <CardTitle className="text-white">Filters</CardTitle>
          <CardDescription className="text-gray-400">Use the filters below to find specific customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, document or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#0f172a] border-[#2a3349] text-white"
                />
              </div>
            </div>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-[200px] flex h-10 rounded-md border border-[#2a3349] bg-[#0f172a] px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="w-[150px] flex h-10 rounded-md border border-[#2a3349] bg-[#0f172a] px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a2234] border-[#2a3349]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#2a3349] hover:bg-[#1a2234]">
                <TableHead className="text-gray-300">Name</TableHead>
                <TableHead className="text-gray-300">SSN</TableHead>
                <TableHead className="text-gray-300">Email</TableHead>
                <TableHead className="text-gray-300">Phone</TableHead>
                <TableHead className="text-gray-300">Company</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Created at</TableHead>
                <TableHead className="text-gray-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : state.error ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-red-400">
                    Error: {state.error}
                  </TableCell>
                </TableRow>
              ) : state.customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                state.customers.map((customer) => (
                  <TableRow key={customer.id} className="border-[#2a3349] hover:bg-[#0f172a]">
                    <TableCell className="text-white font-medium">{customer.name}</TableCell>
                    <TableCell className="text-gray-300">{customer.ssn || "—"}</TableCell>
                    <TableCell className="text-gray-300">{customer.email}</TableCell>
                    <TableCell className="text-gray-300">{customer.phone || "N/A"}</TableCell>
                    <TableCell className="text-gray-300">{customer.company?.name || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={customer.status === 1 ? "default" : "secondary"}>
                        {customer.status === 1 ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">{formatDate(customer.createdDate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(customer)}
                          className="text-gray-400 hover:text-white hover:bg-[#2a3349]"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(customer)}
                          className="text-gray-400 hover:text-white hover:bg-[#2a3349]"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(customer)}
                          className="text-gray-400 hover:text-red-400 hover:bg-[#2a3349]"
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
        <AlertDialogContent className="bg-[#1a2234] border-[#2a3349]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirm deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete the customer "{customerToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#0f172a] border-[#2a3349] text-white hover:bg-[#2a3349]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
