// User Types
export type UserRole = "admin" | "company" | "professional" | "operador" | "leader"

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  avatar?: string | null
  createdDate: string
  updatedDate: string
  status: number // 1 = active, 0 = inactive
  companyId?: number | null
  professionalId?: number | null
  password?: string // Only for creation/update
  language?: string | null // "pt-BR" | "en"
  theme?: string | null // "light" | "dark"
  refreshToken?: string | null
  refreshTokenExpiresAt?: string | null
}

export interface RegisterUserData {
  name: string
  email: string
  password: string
  role: UserRole
  status: number
  companyId?: number | null
  professionalId?: number | null
  language?: string | null
  theme?: string | null
}
