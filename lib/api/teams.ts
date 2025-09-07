import type { Team, ApiResponse, CreateTeamRequest, UpdateTeamRequest, TeamsResponse } from "@/types"
import { getApiUrl } from "./utils"

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("noah_token")
  }
  return null
}

// Helper function to create headers
const createHeaders = (): HeadersInit => {
  const token = getAuthToken()
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Get all teams with pagination and filters
export async function getTeams(
  page = 1,
  pageSize = 10,
  status = "all",
  search = "",
): Promise<ApiResponse<TeamsResponse>> {
  try {
    let url = `${getApiUrl()}/Team?page=${page}&pageSize=${pageSize}`

    if (status !== "all") {
      url += `&status=${status}`
    }

    if (search) {
      url += `&search=${encodeURIComponent(search)}`
    }

    console.log("Fetching teams from URL:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("Teams API response:", data)

    return {
      status: 200,
      data: {
        data: data.results || [],
        meta: {
          currentPage: data.currentPage || 1,
          totalPages: data.pageCount || 1,
          totalItems: data.totalItems || 0,
          itemsPerPage: data.pageSize || pageSize,
        },
      },
    }
  } catch (error) {
    console.error("Error fetching teams:", error)
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Failed to fetch teams",
    }
  }
}

// Get team by ID
export async function getTeamById(id: string): Promise<ApiResponse<Team>> {
  try {
    const url = `${getApiUrl()}/Team/${id}`
    console.log("Fetching team by ID from URL:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return {
      status: 200,
      data: data,
    }
  } catch (error) {
    console.error("Error fetching team:", error)
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Failed to fetch team",
    }
  }
}

// Create new team
export async function createTeam(data: CreateTeamRequest): Promise<ApiResponse<Team>> {
  try {
    const url = `${getApiUrl()}/Team`
    console.log("Creating team at URL:", url)

    const response = await fetch(url, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const responseData = await response.json()

    return {
      status: 201,
      data: responseData,
      message: "Team created successfully",
    }
  } catch (error) {
    console.error("Error creating team:", error)
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Failed to create team",
    }
  }
}

// Update team
export async function updateTeam(id: string, data: UpdateTeamRequest): Promise<ApiResponse<Team>> {
  try {
    const url = `${getApiUrl()}/Team/${id}`
    console.log("Updating team at URL:", url)

    const response = await fetch(url, {
      method: "PUT",
      headers: createHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Get updated team data
    const updatedTeam = await getTeamById(id)

    return {
      status: 200,
      data: updatedTeam.data,
      message: "Team updated successfully",
    }
  } catch (error) {
    console.error("Error updating team:", error)
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Failed to update team",
    }
  }
}

// Delete team
export async function deleteTeam(id: string): Promise<ApiResponse<void>> {
  try {
    const url = `${getApiUrl()}/Team/${id}`
    console.log("Deleting team at URL:", url)

    const response = await fetch(url, {
      method: "DELETE",
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return {
      status: 200,
      message: "Team deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting team:", error)
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Failed to delete team",
    }
  }
}

// Get team members (mock for now since endpoint not provided)
export async function getTeamMembers(teamId: string): Promise<ApiResponse<any[]>> {
  try {
    // This would be the actual API call when endpoint is available
    // const response = await fetch(`${getApiUrl()}/Team/${teamId}/members`)

    // Mock data for now
    return {
      status: 200,
      data: [],
    }
  } catch (error) {
    console.error("Error fetching team members:", error)
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Failed to fetch team members",
    }
  }
}

// Get team performance (mock for now since endpoint not provided)
export async function getTeamPerformance(teamId: string): Promise<
  ApiResponse<{
    onTimeCompletion: number
    customerSatisfaction: number
    qualityScore: number
    efficiency: number
  }>
> {
  try {
    // This would be the actual API call when endpoint is available
    // const response = await fetch(`${getApiUrl()}/Team/${teamId}/performance`)

    // Mock data for now
    return {
      status: 200,
      data: {
        onTimeCompletion: 95,
        customerSatisfaction: 92,
        qualityScore: 90,
        efficiency: 88,
      },
    }
  } catch (error) {
    console.error("Error fetching team performance:", error)
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Failed to fetch team performance",
    }
  }
}

// Get team upcoming services (mock for now since endpoint not provided)
export async function getTeamUpcomingServices(teamId: string): Promise<
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
  try {
    // This would be the actual API call when endpoint is available
    // const response = await fetch(`${getApiUrl()}/Team/${teamId}/services/upcoming`)

    // Mock data for now
    return {
      status: 200,
      data: [],
    }
  } catch (error) {
    console.error("Error fetching team upcoming services:", error)
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Failed to fetch team upcoming services",
    }
  }
}

// Get available professionals (mock for now since endpoint not provided)
export async function getAvailableProfessionals(companyId: string): Promise<ApiResponse<any[]>> {
  try {
    // This would be the actual API call when endpoint is available
    // const response = await fetch(`${getApiUrl()}/Company/${companyId}/professionals/available`)

    // Mock data for now
    return {
      status: 200,
      data: [],
    }
  } catch (error) {
    console.error("Error fetching available professionals:", error)
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Failed to fetch available professionals",
    }
  }
}
