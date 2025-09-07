"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { authApi } from "@/lib/api" // Importe authApi
import { toast } from "sonner"

export function RegisterForm() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

    setIsLoading(true)
    try {
      const response = await authApi.register({
        // Usando authApi.register
        fullName,
        email,
        password,
        role,
      })

      if (response.status === 201 && response.data) {
        toast.success("Account created successfully! Please log in.")
        router.push("/login")
      } else {
        toast.error(response.error || "Registration failed. Please try again.")
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("An unexpected error occurred during registration.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-[#1a2234] text-white border-[#2a3349]">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription className="text-gray-300">Fill in your details to create your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full-name" className="text-white">
              Full Name
            </Label>
            <Input
              id="full-name"
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-white">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-white"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-white">
              Role
            </Label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger
                id="role"
                className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
              >
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2234] text-white border-[#2a3349]">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
          <div className="text-center text-sm text-gray-300">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
