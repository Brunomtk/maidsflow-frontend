"use client"

import { CompanyPaymentsProvider } from "@/contexts/company-payments-context"
import { CompanyPaymentsContent } from "@/components/company/company-payments-content"
import { useAuth } from "@/contexts/auth-context"

export function CompanyPaymentsClient() {
  const { user } = useAuth()
  const companyId = user?.companyId || 1

  return (
    <CompanyPaymentsProvider companyId={companyId}>
      <CompanyPaymentsContent />
    </CompanyPaymentsProvider>
  )
}
