"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Save, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { fetchApi } from "@/lib/api/utils"

export default function ProfilePage() {
  const { user, checkAuth } = useAuth()
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    status: 1,
  })

  // Initialize form data with user data when user is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "",
        status: user.status || 1,
      })
      setInitialLoading(false)
    }
  }, [user])

  const handleSave = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not found. Please login again.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        companyId: user.companyId,
        professionalId: user.professionalId,
        ...(formData.password && { password: formData.password }),
      }

      const response = await fetchApi(`/Users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })

        // Refresh auth context to get updated user data
        await checkAuth()

        // Clear password field
        setFormData((prev) => ({ ...prev, password: "" }))
      } else {
        const errorText = await response.text()
        toast({
          title: "Error",
          description: errorText || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not found. Please login again.",
        variant: "destructive",
      })
      return
    }

    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }

    setDeleteLoading(true)

    try {
      const response = await fetchApi(`/Users/${user.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Account deleted successfully",
        })

        // Logout user after successful deletion
        localStorage.removeItem("noah_token")
        window.location.href = "/login"
      } else {
        const errorText = await response.text()
        toast({
          title: "Error",
          description: errorText || "Failed to delete account",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  if (initialLoading || !user) {
    return (
      <div className="container mx-auto py-4 md:py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 md:py-6 px-4 md:px-0">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
        <p className="text-gray-400 mt-1 text-sm md:text-base">Manage your personal information and account settings</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Personal Information</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Update your personal details and account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  className="text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm">
                  Role
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="operador">Operator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm">
                  Status
                </Label>
                <Select
                  value={formData.status.toString()}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: Number.parseInt(value) }))}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="0">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Leave empty to keep current password"
                className="text-sm"
              />
              <p className="text-xs md:text-sm text-gray-400">Leave empty if you don't want to change your password</p>
            </div>

            <div className="pt-3 md:pt-4 border-t border-[#2a3349]">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Account Information</Label>
                <div className="text-xs md:text-sm text-gray-400 space-y-1">
                  <p>Account ID: {user.id}</p>
                  <p>Created: {new Date(user.createdDate).toLocaleDateString()}</p>
                  <p>Last Updated: {new Date(user.updatedDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-3">
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading} className="w-full sm:w-auto">
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
            <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
