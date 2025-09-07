import type { ApiResponse } from "@/types/api"
import type { Payment } from "@/types/payment"
import { fetchApi } from "./utils"

// --- Helper Functions ---

function decodeJWT(token: string): any | null {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error decoding JWT:", error)
    return null
  }
}

function getToken(): string {
  const t =
    localStorage.getItem("noah_token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("token")
  if (!t) throw new Error("No authentication token found")
  return t
}

function getUserIdFromToken(): string {
  const payload = decodeJWT(getToken())
  return (
    String(payload?.UserId ?? payload?.userId ?? payload?.id) ||
    (() => { throw new Error("Could not extract User ID from token") })()
  )
}

async function getCompanyId(): Promise<string> {
  const userId = getUserIdFromToken()
  const user = await fetchApi<{ companyId: number }>(`/Users/${userId}`)
  if (!user.companyId) throw new Error("No company associated with user")
  return String(user.companyId)
}

// --- API Functions ---

export async function getCurrentCompanyPlan(): Promise<ApiResponse<any>> {
  try {
    const token = getToken()
    const companyId = await getCompanyId()

    // 1. Get Plan ID
    const planId = await fetchApi<number>(`/Companies/${companyId}/plan-id`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!planId) {
      return { success: false, error: "No plan is associated with this company." }
    }

    // 2. Get Plan Details
    const planData = await fetchApi<any>(`/Plan/${planId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    // 3. Get Company Details (non-critical)
    let createdDate = new Date().toISOString()
    try {
      const company = await fetchApi<any>(`/Companies/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      createdDate = company.createdDate || createdDate
    } catch {
      console.warn("Could not fetch company details for extra info.")
    }

    // 4. Transform
    const transformed = {
      id: planData.id,
      name: planData.name,
      description: planData.features?.join(", ") || "",
      price: planData.price,
      billingCycle: "monthly",
      startDate: createdDate,
      expiryDate: new Date(
        Date.now() + (planData.duration ?? 30) * 24 * 60 * 60 * 1000,
      ).toISOString(),
      status: planData.status === 1 ? "active" : "inactive",
      autoRenew: true,
      features: planData.features || [],
      usedUsers: 0,
      maxUsers: planData.professionalsLimit,
      usedTeams: 0,
      maxTeams: planData.teamsLimit,
      usedCustomers: 0,
      maxCustomers: planData.customersLimit,
      usedAppointments: 0,
      maxAppointments: planData.appointmentsLimit,
    }

    return { success: true, data: transformed }
  } catch (error: any) {
    console.error("Error in getCurrentCompanyPlan:", error)
    return {
      success: false,
      error: `Failed to fetch current plan. ${error.message || ""}`,
    }
  }
}

export async function getAvailablePlans(): Promise<ApiResponse<any[]>> {
  try {
    const token = getToken()
    const plans: any[] = await fetchApi(`/Plan`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const active = plans
      .filter((p) => p.status === 1)
      .map((p) => ({
        id: p.id,
        name: p.name,
        description: p.features?.slice(0, 2).join(", ") || "",
        price: p.price,
        billingCycle: "monthly",
        features: p.features || [],
        popular: p.name.toLowerCase().includes("corporativo"),
        professionalsLimit: p.professionalsLimit,
        teamsLimit: p.teamsLimit,
        customersLimit: p.customersLimit,
        appointmentsLimit: p.appointmentsLimit,
      }))

    return { success: true, data: active }
  } catch (error) {
    console.error("Error in getAvailablePlans:", error)
    return { success: false, error: "Failed to fetch available plans." }
  }
}

export async function getPlanPaymentHistory(): Promise<ApiResponse<Payment[]>> {
  const mock: Payment[] = [
    {
      id: "inv-001",
      date: "2025-07-15T10:00:00Z",
      invoice: "INV-2025-001",
      amount: 199.9,
      status: "paid",
      method: "Credit Card",
    },
    {
      id: "inv-002",
      date: "2025-06-15T10:00:00Z",
      invoice: "INV-2025-002",
      amount: 199.9,
      status: "paid",
      method: "Credit Card",
    },
  ]
  return new Promise((resolve) => setTimeout(() => resolve({ success: true, data: mock }), 500))
}
