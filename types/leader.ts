export interface Leader {
  id: number
  name: string
  email: string
  phone: string
  status: string
  createdDate: string
  userId?: number
  region?: string
}

export interface CreateLeaderRequest {
  userId: number
  region: string
  name: string
  email: string
  phone: string
}

export interface UpdateLeaderRequest {
  userId: number
  region: string
  name: string
  email: string
  phone: string
}
