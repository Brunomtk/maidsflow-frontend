"use client"

import { useState, useCallback } from "react"
import type { Team, Professional } from "@/types"
import { useTeams } from "@/contexts/teams-context"

interface UseTeamReturn {
  team: Team | null
  members: Professional[]
  performance: {
    onTimeCompletion: number
    customerSatisfaction: number
    qualityScore: number
    efficiency: number
  } | null
  upcomingServices: Array<{
    id: string
    date: string
    time: string
    customer: string
    address: string
    type: string
  }> | null
  isLoading: boolean
  error: string | null
  fetchTeam: (id: string) => Promise<void>
  fetchMembers: (teamId: string) => Promise<void>
  fetchPerformance: (teamId: string) => Promise<void>
  fetchUpcomingServices: (teamId: string) => Promise<void>
  updateTeam: (data: Partial<Team>) => Promise<Team | null>
  deleteTeam: () => Promise<boolean>
}

export function useTeam(initialTeamId?: string): UseTeamReturn {
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<Professional[]>([])
  const [performance, setPerformance] = useState<{
    onTimeCompletion: number
    customerSatisfaction: number
    qualityScore: number
    efficiency: number
  } | null>(null)
  const [upcomingServices, setUpcomingServices] = useState<Array<{
    id: string
    date: string
    time: string
    customer: string
    address: string
    type: string
  }> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getTeam, getMembers, getPerformance, getUpcomingServices, editTeam, removeTeam } = useTeams()

  const fetchTeam = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const teamData = await getTeam(id)
        setTeam(teamData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch team"
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [getTeam],
  )

  const fetchMembers = useCallback(
    async (teamId: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const membersData = await getMembers(teamId)
        setMembers(membersData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch team members"
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [getMembers],
  )

  const fetchPerformance = useCallback(
    async (teamId: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const performanceData = await getPerformance(teamId)
        setPerformance(performanceData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch team performance"
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [getPerformance],
  )

  const fetchUpcomingServices = useCallback(
    async (teamId: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const servicesData = await getUpcomingServices(teamId)
        setUpcomingServices(servicesData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch upcoming services"
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [getUpcomingServices],
  )

  const updateTeam = useCallback(
    async (data: Partial<Team>): Promise<Team | null> => {
      if (!team) return null

      setIsLoading(true)
      setError(null)

      try {
        const updatedTeam = await editTeam(team.id, data)
        if (updatedTeam) {
          setTeam(updatedTeam)
        }
        return updatedTeam
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update team"
        setError(errorMessage)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [team, editTeam],
  )

  const deleteTeam = useCallback(async (): Promise<boolean> => {
    if (!team) return false

    setIsLoading(true)
    setError(null)

    try {
      const success = await removeTeam(team.id)
      if (success) {
        setTeam(null)
      }
      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete team"
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [team, removeTeam])

  // Initialize with the provided team ID
  if (initialTeamId && !team && !isLoading) {
    fetchTeam(initialTeamId)
  }

  return {
    team,
    members,
    performance,
    upcomingServices,
    isLoading,
    error,
    fetchTeam,
    fetchMembers,
    fetchPerformance,
    fetchUpcomingServices,
    updateTeam,
    deleteTeam,
  }
}
