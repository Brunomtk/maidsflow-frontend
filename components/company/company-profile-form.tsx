"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Building2, Camera, Loader2, Save } from "lucide-react"
import { fetchApi } from "@/lib/api/utils"

// Form validation schema
const companyProfileSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  cnpj: z.string().min(14, "CNPJ must be at least 14 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  responsible: z.string().min(2, "Responsible person name must be at least 2 characters"),
})

type CompanyProfileFormData = z.infer<typeof companyProfileSchema>

// Helper function to decode JWT token
function decodeJWT(token: string) {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

// Helper function to get token
function getToken(): string | null {
  if (typeof window !== "undefined") {
    return (
      localStorage.getItem("noah_token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("token")
    )
  }
  return null
}

export function CompanyProfileForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [companyData, setCompanyData] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)

  const form = useForm<CompanyProfileFormData>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      name: "",
      cnpj: "",
      email: "",
      phone: "",
      responsible: "",
    },
  })

  // Fetch company data on component mount
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true)

        const token = getToken()
        if (!token) throw new Error("No authentication token found. Please login again.")

        // Decode JWT to get user ID
        const decoded = decodeJWT(token)
        const userId = decoded?.UserId
        if (!userId) throw new Error("User ID not found in token. Please login again.")

        // First, get user data to get companyId
        const user = await fetchApi<any>(`/Users/${userId}`)
        setUserData(user)

        const companyId = user.companyId
        if (!companyId) throw new Error("No company associated with this user")

        // Now get company data
        const company = await fetchApi<any>(`/Companies/${companyId}`)
        setCompanyData(company)

        // Update form with company data
        form.reset({
          name: company.name || "",
          cnpj: company.cnpj || "",
          email: company.email || "",
          phone: company.phone || "",
          responsible: company.responsible || "",
        })
      } catch (error) {
        console.error("Error fetching company data:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load company data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyData()
  }, [form])

  // Handle form submission
  const onSubmit = async (data: CompanyProfileFormData) => {
    try {
      setSaving(true)

      if (!companyData) throw new Error("Company data not found")

      // Update company
      await fetchApi(`/Companies/${companyData.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: data.name,
          cnpj: data.cnpj,
          responsible: data.responsible,
          email: data.email,
          phone: data.phone,
          planId: companyData.planId,
          status: companyData.status,
        }),
      })

      // Also update user email if changed
      if (userData && userData.email !== data.email) {
        await fetchApi(`/Users/${userData.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: userData.name,
            email: data.email,
            password: userData.password || "",
            role: userData.role,
            status: userData.status,
            companyId: userData.companyId,
            professionalId: userData.professionalId,
          }),
        }).catch(() => {
          console.warn("Failed to update user email, but company was updated successfully")
        })
      }

      toast({
        title: "Success",
        description: "Company information updated successfully",
      })

      // Refresh company data
      const updatedCompany = await fetchApi<any>(`/Companies/${companyData.id}`)
      setCompanyData(updatedCompany)
    } catch (error) {
      console.error("Error updating company:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update company information",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Information
        </CardTitle>
        <CardDescription>Manage your company's basic information and contact details</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Logo Section */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={companyData?.logo || ""} alt={companyData?.name || "Company"} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  <Building2 className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <p className="text-sm font-medium">Company Logo</p>
                <Button type="button" variant="outline" size="sm" disabled>
                  <Camera className="h-4 w-4 mr-2" />
                  Change Logo
                </Button>
                <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ *</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000/0000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="company@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="responsible"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Responsible Person *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter responsible person name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Company Info Display */}
            {companyData && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Company ID:</span> {companyData.id}
                  </div>
                  <div>
                    <span className="font-medium">Plan ID:</span> {companyData.planId}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    <span className={companyData.status === 1 ? "text-green-600" : "text-red-600"}>
                      {companyData.status === 1 ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(companyData.createdDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
