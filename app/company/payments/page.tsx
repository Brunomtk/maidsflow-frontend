import type { Metadata } from "next"
import { CompanyPaymentsClient } from "./company-payments-client"

export const metadata: Metadata = {
  title: "Payments | Noah Company",
  description: "Manage your company payments",
}

export default function CompanyPaymentsPage() {
  return <CompanyPaymentsClient />
}
