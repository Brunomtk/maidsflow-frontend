// Base API URL
const ENV_URL = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_URL : undefined
const LS_URL = typeof window !== "undefined" ? (localStorage.getItem("api_base_url") ?? undefined) : undefined

export const API_BASE_URL = "https://api.maidsflow.com/api"
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
    mode: "cors", // Enable CORS mode for cross-origin requests
    credentials: "include", // Include credentials (cookies, authorization headers)
    headers: {
      ...createHeaders(),
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)

    console.log(`Response status: ${response.status}`)

    if (!response.ok) {
      let errorText = "Unknown error"
      try {
        if (response.text && typeof response.text === "function") {
          errorText = await response.text()
        }
      } catch (e) {
        console.error("Failed to read error response:", e)
      }
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
