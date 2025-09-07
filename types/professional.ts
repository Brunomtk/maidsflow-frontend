// Professional Types based on real API
export interface Professional {
  id: number
  name: string
  cpf: string
  email: string
  phone: string
  teamId: number
  companyId: number
  status: "Active" | "Inactive"
  rating: number | null
  completedServices: number | null
  createdAt: string
  updatedAt: string
}

export interface CreateProfessionalRequest {
  name: string
  cpf: string
  email: string
  phone: string
  teamId: number
  companyId: number
}

export interface UpdateProfessionalRequest {
  name: string
  cpf: string
  email: string
  phone: string
  teamId: number
  status: 1 | 0 // 1 for Active, 0 for Inactive
}

export interface ProfessionalFilters {
  search?: string
  status?: "all" | "Active" | "Inactive"
  teamId?: number
  companyId?: number
  page?: number
  limit?: number
}

export interface ProfessionalStats {
  totalProfessionals: number
  activeProfessionals: number
  inactiveProfessionals: number
  averageRating: number
  totalCompletedServices: number
}
