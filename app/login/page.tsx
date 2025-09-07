"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { NoahLogo } from "@/components/noah-logo"
import { GlobalLoadingSpinner } from "@/components/ui/global-loading-spinner"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simula carregamento por 2 segundos
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <GlobalLoadingSpinner />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center mb-8">
          <NoahLogo className="h-48 w-auto" /> {/* Logo grande */}
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
