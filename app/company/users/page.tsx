"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Eye, Edit, Trash2, RefreshCw } from "lucide-react"
import { CompanyUserModal } from "@/components/company/company-user-modal"
import { CompanyUserDetailsModal } from "@/components/company/company-user-details-modal"
import { PlanLimitBar } from "@/components/company/plan-limit-bar"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { fetchApi } from "@/lib/api/utils"
import type { Plan } from "@/types/plan"
import { getPlan } from "@/lib/api/plans"

interface User {
  id: number
  name: string
  email: string
  role: string
  status: number
  avatar?: string
  companyId?: number
  professionalId?: number
  createdDate: string
  updatedDate: string
}

interface Professional {
  id: number
  name: string
  cpf: string
  email: string
  phone: string
  teamId: number
  companyId: number
  status: string
}

export default function CompanyUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [plan, setPlan] = useState<Plan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  const companyId = user?.companyId

  useEffect(() => {
    if (companyId) {
      loadInitialData()
    }
  }, [companyId])

  useEffect(() => {
    if (!isLoading && companyId) {
      loadUsers()
    }
  }, [statusFilter, searchQuery, isLoading, companyId])

  async function loadInitialData() {
    setIsLoading(true)

    try {
      const [usersData, profsData, companyData] = await Promise.all([
        fetchApi<User[]>("/Users"),
        fetchApi<{ results: Professional[] }>(`/Professional/paged?CompanyId=${companyId}&PageSize=1000`),
        fetchApi<{ planId: number }>(`/Companies/${companyId}`),
      ])

      const companyUsers = Array.isArray(usersData)
        ? usersData.filter((u) => u.role?.toLowerCase() === "professional" && u.companyId === Number(companyId))
        : []

      console.log("[v0] Loaded users for company ID:", companyId, "Total users:", companyUsers.length)
      setUsers(companyUsers)
      setProfessionals(profsData.results || [])

      if (companyData.planId) {
        const planResponse = await getPlan(companyData.planId.toString())
        if (planResponse.data) {
          setPlan(planResponse.data)
          console.log("[v0] Plan loaded:", planResponse.data.name, "Limit:", planResponse.data.professionalsLimit)
        }
      }
    } catch (error) {
      console.error("Failed to load initial data:", error)
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
      setUsers([])
      setProfessionals([])
    } finally {
      setIsLoading(false)
    }
  }

  async function loadUsers() {
    try {
      const all = await fetchApi<User[]>("/Users")
      const companyUsers = Array.isArray(all)
        ? all.filter((u) => u.role?.toLowerCase() === "professional" && u.companyId === Number(companyId))
        : []

      console.log("[v0] Reloaded users for company ID:", companyId, "Total users:", companyUsers.length)
      setUsers(companyUsers)
    } catch (error) {
      console.error("Failed to load users:", error)
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" })
    }
  }

  async function handleAddUser(data: any) {
    if (plan && users.length >= plan.professionalsLimit) {
      toast({
        title: "Plan Limit Reached",
        description: `You've reached the maximum of ${plan.professionalsLimit} professionals for your ${plan.name} plan. Please upgrade to add more users.`,
        variant: "destructive",
      })
      return
    }

    try {
      const payload = {
        ...data,
        role: "Professional",
        companyId: Number(companyId),
      }

      await fetchApi("/Users/create", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      toast({ title: "Success", description: "User created successfully" })
      setIsModalOpen(false)
      loadUsers()
    } catch (error) {
      console.error("Failed to create user:", error)
      toast({ title: "Error", description: "Failed to create user", variant: "destructive" })
    }
  }

  async function handleEditUser(data: any) {
    if (!selectedUser) return
    try {
      const payload = {
        ...data,
        role: "Professional",
        companyId: Number(companyId),
      }

      await fetchApi(`/Users/${selectedUser.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      })
      toast({ title: "Success", description: "User updated successfully" })
      setSelectedUser(null)
      setIsModalOpen(false)
      loadUsers()
    } catch (error) {
      console.error("Failed to update user:", error)
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" })
    }
  }

  async function handleDeleteUser() {
    if (!userToDelete) return
    try {
      await fetchApi(`/Users/${userToDelete.id}`, { method: "DELETE" })
      toast({ title: "Success", description: "User deleted successfully", variant: "destructive" })
      setUserToDelete(null)
      loadUsers()
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" })
    }
  }

  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setIsDetailsModalOpen(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return { label: "Active", className: "border-green-500 text-green-500" }
      case 0:
        return { label: "Inactive", className: "border-red-500 text-red-500" }
      default:
        return { label: "Unknown", className: "border-gray-500 text-gray-500" }
    }
  }

  const getProfessionalName = (professionalId?: number) => {
    if (!professionalId) return "Not linked"
    const prof = professionals.find((p) => p.id === professionalId)
    return prof ? prof.name : `Professional ${professionalId}`
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || u.status.toString() === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleUpgradePlan = () => {
    toast({
      title: "Upgrade Plan",
      description: "Contact your administrator to upgrade your plan and add more professionals.",
    })
    // TODO: Navigate to plan upgrade page or open upgrade modal
  }

  const isAtLimit = plan ? users.length >= plan.professionalsLimit : false

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadUsers()
      toast({ title: "Success", description: "Users refreshed successfully" })
    } catch (error) {
      console.error("Failed to refresh users:", error)
      toast({ title: "Error", description: "Failed to refresh users", variant: "destructive" })
    } finally {
      setIsRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground">Loading users...</div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">User Management</h1>
            <p className="text-muted-foreground">Manage professional user accounts for your company.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-border text-foreground hover:bg-muted bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    if (isAtLimit) {
                      toast({
                        title: "Plan Limit Reached",
                        description: "Please upgrade your plan to add more professionals.",
                        variant: "destructive",
                      })
                      return
                    }
                    setSelectedUser(null)
                    setIsModalOpen(true)
                  }}
                  disabled={isAtLimit}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New User
                </Button>
              </TooltipTrigger>
              {isAtLimit && (
                <TooltipContent>
                  <p>Plan limit reached. Upgrade to add more users.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>

        {plan && (
          <PlanLimitBar
            currentCount={users.length}
            maxLimit={plan.professionalsLimit}
            planName={plan.name}
            onUpgrade={handleUpgradePlan}
          />
        )}

        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full lg:w-[300px]"
            />
          </div>

          <div className="flex gap-2">
            <Button variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")}>
              All Status
            </Button>
            <Button variant={statusFilter === "1" ? "default" : "outline"} onClick={() => setStatusFilter("1")}>
              Active
            </Button>
            <Button variant={statusFilter === "0" ? "default" : "outline"} onClick={() => setStatusFilter("0")}>
              Inactive
            </Button>
          </div>
        </div>

        <div className="rounded-md border border-border overflow-hidden shadow-lg bg-gradient-to-br from-card via-card to-muted/20">
          <Table>
            <TableHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
              <TableRow className="border-border hover:bg-muted/70">
                <TableHead className="text-foreground">User</TableHead>
                <TableHead className="text-foreground">Email</TableHead>
                <TableHead className="text-foreground">Linked Professional</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
                <TableHead className="text-foreground">Created Date</TableHead>
                <TableHead className="text-foreground text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-border hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/30 shadow-md">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">Professional</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-muted-foreground">{getProfessionalName(user.professionalId)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadge(user.status).className}>
                      {getStatusBadge(user.status).label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.createdDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(user)}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Details</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setUserToDelete(user)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredUsers.length}</span> users
          </p>
        </div>

        <CompanyUserModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedUser(null)
          }}
          onSubmit={selectedUser ? handleEditUser : handleAddUser}
          user={selectedUser}
          professionals={professionals}
        />

        <CompanyUserDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedUser(null)
          }}
          user={selectedUser}
          professionals={professionals}
        />

        <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
          <AlertDialogContent className="bg-card border-border text-card-foreground">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                This action cannot be undone. This will permanently delete the user{" "}
                <span className="font-semibold text-foreground">{userToDelete?.name}</span> from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
