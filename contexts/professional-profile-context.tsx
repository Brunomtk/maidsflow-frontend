"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import * as api from "@/lib/api/professional-profile"
import type {
  ProfessionalProfile,
  UpdateProfileData,
  PasswordUpdateData,
  ProfileStats,
} from "@/lib/api/professional-profile"
import { useToast } from "@/hooks/use-toast"

interface ProfessionalProfileContextType {
  // State
  profile: ProfessionalProfile | null
  stats: ProfileStats | null
  loading: boolean
  updating: boolean
  uploadingPhoto: boolean
  error: string | null

  // Actions
  loadProfile: () => Promise<void>
  loadStats: () => Promise<void>
  updateProfile: (data: UpdateProfileData) => Promise<void>
  updatePassword: (data: PasswordUpdateData) => Promise<void>
  uploadProfilePhoto: (file: File) => Promise<void>
  uploadCoverPhoto: (file: File) => Promise<void>
  deleteProfilePhoto: () => Promise<void>
  updateNotificationPreferences: (preferences: ProfessionalProfile["preferences"]["notifications"]) => Promise<void>
  updateAvailability: (availability: ProfessionalProfile["preferences"]["availability"]) => Promise<void>
  addCertification: (certification: Omit<ProfessionalProfile["certifications"][0], "id">) => Promise<void>
  updateCertification: (id: string, certification: Partial<ProfessionalProfile["certifications"][0]>) => Promise<void>
  deleteCertification: (id: string) => Promise<void>
  uploadCertificationSSN: (certificationId: string, file: File) => Promise<void>
  updateSkills: (skills: string[]) => Promise<void>
  deactivateAccount: (reason: string) => Promise<void>
  exportProfileData: () => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  requestEmailVerification: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const ProfessionalProfileContext = createContext<ProfessionalProfileContextType | undefined>(undefined)

export function ProfessionalProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getProfessionalProfile()
      if (response.data) {
        setProfile(response.data)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load profile"
      setError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const loadStats = useCallback(async () => {
    try {
      const response = await api.getProfessionalProfileStats()
      if (response.data) {
        setStats(response.data)
      }
    } catch (err) {
      console.error("Failed to load stats:", err)
    }
  }, [])

  const updateProfile = useCallback(
    async (data: UpdateProfileData) => {
      try {
        setUpdating(true)
        setError(null)
        const response = await api.updateProfessionalProfile(data)
        if (response.data) {
          setProfile(response.data)
          toast({
            title: "Success",
            description: "Profile updated successfully",
          })
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update profile"
        setError(message)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        throw err
      } finally {
        setUpdating(false)
      }
    },
    [toast],
  )

  const updatePassword = useCallback(
    async (data: PasswordUpdateData) => {
      try {
        setUpdating(true)
        setError(null)
        await api.updateProfessionalPassword(data)
        toast({
          title: "Success",
          description: "Password updated successfully",
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update password"
        setError(message)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        throw err
      } finally {
        setUpdating(false)
      }
    },
    [toast],
  )

  const uploadProfilePhoto = useCallback(
    async (file: File) => {
      try {
        setUploadingPhoto(true)
        setError(null)
        const response = await api.uploadProfessionalProfilePhoto(file)
        if (response.data) {
          await loadProfile()
          toast({
            title: "Success",
            description: "Profile photo uploaded successfully",
          })
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to upload photo"
        setError(message)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        throw err
      } finally {
        setUploadingPhoto(false)
      }
    },
    [loadProfile, toast],
  )

  const uploadCoverPhoto = useCallback(
    async (file: File) => {
      try {
        setUploadingPhoto(true)
        setError(null)
        const response = await api.uploadProfessionalCoverPhoto(file)
        if (response.data) {
          await loadProfile()
          toast({
            title: "Success",
            description: "Cover photo uploaded successfully",
          })
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to upload photo"
        setError(message)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        throw err
      } finally {
        setUploadingPhoto(false)
      }
    },
    [loadProfile, toast],
  )

  const deleteProfilePhoto = useCallback(async () => {
    try {
      setUpdating(true)
      setError(null)
      await api.deleteProfessionalProfilePhoto()
      await loadProfile()
      toast({
        title: "Success",
        description: "Profile photo removed successfully",
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to remove photo"
      setError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw err
    } finally {
      setUpdating(false)
    }
  }, [loadProfile, toast])

  const updateNotificationPreferences = useCallback(
    async (preferences: ProfessionalProfile["preferences"]["notifications"]) => {
      try {
        setUpdating(true)
        setError(null)
        await api.updateProfessionalNotificationPreferences(preferences)
        await loadProfile()
        toast({
          title: "Success",
          description: "Notification preferences updated",
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update preferences"
        setError(message)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        throw err
      } finally {
        setUpdating(false)
      }
    },
    [loadProfile, toast],
  )

  const updateAvailability = useCallback(
    async (availability: ProfessionalProfile["preferences"]["availability"]) => {
      try {
        setUpdating(true)
        setError(null)
        await api.updateProfessionalAvailability(availability)
        await loadProfile()
        toast({
          title: "Success",
          description: "Availability updated",
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update availability"
        setError(message)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        throw err
      } finally {
        setUpdating(false)
      }
    },
    [loadProfile, toast],
  )

  const addCertification = useCallback(
    async (certification: Omit<ProfessionalProfile["certifications"][0], "id">) => {
      try {
        setUpdating(true)
        setError(null)
        await api.addProfessionalCertification(certification)
        await loadProfile()
        toast({
          title: "Success",
          description: "Certification added successfully",
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to add certification"
        setError(message)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        throw err
      } finally {
        setUpdating(false)
      }
    },
    [loadProfile, toast],
  )

  const updateCertification = useCallback(
    async (id: string, certification: Partial<ProfessionalProfile["certifications"][0]>) => {
      try {
        setUpdating(true)
        setError(null)
        await api.updateProfessionalCertification(id, certification)
        await loadProfile()
        toast({
          title: "Success",
          description: "Certification updated successfully",
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update certification"
        setError(message)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        throw err
      } finally {
        setUpdating(false)
      }
    },
    [loadProfile, toast],
  )

  const deleteCertification = useCallback(
    async (id: string) => {
      try {
        setUpdating(true)
        setError(null)
        await api.deleteProfessionalCertification(id)
        await loadProfile()
        toast({
          title: "Success",
          description: "Certification removed successfully",
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to remove certification"
        setError(message)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        throw err
      } finally {
        setUpdating(false)
      }
    },
    [loadProfile, toast],
  )

  const uploadCertificationSSN = useCallback(
    async (certificationId: string, file: File) => {
      try {
        setUploadingPhoto(true)
        setError(null)
        await api.uploadCertificationSSN(certificationId, file)
        await loadProfile()
        toast({
          title: "Success",
          description: "SSN uploaded successfully",
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to upload document"
        setError(message)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        throw err
      } finally {
        setUploadingPhoto(false)
      }
    },
    [loadProfile, toast],
  )

  const updateSkills = useCallback(
    async (skills: string[]) => {
      try {
        setUpdating(true)
        setError(null)
        await api.updateProfessionalSkills(skills)
        await loadProfile()
        toast({
          title: "Success",
          description: "Skills updated successfully",
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update skills"
        setError(message)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        throw err
      } finally {
        setUpdating(false)
      }
    },
    [loadProfile, toast],
  )

  const deactivateAccount = useCallback(
    async (reason: string) => {
      try {
        setUpdating(true)
        setError(null)
        await api.deactivateProfessionalAccount(reason)
        toast({
          title: "Account Deactivated",
          description: "Your account has been deactivated",
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to deactivate account"
        setError(message)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        throw err
      } finally {
        setUpdating(false)
      }
    },
    [toast],
  )

  const exportProfileData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.exportProfessionalProfileData()
      if (response.data) {
        // Create download link
        const url = window.URL.createObjectURL(response.data)
        const a = document.createElement("a")
        a.href = url
        a.download = `profile-data-${new Date().toISOString()}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Success",
          description: "Profile data exported successfully",
        })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to export data"
      setError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const verifyEmail = useCallback(
    async (token: string) => {
      try {
        setUpdating(true)
        setError(null)
        await api.verifyProfessionalEmail(token)
        await loadProfile()
        toast({
          title: "Success",
          description: "Email verified successfully",
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to verify email"
        setError(message)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        throw err
      } finally {
        setUpdating(false)
      }
    },
    [loadProfile, toast],
  )

  const requestEmailVerification = useCallback(async () => {
    try {
      setUpdating(true)
      setError(null)
      await api.requestProfessionalEmailVerification()
      toast({
        title: "Success",
        description: "Verification email sent",
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send verification email"
      setError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw err
    } finally {
      setUpdating(false)
    }
  }, [toast])

  const refreshProfile = useCallback(async () => {
    await Promise.all([loadProfile(), loadStats()])
  }, [loadProfile, loadStats])

  const value: ProfessionalProfileContextType = {
    profile,
    stats,
    loading,
    updating,
    uploadingPhoto,
    error,
    loadProfile,
    loadStats,
    updateProfile,
    updatePassword,
    uploadProfilePhoto,
    uploadCoverPhoto,
    deleteProfilePhoto,
    updateNotificationPreferences,
    updateAvailability,
    addCertification,
    updateCertification,
    deleteCertification,
    uploadCertificationSSN,
    updateSkills,
    deactivateAccount,
    exportProfileData,
    verifyEmail,
    requestEmailVerification,
    refreshProfile,
  }

  return <ProfessionalProfileContext.Provider value={value}>{children}</ProfessionalProfileContext.Provider>
}

export function useProfessionalProfileContext() {
  const context = useContext(ProfessionalProfileContext)
  if (context === undefined) {
    throw new Error("useProfessionalProfileContext must be used within a ProfessionalProfileProvider")
  }
  return context
}
