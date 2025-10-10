"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Search,
  User,
  Users,
  Building,
  Calendar,
  Phone,
  Mail,
  Download,
  ArrowUpDown,
  Trash2,
  RefreshCw,
} from "lucide-react"
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
import ClientModal from "@/components/company/client-modal"
import ClientDetailsModal from "@/components/company/client-details-modal"
import { useAuth } from "@/contexts/auth-context"
import { customersApi } from "@/lib/api/customers"
import { toast } from "@/components/ui/use-toast"
import type { Customer } from "@/types/customer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ClientsPage() {
  const { user } = useAuth()
  const [clients, setClients] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")
  const [currentTab, setCurrentTab] = useState("all")

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Customer | null>(null)

  // Delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch clients from API
  useEffect(() => {
    const fetchClients = async () => {
      if (!user?.companyId) return

      try {
        setLoading(true)
        const response = await customersApi.getAll({
          companyId: user.companyId.toString(),
          pageNumber: 1,
          pageSize: 100,
        })
        setClients(response.results || [])
      } catch (error) {
        console.error("Error fetching clients:", error)
        toast({
          title: "Error",
          description: "Failed to load clients",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [user?.companyId])

  // Transform Customer to Client format for compatibility
  const transformedClients = clients.map((customer) => ({
    id: Number.parseInt(customer.id),
    name: customer.name,
    type: customer.ssn ? "individual" : "unknown",
    ssn: customer.ssn,
    email: customer.email,
    phone: customer.phone,
    addresses: [
      {
        id: 1,
        street: customer.address,
        city: "City", // API doesn't provide separate city
        state: "State", // API doesn't provide separate state
        zipCode: "00000", // API doesn't provide zipCode
        isDefault: true,
      },
    ],
    appointments: 0, // Would need to fetch from appointments API
    totalSpent: 0, // Would need to calculate from appointments
    lastService: null, // Would need to fetch from appointments API
    status: customer.status === 1 ? "active" : "inactive",
    createdAt: customer.createdDate,
    notes: "",
  }))

  // Filter and sort clients
  const filteredClients = transformedClients
    .filter((client) => {
      // Search filter
      const matchesSearch =
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.ssn.includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm)

      // Status filter
      const matchesStatus = statusFilter === "all" || client.status === statusFilter

      // Type filter
      const matchesType = typeFilter === "all" || client.type === typeFilter

      // Tab filter
      const matchesTab =
        currentTab === "all" ||
        (currentTab === "active" && client.status === "active") ||
        (currentTab === "inactive" && client.status === "inactive") ||
        (currentTab === "business" && client.type === "business") ||
        (currentTab === "individual" && client.type === "individual")

      return matchesSearch && matchesStatus && matchesType && matchesTab
    })
    .sort((a, b) => {
      // Sort logic
      if (sortField === "name") {
        return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      } else if (sortField === "appointments") {
        return sortDirection === "asc" ? a.appointments - b.appointments : b.appointments - a.appointments
      } else if (sortField === "totalSpent") {
        return sortDirection === "asc" ? a.totalSpent - b.totalSpent : b.totalSpent - a.totalSpent
      } else if (sortField === "lastService") {
        // Handle null values for lastService
        if (!a.lastService) return sortDirection === "asc" ? -1 : 1
        if (!b.lastService) return sortDirection === "asc" ? 1 : -1

        return sortDirection === "asc"
          ? new Date(a.lastService).getTime() - new Date(b.lastService).getTime()
          : new Date(b.lastService).getTime() - new Date(a.lastService).getTime()
      }
      return 0
    })

  // Statistics
  const totalClients = transformedClients.length
  const activeClients = transformedClients.filter((c) => c.status === "active").length
  const businessClients = transformedClients.filter((c) => c.type === "business").length
  const individualClients = transformedClients.filter((c) => c.type === "individual").length
  const totalAppointments = transformedClients.reduce((sum, client) => sum + client.appointments, 0)
  const totalRevenue = transformedClients.reduce((sum, client) => sum + client.totalSpent, 0)

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

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

  // Handle client selection for details or edit
  const handleViewDetails = (client: any) => {
    setSelectedClient(client)
    setIsDetailsModalOpen(true)
  }

  const handleEditClient = (client: any) => {
    setSelectedClient(client)
    setIsEditModalOpen(true)
  }

  const handleAddClient = () => {
    setSelectedClient(null)
    setIsAddModalOpen(true)
  }

  // Handle delete client
  const handleDeleteClient = (client: any) => {
    setClientToDelete(client)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return

    try {
      setIsDeleting(true)
      await customersApi.delete(clientToDelete.id)

      // Remove client from local state
      setClients((prev) => prev.filter((c) => Number.parseInt(c.id) !== clientToDelete.id))

      toast({
        title: "Client deleted",
        description: `${clientToDelete.name} has been deleted successfully.`,
      })

      await handleRefresh() // Use handleRefresh instead of handleClientSaved
    } catch (error) {
      console.error("Error deleting client:", error)
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setClientToDelete(null)
    }
  }

  // Handle client creation/update
  const handleClientSaved = async () => {
    // Refresh clients list
    if (!user?.companyId) return

    try {
      const response = await customersApi.getAll({
        companyId: user.companyId.toString(),
        pageNumber: 1,
        pageSize: 100,
      })
      setClients(response.results || [])
    } catch (error) {
      console.error("Error refreshing clients:", error)
    }
  }

  const handleRefresh = async () => {
    await handleClientSaved()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-foreground">Loading clients...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Client Management</h1>
          <p className="text-muted-foreground">Manage your client database and view their service history</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="border-border text-foreground hover:bg-muted bg-transparent"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button className="bg-[#06b6d4] hover:bg-[#0891b2] text-white" onClick={handleAddClient}>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-[#06b6d4]" />
              Total Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalClients}</div>
            <p className="text-muted-foreground text-sm">Across all categories</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-lg flex items-center">
              <User className="h-5 w-5 mr-2 text-green-500" />
              Active Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activeClients}</div>
            <p className="text-muted-foreground text-sm">
              {totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0}% of total clients
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-lg flex items-center">
              <Building className="h-5 w-5 mr-2 text-amber-500" />
              Business Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{businessClients}</div>
            <p className="text-muted-foreground text-sm">{individualClients} individual clients</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-500" />
              Total Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalAppointments}</div>
            <p className="text-muted-foreground text-sm">
              Avg {totalClients > 0 ? (totalAppointments / totalClients).toFixed(1) : 0} per client
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <Tabs defaultValue="all" className="w-full" onValueChange={setCurrentTab}>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <TabsList className="bg-muted">
                <TabsTrigger value="all" className="data-[state=active]:bg-[#06b6d4] data-[state=active]:text-white">
                  All Clients
                </TabsTrigger>
                <TabsTrigger value="active" className="data-[state=active]:bg-[#06b6d4] data-[state=active]:text-white">
                  Active
                </TabsTrigger>
                <TabsTrigger
                  value="inactive"
                  className="data-[state=active]:bg-[#06b6d4] data-[state=active]:text-white"
                >
                  Inactive
                </TabsTrigger>
                <TabsTrigger
                  value="business"
                  className="data-[state=active]:bg-[#06b6d4] data-[state=active]:text-white"
                >
                  Business
                </TabsTrigger>
                <TabsTrigger
                  value="individual"
                  className="data-[state=active]:bg-[#06b6d4] data-[state=active]:text-white"
                >
                  Individual
                </TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clients..."
                    className="pl-8 bg-muted border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-[#06b6d4] w-full sm:w-[200px] md:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px] bg-muted border-0 text-foreground focus:ring-[#06b6d4]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all" className="text-foreground focus:bg-muted focus:text-foreground">
                      All Status
                    </SelectItem>
                    <SelectItem value="active" className="text-foreground focus:bg-muted focus:text-foreground">
                      Active
                    </SelectItem>
                    <SelectItem value="inactive" className="text-foreground focus:bg-muted focus:text-foreground">
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[120px] bg-muted border-0 text-foreground focus:ring-[#06b6d4]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all" className="text-foreground focus:bg-muted focus:text-foreground">
                      All Types
                    </SelectItem>
                    <SelectItem value="business" className="text-foreground focus:bg-muted focus:text-foreground">
                      Business
                    </SelectItem>
                    <SelectItem value="individual" className="text-foreground focus:bg-muted focus:text-foreground">
                      Individual
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  className="border-border bg-transparent text-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setTypeFilter("all")
                    setCurrentTab("all")
                  }}
                >
                  Clear
                </Button>

                <Button
                  variant="outline"
                  className="border-border bg-transparent text-foreground hover:bg-muted hover:text-foreground"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </Tabs>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("name")}>
                      Client
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Contact</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("appointments")}>
                      Appointments
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("totalSpent")}>
                      Total Spent
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("lastService")}>
                      Last Service
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="border-b border-border hover:bg-muted">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div
                            className={`p-2 rounded-full mr-3 ${client.type === "business" ? "bg-amber-500/20" : "bg-blue-500/20"}`}
                          >
                            {client.type === "business" ? (
                              <Building
                                className={`h-5 w-5 ${client.type === "business" ? "text-amber-500" : "text-blue-500"}`}
                              />
                            ) : (
                              <User
                                className={`h-5 w-5 ${client.type === "business" ? "text-amber-500" : "text-blue-500"}`}
                              />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{client.name}</div>
                            <div className="text-sm text-muted-foreground">{client.ssn}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-muted-foreground text-sm">
                            <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                            {client.email}
                          </div>
                          <div className="flex items-center text-muted-foreground text-sm">
                            <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                            {client.phone}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            client.type === "business"
                              ? "bg-amber-500/20 text-amber-500 border-amber-500"
                              : "bg-blue-500/20 text-blue-500 border-blue-500"
                          }
                        >
                          {client.type === "business" ? "Business" : "Individual"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{client.appointments}</td>
                      <td className="py-3 px-4 text-muted-foreground">${client.totalSpent.toFixed(2)}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {client.lastService ? new Date(client.lastService).toLocaleDateString() : "Never"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            client.status === "active"
                              ? "bg-green-500/20 text-green-500 border-green-500"
                              : "bg-gray-500/20 text-gray-400 border-gray-500"
                          }
                        >
                          {client.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-border text-foreground hover:bg-muted bg-transparent"
                            onClick={() => handleViewDetails(client)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-border text-foreground hover:bg-muted bg-transparent"
                            onClick={() => handleEditClient(client)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-red-500 text-red-500 hover:bg-red-500/10 hover:text-red-500 bg-transparent"
                            onClick={() => handleDeleteClient(client)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-muted-foreground">
                      No clients found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Client Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <ClientModal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => {
            setIsAddModalOpen(false)
            setIsEditModalOpen(false)
          }}
          client={selectedClient}
          isEditing={isEditModalOpen}
          onSaved={handleClientSaved}
        />
      )}

      {/* Client Details Modal */}
      {isDetailsModalOpen && selectedClient && (
        <ClientDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          client={selectedClient}
          onEdit={() => {
            setIsDetailsModalOpen(false)
            setIsEditModalOpen(true)
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Client</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{clientToDelete?.name}</span>? This action cannot be undone
              and will permanently remove all client data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border text-foreground hover:bg-muted bg-transparent"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteClient}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Client"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
