export const API_BASE_URL = "https://206.189.191.51:5001/api"

export const fetchApi = async (endpoint: string, options?: RequestInit): Promise<any> => {
  const url = `${API_BASE_URL}/${endpoint.startsWith("/") ? endpoint.slice(1) : endpoint}`

  const response = await fetch(url, {
    mode: "cors",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`)
  }

  return response.json()
}
