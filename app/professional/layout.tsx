"use client"

import type React from "react"
import { useState } from "react"
import { ProfessionalHeader } from "@/components/professional/professional-header"
import { ProfessionalSidebar } from "@/components/professional/professional-sidebar"
import { ProfessionalMobileNav } from "@/components/professional/professional-mobile-nav"

export default function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900">
      <div className="hidden md:block">
        <ProfessionalSidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-background">
            <ProfessionalSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <ProfessionalHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>

        <div className="md:hidden">
          <ProfessionalMobileNav />
        </div>
      </div>
    </div>
  )
}
