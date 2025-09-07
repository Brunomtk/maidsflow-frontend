"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react"
import type { Team, CreateTeamRequest, UpdateTeamRequest } from "@/types"
import { getTeams, getTeamById, createTeam, updateTeam, deleteTeam } from "@/lib/api/teams"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface CompanyTeamsContextType {
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
  addTeam: (team: CreateTeamRequest) => Promise<Team | null>
  editTeam: (id: string, team: UpdateTeamRequest) => Promise<Team | null>
  removeTeam: (id: string) => Promise<boolean>
  setStatusFilter: (status: string) => void
  setSearchQuery: (query: string) => void
}

const CompanyTeamsContext = createContext<CompanyTeamsContextType | undefined>(undefined)

export function CompanyTeamsProvider({ children }: { children: React.ReactNode }) {
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
  const { user } = useAuth()

  const fetchTeams = useCallback(
    async (page = 1, status = statusFilter, search = searchQuery) => {
      if (!user?.companyId) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await getTeams(page, pagination.itemsPerPage, status, search)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Erro",
            description: response.error,
            variant: "destructive",
          })
          return
        }

        if (response.data) {
          // Filter teams by company
          const companyTeams = response.data.data.filter((team) => team.companyId === user.companyId)
          setTeams(companyTeams)
          setPagination({
            ...response.data.meta,
            totalItems: companyTeams.length,
          })
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Falha ao buscar equipes"
        setError(errorMessage)
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [statusFilter, searchQuery, pagination.itemsPerPage, toast, user?.companyId],
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
            title: "Erro",
            description: response.error,
            variant: "destructive",
          })
          return null
        }

        return response.data || null
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Falha ao buscar equipe"
        setError(errorMessage)
        toast({
          title: "Erro",
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
    async (teamData: CreateTeamRequest): Promise<Team | null> => {
      if (!user?.companyId) return null

      setIsLoading(true)
      setError(null)

      try {
        const teamWithCompany = {
          ...teamData,
          companyId: user.companyId,
        }

        const response = await createTeam(teamWithCompany)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Erro",
            description: response.error,
            variant: "destructive",
          })
          return null
        }

        if (response.data) {
          toast({
            title: "Sucesso",
            description: response.message || "Equipe criada com sucesso",
          })
          // Refresh teams list
          fetchTeams()
          return response.data
        }

        return null
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Falha ao criar equipe"
        setError(errorMessage)
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        })
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [fetchTeams, toast, user?.companyId],
  )

  const editTeam = useCallback(
    async (id: string, teamData: UpdateTeamRequest): Promise<Team | null> => {
      if (!user?.companyId) return null

      setIsLoading(true)
      setError(null)

      try {
        const teamWithCompany = {
          ...teamData,
          companyId: user.companyId,
        }

        const response = await updateTeam(id, teamWithCompany)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Erro",
            description: response.error,
            variant: "destructive",
          })
          return null
        }

        if (response.data) {
          toast({
            title: "Sucesso",
            description: response.message || "Equipe atualizada com sucesso",
          })
          // Refresh teams list
          fetchTeams()
          return response.data
        }

        return null
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Falha ao atualizar equipe"
        setError(errorMessage)
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        })
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [fetchTeams, toast, user?.companyId],
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
            title: "Erro",
            description: response.error,
            variant: "destructive",
          })
          return false
        }

        toast({
          title: "Sucesso",
          description: response.message || "Equipe excluída com sucesso",
        })
        // Refresh teams list
        fetchTeams()
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Falha ao excluir equipe"
        setError(errorMessage)
        toast({
          title: "Erro",
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

  // Initial fetch
  useEffect(() => {
    if (user?.companyId) {
      fetchTeams()
    }
  }, [fetchTeams, user?.companyId])

  // Update when filters change
  useEffect(() => {
    if (user?.companyId) {
      fetchTeams(1, statusFilter, searchQuery)
    }
  }, [statusFilter, searchQuery, fetchTeams, user?.companyId])

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
    ],
  )

  return <CompanyTeamsContext.Provider value={value}>{children}</CompanyTeamsContext.Provider>
}

export function useCompanyTeams() {
  const context = useContext(CompanyTeamsContext)
  if (context === undefined) {
    throw new Error("useCompanyTeams must be used within a CompanyTeamsProvider")
  }
  return context
}
