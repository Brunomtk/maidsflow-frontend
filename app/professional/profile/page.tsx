"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { User, Mail, Shield, Trash2, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/api/utils"

export default function ProfessionalProfile() {
  const { user, refreshUser, logout } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form states
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    role: "",
    status: 1,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        status: user.status || 1,
      })
    }
  }, [user])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleLabel = (role: string) => {
    switch (role?.toLowerCase()) {
      case "professional":
        return "Professional"
      case "admin":
        return "Administrator"
      case "company":
        return "Company"
      default:
        return role || "User"
    }
  }

  const getStatusLabel = (status: number) => {
    return status === 1 ? "Active" : "Inactive"
  }

  const getStatusVariant = (status: number) => {
    return status === 1 ? "default" : "secondary"
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setIsLoading(true)
    try {
      const updateData = {
        name: profileData.name,
        email: profileData.email,
        role: profileData.role,
        status: profileData.status,
        companyId: user.companyId,
        professionalId: user.professionalId,
      }

      const response = await apiRequest(`/Users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      })

      if (response) {
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        })
        await refreshUser()
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Error updating profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const updateData = {
        name: profileData.name,
        email: profileData.email,
        password: passwordData.newPassword,
        role: profileData.role,
        status: profileData.status,
        companyId: user.companyId,
        professionalId: user.professionalId,
      }

      const response = await apiRequest(`/Users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      })

      if (response) {
        toast({
          title: "Success",
          description: "Password changed successfully!",
        })
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      }
    } catch (error) {
      console.error("Error changing password:", error)
      toast({
        title: "Error",
        description: "Error changing password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      await apiRequest(`/Users/${user.id}`, {
        method: "DELETE",
      })

      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully.",
      })

      logout()
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: "Error deleting account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">Manage your personal information and account settings</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your basic user information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatar || ""} alt={user?.name || ""} />
                <AvatarFallback className="text-lg">{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{user?.name || "User"}</h3>
                <p className="text-muted-foreground">{user?.email || ""}</p>
                <div className="flex gap-2">
                  <Badge variant="outline">{getRoleLabel(user?.role || "")}</Badge>
                  <Badge variant={getStatusVariant(user?.status || 1)}>{getStatusLabel(user?.status || 1)}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Personal Data</TabsTrigger>
            <TabsTrigger value="password">Change Password</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Data</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Your full name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="role"
                          type="text"
                          value={getRoleLabel(profileData.role)}
                          className="pl-10"
                          disabled
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Input id="status" type="text" value={getStatusLabel(profileData.status)} disabled />
                    </div>
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Changing..." : "Change Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions that will permanently affect your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">
                      Once deleted, your account cannot be recovered. This action is permanent.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={isLoading}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove all your
                          data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Yes, delete account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
