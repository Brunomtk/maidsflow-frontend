import type { Company } from "./company"
import type { Leader } from "./leader"

export interface Team {
  id: number
  name: string
  region: string
  description: string
  rating: number
  completedServices: number
  status: number
  companyId: number
  company?: Company
  leaderId: number
  leader?: Leader
  createdDate: string
  updatedDate: string
}

export interface CreateTeamRequest {
  name: string
  leaderId: number
  region: string
  description: string
  companyId: number
}

export interface UpdateTeamRequest {
  id: number
  createdDate: string
  updatedDate: string
  name: string
  region: string
  description: string
  rating: number
  completedServices: number
  status: number
  companyId: number
  company?: Company
  leaderId: number
  leader?: Leader
}

export interface TeamsResponse {
  data: Team[]
  meta: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}
