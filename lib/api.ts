import type { ApiResponse, LoginCredentials, AuthUser, User, RegisterUserData, PaginatedResponse } from "@/types"
import type { AuthResponse } from "@/types/auth"

// Base URL da API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://209.97.149.15:5000/api"

// Função para obter o header de autenticação
export const getAuthHeader = (): Record<string, string> => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("noah_token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
  return {}
}

// Função genérica para fazer requisições à API
export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        error: errorText || `HTTP error! status: ${response.status}`,
        status: response.status,
      }
    }

    const data = await response.json()
    return { data, status: response.status }
  } catch (error) {
    console.error("API request failed:", error)
    return {
      error: "Failed to fetch data from API",
      status: 500,
    }
  }
}

// API de Autenticação
export const authApi = {
  // Login
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthUser>> {
    try {
      const response = await fetchApi<AuthResponse>("/Users/authenticate", {
        method: "POST",
        body: JSON.stringify(credentials),
      })
      if (response.error || !response.data) {
        return {
          error: response.error || "Invalid credentials",
          status: response.status,
        }
      }

      const auth = response.data
      const authUser: AuthUser = {
        id: auth.id,
        name: auth.name,
        email: auth.email,
        role: auth.role,
        avatar: auth.avatar,
        status: auth.status,
        token: auth.token,
        companyId: auth.companyId,
        professionalId: auth.professionalId,
        createdDate: auth.createdDate,
        updatedDate: auth.updatedDate,
      }

      localStorage.setItem("noah_token", auth.token)
      return { data: authUser, status: response.status }
    } catch (error) {
      console.error("Login failed:", error)
      return {
        error: "Authentication failed",
        status: 500,
      }
    }
  },

  // Logout
  async logout(): Promise<ApiResponse<null>> {
    try {
      localStorage.removeItem("noah_token")
      return { status: 200 }
    } catch (error) {
      console.error("Logout failed:", error)
      return {
        error: "Logout failed",
        status: 500,
      }
    }
  },

  // Verificar autenticação atual
  async checkAuth(): Promise<ApiResponse<AuthUser>> {
    const token = localStorage.getItem("noah_token")
    if (!token) {
      return { error: "Not authenticated", status: 401 }
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      const userId = payload.UserId
      if (!userId) {
        return { error: "Invalid token", status: 401 }
      }

      const response = await fetchApi<User>(`/Users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.error || !response.data) {
        return { error: "Invalid token", status: 401 }
      }

      const u = response.data
      const authUser: AuthUser = {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        status: u.status,
        token,
        companyId: u.companyId,
        professionalId: u.professionalId,
        createdDate: u.createdDate,
        updatedDate: u.updatedDate,
      }
      return { data: authUser, status: 200 }
    } catch (error) {
      console.error("Auth check failed:", error)
      return { error: "Authentication check failed", status: 500 }
    }
  },

  // Registrar novo usuário
  async register(userData: RegisterUserData): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetchApi<boolean>("/Users/create", {
        method: "POST",
        body: JSON.stringify(userData),
      })
      if (response.error) {
        return { error: response.error, status: response.status }
      }
      return { data: response.data ?? false, status: 201 }
    } catch (error) {
      console.error("Registration failed:", error)
      return { error: "Registration failed", status: 500 }
    }
  },
}

// API de Usuários
export const usersApi = {
  // Listar usuários (com paginação)
  getUsers(page = 1, limit = 10, name?: string): Promise<ApiResponse<PaginatedResponse<User>>> {
    const params = new URLSearchParams({
      pageNumber: page.toString(),
      pageSize: limit.toString(),
    })
    if (name) params.append("Name", name)
    return fetchApi<PaginatedResponse<User>>(`/Users/paged?${params.toString()}`)
  },

  // Obter usuário por ID
  getUserById(id: string): Promise<ApiResponse<User>> {
    return fetchApi<User>(`/Users/${id}`)
  },

  // Atualizar usuário
  updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<boolean>> {
    return fetchApi<boolean>(`/Users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  },

  // Excluir usuário
  deleteUser(id: string): Promise<ApiResponse<boolean>> {
    return fetchApi<boolean>(`/Users/${id}`, { method: "DELETE" })
  },

  // Listar todos os usuários
  getAllUsers(): Promise<ApiResponse<User[]>> {
    return fetchApi<User[]>("/Users")
  },
}
