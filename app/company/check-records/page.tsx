"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Eye, Edit, Trash2, Clock, CheckCircle, XCircle, LogIn, LogOut } from "lucide-react"
import { CheckRecordModal } from "@/components/company/check-record-modal"
import { CheckRecordDetailsModal } from "@/components/company/check-record-details-modal"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { fetchApi } from "@/lib/api/config"
import { performCheckIn, performCheckOut } from "@/lib/api/check-records"
import { customersApi } from "@/lib/api/customers"
import { createPayment } from "@/lib/api/payments"
import { useToast } from "@/hooks/use-toast"

interface CheckRecord {
  id: number
  professionalId: number
  professionalName: string
  companyId: number
  customerId: number
  customerName: string
  appointmentId: number
  address: string
  teamId: number | null
  teamName: string | null
  checkInTime: string | null
  checkOutTime: string | null
  status: number
  serviceType: string
  notes: string
  createdDate: string
  updatedDate: string
}

interface CheckRecordsResponse {
  results: CheckRecord[]
  currentPage: number
  pageCount: number
  pageSize: number
  totalItems: number
  firstRowOnPage: number
  lastRowOnPage: number
}

const statusMap = {
  0: { label: "Pending", color: "bg-yellow-500", icon: Clock },
  1: { label: "Checked In", color: "bg-blue-500", icon: CheckCircle },
  2: { label: "Completed", color: "bg-green-500", icon: CheckCircle },
  3: { label: "Cancelled", color: "bg-red-500", icon: XCircle },
}

export default function CheckRecordsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [checkRecords, setCheckRecords] = useState<CheckRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<CheckRecord | null>(null)

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [customerData, setCustomerData] = useState<any>(null)
  const [paymentForm, setPaymentForm] = useState<{
    paid: boolean
    amount: string
    method: string
    reference: string
  }>({
    paid: true,
    amount: "",
    method: "",
    reference: "",
  })

  const fetchCheckRecords = async () => {
    if (!user?.companyId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        CompanyId: user.companyId.toString(),
        PageNumber: currentPage.toString(),
        PageSize: "10",
      })

      if (searchTerm) params.append("Search", searchTerm)
      if (statusFilter) params.append("Status", statusFilter)
      if (serviceTypeFilter) params.append("ServiceType", serviceTypeFilter)

      const data: CheckRecordsResponse = await fetchApi(`CheckRecord?${params}`)
      setCheckRecords(data.results)
      setTotalPages(data.pageCount)
      setTotalItems(data.totalItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCheckRecords()
  }, [user?.companyId, currentPage, searchTerm, statusFilter, serviceTypeFilter])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value === "all" ? "" : value)
    setCurrentPage(1)
  }

  const handleServiceTypeFilter = (value: string) => {
    setServiceTypeFilter(value === "all" ? "" : value)
    setCurrentPage(1)
  }

  const handleViewDetails = (record: CheckRecord) => {
    setSelectedRecord(record)
    setIsDetailsModalOpen(true)
  }

  const handleEdit = (record: CheckRecord) => {
    setSelectedRecord(record)
    setIsCreateModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!user?.token) return
    if (!confirm("Are you sure you want to delete this check record?")) return

    try {
      await fetchApi(`CheckRecord/${id}`, {
        method: "DELETE",
      })
      fetchCheckRecords()
    } catch (err) {
      console.error("Error deleting check record:", err)
    }
  }

  const handleCheckIn = async (record: CheckRecord) => {
    if (!user?.token) return

    try {
      await fetchApi(`CheckRecord/${record.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...record,
          status: 1, // Checked In
          checkInTime: new Date().toISOString(),
        }),
      })

      try {
        const checkInData = {
          professionalId: record.professionalId,
          professionalName: record.professionalName || "",
          companyId: record.companyId,
          customerId: record.customerId,
          customerName: record.customerName || "",
          appointmentId: record.appointmentId,
          address: record.address,
          teamId: record.teamId || null,
          teamName: record.teamName || null,
          serviceType: record.serviceType,
          notes: record.notes || "",
        }

        await performCheckIn(checkInData)
      } catch (gpsError) {
        console.error("GPS tracking creation failed:", gpsError)
      }

      toast({
        title: "Check-in realizado",
        description: "Check-in realizado com sucesso",
      })

      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (err) {
      console.error("Error checking in:", err)
      setError("Failed to check in")
      toast({
        title: "Erro",
        description: "Falha ao realizar check-in",
        variant: "destructive",
      })
    }
  }

  const handleCheckOut = async (record: CheckRecord) => {
    if (!user?.token || !record.id) return

    try {
      await performCheckOut(record.id.toString())

      toast({
        title: "Check-out realizado",
        description: "Abrindo confirmação de pagamento...",
      })

      await openPaymentDialogPrefilled(record)
    } catch (err) {
      console.error("Error checking out:", err)
      setError("Failed to check out")
      toast({
        title: "Erro",
        description: "Falha ao realizar check-out",
        variant: "destructive",
      })
    }
  }

  async function openPaymentDialogPrefilled(record: CheckRecord) {
    try {
      console.log("[v0] Fetching customer data for ID:", record.customerId)
      setSelectedRecord(record)

      const customer = await customersApi.getById(Number(record.customerId))
      console.log("[v0] Customer data fetched:", customer)

      setCustomerData(customer)

      const defaultAmount = (customer as any)?.ticket != null ? String((customer as any).ticket) : ""
      const defaultMethod = (customer as any)?.paymentMethod != null ? String((customer as any).paymentMethod) : ""

      console.log("[v0] Default amount (ticket):", defaultAmount)
      console.log("[v0] Default method:", defaultMethod)

      setPaymentForm({
        paid: true,
        amount: defaultAmount,
        method: defaultMethod,
        reference: `Appointment #${record.appointmentId} - ${(customer as any)?.name || record.customerName || ""}`,
      })
    } catch (error) {
      console.error("[v0] Error fetching customer data:", error)
      setCustomerData(null)
      setPaymentForm({
        paid: true,
        amount: "",
        method: "",
        reference: `Appointment #${record.appointmentId} - ${record.customerName || ""}`,
      })
    } finally {
      setPaymentDialogOpen(true)
    }
  }

  const handlePaymentConfirmation = async () => {
    if (!selectedRecord) {
      setPaymentDialogOpen(false)
      return
    }

    if (!paymentForm.paid) {
      setPaymentDialogOpen(false)
      setSelectedRecord(null)
      toast({
        title: "Pagamento registrado",
        description: "Pagamento não recebido foi registrado",
      })
      setTimeout(() => {
        window.location.reload()
      }, 500)
      return
    }

    setPaymentLoading(true)
    try {
      const nowIso = new Date().toISOString()
      let planId: number | undefined = undefined

      try {
        const customer = await customersApi.getById(Number(selectedRecord.customerId))
        planId = (customer as any)?.company?.planId ?? undefined
      } catch {}

      await createPayment({
        companyId: Number(selectedRecord.companyId || user?.companyId || 1),
        amount: Number(paymentForm.amount),
        dueDate: nowIso,
        paymentDate: nowIso,
        status: 1, // Paid
        method: Number(paymentForm.method) as any,
        reference: paymentForm.reference || `Appointment #${selectedRecord.appointmentId}`,
        ...(planId ? { planId } : {}),
      } as any)

      setPaymentDialogOpen(false)
      setSelectedRecord(null)
      toast({
        title: "Pagamento criado",
        description: "O pagamento foi registrado com sucesso",
      })

      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (err) {
      console.error("Failed to create payment:", err)
      toast({
        title: "Erro",
        description: "Falha ao criar pagamento",
        variant: "destructive",
      })
    } finally {
      setPaymentLoading(false)
    }
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadge = (status: number) => {
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap[0]
    const Icon = statusInfo.icon

    return (
      <Badge className={`${statusInfo.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {statusInfo.label}
      </Badge>
    )
  }

  if (!user?.companyId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to view check records.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Check Records</h1>
          <p className="text-muted-foreground">Manage and track service check records</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Check Record
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search check records..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-background border-border"
                />
              </div>
            </div>
            <Select value={statusFilter || "all"} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-background border-border">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="0">Pending</SelectItem>
                <SelectItem value="1">Checked In</SelectItem>
                <SelectItem value="2">Completed</SelectItem>
                <SelectItem value="3">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={serviceTypeFilter || "all"} onValueChange={handleServiceTypeFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-background border-border">
                <SelectValue placeholder="Filter by service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Service Types</SelectItem>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Check Records ({totalItems})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-destructive">{error}</p>
            </div>
          ) : checkRecords.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No check records found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Professional</TableHead>
                      <TableHead className="text-muted-foreground">Customer</TableHead>
                      <TableHead className="text-muted-foreground">Address</TableHead>
                      <TableHead className="text-muted-foreground">Team</TableHead>
                      <TableHead className="text-muted-foreground">Service Type</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Check In</TableHead>
                      <TableHead className="text-muted-foreground">Check Out</TableHead>
                      <TableHead className="text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checkRecords.map((record) => (
                      <TableRow key={record.id} className="border-border hover:bg-muted/50">
                        <TableCell className="font-medium text-foreground">
                          {record.professionalName || "N/A"}
                        </TableCell>
                        <TableCell className="text-foreground">{record.customerName || "N/A"}</TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground">
                          {record.address || "N/A"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{record.teamName || "N/A"}</TableCell>
                        <TableCell className="text-muted-foreground">{record.serviceType || "N/A"}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDateTime(record.checkInTime)}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDateTime(record.checkOutTime)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {record.status === 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCheckIn(record)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <LogIn className="w-4 h-4" />
                              </Button>
                            )}
                            {record.status === 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCheckOut(record)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <LogOut className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(record)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(record.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems}{" "}
                    results
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CheckRecordModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setSelectedRecord(null)
        }}
        onSuccess={() => {
          fetchCheckRecords()
          setIsCreateModalOpen(false)
          setSelectedRecord(null)
        }}
        record={selectedRecord}
      />

      <CheckRecordDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedRecord(null)
        }}
        record={selectedRecord}
      />

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md bg-[#1a2234] border-[#2a3349] text-white">
          <DialogHeader>
            <DialogTitle>Confirmação de Pagamento</DialogTitle>
            <DialogDescription className="text-gray-400">
              O pagamento foi recebido de {customerData?.name || selectedRecord?.customerName || "este cliente"}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {customerData && (
              <div className="p-3 bg-[#0f172a] rounded-lg border border-[#2a3349] space-y-2">
                <h4 className="text-sm font-semibold text-cyan-400">Informações do Cliente</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400">Nome:</p>
                    <p className="font-medium">{customerData.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Email:</p>
                    <p className="font-medium">{customerData.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Telefone:</p>
                    <p className="font-medium">{customerData.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Ticket Médio:</p>
                    <p className="font-medium text-green-400">${customerData.ticket || "0"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Frequência:</p>
                    <p className="font-medium">{customerData.frequency || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Endereço:</p>
                    <p className="font-medium truncate">{customerData.address || "N/A"}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium leading-none">Pagamento recebido?</p>
                <p className="text-xs text-gray-400">Confirme se o cliente pagou pelo serviço.</p>
              </div>
              <Switch checked={paymentForm.paid} onCheckedChange={(v) => setPaymentForm((f) => ({ ...f, paid: v }))} />
            </div>

            {paymentForm.paid && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="pay-amount" className="text-white">
                      Valor * <span className="text-xs text-gray-400">(editável)</span>
                    </Label>
                    <Input
                      id="pay-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))}
                      className="bg-[#0f172a] border-[#2a3349] text-white"
                    />
                    {customerData?.ticket && (
                      <p className="text-xs text-gray-400 mt-1">Ticket médio: ${customerData.ticket}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="pay-method" className="text-white">
                      Método *
                    </Label>
                    <Select
                      value={paymentForm.method}
                      onValueChange={(v) => setPaymentForm((f) => ({ ...f, method: v }))}
                    >
                      <SelectTrigger id="pay-method" className="bg-[#0f172a] border-[#2a3349] text-white">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Cartão de Crédito</SelectItem>
                        <SelectItem value="1">Cartão de Débito</SelectItem>
                        <SelectItem value="2">Transferência</SelectItem>
                        <SelectItem value="3">Pix</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="pay-ref" className="text-white">
                    Referência
                  </Label>
                  <Input
                    id="pay-ref"
                    placeholder="Referência do pagamento"
                    value={paymentForm.reference}
                    onChange={(e) => setPaymentForm((f) => ({ ...f, reference: e.target.value }))}
                    className="bg-[#0f172a] border-[#2a3349] text-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setPaymentDialogOpen(false)
                setSelectedRecord(null)
                setCustomerData(null)
                setTimeout(() => {
                  window.location.reload()
                }, 500)
              }}
              className="bg-transparent border-[#2a3349] text-white hover:bg-[#2a3349]"
            >
              Pular
            </Button>
            <Button
              disabled={paymentLoading || (paymentForm.paid && (!paymentForm.amount || !paymentForm.method))}
              onClick={handlePaymentConfirmation}
              className="flex-1 bg-[#06b6d4] hover:bg-[#0891b2]"
            >
              {paymentLoading ? "Processando..." : "Confirmar & Criar Pagamento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
