import type { User } from "./user"

export interface AuthUser extends Omit<User, "password"> {
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
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
  createdDate: string
  updatedDate: string
}
