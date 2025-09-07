"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { NoahLogo } from "./noah-logo"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login({ email, password })

      if (success) {
        // Redirecionar baseado no role do usuário
        const token = localStorage.getItem("noah_token")
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]))
          const role = payload.role

          switch (role) {
            case "admin":
              router.push("/admin/dashboard")
              break
            case "company":
              router.push("/company/dashboard")
              break
            case "professional":
              router.push("/professional/dashboard")
              break
            default:
              router.push("/admin/dashboard")
          }
        }
      }
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className=" flex items-center justify-center from-slate-900 via-blue-900 to-slate-900 p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="space-y-4 text-center">
          <div>
            <CardTitle className="text-2xl font-bold text-white">Welcome back</CardTitle>
            <CardDescription className="text-gray-300">Sign in to your account to continue</CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
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
                  placeholder="Enter your password"
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
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
            <div className="text-center text-sm text-gray-300">
              Don't have an account?{" "}
              <Link href="/register" className="text-cyan-400 hover:text-cyan-300 underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
