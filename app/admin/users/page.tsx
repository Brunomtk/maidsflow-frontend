"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { usersApi } from "@/lib/api/users"
import { useUsersContext } from "@/contexts/users-context"
import { UserModal } from "@/components/admin/user-modal"
import { UserDetailsModal } from "@/components/admin/user-details-modal"
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Users, UserCheck, UserX, Shield } from "lucide-react"
import type { User } from "@/types/user"

export default function UsersPage() {
  const { users, isLoading, error, pagination, dispatch } = useUsersContext()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async (page = 1) => {
    dispatch({ type: "SET_LOADING", payload: true })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      console.log("Fetching users...")
      const response = await usersApi.getUsers(page, 10)
      console.log("API Response:", response)

      if (response.data && response.data.data) {
        console.log("Users data:", response.data.data)
        dispatch({ type: "SET_USERS", payload: response.data.data })
        dispatch({ type: "SET_PAGINATION", payload: response.data.meta })
      } else if (response.error) {
        throw new Error(response.error)
      } else {
        // Handle case where response structure is different
        console.log("Unexpected response structure:", response)
        throw new Error("Unexpected response format")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      dispatch({
        type: "SET_ERROR",
        payload: errorMessage,
      })
      toast({
        title: "Error",
        description: "Failed to load users: " + errorMessage,
        variant: "destructive",
      })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      console.log("Deleting user:", selectedUser.id)
      const response = await usersApi.deleteUser(selectedUser.id.toString())
      console.log("Delete user response:", response)

      // Check if the operation was successful (status 200/204 or response is true)
      if (response.status === 200 || response.status === 204 || response.data === true || response === true) {
        dispatch({ type: "DELETE_USER", payload: selectedUser.id.toString() })
        toast({
          title: "Success",
          description: "User deleted successfully",
        })
      } else {
        console.error("Delete user failed:", response)
        throw new Error(response.error || "Failed to delete user")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
        month: "short",
        day: "numeric",
      })
    } catch {
      return "Invalid Date"
    }
  }

  // Calculate stats
  const totalUsers = users.length
  const activeUsers = users.filter((user) => user.status === 1).length
  const inactiveUsers = users.filter((user) => user.status === 0).length
  const adminUsers = users.filter((user) => user.role === "admin").length

  if (error) {
    return (
      <div className="container mx-auto py-4 md:py-6 px-4 md:px-0">
        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-red-400 mb-4">Error: {error}</p>
              <Button onClick={() => fetchUsers()} className="bg-[#06b6d4] hover:bg-[#0891b2]">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 md:py-6 px-4 md:px-0 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Users</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage system users and their permissions</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 via-card to-blue-500/5 border-blue-500/30 shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-card-foreground">Total Users</CardTitle>
            <Users className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-blue-500">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 via-card to-green-500/5 border-green-500/30 shadow-lg hover:shadow-green-500/20 hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-card-foreground">Active Users</CardTitle>
            <UserCheck className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-green-500">{activeUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 via-card to-red-500/5 border-red-500/30 shadow-lg hover:shadow-red-500/20 hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-card-foreground">Inactive Users</CardTitle>
            <UserX className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-red-500">{inactiveUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 via-card to-purple-500/5 border-purple-500/30 shadow-lg hover:shadow-purple-500/20 hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-card-foreground">Administrators</CardTitle>
            <Shield className="h-3 w-3 md:h-4 md:w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-purple-500">{adminUsers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="block md:hidden">
        <Card className="bg-gradient-to-br from-card via-card to-muted/20 border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-card-foreground text-lg">Users List</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              A list of all users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm"
              />
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-[150px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <Card
                    key={user.id}
                    className="bg-gradient-to-br from-muted/50 via-muted/30 to-transparent border-border shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar || undefined} alt={user.name || "User"} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {getUserInitials(user.name || "User")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground text-sm">{user.name || "N/A"}</div>
                            <div className="text-xs text-muted-foreground">{user.email || "N/A"}</div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setIsDetailsModalOpen(true)
                              }}
                              className="text-card-foreground hover:bg-border hover:text-foreground text-xs"
                            >
                              <Eye className="mr-2 h-3 w-3" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setIsEditModalOpen(true)
                              }}
                              className="text-card-foreground hover:bg-border hover:text-foreground text-xs"
                            >
                              <Edit className="mr-2 h-3 w-3" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setIsDeleteDialogOpen(true)
                              }}
                              className="text-red-500 hover:bg-border hover:text-red-400 text-xs"
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                          {getRoleDisplayName(user.role)}
                        </Badge>
                        <Badge variant={user.status === 1 ? "default" : "secondary"} className="text-xs">
                          {user.status === 1 ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground">Created: {formatDate(user.createdDate)}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No users found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="hidden md:block">
        <Card className="bg-gradient-to-br from-card via-card to-muted/20 border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-card-foreground">Users List</CardTitle>
            <CardDescription className="text-muted-foreground">A list of all users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">User</TableHead>
                      <TableHead className="text-muted-foreground">Role</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Created</TableHead>
                      <TableHead className="text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-border">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={user.avatar || undefined} alt={user.name || "User"} />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {getUserInitials(user.name || "User")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-foreground">{user.name || "N/A"}</div>
                              <div className="text-sm text-muted-foreground">{user.email || "N/A"}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>{getRoleDisplayName(user.role)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 1 ? "default" : "secondary"}>
                            {user.status === 1 ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground">{formatDate(user.createdDate)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setIsDetailsModalOpen(true)
                                }}
                                className="text-card-foreground hover:bg-border hover:text-foreground"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setIsEditModalOpen(true)
                                }}
                                className="text-card-foreground hover:bg-border hover:text-foreground"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setIsDeleteDialogOpen(true)
                                }}
                                className="text-red-500 hover:bg-border hover:text-red-400"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!isLoading && filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No users found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <UserModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} mode="create" />

      <UserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
        mode="edit"
      />

      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-card-foreground">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete the user
              {selectedUser && ` "${selectedUser.name}"`} and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>Cancel</AlertDialogCancel>
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
  )
}
