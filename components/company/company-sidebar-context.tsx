"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type SidebarContextType = {
  collapsed: boolean
  toggleSidebar: () => void
  setCollapsed: (value: boolean) => void
  isMobileOpen: boolean
  setIsMobileOpen: (value: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function CompanySidebarProvider({ children }: { children: React.ReactNode }) {
  // Use localStorage to persist the state between page navigations
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false)

  // Initialize from localStorage when component mounts
  useEffect(() => {
    const storedState = localStorage.getItem("companySidebarCollapsed")
    if (storedState !== null) {
      setCollapsed(storedState === "true")
    }
  }, [])

  // Update localStorage when state changes
  useEffect(() => {
    localStorage.setItem("companySidebarCollapsed", String(collapsed))
  }, [collapsed])

  const toggleSidebar = () => {
    // On mobile, toggle the mobile overlay
    if (window.innerWidth < 1024) {
      setIsMobileOpen(!isMobileOpen)
    } else {
      // On desktop, toggle collapse
      setCollapsed(!collapsed)
    }
  }

  return (
    <SidebarContext.Provider value={{ collapsed, toggleSidebar, setCollapsed, isMobileOpen, setIsMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useCompanySidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useCompanySidebar must be used within a CompanySidebarProvider")
  }
  return context
}
