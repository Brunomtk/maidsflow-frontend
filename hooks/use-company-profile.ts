"use client"

import { useCompanyProfileContext } from "@/contexts/company-profile-context"
import { useState } from "react"

export function useCompanyProfile() {
  const context = useCompanyProfileContext()
  const [activeTab, setActiveTab] = useState<string>("general")

  // Format date to readable format
  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A"

    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Format phone number
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return ""

    // Remove non-numeric characters
    const numericOnly = phone.replace(/\D/g, "")

    // Format as (XX) XXXXX-XXXX
    if (numericOnly.length === 11) {
      return `(${numericOnly.slice(0, 2)}) ${numericOnly.slice(2, 7)}-${numericOnly.slice(7)}`
    }

    // Format as (XX) XXXX-XXXX
    if (numericOnly.length === 10) {
      return `(${numericOnly.slice(0, 2)}) ${numericOnly.slice(2, 6)}-${numericOnly.slice(6)}`
    }

    return phone
  }

  // Format CNPJ
  const formatCNPJ = (cnpj: string): string => {
    if (!cnpj) return ""

    // Remove non-numeric characters
    const numericOnly = cnpj.replace(/\D/g, "")

    // Format as XX.XXX.XXX/XXXX-XX
    if (numericOnly.length === 14) {
      return `${numericOnly.slice(0, 2)}.${numericOnly.slice(2, 5)}.${numericOnly.slice(5, 8)}/${numericOnly.slice(8, 12)}-${numericOnly.slice(12)}`
    }

    return cnpj
  }

  // Format ZIP code
  const formatZipCode = (zipCode: string): string => {
    if (!zipCode) return ""

    // Remove non-numeric characters
    const numericOnly = zipCode.replace(/\D/g, "")

    // Format as XXXXX-XXX
    if (numericOnly.length === 8) {
      return `${numericOnly.slice(0, 5)}-${numericOnly.slice(5)}`
    }

    return zipCode
  }

  // Get days since password was last changed
  const getDaysSincePasswordChange = (): number => {
    if (!context.profile?.securitySettings?.passwordLastChanged) return 0

    const lastChanged = new Date(context.profile.securitySettings.passwordLastChanged)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - lastChanged.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  // Check if password should be updated (older than 90 days)
  const shouldUpdatePassword = (): boolean => {
    return getDaysSincePasswordChange() > 90
  }

  // Get business hours for a specific day
  const getBusinessHoursForDay = (day: string) => {
    if (!context.profile?.businessHours) return null
    return context.profile.businessHours[day.toLowerCase()]
  }

  // Check if business is open on a specific day
  const isOpenOnDay = (day: string): boolean => {
    const dayHours = getBusinessHoursForDay(day)
    return dayHours?.open || false
  }

  // Format business hours for display
  const formatBusinessHours = (day: string): string => {
    const dayHours = getBusinessHoursForDay(day)

    if (!dayHours || !dayHours.open) {
      return "Fechado"
    }

    let hoursText = `${dayHours.start} - ${dayHours.end}`

    if (dayHours.breaks && dayHours.breaks.length > 0) {
      const breakTexts = dayHours.breaks.map(
        (breakTime: { start: string; end: string }) => `${breakTime.start} - ${breakTime.end}`,
      )
      hoursText += ` (Intervalo: ${breakTexts.join(", ")})`
    }

    return hoursText
  }

  // Copy business hours from one day to all days
  const copyBusinessHoursToAllDays = (sourceDay: string) => {
    if (!context.profile?.businessHours) return

    const sourceDayHours = context.profile.businessHours[sourceDay.toLowerCase()]
    if (!sourceDayHours) return

    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    const updatedBusinessHours = { ...context.profile.businessHours }

    days.forEach((day) => {
      if (day !== sourceDay.toLowerCase()) {
        updatedBusinessHours[day] = { ...sourceDayHours }
      }
    })

    return context.updateBusinessHours(updatedBusinessHours)
  }

  return {
    ...context,
    activeTab,
    setActiveTab,
    formatDate,
    formatPhoneNumber,
    formatCNPJ,
    formatZipCode,
    getDaysSincePasswordChange,
    shouldUpdatePassword,
    getBusinessHoursForDay,
    isOpenOnDay,
    formatBusinessHours,
    copyBusinessHoursToAllDays,
  }
}
