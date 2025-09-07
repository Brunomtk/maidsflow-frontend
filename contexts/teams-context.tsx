"use client"

import type React from "react"

import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react"
import type { Team, Professional } from "@/types"
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  getTeamPerformance,
  getTeamUpcomingServices,
} from "@/lib/api/teams"
import { useToast } from "@/hooks/use-toast"

interface TeamsContextType {
  teams: Team[]
  isLoading: boolean
  error: string | null
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  statusFilter: string
  searchQuery: string
  fetchTeams: (page?: number, status?: string, search?: string) => Promise<void>
  getTeam: (id: string) => Promise<Team | null>
  addTeam: (team: Partial<Team>) => Promise<Team | null>
  editTeam: (id: string, team: Partial<Team>) => Promise<Team | null>
  removeTeam: (id: string) => Promise<boolean>
  getMembers: (teamId: string) => Promise<Professional[]>
  getPerformance: (teamId: string) => Promise<{
    onTimeCompletion: number
    customerSatisfaction: number
    qualityScore: number
    efficiency: number
  } | null>
  getUpcomingServices: (teamId: string) => Promise<Array<{
    id: string
    date: string
    time: string
    customer: string
    address: string
    type: string
  }> | null>
  getAvailableProfessionals: (companyId: string) => Promise<Professional[]>
  setStatusFilter: (status: string) => void
  setSearchQuery: (query: string) => void
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined)

export function TeamsProvider({ children }: { children: React.ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })
  const { toast } = useToast()

  const fetchTeams = useCallback(
    async (page = 1, status = statusFilter, search = searchQuery) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await getTeams(page, pagination.itemsPerPage, status, search)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          })
          return
        }

        if (response.data) {
          setTeams(response.data.data)
          setPagination(response.data.meta)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch teams"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [statusFilter, searchQuery, pagination.itemsPerPage, toast],
  )

  const getTeam = useCallback(
    async (id: string): Promise<Team | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await getTeamById(id)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          })
          return null
        }

        return response.data || null
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch team"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const addTeam = useCallback(
    async (team: Partial<Team>): Promise<Team | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await createTeam(team)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          })
          return null
        }

        if (response.data) {
          toast({
            title: "Success",
            description: response.message || "Team created successfully",
          })
          // Refresh teams list
          fetchTeams()
          return response.data
        }

        return null
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create team"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [fetchTeams, toast],
  )

  const editTeam = useCallback(
    async (id: string, team: Partial<Team>): Promise<Team | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await updateTeam(id, team)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          })
          return null
        }

        if (response.data) {
          toast({
            title: "Success",
            description: response.message || "Team updated successfully",
          })
          // Refresh teams list
          fetchTeams()
          return response.data
        }

        return null
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update team"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [fetchTeams, toast],
  )

  const removeTeam = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await deleteTeam(id)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          })
          return false
        }

        toast({
          title: "Success",
          description: response.message || "Team deleted successfully",
        })
        // Refresh teams list
        fetchTeams()
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete team"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [fetchTeams, toast],
  )

  const getMembers = useCallback(
    async (teamId: string): Promise<Professional[]> => {
      try {
        const response = await getTeamMembers(teamId)

        if (response.error) {
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          })
          return []
        }

        return response.data || []
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch team members"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return []
      }
    },
    [toast],
  )

  const getPerformance = useCallback(
    async (
      teamId: string,
    ): Promise<{
      onTimeCompletion: number
      customerSatisfaction: number
      qualityScore: number
      efficiency: number
    } | null> => {
      try {
        const response = await getTeamPerformance(teamId)

        if (response.error) {
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          })
          return null
        }

        return response.data || null
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch team performance"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return null
      }
    },
    [toast],
  )

  const getUpcomingServices = useCallback(
    async (
      teamId: string,
    ): Promise<Array<{
      id: string
      date: string
      time: string
      customer: string
      address: string
      type: string
    }> | null> => {
      try {
        const response = await getTeamUpcomingServices(teamId)

        if (response.error) {
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          })
          return null
        }

        return response.data || null
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch upcoming services"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return null
      }
    },
    [toast],
  )

  const getAvailableProfessionals = useCallback(
    async (companyId: string): Promise<Professional[]> => {
      try {
        const response = await getAvailableProfessionals(companyId)

        if (response.error) {
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          })
          return []
        }

        return response.data || []
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch available professionals"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return []
      }
    },
    [toast],
  )

  // Initial fetch
  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  // Update when filters change
  useEffect(() => {
    fetchTeams(1, statusFilter, searchQuery)
  }, [statusFilter, searchQuery, fetchTeams])

  const value = useMemo(
    () => ({
      teams,
      isLoading,
      error,
      pagination,
      statusFilter,
      searchQuery,
      fetchTeams,
      getTeam,
      addTeam,
      editTeam,
      removeTeam,
      getMembers,
      getPerformance,
      getUpcomingServices,
      getAvailableProfessionals,
      setStatusFilter,
      setSearchQuery,
    }),
    [
      teams,
      isLoading,
      error,
      pagination,
      statusFilter,
      searchQuery,
      fetchTeams,
      getTeam,
      addTeam,
      editTeam,
      removeTeam,
      getMembers,
      getPerformance,
      getUpcomingServices,
      getAvailableProfessionals,
    ],
  )

  return <TeamsContext.Provider value={value}>{children}</TeamsContext.Provider>
}

export function useTeams() {
  const context = useContext(TeamsContext)
  if (context === undefined) {
    throw new Error("useTeams must be used within a TeamsProvider")
  }
  return context
}
