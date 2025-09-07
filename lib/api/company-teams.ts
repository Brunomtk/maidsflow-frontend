import type { Team, PaginatedResponse, ApiResponse, Professional } from "@/types"
import { delay } from "./utils"

// Import existing team data and functions
import {
  getTeams as getAdminTeams,
  getTeamById as getAdminTeamById,
  createTeam as createAdminTeam,
  updateTeam as updateAdminTeam,
  deleteTeam as deleteAdminTeam,
  getTeamMembers as getAdminTeamMembers,
  getTeamPerformance as getAdminTeamPerformance,
  getTeamUpcomingServices as getAdminTeamUpcomingServices,
  getAvailableProfessionals as getAdminAvailableProfessionals,
} from "./teams"

// Company-specific team functions
export async function getCompanyTeams(
  companyId: string,
  page = 1,
  limit = 10,
  status?: string,
  search?: string,
): Promise<ApiResponse<PaginatedResponse<Team>>> {
  await delay(800) // Simulate network delay

  // Get all teams and filter by company
  const allTeamsResponse = await getAdminTeams(1, 1000, status, search)

  if (allTeamsResponse.error || !allTeamsResponse.data) {
    return allTeamsResponse
  }

  // Filter teams by company
  const companyTeams = allTeamsResponse.data.data.filter((team) => team.companyId === companyId)

  // Calculate pagination for filtered results
  const totalItems = companyTeams.length
  const totalPages = Math.ceil(totalItems / limit)
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedTeams = companyTeams.slice(startIndex, endIndex)

  return {
    status: 200,
    data: {
      data: paginatedTeams,
      meta: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    },
  }
}

export async function getCompanyTeamById(companyId: string, teamId: string): Promise<ApiResponse<Team>> {
  await delay(500) // Simulate network delay

  const teamResponse = await getAdminTeamById(teamId)

  if (teamResponse.error || !teamResponse.data) {
    return teamResponse
  }

  // Verify team belongs to company
  if (teamResponse.data.companyId !== companyId) {
    return {
      status: 403,
      error: "Access denied: Team does not belong to your company",
    }
  }

  return teamResponse
}

export async function createCompanyTeam(companyId: string, teamData: Partial<Team>): Promise<ApiResponse<Team>> {
  await delay(1000) // Simulate network delay

  // Ensure team is created for the correct company
  const teamWithCompany = {
    ...teamData,
    companyId,
  }

  return createAdminTeam(teamWithCompany)
}

export async function updateCompanyTeam(
  companyId: string,
  teamId: string,
  teamData: Partial<Team>,
): Promise<ApiResponse<Team>> {
  await delay(1000) // Simulate network delay

  // First verify team belongs to company
  const teamResponse = await getCompanyTeamById(companyId, teamId)
  if (teamResponse.error) {
    return teamResponse
  }

  // Ensure company ID cannot be changed
  const { companyId: _, ...updateData } = teamData

  return updateAdminTeam(teamId, updateData)
}

export async function deleteCompanyTeam(companyId: string, teamId: string): Promise<ApiResponse<null>> {
  await delay(1000) // Simulate network delay

  // First verify team belongs to company
  const teamResponse = await getCompanyTeamById(companyId, teamId)
  if (teamResponse.error) {
    return {
      status: teamResponse.status,
      error: teamResponse.error,
    }
  }

  return deleteAdminTeam(teamId)
}

export async function getCompanyTeamMembers(companyId: string, teamId: string): Promise<ApiResponse<Professional[]>> {
  await delay(500) // Simulate network delay

  // First verify team belongs to company
  const teamResponse = await getCompanyTeamById(companyId, teamId)
  if (teamResponse.error) {
    return {
      status: teamResponse.status,
      error: teamResponse.error,
    }
  }

  return getAdminTeamMembers(teamId)
}

export async function getCompanyTeamPerformance(
  companyId: string,
  teamId: string,
): Promise<
  ApiResponse<{
    onTimeCompletion: number
    customerSatisfaction: number
    qualityScore: number
    efficiency: number
  }>
> {
  await delay(500) // Simulate network delay

  // First verify team belongs to company
  const teamResponse = await getCompanyTeamById(companyId, teamId)
  if (teamResponse.error) {
    return {
      status: teamResponse.status,
      error: teamResponse.error,
    }
  }

  return getAdminTeamPerformance(teamId)
}

export async function getCompanyTeamUpcomingServices(
  companyId: string,
  teamId: string,
): Promise<
  ApiResponse<
    Array<{
      id: string
      date: string
      time: string
      customer: string
      address: string
      type: string
    }>
  >
> {
  await delay(500) // Simulate network delay

  // First verify team belongs to company
  const teamResponse = await getCompanyTeamById(companyId, teamId)
  if (teamResponse.error) {
    return {
      status: teamResponse.status,
      error: teamResponse.error,
    }
  }

  return getAdminTeamUpcomingServices(teamId)
}

export async function getCompanyAvailableProfessionals(companyId: string): Promise<ApiResponse<Professional[]>> {
  await delay(500) // Simulate network delay

  return getAdminAvailableProfessionals(companyId)
}

// Company-specific team statistics
export async function getCompanyTeamStats(companyId: string): Promise<
  ApiResponse<{
    totalTeams: number
    activeTeams: number
    inactiveTeams: number
    totalMembers: number
    averageRating: number
    totalCompletedServices: number
  }>
> {
  await delay(500) // Simulate network delay

  try {
    const teamsResponse = await getCompanyTeams(companyId, 1, 1000)

    if (teamsResponse.error || !teamsResponse.data) {
      return {
        status: 500,
        error: "Failed to fetch team statistics",
      }
    }

    const teams = teamsResponse.data.data
    const totalTeams = teams.length
    const activeTeams = teams.filter((team) => team.status === "active").length
    const inactiveTeams = teams.filter((team) => team.status === "inactive").length

    // Calculate totals and averages
    const totalCompletedServices = teams.reduce((sum, team) => sum + (team.completedServices || 0), 0)
    const totalRating = teams.reduce((sum, team) => sum + (team.rating || 0), 0)
    const averageRating = totalTeams > 0 ? totalRating / totalTeams : 0

    // Get total members across all teams
    let totalMembers = 0
    for (const team of teams) {
      const membersResponse = await getAdminTeamMembers(team.id)
      if (membersResponse.data) {
        totalMembers += membersResponse.data.length
      }
    }

    return {
      status: 200,
      data: {
        totalTeams,
        activeTeams,
        inactiveTeams,
        totalMembers,
        averageRating: Math.round(averageRating * 10) / 10,
        totalCompletedServices,
      },
    }
  } catch (err) {
    return {
      status: 500,
      error: "Failed to calculate team statistics",
    }
  }
}
