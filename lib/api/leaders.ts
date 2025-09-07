import { fetchApi } from "./utils"
import type { Leader, CreateLeaderRequest, UpdateLeaderRequest } from "@/types/leader"

export const leadersApi = {
  // Get all leaders
  async getAll(): Promise<Leader[]> {
    return await fetchApi<Leader[]>("/Leader")
  },

  // Get leader by ID
  async getById(id: number): Promise<Leader> {
    return await fetchApi<Leader>(`/Leader/${id}`)
  },

  // Create new leader
  async create(data: CreateLeaderRequest): Promise<Leader> {
    return await fetchApi<Leader>("/Leader", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  // Update leader
  async update(id: number, data: UpdateLeaderRequest): Promise<Leader> {
    return await fetchApi<Leader>(`/Leader/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  // Delete leader
  async delete(id: number): Promise<void> {
    await fetchApi<void>(`/Leader/${id}`, {
      method: "DELETE",
    })
  },
}
