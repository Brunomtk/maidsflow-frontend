import { apiRequest } from "./utils"
import type { Professional } from "@/types/professional"
import type { ApiResponse } from "@/types/api"

export interface ProfessionalProfile extends Professional {
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  birthDate?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  bankAccount?: {
    bank: string
    agency: string
    account: string
    accountType: "checking" | "savings"
    pixKey?: string
  }
  documents?: {
    cpf: string
    rg?: string
    professionalLicense?: string
  }
  preferences: {
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
      appointments: boolean
      cancellations: boolean
      payments: boolean
      feedback: boolean
    }
    availability: {
      monday: { start: string; end: string; available: boolean }
      tuesday: { start: string; end: string; available: boolean }
      wednesday: { start: string; end: string; available: boolean }
      thursday: { start: string; end: string; available: boolean }
      friday: { start: string; end: string; available: boolean }
      saturday: { start: string; end: string; available: boolean }
      sunday: { start: string; end: string; available: boolean }
    }
    maxDailyAppointments?: number
    preferredServices?: string[]
    preferredAreas?: string[]
  }
  certifications?: Array<{
    id: string
    name: string
    issuer: string
    issueDate: string
    expiryDate?: string
    documentUrl?: string
  }>
  skills?: string[]
  bio?: string
  profilePhoto?: string
  coverPhoto?: string
}

export interface UpdateProfileData {
  name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  birthDate?: string
  emergencyContact?: ProfessionalProfile["emergencyContact"]
  bankAccount?: ProfessionalProfile["bankAccount"]
  documents?: ProfessionalProfile["documents"]
  preferences?: ProfessionalProfile["preferences"]
  certifications?: ProfessionalProfile["certifications"]
  skills?: string[]
  bio?: string
}

export interface PasswordUpdateData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ProfileStats {
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  averageRating: number
  totalReviews: number
  totalEarnings: number
  currentMonthEarnings: number
  hoursWorked: number
  clientSatisfaction: number
  onTimePercentage: number
}

// Get professional profile
export async function getProfessionalProfile(): Promise<ApiResponse<ProfessionalProfile>> {
  return apiRequest<ProfessionalProfile>("/api/professional/profile")
}

// Update professional profile
export async function updateProfessionalProfile(data: UpdateProfileData): Promise<ApiResponse<ProfessionalProfile>> {
  return apiRequest<ProfessionalProfile>("/api/professional/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

// Update password
export async function updateProfessionalPassword(data: PasswordUpdateData): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>("/api/professional/profile/password", {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

// Upload profile photo
export async function uploadProfessionalProfilePhoto(file: File): Promise<ApiResponse<{ url: string }>> {
  const formData = new FormData()
  formData.append("photo", file)

  return apiRequest<{ url: string }>("/api/professional/profile/photo", {
    method: "POST",
    body: formData,
    headers: {}, // Let browser set content-type for FormData
  })
}

// Upload cover photo
export async function uploadProfessionalCoverPhoto(file: File): Promise<ApiResponse<{ url: string }>> {
  const formData = new FormData()
  formData.append("photo", file)

  return apiRequest<{ url: string }>("/api/professional/profile/cover-photo", {
    method: "POST",
    body: formData,
    headers: {},
  })
}

// Delete profile photo
export async function deleteProfessionalProfilePhoto(): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>("/api/professional/profile/photo", {
    method: "DELETE",
  })
}

// Get profile stats
export async function getProfessionalProfileStats(): Promise<ApiResponse<ProfileStats>> {
  return apiRequest<ProfileStats>("/api/professional/profile/stats")
}

// Update notification preferences
export async function updateProfessionalNotificationPreferences(
  preferences: ProfessionalProfile["preferences"]["notifications"],
): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>("/api/professional/profile/notifications", {
    method: "PUT",
    body: JSON.stringify({ preferences }),
  })
}

// Update availability
export async function updateProfessionalAvailability(
  availability: ProfessionalProfile["preferences"]["availability"],
): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>("/api/professional/profile/availability", {
    method: "PUT",
    body: JSON.stringify({ availability }),
  })
}

// Add certification
export async function addProfessionalCertification(
  certification: Omit<ProfessionalProfile["certifications"][0], "id">,
): Promise<ApiResponse<ProfessionalProfile["certifications"][0]>> {
  return apiRequest<ProfessionalProfile["certifications"][0]>("/api/professional/profile/certifications", {
    method: "POST",
    body: JSON.stringify(certification),
  })
}

// Update certification
export async function updateProfessionalCertification(
  id: string,
  certification: Partial<ProfessionalProfile["certifications"][0]>,
): Promise<ApiResponse<ProfessionalProfile["certifications"][0]>> {
  return apiRequest<ProfessionalProfile["certifications"][0]>(`/api/professional/profile/certifications/${id}`, {
    method: "PUT",
    body: JSON.stringify(certification),
  })
}

// Delete certification
export async function deleteProfessionalCertification(id: string): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>(`/api/professional/profile/certifications/${id}`, {
    method: "DELETE",
  })
}

// Upload certification document
export async function uploadCertificationDocument(
  certificationId: string,
  file: File,
): Promise<ApiResponse<{ url: string }>> {
  const formData = new FormData()
  formData.append("document", file)

  return apiRequest<{ url: string }>(`/api/professional/profile/certifications/${certificationId}/document`, {
    method: "POST",
    body: formData,
    headers: {},
  })
}

// Update skills
export async function updateProfessionalSkills(skills: string[]): Promise<ApiResponse<{ skills: string[] }>> {
  return apiRequest<{ skills: string[] }>("/api/professional/profile/skills", {
    method: "PUT",
    body: JSON.stringify({ skills }),
  })
}

// Deactivate account
export async function deactivateProfessionalAccount(reason: string): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>("/api/professional/profile/deactivate", {
    method: "POST",
    body: JSON.stringify({ reason }),
  })
}

// Export profile data
export async function exportProfessionalProfileData(): Promise<ApiResponse<Blob>> {
  return apiRequest<Blob>("/api/professional/profile/export", {
    method: "GET",
    responseType: "blob",
  })
}

// Verify email
export async function verifyProfessionalEmail(token: string): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>("/api/professional/profile/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  })
}

// Request email verification
export async function requestProfessionalEmailVerification(): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>("/api/professional/profile/request-verification", {
    method: "POST",
  })
}
