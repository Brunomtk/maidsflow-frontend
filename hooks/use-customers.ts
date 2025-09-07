"use client"
import { useCustomers as useCustomersContext } from "@/contexts/customers-context"

export function useCustomers() {
  return useCustomersContext()
}
