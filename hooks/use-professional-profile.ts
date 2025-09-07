"use client"

import { useEffect, useState, useCallback } from "react"
import { useProfessionalProfileContext } from "@/contexts/professional-profile-context"
import type { ProfessionalProfile } from "@/lib/api/professional-profile"

export function useProfessionalProfile() {
  const context = useProfessionalProfileContext()

  useEffect(() => {
    context.loadProfile()
    context.loadStats()
  }, [])

  return {
    profile: context.profile,
    stats: context.stats,
    loading: context.loading,
    updating: context.updating,
    uploadingPhoto: context.uploadingPhoto,
    error: context.error,
    updateProfile: context.updateProfile,
    updatePassword: context.updatePassword,
    uploadProfilePhoto: context.uploadProfilePhoto,
    uploadCoverPhoto: context.uploadCoverPhoto,
    deleteProfilePhoto: context.deleteProfilePhoto,
    refreshProfile: context.refreshProfile,
  }
}

export function useProfessionalPreferences() {
  const context = useProfessionalProfileContext()

  return {
    preferences: context.profile?.preferences,
    updateNotificationPreferences: context.updateNotificationPreferences,
    updateAvailability: context.updateAvailability,
    updating: context.updating,
  }
}

export function useProfessionalCertifications() {
  const context = useProfessionalProfileContext()

  return {
    certifications: context.profile?.certifications || [],
    addCertification: context.addCertification,
    updateCertification: context.updateCertification,
    deleteCertification: context.deleteCertification,
    uploadDocument: context.uploadCertificationDocument,
    updating: context.updating,
  }
}

export function useProfessionalSkills() {
  const context = useProfessionalProfileContext()
  const [skills, setSkills] = useState<string[]>([])

  useEffect(() => {
    if (context.profile?.skills) {
      setSkills(context.profile.skills)
    }
  }, [context.profile])

  const addSkill = useCallback(
    (skill: string) => {
      const newSkills = [...skills, skill]
      setSkills(newSkills)
    },
    [skills],
  )

  const removeSkill = useCallback(
    (skill: string) => {
      const newSkills = skills.filter((s) => s !== skill)
      setSkills(newSkills)
    },
    [skills],
  )

  const saveSkills = useCallback(async () => {
    await context.updateSkills(skills)
  }, [context, skills])

  return {
    skills,
    addSkill,
    removeSkill,
    saveSkills,
    updating: context.updating,
  }
}

export function useProfessionalSecurity() {
  const context = useProfessionalProfileContext()

  return {
    updatePassword: context.updatePassword,
    deactivateAccount: context.deactivateAccount,
    exportData: context.exportProfileData,
    verifyEmail: context.verifyEmail,
    requestEmailVerification: context.requestEmailVerification,
    emailVerified: context.profile?.email ? true : false, // Simplified check
    updating: context.updating,
  }
}

export function useProfessionalAvailability() {
  const context = useProfessionalProfileContext()
  const [availability, setAvailability] = useState<ProfessionalProfile["preferences"]["availability"] | null>(null)

  useEffect(() => {
    if (context.profile?.preferences?.availability) {
      setAvailability(context.profile.preferences.availability)
    }
  }, [context.profile])

  const updateDay = useCallback(
    (
      day: keyof ProfessionalProfile["preferences"]["availability"],
      data: { start?: string; end?: string; available?: boolean },
    ) => {
      if (!availability) return

      setAvailability({
        ...availability,
        [day]: {
          ...availability[day],
          ...data,
        },
      })
    },
    [availability],
  )

  const saveAvailability = useCallback(async () => {
    if (!availability) return
    await context.updateAvailability(availability)
  }, [context, availability])

  const resetAvailability = useCallback(() => {
    if (context.profile?.preferences?.availability) {
      setAvailability(context.profile.preferences.availability)
    }
  }, [context.profile])

  return {
    availability,
    updateDay,
    saveAvailability,
    resetAvailability,
    updating: context.updating,
  }
}

export function useProfessionalProfileCompletion() {
  const { profile } = useProfessionalProfileContext()
  const [completion, setCompletion] = useState(0)
  const [missingFields, setMissingFields] = useState<string[]>([])

  useEffect(() => {
    if (!profile) return

    const requiredFields = [
      { field: "name", label: "Name" },
      { field: "email", label: "Email" },
      { field: "phone", label: "Phone" },
      { field: "address", label: "Address" },
      { field: "city", label: "City" },
      { field: "state", label: "State" },
      { field: "profilePhoto", label: "Profile Photo" },
      { field: "bio", label: "Bio" },
      { field: "skills", label: "Skills", check: (p: any) => p.skills?.length > 0 },
      { field: "certifications", label: "Certifications", check: (p: any) => p.certifications?.length > 0 },
      { field: "bankAccount", label: "Bank Account" },
      { field: "documents.cpf", label: "CPF", check: (p: any) => p.documents?.cpf },
    ]

    const missing: string[] = []
    let completed = 0

    requiredFields.forEach(({ field, label, check }) => {
      const value = check
        ? check(profile)
        : field.includes(".")
          ? field.split(".").reduce((obj, key) => obj?.[key], profile as any)
          : profile[field as keyof ProfessionalProfile]

      if (value) {
        completed++
      } else {
        missing.push(label)
      }
    })

    setCompletion(Math.round((completed / requiredFields.length) * 100))
    setMissingFields(missing)
  }, [profile])

  return {
    completion,
    missingFields,
    isComplete: completion === 100,
  }
}
