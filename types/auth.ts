import type { User } from "./user"

export interface AuthUser extends Omit<User, "password"> {
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean // Added rememberMe field
}

export interface AuthResponse {
  id: number
  name: string
  email: string
  role: string
  avatar: string | null
  status: number
  token: string
  companyId: number | null
  professionalId: number | null
  language: string | null
  theme: string | null
  refreshToken: string
  refreshTokenExpiresAt?: string
  createdDate: string
  updatedDate: string
}

export interface RefreshTokenRequest {
  token: string
  refreshToken: string
}
