"use client"

import { useCallback } from "react"
import { useInternalFeedbackContext } from "@/contexts/internal-feedback-context"

export function useInternalFeedback() {
  const context = useInternalFeedbackContext()

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
  const getStatusStyles = useCallback((status: number) => {
    switch (status) {
      case 0:
        return "border-yellow-500 text-yellow-500"
      case 2:
        return "border-green-500 text-green-500"
      case 1:
        return "border-blue-500 text-blue-500"
      default:
        return "border-gray-500 text-gray-500"
    }
  }, [])

  // Helper function to get priority styles
  const getPriorityStyles = useCallback((priority: number) => {
    switch (priority) {
      case 0:
        return "border-green-500 text-green-500"
      case 1:
        return "border-yellow-500 text-yellow-500"
      case 2:
        return "border-red-500 text-red-500"
      default:
        return "border-gray-500 text-gray-500"
    }
  }, [])

  // Helper function to get status label
  const getStatusLabel = useCallback((status: number) => {
    switch (status) {
      case 0:
        return "Pending"
      case 2:
        return "Resolved"
      case 1:
        return "In Progress"
      default:
        return "Unknown"
    }
  }, [])

  // Helper function to get priority label
  const getPriorityLabel = useCallback((priority: number) => {
    switch (priority) {
      case 0:
        return "Low"
      case 1:
        return "Medium"
      case 2:
        return "High"
      default:
        return "Unknown"
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
