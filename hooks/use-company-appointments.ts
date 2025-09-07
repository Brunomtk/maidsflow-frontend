"use client"

import { useContext } from "react"
import { CompanyAppointmentsContext } from "@/contexts/company-appointments-context"

export function useCompanyAppointments() {
  const context = useContext(CompanyAppointmentsContext)
  if (context === undefined) {
    throw new Error("useCompanyAppointments must be used within a CompanyAppointmentsProvider")
  }
  return context
}
