"use client"

import { useContext } from "react"
import { CompaniesContext } from "@/contexts/companies-context"

export function useCompanies() {
  const context = useContext(CompaniesContext)
  if (context === undefined) {
    throw new Error("useCompanies must be used within a CompaniesProvider")
  }
  return context
}
