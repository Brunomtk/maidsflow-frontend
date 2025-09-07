import { fetchApi } from "./utils"
import type { Plan, PlanFormData } from "@/types/plan"

// Tipos para as respostas da API
interface PaginatedResponse<T> {
  results: T[]
  currentPage: number
  pageCount: number
  pageSize: number
  totalItems: number
  firstRowOnPage: number
  lastRowOnPage: number
}

// Get all plans with optional filtering
export async function getPlans(
  page = 1,
  limit = 10,
  status?: number,
  search?: string,
): Promise<{ status: number; data?: { items: Plan[]; meta: any }; error?: string }> {
  try {
    const params = new URLSearchParams({
      pageNumber: page.toString(),
      pageSize: limit.toString(),
    })
    if (search) params.append("name", search)
    if (status !== undefined) params.append("status", status.toString())

    // Aqui fetchApi já retorna o objeto JSON parseado
    const data = await fetchApi<PaginatedResponse<Plan>>(`/Plan/paged?${params}`)

    return {
      status: 200,
      data: {
        items: data.results,
        meta: {
          currentPage: data.currentPage,
          totalPages: data.pageCount,
          totalItems: data.totalItems,
          itemsPerPage: data.pageSize,
        },
      },
    }
  } catch (err) {
    console.error("Error fetching plans:", err)
    return {
      status: 500,
      error: "Failed to fetch plans. Please try again.",
    }
  }
}

// Get a specific plan by ID
export async function getPlan(id: string): Promise<{ status: number; data?: Plan; error?: string }> {
  try {
    const data = await fetchApi<Plan>(`/Plan/${id}`)
    return { status: 200, data }
  } catch (err) {
    console.error("Error fetching plan:", err)
    return {
      status: 500,
      error: "Failed to fetch plan. Please try again.",
    }
  }
}

// Create a new plan
export async function createPlan(planData: PlanFormData): Promise<{ status: number; data?: Plan; error?: string }> {
  try {
    const created = await fetchApi<Plan>("/Plan", {
      method: "POST",
      body: JSON.stringify(planData),
    })
    return { status: 201, data: created }
  } catch (err) {
    console.error("Error creating plan:", err)
    return {
      status: 500,
      error: "Failed to create plan. Please try again.",
    }
  }
}

// Update an existing plan
export async function updatePlan(
  id: string,
  planData: PlanFormData,
): Promise<{ status: number; data?: Plan; error?: string }> {
  try {
    // Se a API retornar o objeto, ele virá aqui; caso contrário, devemos buscá-lo após o PUT
    const updated = await fetchApi<Plan>(`/Plan/${id}`, {
      method: "PUT",
      body: JSON.stringify(planData),
    })
    return { status: 200, data: updated }
  } catch (err) {
    console.error("Error updating plan:", err)
    return {
      status: 500,
      error: "Failed to update plan. Please try again.",
    }
  }
}

// Delete a plan
export async function deletePlan(id: string): Promise<{ status: number; data?: null; error?: string }> {
  try {
    await fetchApi(`/Plan/${id}`, { method: "DELETE" })
    return { status: 200, data: null }
  } catch (err) {
    console.error("Error deleting plan:", err)
    return {
      status: 500,
      error: "Failed to delete plan. Please try again.",
    }
  }
}

// Update plan status (activate/deactivate)
export async function updatePlanStatus(
  id: string,
  status: number,
): Promise<{ status: number; data?: Plan; error?: string }> {
  try {
    await fetchApi(`/Plan/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
    // buscamos o plano atualizado
    const data = await getPlan(id)
    if (data.data) return { status: 200, data: data.data }
    throw new Error("Failed to fetch updated plan")
  } catch (err) {
    console.error("Error updating plan status:", err)
    return {
      status: 500,
      error: "Failed to update plan status. Please try again.",
    }
  }
}

// Get companies subscribed to a specific plan (mocked)
export async function getPlanSubscribers(
  planId: string,
  page = 1,
  limit = 10,
): Promise<{ status: number; data?: { items: any[]; meta: any }; error?: string }> {
  try {
    const mock = [
      {
        id: "company-1",
        name: "Acme Corp",
        email: "info@acme.com",
        subscriptionStart: "2023-02-15T00:00:00Z",
        subscriptionEnd: "2024-02-15T00:00:00Z",
        status: "active",
      },
      {
        id: "company-2",
        name: "TechSolutions",
        email: "contact@tech.com",
        subscriptionStart: "2023-03-10T00:00:00Z",
        subscriptionEnd: "2024-03-10T00:00:00Z",
        status: "active",
      },
    ]
    const total = mock.length
    const pages = Math.ceil(total / limit)
    const slice = mock.slice((page - 1) * limit, page * limit)
    return {
      status: 200,
      data: {
        items: slice,
        meta: { currentPage: page, itemsPerPage: limit, totalItems: total, totalPages: pages },
      },
    }
  } catch (err) {
    console.error("Error fetching plan subscribers:", err)
    return {
      status: 500,
      error: "Failed to fetch plan subscribers. Please try again.",
    }
  }
}
