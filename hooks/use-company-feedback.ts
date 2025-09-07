"use client"

import { useCallback, useEffect } from "react"
import { useCompanyFeedbackContext } from "@/contexts/company-feedback-context"
import type { InternalFeedbackStatus, InternalFeedbackPriority } from "@/types/internal-feedback"

export function useCompanyFeedback() {
  const context = useCompanyFeedbackContext()

  // Helper function to format dates
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }, [])

  // Helper function to get status styles
  const getStatusStyles = useCallback((status: InternalFeedbackStatus) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/20 text-amber-500 border-amber-500"
      case "resolved":
        return "bg-green-500/20 text-green-500 border-green-500"
      case "in_progress":
        return "bg-blue-500/20 text-blue-500 border-blue-500"
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500"
    }
  }, [])

  // Helper function to get priority styles
  const getPriorityStyles = useCallback((priority: InternalFeedbackPriority) => {
    switch (priority) {
      case "low":
        return "bg-green-500/20 text-green-500 border-green-500"
      case "medium":
        return "bg-amber-500/20 text-amber-500 border-amber-500"
      case "high":
        return "bg-red-500/20 text-red-500 border-red-500"
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500"
    }
  }, [])

  // Helper function to get status label
  const getStatusLabel = useCallback((status: InternalFeedbackStatus) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "resolved":
        return "Resolved"
      case "in_progress":
        return "In Progress"
      default:
        return status
    }
  }, [])

  // Helper function to get priority label
  const getPriorityLabel = useCallback((priority: InternalFeedbackPriority) => {
    switch (priority) {
      case "low":
        return "Low"
      case "medium":
        return "Medium"
      case "high":
        return "High"
      default:
        return priority
    }
  }, [])

  // Helper function to get type icon
  const getTypeIcon = useCallback((type: string) => {
    switch (type.toLowerCase()) {
      case "issue":
        return "AlertTriangle"
      case "material":
        return "Package"
      case "suggestion":
        return "Lightbulb"
      case "equipment":
        return "Wrench"
      case "scheduling":
        return "Calendar"
      case "customer info":
        return "User"
      case "training":
        return "GraduationCap"
      case "safety":
        return "Shield"
      default:
        return "MessageSquare"
    }
  }, [])

  // Helper function to get type color
  const getTypeColor = useCallback((type: string) => {
    switch (type.toLowerCase()) {
      case "issue":
        return "text-amber-500"
      case "material":
        return "text-blue-500"
      case "suggestion":
        return "text-green-500"
      case "equipment":
        return "text-purple-500"
      case "scheduling":
        return "text-indigo-500"
      case "customer info":
        return "text-pink-500"
      case "training":
        return "text-cyan-500"
      case "safety":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }, [])

  // Helper function to update filters
  const updateFilters = useCallback(
    (key: string, value: string) => {
      context.setFilters({ ...context.filters, [key]: value })
    },
    [context],
  )

  // Helper function to get feedback categories
  const getFeedbackCategories = useCallback(() => {
    return ["Equipment", "Scheduling", "Customer Info", "Training", "Safety", "Material", "Other"]
  }, [])

  // Helper function to calculate response time
  const calculateResponseTime = useCallback((createdAt: string, updatedAt: string) => {
    const created = new Date(createdAt)
    const updated = new Date(updatedAt)
    const diffMs = updated.getTime() - created.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""}`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""}`
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`
    }
  }, [])

  // Load initial data
  useEffect(() => {
    if (!context.feedbacks.length && !context.isLoading) {
      context.fetchFeedbacks()
    }
    if (!context.stats && !context.isLoading) {
      context.fetchStats()
    }
  }, [context])

  return {
    ...context,
    formatDate,
    getStatusStyles,
    getPriorityStyles,
    getStatusLabel,
    getPriorityLabel,
    getTypeIcon,
    getTypeColor,
    updateFilters,
    getFeedbackCategories,
    calculateResponseTime,
  }
}
