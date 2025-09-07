"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Plus, Search, List, CalendarDays } from "lucide-react"
import { AppointmentList } from "@/components/admin/appointment-list"
import { AppointmentCalendar } from "@/components/admin/appointment-calendar"
import { AppointmentModal } from "@/components/admin/appointment-modal"
import { AppointmentDetailsModal } from "@/components/admin/appointment-details-modal"
import { CheckInModal } from "@/components/admin/check-in-modal"
import { useToast } from "@/hooks/use-toast"
import { useAppointments } from "@/hooks/use-appointments"
import { format } from "date-fns"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Appointment, AppointmentFilters } from "@/types/appointment"
import { apiRequest } from "@/lib/api/utils"
import { createCheckRecord } from "@/lib/api/check-records"
import Swal from "sweetalert2"

interface Company {
  id: number
  name: string
  cnpj: string
  responsible: string
  email: string
  phone: string
  planId: number
  status: number
  createdDate: string
  updatedDate: string
}

interface Professional {
  id: number
  name: string
  cpf: string
  email: string
  phone: string
  teamId: number
  companyId: number
  status: string
  rating: number | null
  completedServices: number | null
  createdAt: string
  updatedAt: string
}

export default function AppointmentsPage() {
  const {
    appointments,
    isLoading,
    pagination,
    fetchAppointments,
    addAppointment,
    updateAppointment,
    removeAppointment,
  } = useAppointments()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined)
  const [companyFilter, setCompanyFilter] = useState<number | undefined>(undefined)
  const [professionalFilter, setProfessionalFilter] = useState<number | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [displayMode, setDisplayMode] = useState<"list" | "calendar">("list")
  const [calendarView, setCalendarView] = useState<"day" | "week" | "month">("week")
  const [companies, setCompanies] = useState<Company[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const [loadingProfessionals, setLoadingProfessionals] = useState(false)
  const [createdAppointmentData, setCreatedAppointmentData] = useState<any>(null)
  const { toast } = useToast()

  // Load companies and professionals on component mount
  useEffect(() => {
    loadCompanies()
    loadProfessionals()
  }, [])

  // Load appointments on component mount and when filters change
  useEffect(() => {
    loadAppointments()
  }, [currentPage, pageSize, statusFilter, companyFilter, professionalFilter, searchTerm])

  // Update the loadCompanies function to use the correct endpoint
  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true)
      const response = await apiRequest("/Companies")
      if (Array.isArray(response)) {
        setCompanies(response)
      } else if (response.results && Array.isArray(response.results)) {
        setCompanies(response.results)
      }
    } catch (error) {
      console.error("Error loading companies:", error)
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      })
    } finally {
      setLoadingCompanies(false)
    }
  }

  // Update the loadProfessionals function to use the correct endpoint
  const loadProfessionals = async () => {
    try {
      setLoadingProfessionals(true)
      const response = await apiRequest("/Professional")
      if (Array.isArray(response)) {
        setProfessionals(response)
      } else if (response.results && Array.isArray(response.results)) {
        setProfessionals(response.results)
      }
    } catch (error) {
      console.error("Error loading professionals:", error)
      toast({
        title: "Error",
        description: "Failed to load professionals",
        variant: "destructive",
      })
    } finally {
      setLoadingProfessionals(false)
    }
  }

  const loadAppointments = async () => {
    const filters: AppointmentFilters = {
      page: currentPage,
      pageSize: displayMode === "calendar" ? 100 : pageSize, // Load more for calendar view
    }

    if (statusFilter !== undefined) {
      filters.status = statusFilter
    }

    if (companyFilter !== undefined) {
      filters.companyId = companyFilter
    }

    if (professionalFilter !== undefined) {
      filters.professionalId = professionalFilter
    }

    if (searchTerm.trim()) {
      filters.search = searchTerm.trim()
    }

    await fetchAppointments(filters)
  }

  const handleAddAppointment = async (data: any) => {
    const success = await addAppointment(data)
    if (success) {
      // Sempre fechar o modal primeiro
      setIsModalOpen(false)
      setSelectedAppointment(null)

      // Mostrar SweetAlert com opções
      const result = await Swal.fire({
        title: "Appointment Created!",
        text: "What would you like to do next?",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Create Check Record",
        cancelButtonText: "Continue",
        confirmButtonColor: "#06b6d4",
        cancelButtonColor: "#6b7280",
        background: "#1a2234",
        color: "#ffffff",
        customClass: {
          popup: "swal-dark-popup",
          title: "swal-dark-title",
          content: "swal-dark-content",
        },
      })

      if (result.isConfirmed) {
        // Preparar dados para o check record baseado no appointment
        const checkRecordData = {
          professionalId: data.professionalId || "",
          professionalName: "",
          companyId: data.companyId || "",
          customerId: data.customerId || "",
          customerName: "",
          appointmentId: "", // Será preenchido com o ID do appointment criado se disponível
          address: data.address || "",
          teamId: data.teamId || "",
          teamName: "",
          serviceType: getServiceTypeText(data.type) || "General Service",
          notes: data.notes || "",
        }

        setCreatedAppointmentData(checkRecordData)
        setIsCheckInModalOpen(true)
      }
    }
  }

  const handleEditAppointment = async (data: any) => {
    if (selectedAppointment) {
      const success = await updateAppointment(selectedAppointment.id, data)
      if (success) {
        setIsModalOpen(false)
        setSelectedAppointment(null)
      }
    }
  }

  const handleDeleteAppointment = async () => {
    if (appointmentToDelete) {
      const success = await removeAppointment(appointmentToDelete.id)
      if (success) {
        setAppointmentToDelete(null)
      }
    }
  }

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailsModalOpen(true)
  }

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsModalOpen(true)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: string) => {
    setPageSize(Number.parseInt(size))
    setCurrentPage(1)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "all" ? undefined : Number.parseInt(value))
    setCurrentPage(1)
  }

  const handleCompanyFilterChange = (value: string) => {
    setCompanyFilter(value === "all" ? undefined : Number.parseInt(value))
    setCurrentPage(1)
  }

  const handleProfessionalFilterChange = (value: string) => {
    setProfessionalFilter(value === "all" ? undefined : Number.parseInt(value))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter(undefined)
    setCompanyFilter(undefined)
    setProfessionalFilter(undefined)
    setCurrentPage(1)
  }

  const handleAddAppointmentFromCalendar = (date: Date) => {
    const endDate = new Date(date)
    endDate.setHours(date.getHours() + 1)

    const tempAppointment = {
      start: date,
      end: endDate,
    }

    setSelectedAppointment(tempAppointment as Appointment)
    setIsModalOpen(true)
  }

  const handleDisplayModeChange = (mode: string) => {
    setDisplayMode(mode as "list" | "calendar")
    if (mode === "calendar") {
      // Load more appointments for calendar view
      setCurrentPage(1)
      loadAppointments()
    }
  }

  const handleCreateCheckRecord = async (checkRecordData: any) => {
    try {
      const result = await createCheckRecord(checkRecordData)
      if (result.data) {
        toast({
          title: "Success",
          description: "Check record created successfully!",
        })
        setIsCheckInModalOpen(false)
        setCreatedAppointmentData(null)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create check record",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating check record:", error)
      toast({
        title: "Error",
        description: "Failed to create check record",
        variant: "destructive",
      })
    }
  }

  const getServiceTypeText = (type: number): string => {
    switch (type) {
      case 0:
        return "Residential"
      case 1:
        return "Commercial"
      case 2:
        return "Industrial"
      default:
        return "General Service"
    }
  }

  // Filter professionals based on selected company
  const filteredProfessionals = companyFilter
    ? professionals.filter((prof) => prof.companyId === companyFilter)
    : professionals

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Appointment Management</h1>
          <p className="text-gray-400">Schedule and manage all appointments.</p>
        </div>
        <Button
          className="bg-[#06b6d4] hover:bg-[#0891b2] text-white"
          onClick={() => {
            setSelectedAppointment(null)
            setIsModalOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col gap-4 bg-[#1a2234] p-4 rounded-lg border border-[#2a3349]">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#06b6d4]" />
          <h2 className="text-lg font-medium text-white">Appointments</h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search and Filters */}
          <div className="flex flex-1 items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-sm min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-[#0f172a] border-[#2a3349] text-white placeholder-gray-400"
              />
            </div>

            <Select value={companyFilter?.toString() || "all"} onValueChange={handleCompanyFilterChange}>
              <SelectTrigger className="w-[180px] bg-[#0f172a] border-[#2a3349] text-white">
                <SelectValue placeholder={loadingCompanies ? "Loading..." : "All Companies"} />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={professionalFilter?.toString() || "all"}
              onValueChange={handleProfessionalFilterChange}
              disabled={loadingProfessionals}
            >
              <SelectTrigger className="w-[180px] bg-[#0f172a] border-[#2a3349] text-white">
                <SelectValue placeholder={loadingProfessionals ? "Loading..." : "All Professionals"} />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                <SelectItem value="all">All Professionals</SelectItem>
                {filteredProfessionals.map((professional) => (
                  <SelectItem key={professional.id} value={professional.id.toString()}>
                    {professional.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter?.toString() || "all"} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-[140px] bg-[#0f172a] border-[#2a3349] text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="0">Scheduled</SelectItem>
                <SelectItem value="1">In Progress</SelectItem>
                <SelectItem value="2">Completed</SelectItem>
                <SelectItem value="3">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {displayMode === "list" && (
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-[80px] bg-[#0f172a] border-[#2a3349] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            )}

            {(searchTerm ||
              statusFilter !== undefined ||
              companyFilter !== undefined ||
              professionalFilter !== undefined) && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-[#2a3349] text-white hover:bg-[#2a3349] bg-transparent whitespace-nowrap"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-4">
            <Tabs value={displayMode} onValueChange={handleDisplayModeChange}>
              <TabsList className="bg-[#0f172a] border border-[#2a3349]">
                <TabsTrigger value="list" className="data-[state=active]:bg-[#06b6d4] data-[state=active]:text-white">
                  <List className="h-4 w-4 mr-2" />
                  List
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="data-[state=active]:bg-[#06b6d4] data-[state=active]:text-white"
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Calendar
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Calendar View Options */}
            {displayMode === "calendar" && (
              <Tabs value={calendarView} onValueChange={(value) => setCalendarView(value as "day" | "week" | "month")}>
                <TabsList className="bg-[#0f172a] border border-[#2a3349]">
                  <TabsTrigger value="day" className="data-[state=active]:bg-[#06b6d4] data-[state=active]:text-white">
                    Day
                  </TabsTrigger>
                  <TabsTrigger value="week" className="data-[state=active]:bg-[#06b6d4] data-[state=active]:text-white">
                    Week
                  </TabsTrigger>
                  <TabsTrigger
                    value="month"
                    className="data-[state=active]:bg-[#06b6d4] data-[state=active]:text-white"
                  >
                    Month
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-white">Loading appointments...</div>
        </div>
      ) : (
        <>
          {displayMode === "list" ? (
            <>
              <AppointmentList
                appointments={appointments}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onDelete={setAppointmentToDelete}
              />

              {/* Pagination */}
              {pagination.pageCount > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Showing {pagination.firstRowOnPage || 1} to {pagination.lastRowOnPage || 0} of{" "}
                    {pagination.totalItems} appointments
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="border-[#2a3349] text-white hover:bg-[#2a3349]"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-white">
                      Page {pagination.currentPage} of {pagination.pageCount}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= pagination.pageCount}
                      className="border-[#2a3349] text-white hover:bg-[#2a3349]"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <AppointmentCalendar
              appointments={appointments}
              onAppointmentClick={handleViewDetails}
              onDateClick={handleAddAppointmentFromCalendar}
              view={calendarView}
            />
          )}
        </>
      )}

      {/* Modals */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedAppointment(null)
        }}
        onSubmit={selectedAppointment && selectedAppointment.id ? handleEditAppointment : handleAddAppointment}
        appointment={selectedAppointment}
      />

      <AppointmentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedAppointment(null)
        }}
        appointment={selectedAppointment}
        onEdit={handleEdit}
        onDelete={setAppointmentToDelete}
      />

      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => {
          setIsCheckInModalOpen(false)
          setCreatedAppointmentData(null)
        }}
        onSubmit={handleCreateCheckRecord}
        checkIn={createdAppointmentData}
      />

      <AlertDialog open={!!appointmentToDelete} onOpenChange={() => setAppointmentToDelete(null)}>
        <AlertDialogContent className="bg-[#1a2234] border-[#2a3349] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the appointment
              <span className="font-semibold text-white block mt-1">
                {appointmentToDelete?.title} for {appointmentToDelete?.customer?.name}
              </span>
              scheduled for{" "}
              {appointmentToDelete?.start ? format(new Date(appointmentToDelete.start), "PPP 'at' p") : "unknown date"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[#2a3349] text-white hover:bg-[#2a3349]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAppointment}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx global>{`
        .swal-dark-popup {
          background-color: #1a2234 !important;
          border: 1px solid #2a3349 !important;
        }
        .swal-dark-title {
          color: #ffffff !important;
        }
        .swal-dark-content {
          color: #d1d5db !important;
        }
      `}</style>
    </div>
  )
}
