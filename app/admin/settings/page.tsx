"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Save, Trash2, User, Mail, Sun, Moon, Globe, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { fetchApi } from "@/lib/api/utils"
import { useTheme } from "next-themes"

export default function AdminSettingsPage() {
  const { user, refreshUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    role: "",
    status: 1,
    theme: "dark",
    language: "pt-BR",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        role: user.role || "",
        status: user.status || 1,
        theme: user.theme || "dark",
        language: user.language || "pt-BR",
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

    if (!formData.currentPassword) {
      toast({
        title: "Error",
        description: "Current password is required to save changes.",
        variant: "destructive",
      })
      return
    }

    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "New passwords don't match.",
          variant: "destructive",
        })
        return
      }

      if (formData.newPassword.length < 6) {
        toast({
          title: "Error",
          description: "New password must be at least 6 characters long.",
          variant: "destructive",
        })
        return
      }
    }

    setLoading(true)

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        password: formData.newPassword || formData.currentPassword,
        role: formData.role,
        status: formData.status,
        companyId: user.companyId,
        professionalId: user.professionalId,
        theme: formData.theme,
        language: formData.language,
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

        setTheme(formData.theme)

        await refreshUser()

        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        let errorMessage = "Failed to update profile"
        try {
          if (response.text && typeof response.text === "function") {
            const errorText = await response.text()
            errorMessage = errorText || errorMessage
          }
        } catch (e) {
          console.error("Error reading response:", e)
        }
        toast({
          title: "Error",
          description: errorMessage,
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
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-gray-400 mt-1 text-sm md:text-base">Manage your personal information and preferences</p>
      </div>

      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Personal Information</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Update your personal details and account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Data */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Data</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="text-sm pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      className="text-sm pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Preferences</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme" className="text-sm">
                    Theme
                  </Label>
                  <Select
                    value={formData.theme}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, theme: value }))}
                  >
                    <SelectTrigger id="theme" className="text-sm">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm">
                    Language
                  </Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger id="language" className="text-sm">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Português (BR)
                        </div>
                      </SelectItem>
                      <SelectItem value="en">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          English
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Current Password Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Current Password (Required)</h3>
              <p className="text-sm text-muted-foreground">Enter your current password to confirm changes</p>
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm">
                  Current Password *
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter your current password"
                    className="text-sm"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Password Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Change Password (Optional)</h3>
              <p className="text-sm text-muted-foreground">Leave blank if you don't want to change your password</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                      className="text-sm"
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
                  <Label htmlFor="confirmPassword" className="text-sm">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                      className="text-sm"
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
              </div>
            </div>

            <Separator />

            <div className="pt-3 md:pt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Account Information</Label>
                <div className="text-xs md:text-sm text-gray-400 space-y-1">
                  <p>Account ID: {user.id}</p>
                  <p>Role: {formData.role}</p>
                  <p>Status: {formData.status === 1 ? "Active" : "Inactive"}</p>
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
