import { usePlansContext } from "@/contexts/plans-context"
import type { Plan } from "@/types/plan"

export function usePlans() {
  const context = usePlansContext()

  // Format price for display
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get status color for UI
  const getStatusColor = (status: number): string => {
    switch (status) {
      case 1:
        return "bg-green-100 text-green-800"
      case 0:
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get status label for display
  const getStatusLabel = (status: number): string => {
    return status === 1 ? "Ativo" : "Inativo"
  }

  // Format duration for display
  const formatDuration = (duration: number): string => {
    if (duration === 30) return "Mensal"
    if (duration === 365) return "Anual"
    return `${duration} dias`
  }

  // Format limits for display
  const formatLimits = (plan: Plan): string[] => {
    const limitDescriptions: string[] = []

    if (plan.professionalsLimit !== undefined) {
      limitDescriptions.push(
        plan.professionalsLimit === 0 ? "Profissionais ilimitados" : `Até ${plan.professionalsLimit} profissionais`,
      )
    }

    if (plan.teamsLimit !== undefined) {
      limitDescriptions.push(plan.teamsLimit === 0 ? "Equipes ilimitadas" : `Até ${plan.teamsLimit} equipes`)
    }

    if (plan.customersLimit !== undefined) {
      limitDescriptions.push(plan.customersLimit === 0 ? "Clientes ilimitados" : `Até ${plan.customersLimit} clientes`)
    }

    if (plan.appointmentsLimit !== undefined) {
      limitDescriptions.push(
        plan.appointmentsLimit === 0 ? "Agendamentos ilimitados" : `Até ${plan.appointmentsLimit} agendamentos por mês`,
      )
    }

    return limitDescriptions
  }

  const getPlanStatusText = (status: number): string => {
    return status === 1 ? "Ativo" : "Inativo"
  }

  const isPlanActive = (status: number): boolean => {
    return status === 1
  }

  return {
    ...context,
    formatPrice,
    formatDate,
    getStatusColor,
    getStatusLabel,
    formatDuration,
    formatLimits,
    getPlanStatusText,
    isPlanActive,
  }
}
