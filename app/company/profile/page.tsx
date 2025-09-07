"use client"

import { CompanyProfileForm } from "@/components/company/company-profile-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CompanyProfilePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
          <p className="text-muted-foreground">Manage your company information and settings.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Update your company details and contact information.</CardDescription>
          </CardHeader>
          <CardContent>
            <CompanyProfileForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
