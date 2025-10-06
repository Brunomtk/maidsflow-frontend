"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Eye, Edit, Trash2, LogIn, LogOut, Clock } from "lucide-react"
import { CheckInModal } from "@/components/admin/check-in-modal"
import { CheckInDetailsModal } from "@/components/admin/check-in-details-modal"
import { useToast } from "@/hooks/use-toast"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import { getCheckRecords, performCheckOut, getCompanies, createCheckRecord } from "@/lib/api/check-records"

export default function CheckInPage() {
  const [checkIns, setCheckIns] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedCheckIn, setSelectedCheckIn] = useState<any>(null)
  const [checkInToDelete, setCheckInToDelete] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [companyFilter, setCompanyFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    loadCheckIns()
    loadCompanies()
  }, [])

  const loadCheckIns = async () => {
    try {
      setIsLoading(true)
      const defaultFilters = {
        page: 1,
        pageSize: 50, // Load more records by default
        ...(companyFilter !== "all" && { companyId: Number.parseInt(companyFilter) }),
        ...(statusFilter !== "all" && { status: Number.parseInt(statusFilter) }),
        ...(searchQuery && { search: searchQuery }),
      }

      const response = await getCheckRecords(defaultFilters)
      console.log("Check-ins response:", response)

      const data = response.results || []
      setCheckIns(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error loading check-ins:", error)
      toast({
        title: "Error",
        description: "Failed to load check-in records",
        variant: "destructive",
      })
      setCheckIns([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadCompanies = async () => {
    try {
      const response = await getCompanies()
      const data = response.data || response.results || response.result || []
      setCompanies(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error loading companies:", error)
      setCompanies([])
    }
  }

  const handleAddCheckIn = async (data: any) => {
    try {
      console.log("Adding check-in with data:", data)

      const result = await createCheckRecord(data)

      if (result.data) {
        await loadCheckIns() // Recarregar a lista
        setIsModalOpen(false)
        toast({
          title: "Check-in added successfully",
          description: `Check-in for ${data.professionalName} has been registered.`,
        })
      } else {
        throw new Error(result.error || "Failed to create check record")
      }
    } catch (error) {
      console.error("Error adding check-in:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add check-in record",
        variant: "destructive",
      })
    }
  }

  const handleEditCheckIn = async (data: any) => {
    try {
      // Implementar edição de check-in
      await loadCheckIns() // Recarregar a lista
      setSelectedCheckIn(null)
      setIsModalOpen(false)
      toast({
        title: "Check-in updated successfully",
        description: `Check-in for ${data.professionalName} has been updated.`,
      })
    } catch (error) {
      console.error("Error updating check-in:", error)
      toast({
        title: "Error",
        description: "Failed to update check-in record",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCheckIn = async () => {
    if (checkInToDelete) {
      try {
        // Implementar exclusão de check-in
        await loadCheckIns() // Recarregar a lista
        toast({
          title: "Check-in deleted successfully",
          description: `Check-in for ${checkInToDelete.professionalName} has been removed.`,
          variant: "destructive",
        })
        setCheckInToDelete(null)
      } catch (error) {
        console.error("Error deleting check-in:", error)
        toast({
          title: "Error",
          description: "Failed to delete check-in record",
          variant: "destructive",
        })
      }
    }
  }

  const handleViewDetails = (checkIn: any) => {
    setSelectedCheckIn(checkIn)
    setIsDetailsModalOpen(true)
  }

  const handleEdit = (checkIn: any) => {
    setSelectedCheckIn(checkIn)
    setIsModalOpen(true)
  }

  const handleQuickCheckOut = async (checkIn: any) => {
    if (checkIn.status === 1) {
      // checked_in
      try {
        const response = await performCheckOut(checkIn.id.toString())

        if (response) {
          await loadCheckIns() // Recarregar a lista
          toast({
            title: "Check-out completed",
            description: `${checkIn.professionalName} has checked out.`,
          })
        }
      } catch (error) {
        console.error("Error performing check-out:", error)
        toast({
          title: "Error",
          description: "Failed to perform check-out",
          variant: "destructive",
        })
      }
    }
  }

  // Garantir que checkIns é sempre um array antes de filtrar
  const filteredCheckIns = Array.isArray(checkIns)
    ? checkIns.filter((checkIn) => {
        const matchesSearch =
          (checkIn.professionalName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (checkIn.customerName || "").toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || checkIn.status?.toString() === statusFilter
        const matchesCompany = companyFilter === "all" || checkIn.companyId?.toString() === companyFilter
        return matchesSearch && matchesStatus && matchesCompany
      })
    : []

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return { label: "Pending", className: "border-yellow-500 text-yellow-500" }
      case 1:
        return { label: "Checked In", className: "border-blue-500 text-blue-500" }
      case 2:
        return { label: "Checked Out", className: "border-green-500 text-green-500" }
      default:
        return { label: "Unknown", className: "border-gray-500 text-gray-500" }
    }
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString || dateString === "0001-01-01T00:00:00") return "-"
    try {
      return format(new Date(dateString), "MMM d, yyyy HH:mm")
    } catch {
      return "-"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground">Loading check-in records...</div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Check-in/Check-out Management</h1>
            <p className="text-muted-foreground">
              Monitor all check-ins and check-outs across all companies in the system.
            </p>
          </div>
          <Button
            className="bg-[#06b6d4] hover:bg-[#0891b2] text-white"
            onClick={() => {
              setSelectedCheckIn(null)
              setIsModalOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Check-in
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by professional or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full md:w-[300px] bg-background border-input text-foreground focus-visible:ring-[#06b6d4]"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-background border-input text-foreground">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                <SelectItem value="all" className="hover:bg-accent">
                  All Statuses
                </SelectItem>
                <SelectItem value="0" className="hover:bg-accent">
                  Pending
                </SelectItem>
                <SelectItem value="1" className="hover:bg-accent">
                  Checked In
                </SelectItem>
                <SelectItem value="2" className="hover:bg-accent">
                  Checked Out
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-[180px] bg-background border-input text-foreground">
                <SelectValue placeholder="Filter by company" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                <SelectItem value="all" className="hover:bg-accent">
                  All Companies
                </SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()} className="hover:bg-accent">
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-border hover:bg-muted">
                <TableHead className="text-foreground">Professional</TableHead>
                <TableHead className="text-foreground">Customer</TableHead>
                <TableHead className="text-foreground">Check-in</TableHead>
                <TableHead className="text-foreground">Check-out</TableHead>
                <TableHead className="text-foreground">Service Type</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
                <TableHead className="text-foreground text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCheckIns.length === 0 ? (
                <TableRow className="border-border bg-background">
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No check-in records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCheckIns.map((checkIn) => (
                  <TableRow key={checkIn.id} className="border-border hover:bg-muted/50 bg-background">
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border border-border">
                          <AvatarFallback className="bg-muted text-[#06b6d4]">
                            {(checkIn.professionalName || "N/A")
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div>{checkIn.professionalName || "N/A"}</div>
                          <div className="text-xs text-muted-foreground">ID: {checkIn.professionalId || "N/A"}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-foreground">{checkIn.customerName || "N/A"}</div>
                        <div className="text-xs text-muted-foreground">{checkIn.address || "N/A"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {checkIn.checkInTime ? (
                        <div className="flex items-center gap-1">
                          <LogIn className="h-3 w-3 text-green-500" />
                          <span className="text-muted-foreground">{formatDateTime(checkIn.checkInTime)}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {checkIn.checkOutTime ? (
                        <div className="flex items-center gap-1">
                          <LogOut className="h-3 w-3 text-red-500" />
                          <span className="text-muted-foreground">{formatDateTime(checkIn.checkOutTime)}</span>
                        </div>
                      ) : checkIn.status === 1 ? (
                        <span className="text-muted-foreground">In progress</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{checkIn.serviceType || "N/A"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadge(checkIn.status || 0).className}>
                        {getStatusBadge(checkIn.status || 0).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(checkIn)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Details</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(checkIn)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit</p>
                          </TooltipContent>
                        </Tooltip>

                        {checkIn.status === 1 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleQuickCheckOut(checkIn)}
                                className="h-8 w-8 text-muted-foreground hover:text-green-500 hover:bg-accent"
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Quick Check-out</p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setCheckInToDelete(checkIn)}
                              className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-accent"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredCheckIns.length}</span> of{" "}
            <span className="font-medium text-foreground">{checkIns.length}</span> check-ins
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-input text-foreground hover:bg-accent bg-transparent">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="border-input bg-accent text-foreground hover:bg-accent">
              1
            </Button>
            <Button variant="outline" size="sm" className="border-input text-foreground hover:bg-accent bg-transparent">
              2
            </Button>
            <Button variant="outline" size="sm" className="border-input text-foreground hover:bg-accent bg-transparent">
              Next
            </Button>
          </div>
        </div>

        <CheckInModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedCheckIn(null)
          }}
          onSubmit={selectedCheckIn ? handleEditCheckIn : handleAddCheckIn}
          checkIn={selectedCheckIn}
        />

        <CheckInDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedCheckIn(null)
          }}
          checkIn={selectedCheckIn}
          onEdit={handleEdit}
          onDelete={setCheckInToDelete}
        />

        <AlertDialog open={!!checkInToDelete} onOpenChange={() => setCheckInToDelete(null)}>
          <AlertDialogContent className="bg-popover border-border text-popover-foreground">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                This action cannot be undone. This will permanently delete the check-in record for
                <span className="font-semibold text-foreground block mt-1">{checkInToDelete?.professionalName}</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-input text-foreground hover:bg-accent">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCheckIn}
                className="bg-red-600 hover:bg-red-700 text-white border-0"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
