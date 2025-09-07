// Base API URL
const ENV_URL = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_URL : undefined
const LS_URL = typeof window !== "undefined" ? (localStorage.getItem("api_base_url") ?? undefined) : undefined
export const API_BASE_URL = (LS_URL || ENV_URL || "http://209.97.149.15:5000/api").replace(/\/+$/,"")
export const API_URL = API_BASE_URL

// Get API URL
export function getApiUrl(): string {
  return API_BASE_URL
}

// Get authentication token
export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("noah_token") || localStorage.getItem("token") || null
  }
  return null
}

// Create headers for API requests
export function createHeaders(): HeadersInit {
  const token = getAuthToken()
  return {
    "Content-Type": "application/json",
    accept: "*/*",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// API delay for simulation
export async function apiDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
export const delay = apiDelay

// Main API request function
export async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  // Ensure endpoint starts with a slash
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  const url = `${getApiUrl()}${normalizedEndpoint}`

  console.log(`Making API request to: ${url}`)
  console.log("Request options:", options)

  const config: RequestInit = {
    ...options,
    headers: {
      ...createHeaders(),
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)

    console.log(`Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error: ${response.status} - ${errorText}`)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    // Check if response has content
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()
      console.log("Response data:", data)
      return data
    } else {
      // For responses without JSON content (like DELETE requests)
      return null
    }
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

// Legacy function for backward compatibility
export async function fetchApi(endpoint: string, options: RequestInit = {}): Promise<any> {
  return apiRequest(endpoint, options)
}
