"use client"

import type React from "react"

import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { CompanyTeamsProvider } from "@/contexts/company-teams-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <CompanyTeamsProvider>{children}</CompanyTeamsProvider>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}
