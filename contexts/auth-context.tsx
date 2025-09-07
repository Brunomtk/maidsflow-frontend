"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, LoginCredentials, RegisterData } from "@/types"
import { fetchApi } from "@/lib/api/utils"
import { toast } from "sonner"

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  checkAuth: () => Promise<void>
  getToken: () => string | null
  getUserId: () => string | null
  getCompanyId: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await fetchApi<{ token: string; id: number; name: string; email: string; role: string; status: number; avatar?: string; companyId?: string; professionalId?: string; createdDate: string; updatedDate: string }>(
        "/Users/authenticate",
        {
          method: "POST",
          body: JSON.stringify(credentials),
        }
      )
      // fetchApi throws on non-ok, so if we’re here we have data
      localStorage.setItem("noah_token", response.token)
      setToken(response.token)
      setUser({
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role,
        status: response.status,
        avatar: response.avatar,
        companyId: response.companyId,
        professionalId: response.professionalId,
        createdDate: response.createdDate,
        updatedDate: response.updatedDate,
      })
      toast.success("Login successful!")
      return true
    } catch (err: any) {
      console.error("Login error:", err)
      toast.error("Login failed: " + (err.message || "Please try again."))
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true)
      const result = await fetchApi<boolean>(
        "/Users/create",
        {
          method: "POST",
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role,
            status: 1,
            companyId: data.companyId || null,
            professionalId: data.professionalId || null,
          }),
        }
      )
      if (result) {
        toast.success("Registration successful! Please login.")
        return true
      } else {
        toast.error("Registration failed. Please try again.")
        return false
      }
    } catch (err: any) {
      console.error("Registration error:", err)
      toast.error("Registration failed: " + (err.message || "Please try again."))
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("noah_token")
    setUser(null)
    setToken(null)
    toast.success("Logged out successfully")
  }

  const getToken = () => {
    if (token) return token
    if (typeof window !== "undefined") {
      return localStorage.getItem("noah_token")
    }
    return null
  }

  const getUserId = () => {
    if (user?.id) return String(user.id)
    const t = getToken()
    if (t) {
      try {
        const p = JSON.parse(atob(t.split(".")[1]))
        return String(p.UserId || p.userId)
      } catch {
        console.error("Error decoding token for user ID")
      }
    }
    return null
  }

  const getCompanyId = () => {
    if (user?.companyId) return String(user.companyId)
    const t = getToken()
    if (t) {
      try {
        const p = JSON.parse(atob(t.split(".")[1]))
        return String(p.CompanyId || p.companyId)
      } catch {
        console.error("Error decoding token for company ID")
      }
    }
    return null
  }

  const checkAuth = async () => {
    setIsLoading(true)
    try {
      const t = localStorage.getItem("noah_token")
      if (!t) return
      const p = JSON.parse(atob(t.split(".")[1]))
      const userId = p.UserId || p.userId
      if (!userId) throw new Error("Invalid token")
      const userData = await fetchApi<User>(`/Users/${userId}`)
      setUser(userData)
      setToken(t)
    } catch (err) {
      console.error("Auth check error:", err)
      localStorage.removeItem("noah_token")
      setUser(null)
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    checkAuth,
    getToken,
    getUserId,
    getCompanyId,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
