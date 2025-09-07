"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { usersApi } from "@/lib/api/users"
import { User, Shield, Building, UserCheck, Calendar, Mail, Clock } from "lucide-react"
import type { User as UserType } from "@/types/user"

interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserType | null
}

interface CompanyInfo {
  id: number
  name: string
}

interface ProfessionalInfo {
  id: number
  name: string
}

export function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  const [professionalInfo, setProfessionalInfo] = useState<ProfessionalInfo | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  useEffect(() => {
    if (isOpen && user) {
      loadAdditionalDetails()
    }
  }, [isOpen, user])

  const loadAdditionalDetails = async () => {
    if (!user) return

    setIsLoadingDetails(true)
    try {
      // Load company and professional info if they exist
      const promises = []

      if (user.companyId) {
        promises.push(
          usersApi.getCompaniesForDropdown().then((response) => {
            if (response.data) {
              const company = response.data.find((c) => c.id === user.companyId)
              if (company) setCompanyInfo(company)
            }
          }),
        )
      }

      if (user.professionalId) {
        promises.push(
          usersApi.getProfessionalsForDropdown().then((response) => {
            if (response.data) {
              const professional = response.data.find((p) => p.id === user.professionalId)
              if (professional) setProfessionalInfo(professional)
            }
          }),
        )
      }

      await Promise.all(promises)
    } catch (error) {
      console.error("Error loading additional details:", error)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "Administrator"
      case "company":
        return "Company"
      case "professional":
        return "Professional"
      case "operador":
        return "Operator"
      default:
        return role || "User"
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "destructive"
      case "company":
        return "default"
      case "professional":
        return "secondary"
      case "operador":
        return "outline"
      default:
        return "outline"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return Shield
      case "company":
        return Building
      case "professional":
        return UserCheck
      case "operador":
        return User
      default:
        return User
    }
  }

  const getUserInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Invalid Date"
    }
  }

  if (!user) return null

  const RoleIcon = getRoleIcon(user.role)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#1a2234] border-[#2a3349]">
        <DialogHeader>
          <DialogTitle className="text-white">User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Profile Section */}
          <Card className="bg-[#0f172a] border-[#2a3349]">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar || undefined} alt={user.name || "User"} />
                  <AvatarFallback className="bg-[#06b6d4] text-white text-lg">
                    {getUserInitials(user.name || "User")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-semibold text-white">{user.name || "N/A"}</h3>
                    <Badge variant={user.status === 1 ? "default" : "secondary"}>
                      {user.status === 1 ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-gray-400 flex items-center mt-1">
                    <Mail className="h-4 w-4 mr-2" />
                    {user.email || "N/A"}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <RoleIcon className="h-4 w-4 text-gray-400" />
                    <Badge variant={getRoleBadgeVariant(user.role)}>{getRoleDisplayName(user.role)}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Basic Information */}
          <Card className="bg-[#0f172a] border-[#2a3349]">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">User ID</label>
                  <p className="text-white">{user.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Status</label>
                  <p className="text-white">{user.status === 1 ? "Active" : "Inactive"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Role</label>
                  <p className="text-white">{getRoleDisplayName(user.role)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Email</label>
                  <p className="text-white">{user.email || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Associated Information */}
          {(user.companyId || user.professionalId) && (
            <Card className="bg-[#0f172a] border-[#2a3349]">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Associated Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.companyId && (
                  <div>
                    <label className="text-sm font-medium text-gray-400">Company</label>
                    {isLoadingDetails ? (
                      <Skeleton className="h-4 w-32 bg-[#2a3349]" />
                    ) : (
                      <p className="text-white">{companyInfo?.name || `Company ID: ${user.companyId}`}</p>
                    )}
                  </div>
                )}
                {user.professionalId && (
                  <div>
                    <label className="text-sm font-medium text-gray-400">Professional</label>
                    {isLoadingDetails ? (
                      <Skeleton className="h-4 w-32 bg-[#2a3349]" />
                    ) : (
                      <p className="text-white">
                        {professionalInfo?.name || `Professional ID: ${user.professionalId}`}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card className="bg-[#0f172a] border-[#2a3349]">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Created Date
                  </label>
                  <p className="text-white">{formatDate(user.createdDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Last Updated
                  </label>
                  <p className="text-white">{formatDate(user.updatedDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card className="bg-[#0f172a] border-[#2a3349]">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Account Status</label>
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${user.status === 1 ? "bg-green-400" : "bg-red-400"}`} />
                    <p className="text-white">{user.status === 1 ? "Active Account" : "Inactive Account"}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">User Type</label>
                  <p className="text-white">{getRoleDisplayName(user.role)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
