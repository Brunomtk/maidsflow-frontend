import type { ApiResponse } from "@/types"
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

// Helper function to make API calls
const apiCall = async (endpoint: string) => {
  const baseUrl = getApiUrl()
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

  const response = await fetch(url, {
    method: "GET",
    headers: createHeaders(),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Get dashboard statistics
export async function getDashboardStats(): Promise<ApiResponse<any>> {
  try {
    console.log("Fetching dashboard stats from API...")

    // Fetch real data from multiple endpoints
    const [companiesData, customersData, appointmentsData] = await Promise.allSettled([
      apiCall("/Companies"),
      apiCall("/Customer"),
      apiCall("/Appointment"),
    ])

    // Process the results
    const processData = (result: PromiseSettledResult<any>) => {
      if (result.status === "fulfilled") {
        const data = result.value
        return data.results || data.result || data.data || data || []
      }
      return []
    }

    const companies = processData(companiesData)
    const customers = processData(customersData)
    const appointments = processData(appointmentsData)

    const stats = {
      companies: {
        total: Array.isArray(companies) ? companies.length : 0,
        active: Array.isArray(companies)
          ? companies.filter((c: any) => c.status === 1 || c.status === "Active").length
          : 0,
        loading: false,
      },
      customers: {
        total: Array.isArray(customers) ? customers.length : 0,
        active: Array.isArray(customers)
          ? customers.filter((c: any) => c.status === 1 || c.status === "Active").length
          : 0,
        loading: false,
      },
      appointments: {
        total: Array.isArray(appointments) ? appointments.length : 0,
        scheduled: Array.isArray(appointments)
          ? appointments.filter((a: any) => a.status === "Scheduled" || a.status === 1).length
          : 0,
        completed: Array.isArray(appointments)
          ? appointments.filter((a: any) => a.status === "Completed" || a.status === 2).length
          : 0,
        cancelled: Array.isArray(appointments)
          ? appointments.filter((a: any) => a.status === "Cancelled" || a.status === 0).length
          : 0,
        loading: false,
      },
      checkRecords: {
        total: 0,
        checkedIn: 0,
        checkedOut: 0,
        loading: false,
      },
      payments: {
        total: 0,
        paid: 0,
        pending: 0,
        overdue: 0,
        totalAmount: 0,
        loading: false,
      },
    }

    return {
      status: 200,
      data: stats,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    throw error
  }
}

// Get recent activities
export async function getRecentActivities(limit = 10): Promise<ApiResponse<any[]>> {
  try {
    const url = `${getApiUrl()}/Dashboard/activities?limit=${limit}`
    console.log("Fetching recent activities from URL:", url)

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
      data: data.results || data.data || [],
    }
  } catch (error) {
    console.error("Error fetching recent activities:", error)
    return {
      status: 200,
      data: [],
    }
  }
}

// Get dashboard chart data
export async function getDashboardChartData(period = "7d", type = "appointments"): Promise<ApiResponse<any[]>> {
  try {
    const url = `${getApiUrl()}/Dashboard/chart?period=${period}&type=${type}`
    console.log("Fetching chart data from URL:", url)

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
      data: data.results || data.data || [],
    }
  } catch (error) {
    console.error("Error fetching chart data:", error)
    return {
      status: 200,
      data: [],
    }
  }
}

// Get companies count
export async function getCompaniesCount(): Promise<ApiResponse<number>> {
  try {
    const data = await apiCall("/Companies")
    const companies = data.results || data.result || data.data || data || []
    const count = Array.isArray(companies) ? companies.length : 0

    return {
      status: 200,
      data: count,
    }
  } catch (error) {
    console.error("Error fetching companies count:", error)
    return {
      status: 200,
      data: 0,
    }
  }
}

// Get professionals count
export async function getProfessionalsCount(): Promise<ApiResponse<number>> {
  try {
    const data = await apiCall("/Professional")
    const professionals = data.results || data.result || data.data || data || []
    const count = Array.isArray(professionals) ? professionals.length : 0

    return {
      status: 200,
      data: count,
    }
  } catch (error) {
    console.error("Error fetching professionals count:", error)
    return {
      status: 200,
      data: 0,
    }
  }
}

// Get customers count
export async function getCustomersCount(): Promise<ApiResponse<number>> {
  try {
    const data = await apiCall("/Customer")
    const customers = data.results || data.result || data.data || data || []
    const count = Array.isArray(customers) ? customers.length : 0

    return {
      status: 200,
      data: count,
    }
  } catch (error) {
    console.error("Error fetching customers count:", error)
    return {
      status: 200,
      data: 0,
    }
  }
}
