"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "@/components/ui/use-toast"
import { fetchApi } from "@/lib/api/utils"

interface CompanyData {
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

interface UserData {
  name: string
  email: string
  password: string
  role: string
  status: number
  avatar: string | null
  companyId: number
  professionalId: number
  id: number
  createdDate: string
  updatedDate: string
}

interface CompanyProfileContextType {
  company: CompanyData | null
  user: UserData | null
  loading: boolean
  error: string | null
  fetchCompany: () => Promise<void>
  updateCompany: (companyData: Partial<CompanyData>) => Promise<boolean>
}

// Function to decode JWT token
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
  } catch (error) {
    console.error("Error decoding JWT:", error)
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

const CompanyProfileContext = createContext<CompanyProfileContextType | undefined>(undefined)

export function CompanyProfileProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCompany = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = getToken()
      if (!token) {
        throw new Error("No authentication token found. Please login again.")
      }

      // Decode JWT to get user ID
      const decodedToken = decodeJWT(token)
      if (!decodedToken || !decodedToken.UserId) {
        throw new Error("Invalid token. Please login again.")
      }
      const userId = decodedToken.UserId

      // First, get user data to get companyId
      const userData: UserData = await fetchApi<UserData>(`/Users/${userId}`)
      setUser(userData)

      if (!userData.companyId) {
        throw new Error("User is not associated with a company")
      }

      // Now fetch company data using the companyId from user
      const companyData: CompanyData = await fetchApi<CompanyData>(`/Companies/${userData.companyId}`)
      setCompany(companyData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateCompany = async (companyDataPartial: Partial<CompanyData>): Promise<boolean> => {
    if (!company) return false

    setLoading(true)
    setError(null)

    try {
      const token = getToken()
      if (!token) {
        throw new Error("No authentication token found. Please login again.")
      }

      const updateData = {
        name: companyDataPartial.name ?? company.name,
        cnpj: companyDataPartial.cnpj ?? company.cnpj,
        responsible: companyDataPartial.responsible ?? company.responsible,
        email: companyDataPartial.email ?? company.email,
        phone: companyDataPartial.phone ?? company.phone,
        planId: companyDataPartial.planId ?? company.planId,
        status: companyDataPartial.status ?? company.status,
      }

      const result = await fetchApi<boolean>(`/Companies/${company.id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      })

      if (result) {
        // Fetch updated company data
        await fetchCompany()
        toast({
          title: "Success",
          description: "Company profile updated successfully",
        })
        return true
      } else {
        throw new Error("Failed to update company profile")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    fetchCompany()
  }, [])

  const value: CompanyProfileContextType = {
    company,
    user,
    loading,
    error,
    fetchCompany,
    updateCompany,
  }

  return (
    <CompanyProfileContext.Provider value={value}>
      {children}
    </CompanyProfileContext.Provider>
  )
}

export function useCompanyProfileContext() {
  const context = useContext(CompanyProfileContext)
  if (context === undefined) {
    throw new Error("useCompanyProfileContext must be used within a CompanyProfileProvider")
  }
  return context
}
