"use client"

import { useCallback } from "react"
import { useInternalReportsContext } from "@/contexts/internal-reports-context"
import type { InternalReportStatus, InternalReportPriority } from "@/types/internal-report"

export function useInternalReports() {
  const context = useInternalReportsContext()

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
  const getStatusStyles = useCallback((status: InternalReportStatus) => {
    switch (status) {
      case "pending":
        return "border-yellow-500 text-yellow-500"
      case "resolved":
        return "border-green-500 text-green-500"
      case "in_progress":
        return "border-blue-500 text-blue-500"
      default:
        return "border-gray-500 text-gray-500"
    }
  }, [])

  // Helper function to get priority styles
  const getPriorityStyles = useCallback((priority: InternalReportPriority) => {
    switch (priority) {
      case "low":
        return "border-green-500 text-green-500"
      case "medium":
        return "border-yellow-500 text-yellow-500"
      case "high":
        return "border-red-500 text-red-500"
      default:
        return "border-gray-500 text-gray-500"
    }
  }, [])

  // Helper function to get status label
  const getStatusLabel = useCallback((status: InternalReportStatus) => {
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
  const getPriorityLabel = useCallback((priority: InternalReportPriority) => {
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

  // Helper function to update filters
  const updateFilters = useCallback(
    (key: string, value: string) => {
      context.setFilters({ ...context.filters, [key]: value })
    },
    [context],
  )

  return {
    ...context,
    formatDate,
    getStatusStyles,
    getPriorityStyles,
    getStatusLabel,
    getPriorityLabel,
    updateFilters,
  }
}
