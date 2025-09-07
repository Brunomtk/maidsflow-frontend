"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { CheckRecord } from "@/types/check-record"
import {
  getCurrentCheckStatus,
  performCheckInWithPhoto,
  performCheckOutWithPhoto,
  getProfessionalCheckHistory,
  getCheckPhotos,
  verifyLocation,
  type CurrentCheckStatus,
  type CheckLocation,
  type CheckPhoto,
} from "@/lib/api/professional-check"
import { useToast } from "@/hooks/use-toast"

interface ProfessionalCheckContextType {
  currentStatus: CurrentCheckStatus | null
  isLoading: boolean
  error: string | null
  checkHistory: CheckRecord[]
  checkPhotos: CheckPhoto[]
  locationStatus: {
    isNearby: boolean
    distance: number | null
    accuracy: number | null
    lastVerified: Date | null
  }
  refreshCurrentStatus: () => Promise<void>
  performCheckIn: (data: {
    photoBase64: string
    notes?: string
    location: CheckLocation
  }) => Promise<CheckRecord | null>
  performCheckOut: (data: {
    photoBase64: string
    notes?: string
    location: CheckLocation
  }) => Promise<CheckRecord | null>
  loadCheckHistory: (filters?: {
    startDate?: string
    endDate?: string
    status?: "checked_in" | "checked_out"
    limit?: number
    offset?: number
  }) => Promise<void>
  loadCheckPhotos: (checkRecordId: string) => Promise<void>
  verifyCurrentLocation: () => Promise<void>
  formatTime: (dateString: string | null | undefined) => string
  calculateDuration: (checkInTime: string | null | undefined, checkOutTime: string | null | undefined) => string
}

const ProfessionalCheckContext = createContext<ProfessionalCheckContextType | undefined>(undefined)

export const useProfessionalCheckContext = () => {
  const context = useContext(ProfessionalCheckContext)
  if (!context) {
    throw new Error("useProfessionalCheckContext must be used within a ProfessionalCheckProvider")
  }
  return context
}

interface ProfessionalCheckProviderProps {
  children: ReactNode
  professionalId: string
}

export const ProfessionalCheckProvider = ({ children, professionalId }: ProfessionalCheckProviderProps) => {
  const [currentStatus, setCurrentStatus] = useState<CurrentCheckStatus | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [checkHistory, setCheckHistory] = useState<CheckRecord[]>([])
  const [checkPhotos, setCheckPhotos] = useState<CheckPhoto[]>([])
  const [locationStatus, setLocationStatus] = useState<{
    isNearby: boolean
    distance: number | null
    accuracy: number | null
    lastVerified: Date | null
  }>({
    isNearby: false,
    distance: null,
    accuracy: null,
    lastVerified: null,
  })
  const { toast } = useToast()

  const refreshCurrentStatus = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const status = await getCurrentCheckStatus(professionalId)
      setCurrentStatus(status)
      return status
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch current check status"
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshCurrentStatus()
  }, [professionalId])

  const performCheckIn = async (data: {
    photoBase64: string
    notes?: string
    location: CheckLocation
  }): Promise<CheckRecord | null> => {
    if (!currentStatus?.appointmentId) {
      toast({
        title: "Erro",
        description: "Nenhum agendamento disponível para check-in",
        variant: "destructive",
      })
      return null
    }

    setIsLoading(true)
    setError(null)
    try {
      const checkRecord = await performCheckInWithPhoto(professionalId, currentStatus.appointmentId, data)

      // Atualizar o status atual
      setCurrentStatus((prev) => {
        if (!prev) return null
        return {
          ...prev,
          checkRecordId: checkRecord.id,
          status: "checked_in",
          checkInTime: checkRecord.checkInTime || undefined,
          checkInPhoto: data.photoBase64,
          checkInNotes: data.notes,
        }
      })

      toast({
        title: "Check-in realizado",
        description: "Check-in registrado com sucesso",
      })

      return checkRecord
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Falha ao realizar check-in"
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const performCheckOut = async (data: {
    photoBase64: string
    notes?: string
    location: CheckLocation
  }): Promise<CheckRecord | null> => {
    if (!currentStatus?.checkRecordId) {
      toast({
        title: "Erro",
        description: "Nenhum check-in encontrado para realizar check-out",
        variant: "destructive",
      })
      return null
    }

    setIsLoading(true)
    setError(null)
    try {
      const checkRecord = await performCheckOutWithPhoto(currentStatus.checkRecordId, data)

      // Atualizar o status atual
      setCurrentStatus((prev) => {
        if (!prev) return null
        return {
          ...prev,
          status: "checked_out",
          checkOutTime: checkRecord.checkOutTime || undefined,
          checkOutPhoto: data.photoBase64,
          checkOutNotes: data.notes,
        }
      })

      toast({
        title: "Check-out realizado",
        description: "Check-out registrado com sucesso",
      })

      return checkRecord
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Falha ao realizar check-out"
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const loadCheckHistory = async (filters?: {
    startDate?: string
    endDate?: string
    status?: "checked_in" | "checked_out"
    limit?: number
    offset?: number
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      const history = await getProfessionalCheckHistory(professionalId, filters)
      setCheckHistory(history)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Falha ao carregar histórico de check"
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadCheckPhotos = async (checkRecordId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const photos = await getCheckPhotos(checkRecordId)
      setCheckPhotos(photos)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Falha ao carregar fotos"
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCurrentLocation = async () => {
    if (!currentStatus?.appointmentId) {
      toast({
        title: "Erro",
        description: "Nenhum agendamento disponível para verificar localização",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      // Obter localização atual
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        })
      })

      const currentLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }

      // Verificar proximidade
      const locationCheck = await verifyLocation(currentStatus.appointmentId, currentLocation)

      setLocationStatus({
        isNearby: locationCheck.isNearby,
        distance: locationCheck.distance,
        accuracy: locationCheck.accuracy,
        lastVerified: new Date(),
      })

      return locationCheck
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Falha ao verificar localização"
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Formatar hora para exibição
  const formatTime = (dateString: string | null | undefined): string => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Calcular duração entre check-in e check-out
  const calculateDuration = (
    checkInTime: string | null | undefined,
    checkOutTime: string | null | undefined,
  ): string => {
    if (!checkInTime || !checkOutTime) return "-"

    const start = new Date(checkInTime)
    const end = new Date(checkOutTime)
    const durationMs = end.getTime() - start.getTime()

    // Converter para horas e minutos
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}min`
  }

  const value: ProfessionalCheckContextType = {
    currentStatus,
    isLoading,
    error,
    checkHistory,
    checkPhotos,
    locationStatus,
    refreshCurrentStatus,
    performCheckIn,
    performCheckOut,
    loadCheckHistory,
    loadCheckPhotos,
    verifyCurrentLocation,
    formatTime,
    calculateDuration,
  }

  return <ProfessionalCheckContext.Provider value={value}>{children}</ProfessionalCheckContext.Provider>
}
