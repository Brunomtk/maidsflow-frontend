export interface PerformanceMetrics {
  id: string
  professionalId: string
  period: "daily" | "weekly" | "monthly" | "yearly"
  startDate: Date
  endDate: Date

  // Métricas principais
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  completionRate: number

  // Avaliações
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }

  // Pontualidade
  onTimeAppointments: number
  lateAppointments: number
  punctualityRate: number
  averageDelayMinutes: number

  // Produtividade
  hoursWorked: number
  revenueGenerated: number
  averageServiceTime: number
  efficiencyScore: number

  // Qualidade
  customerSatisfactionScore: number
  complaintCount: number
  complimentCount: number

  createdAt: Date
  updatedAt: Date
}

export interface PerformanceGoal {
  id: string
  professionalId: string
  title: string
  description: string
  targetValue: number
  currentValue: number
  unit: string
  category: "rating" | "punctuality" | "productivity" | "revenue" | "efficiency"
  deadline: Date
  status: "active" | "completed" | "overdue" | "cancelled"
  progress: number
  createdAt: Date
  updatedAt: Date
}

export interface Achievement {
  id: string
  professionalId: string
  title: string
  description: string
  icon: string
  category: "milestone" | "rating" | "punctuality" | "productivity" | "special"
  earnedAt: Date
  points: number
}

export interface PerformanceRanking {
  professionalId: string
  professionalName: string
  position: number
  score: number
  category: "overall" | "rating" | "punctuality" | "productivity"
  period: "weekly" | "monthly" | "yearly"
}

export interface PerformanceComparison {
  metric: string
  currentValue: number
  previousValue: number
  change: number
  changePercentage: number
  trend: "up" | "down" | "stable"
}

export interface PerformanceReport {
  id: string
  professionalId: string
  period: string
  metrics: PerformanceMetrics
  goals: PerformanceGoal[]
  achievements: Achievement[]
  ranking: PerformanceRanking[]
  comparisons: PerformanceComparison[]
  recommendations: string[]
  generatedAt: Date
}
