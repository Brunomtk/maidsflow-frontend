import type { ApiResponse } from "@/types/api"
import { apiDelay } from "./utils"

// Mock data for company profile
const mockCompanyProfile = {
  id: "comp-001",
  name: "Tech Solutions Ltd",
  cnpj: "12.345.678/0001-90",
  logo: "/placeholder.svg?height=200&width=200&query=company%20logo",
  description: "Providing innovative solutions for businesses of all sizes.",
  contact: {
    email: "contact@techsolutions.com",
    phone: "(11) 98765-4321",
    website: "https://techsolutions.com",
    whatsapp: "(11) 98765-4321",
  },
  address: {
    street: "Av. Paulista, 1000",
    number: "1000",
    complement: "Sala 501",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
    zipCode: "01310-100",
    country: "Brasil",
  },
  businessHours: {
    monday: { open: true, start: "08:00", end: "18:00", breaks: [{ start: "12:00", end: "13:00" }] },
    tuesday: { open: true, start: "08:00", end: "18:00", breaks: [{ start: "12:00", end: "13:00" }] },
    wednesday: { open: true, start: "08:00", end: "18:00", breaks: [{ start: "12:00", end: "13:00" }] },
    thursday: { open: true, start: "08:00", end: "18:00", breaks: [{ start: "12:00", end: "13:00" }] },
    friday: { open: true, start: "08:00", end: "18:00", breaks: [{ start: "12:00", end: "13:00" }] },
    saturday: { open: true, start: "09:00", end: "13:00", breaks: [] },
    sunday: { open: false, start: "", end: "", breaks: [] },
  },
  notificationSettings: {
    channels: {
      email: true,
      sms: true,
      push: true,
      whatsapp: false,
    },
    types: {
      appointments: true,
      cancellations: true,
      rescheduling: true,
      payments: true,
      reviews: true,
      systemUpdates: false,
    },
    frequency: "immediate", // immediate, hourly, daily, weekly
  },
  securitySettings: {
    twoFactorAuth: false,
    sessionNotifications: true,
    passwordLastChanged: "2023-12-01T10:00:00Z",
  },
  socialMedia: {
    facebook: "https://facebook.com/techsolutions",
    instagram: "https://instagram.com/techsolutions",
    linkedin: "https://linkedin.com/company/techsolutions",
    twitter: "",
  },
  createdAt: "2023-01-15T10:30:00Z",
  updatedAt: "2024-03-20T14:45:00Z",
}

export const companyProfileApi = {
  // Get company profile
  async getCompanyProfile(): Promise<ApiResponse<any>> {
    try {
      await apiDelay(800)

      return {
        success: true,
        data: mockCompanyProfile,
      }
    } catch (error) {
      console.error("Error fetching company profile:", error)
      return {
        success: false,
        error: "Failed to fetch company profile",
      }
    }
  },

  // Update company profile
  async updateCompanyProfile(profileData: Partial<typeof mockCompanyProfile>): Promise<ApiResponse<any>> {
    try {
      await apiDelay(1000)

      // In a real implementation, this would update the database
      const updatedProfile = {
        ...mockCompanyProfile,
        ...profileData,
        updatedAt: new Date().toISOString(),
      }

      return {
        success: true,
        data: updatedProfile,
      }
    } catch (error) {
      console.error("Error updating company profile:", error)
      return {
        success: false,
        error: "Failed to update company profile",
      }
    }
  },

  // Update company logo
  async updateCompanyLogo(logoFile: File): Promise<ApiResponse<any>> {
    try {
      await apiDelay(1500)

      // In a real implementation, this would upload the file to storage
      // and return the URL
      const logoUrl = "/placeholder.svg?height=200&width=200&query=new%20company%20logo"

      return {
        success: true,
        data: {
          logo: logoUrl,
        },
      }
    } catch (error) {
      console.error("Error updating company logo:", error)
      return {
        success: false,
        error: "Failed to update company logo",
      }
    }
  },

  // Update business hours
  async updateBusinessHours(businessHours: typeof mockCompanyProfile.businessHours): Promise<ApiResponse<any>> {
    try {
      await apiDelay(800)

      // In a real implementation, this would update the database
      const updatedProfile = {
        ...mockCompanyProfile,
        businessHours,
        updatedAt: new Date().toISOString(),
      }

      return {
        success: true,
        data: updatedProfile,
      }
    } catch (error) {
      console.error("Error updating business hours:", error)
      return {
        success: false,
        error: "Failed to update business hours",
      }
    }
  },

  // Update notification settings
  async updateNotificationSettings(
    notificationSettings: typeof mockCompanyProfile.notificationSettings,
  ): Promise<ApiResponse<any>> {
    try {
      await apiDelay(600)

      // In a real implementation, this would update the database
      const updatedProfile = {
        ...mockCompanyProfile,
        notificationSettings,
        updatedAt: new Date().toISOString(),
      }

      return {
        success: true,
        data: updatedProfile,
      }
    } catch (error) {
      console.error("Error updating notification settings:", error)
      return {
        success: false,
        error: "Failed to update notification settings",
      }
    }
  },

  // Update security settings
  async updateSecuritySettings(
    securitySettings: typeof mockCompanyProfile.securitySettings,
  ): Promise<ApiResponse<any>> {
    try {
      await apiDelay(700)

      // In a real implementation, this would update the database
      const updatedProfile = {
        ...mockCompanyProfile,
        securitySettings,
        updatedAt: new Date().toISOString(),
      }

      return {
        success: true,
        data: updatedProfile,
      }
    } catch (error) {
      console.error("Error updating security settings:", error)
      return {
        success: false,
        error: "Failed to update security settings",
      }
    }
  },

  // Update password
  async updatePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<any>> {
    try {
      await apiDelay(1000)

      // In a real implementation, this would verify the current password
      // and update with the new password
      if (currentPassword === "wrong-password") {
        return {
          success: false,
          error: "Current password is incorrect",
        }
      }

      return {
        success: true,
        data: {
          message: "Password updated successfully",
          passwordLastChanged: new Date().toISOString(),
        },
      }
    } catch (error) {
      console.error("Error updating password:", error)
      return {
        success: false,
        error: "Failed to update password",
      }
    }
  },

  // Enable/disable two-factor authentication
  async toggleTwoFactorAuth(enable: boolean): Promise<ApiResponse<any>> {
    try {
      await apiDelay(800)

      // In a real implementation, this would enable/disable 2FA
      // and possibly return QR code or recovery codes
      return {
        success: true,
        data: {
          twoFactorAuth: enable,
          ...(enable
            ? {
                qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
                recoveryCodes: ["ABCD-EFGH-IJKL", "MNOP-QRST-UVWX", "YZAB-CDEF-GHIJ"],
              }
            : {}),
        },
      }
    } catch (error) {
      console.error("Error toggling two-factor authentication:", error)
      return {
        success: false,
        error: "Failed to update two-factor authentication",
      }
    }
  },

  // Update social media links
  async updateSocialMedia(socialMedia: typeof mockCompanyProfile.socialMedia): Promise<ApiResponse<any>> {
    try {
      await apiDelay(500)

      // In a real implementation, this would update the database
      const updatedProfile = {
        ...mockCompanyProfile,
        socialMedia,
        updatedAt: new Date().toISOString(),
      }

      return {
        success: true,
        data: updatedProfile,
      }
    } catch (error) {
      console.error("Error updating social media:", error)
      return {
        success: false,
        error: "Failed to update social media links",
      }
    }
  },

  // Deactivate company account
  async deactivateAccount(reason: string, password: string): Promise<ApiResponse<any>> {
    try {
      await apiDelay(1500)

      // In a real implementation, this would verify the password
      // and deactivate the account
      if (password === "wrong-password") {
        return {
          success: false,
          error: "Password is incorrect",
        }
      }

      return {
        success: true,
        data: {
          message: "Account deactivated successfully",
          deactivatedAt: new Date().toISOString(),
          reason,
        },
      }
    } catch (error) {
      console.error("Error deactivating account:", error)
      return {
        success: false,
        error: "Failed to deactivate account",
      }
    }
  },
}
