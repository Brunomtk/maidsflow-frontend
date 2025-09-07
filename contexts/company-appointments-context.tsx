"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import type { Appointment, CreateAppointmentData, UpdateAppointmentData, AppointmentFilters } from "@/types/appointment"
import {
  getCompanyAppointments,
  createCompanyAppointment,
  updateCompanyAppointment,
  deleteCompanyAppointment,
} from "@/lib/api/company-appointments"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "./auth-context"

interface CompanyAppointmentsContextType {
  appointments: Appointment[]
  isLoading: boolean
  error: string | null
  fetchAppointments: (filters?: Omit<AppointmentFilters, "companyId">) => Promise<void>
  addAppointment: (data: Omit<CreateAppointmentData, "companyId">) => Promise<Appointment | null>
  editAppointment: (id: number, data: UpdateAppointmentData) => Promise<Appointment | null>
  removeAppointment: (id: number) => Promise<boolean>
  pagination: {
    currentPage: number
    pageCount: number
    pageSize: number
    totalItems: number
  }
  setPagination: (pagination: CompanyAppointmentsContextType["pagination"]) => void
}

const CompanyAppointmentsContext = createContext<CompanyAppointmentsContextType | undefined>(undefined)

export { CompanyAppointmentsContext }

export function CompanyAppointmentsProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageCount: 1,
    pageSize: 10,
    totalItems: 0,
  })
  const { toast } = useToast()
  const { user } = useAuth()
  const companyId = user?.companyId

  const fetchAppointments = useCallback(
    async (filters: Omit<AppointmentFilters, "companyId"> = {}) => {
      if (!companyId) {
        setError("Company ID not found.")
        return
      }
      setIsLoading(true)
      setError(null)
      try {
        const response = await getCompanyAppointments({
          ...filters,
          companyId,
          page: pagination.currentPage,
          pageSize: pagination.pageSize,
        })
        const formattedAppointments = response.results.map((appointment) => ({
          ...appointment,
          start: new Date(appointment.start),
          end: new Date(appointment.end),
        }))
        setAppointments(formattedAppointments)
        setPagination({
          currentPage: response.currentPage,
          pageCount: response.pageCount,
          pageSize: response.pageSize,
          totalItems: response.totalItems,
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch appointments"
        setError(errorMessage)
        toast({ title: "Error", description: errorMessage, variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    },
    [companyId, toast, pagination.currentPage, pagination.pageSize],
  )

  const addAppointment = async (data: Omit<CreateAppointmentData, "companyId">): Promise<Appointment | null> => {
    if (!companyId) {
      toast({ title: "Error", description: "Company ID not found.", variant: "destructive" })
      return null
    }
    setIsLoading(true)
    try {
      const newAppointment = await createCompanyAppointment({ ...data, companyId })
      toast({ title: "Success", description: "Appointment created successfully." })
      fetchAppointments() // Refresh list
      return newAppointment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create appointment"
      setError(errorMessage)
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const editAppointment = async (id: number, data: UpdateAppointmentData): Promise<Appointment | null> => {
    setIsLoading(true)
    try {
      const updatedAppointment = await updateCompanyAppointment(id, data)
      toast({ title: "Success", description: "Appointment updated successfully." })
      fetchAppointments() // Refresh list
      return updatedAppointment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update appointment"
      setError(errorMessage)
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const removeAppointment = async (id: number): Promise<boolean> => {
    setIsLoading(true)
    try {
      await deleteCompanyAppointment(id)
      toast({ title: "Success", description: "Appointment deleted successfully." })
      fetchAppointments() // Refresh list
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete appointment"
      setError(errorMessage)
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (companyId) {
      fetchAppointments()
    }
  }, [companyId, fetchAppointments])

  return (
    <CompanyAppointmentsContext.Provider
      value={{
        appointments,
        isLoading,
        error,
        fetchAppointments,
        addAppointment,
        editAppointment,
        removeAppointment,
        pagination,
        setPagination,
      }}
    >
      {children}
    </CompanyAppointmentsContext.Provider>
  )
}

export function useCompanyAppointments() {
  const context = useContext(CompanyAppointmentsContext)
  if (context === undefined) {
    throw new Error("useCompanyAppointments must be used within a CompanyAppointmentsProvider")
  }
  return context
}
