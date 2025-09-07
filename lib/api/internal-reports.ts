import type {
  InternalReport,
  InternalReportFormData,
  InternalReportFilters,
  InternalReportComment,
} from "@/types/internal-report"

// Mock data for development
const mockInternalReports: InternalReport[] = [
  {
    id: "RP001",
    title: "Monthly performance report for Team A",
    professionalId: "prof-001",
    professional: "John Doe",
    teamId: "team-001",
    team: "Cleaning Team A",
    category: "Performance",
    status: "pending",
    date: "2023-05-15",
    description: "Monthly performance analysis for Cleaning Team A. Overall performance is above average.",
    priority: "medium",
    assignedToId: "user-001",
    assignedTo: "Operations Manager",
    comments: [
      {
        id: "comment-001",
        authorId: "user-001",
        author: "Operations Manager",
        date: "2023-05-16",
        text: "Please include more details about individual performance metrics.",
      },
    ],
    createdAt: "2023-05-15T10:30:00Z",
    updatedAt: "2023-05-16T14:20:00Z",
  },
  {
    id: "RP002",
    title: "Customer satisfaction survey results",
    professionalId: "prof-002",
    professional: "Jane Smith",
    teamId: "team-002",
    team: "Maintenance Team B",
    category: "Customer Satisfaction",
    status: "resolved",
    date: "2023-05-14",
    description: "Analysis of customer satisfaction survey results for Q1 2023. Overall satisfaction rate is 87%.",
    priority: "high",
    assignedToId: "user-002",
    assignedTo: "Customer Relations Manager",
    comments: [
      {
        id: "comment-002",
        authorId: "user-002",
        author: "Customer Relations Manager",
        date: "2023-05-14",
        text: "Great report. Let's discuss action items for improving the satisfaction rate further.",
      },
    ],
    createdAt: "2023-05-14T09:15:00Z",
    updatedAt: "2023-05-14T16:45:00Z",
  },
  {
    id: "RP003",
    title: "Equipment utilization report",
    professionalId: "prof-003",
    professional: "Mike Johnson",
    teamId: "team-003",
    team: "Plumbing Team C",
    category: "Equipment",
    status: "in_progress",
    date: "2023-05-16",
    description:
      "Analysis of equipment utilization and efficiency for Plumbing Team C. Several opportunities for optimization identified.",
    priority: "medium",
    assignedToId: "user-003",
    assignedTo: "Resource Manager",
    comments: [
      {
        id: "comment-003",
        authorId: "user-003",
        author: "Resource Manager",
        date: "2023-05-16",
        text: "Please provide specific recommendations for optimizing equipment usage.",
      },
    ],
    createdAt: "2023-05-16T11:20:00Z",
    updatedAt: "2023-05-16T13:10:00Z",
  },
  {
    id: "RP004",
    title: "Training needs assessment",
    professionalId: "prof-004",
    professional: "Sarah Williams",
    teamId: "team-004",
    team: "Electrical Team A",
    category: "Training",
    status: "pending",
    date: "2023-05-13",
    description: "Assessment of training needs for Electrical Team A based on recent performance evaluations.",
    priority: "low",
    assignedToId: "user-004",
    assignedTo: "Training Coordinator",
    comments: [],
    createdAt: "2023-05-13T14:30:00Z",
    updatedAt: "2023-05-13T14:30:00Z",
  },
  {
    id: "RP005",
    title: "Safety incident analysis",
    professionalId: "prof-005",
    professional: "Robert Brown",
    teamId: "team-005",
    team: "Construction Team D",
    category: "Safety",
    status: "in_progress",
    date: "2023-05-17",
    description: "Analysis of recent safety incidents and recommendations for preventing future occurrences.",
    priority: "high",
    assignedToId: "user-005",
    assignedTo: "Safety Officer",
    comments: [
      {
        id: "comment-004",
        authorId: "user-005",
        author: "Safety Officer",
        date: "2023-05-17",
        text: "This is a critical report. Let's schedule a meeting to discuss implementation of safety measures.",
      },
    ],
    createdAt: "2023-05-17T08:45:00Z",
    updatedAt: "2023-05-17T10:20:00Z",
  },
]

// API functions
export async function getInternalReports(filters?: InternalReportFilters): Promise<InternalReport[]> {
  try {
    // In a real app, this would be a fetch call to the API
    // const response = await fetch(`${API_ENDPOINTS.INTERNAL_REPORTS}?${new URLSearchParams(filters)}`)
    // if (!response.ok) throw new Error('Failed to fetch internal reports')
    // return await response.json()

    // For development, filter the mock data based on the provided filters
    let filteredReports = [...mockInternalReports]

    if (filters) {
      if (filters.status && filters.status !== "all") {
        filteredReports = filteredReports.filter((report) => report.status === filters.status)
      }

      if (filters.priority) {
        filteredReports = filteredReports.filter((report) => report.priority === filters.priority)
      }

      if (filters.category) {
        filteredReports = filteredReports.filter((report) => report.category === filters.category)
      }

      if (filters.professionalId) {
        filteredReports = filteredReports.filter((report) => report.professionalId === filters.professionalId)
      }

      if (filters.teamId) {
        filteredReports = filteredReports.filter((report) => report.teamId === filters.teamId)
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredReports = filteredReports.filter(
          (report) =>
            report.title.toLowerCase().includes(searchLower) ||
            report.description.toLowerCase().includes(searchLower) ||
            report.professional.toLowerCase().includes(searchLower) ||
            report.team.toLowerCase().includes(searchLower),
        )
      }
    }

    return filteredReports
  } catch (error) {
    console.error("Error fetching internal reports:", error)
    throw error
  }
}

export async function getInternalReportById(id: string): Promise<InternalReport | null> {
  try {
    // In a real app, this would be a fetch call to the API
    // const response = await fetch(`${API_ENDPOINTS.INTERNAL_REPORTS}/${id}`)
    // if (!response.ok) throw new Error('Failed to fetch internal report')
    // return await response.json()

    // For development, find the report in the mock data
    const report = mockInternalReports.find((r) => r.id === id)
    return report || null
  } catch (error) {
    console.error(`Error fetching internal report with ID ${id}:`, error)
    throw error
  }
}

export async function createInternalReport(data: InternalReportFormData): Promise<InternalReport> {
  try {
    // In a real app, this would be a fetch call to the API
    // const response = await fetch(API_ENDPOINTS.INTERNAL_REPORTS, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // })
    // if (!response.ok) throw new Error('Failed to create internal report')
    // return await response.json()

    // For development, create a new report with mock data
    const newReport: InternalReport = {
      id: `RP${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
      title: data.title,
      professionalId: data.professionalId,
      professional: data.professional || "Unknown Professional",
      teamId: data.teamId,
      team: data.team || "Unknown Team",
      category: data.category,
      status: data.status || "pending",
      date: new Date().toISOString().split("T")[0],
      description: data.description,
      priority: data.priority || "medium",
      assignedToId: data.assignedToId,
      assignedTo: data.assignedTo || "Unassigned",
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // In a real app, the new report would be returned from the API
    return newReport
  } catch (error) {
    console.error("Error creating internal report:", error)
    throw error
  }
}

export async function updateInternalReport(id: string, data: Partial<InternalReportFormData>): Promise<InternalReport> {
  try {
    // In a real app, this would be a fetch call to the API
    // const response = await fetch(`${API_ENDPOINTS.INTERNAL_REPORTS}/${id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // })
    // if (!response.ok) throw new Error('Failed to update internal report')
    // return await response.json()

    // For development, find and update the report in the mock data
    const report = mockInternalReports.find((r) => r.id === id)
    if (!report) {
      throw new Error(`Internal report with ID ${id} not found`)
    }

    // Update the report with the new data
    const updatedReport: InternalReport = {
      ...report,
      ...data,
      updatedAt: new Date().toISOString(),
    }

    // In a real app, the updated report would be returned from the API
    return updatedReport
  } catch (error) {
    console.error(`Error updating internal report with ID ${id}:`, error)
    throw error
  }
}

export async function deleteInternalReport(id: string): Promise<void> {
  try {
    // In a real app, this would be a fetch call to the API
    // const response = await fetch(`${API_ENDPOINTS.INTERNAL_REPORTS}/${id}`, {
    //   method: 'DELETE'
    // })
    // if (!response.ok) throw new Error('Failed to delete internal report')
    // return

    // For development, we would filter out the deleted report from the mock data
    // This is just a placeholder since we're not actually modifying the mock data
    console.log(`Deleted internal report with ID ${id}`)
  } catch (error) {
    console.error(`Error deleting internal report with ID ${id}:`, error)
    throw error
  }
}

export async function addCommentToInternalReport(
  reportId: string,
  comment: Omit<InternalReportComment, "id" | "date">,
): Promise<InternalReportComment> {
  try {
    // In a real app, this would be a fetch call to the API
    // const response = await fetch(`${API_ENDPOINTS.INTERNAL_REPORTS}/${reportId}/comments`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(comment)
    // })
    // if (!response.ok) throw new Error('Failed to add comment to internal report')
    // return await response.json()

    // For development, create a new comment with mock data
    const newComment: InternalReportComment = {
      id: `comment-${Math.floor(Math.random() * 1000)}`,
      authorId: comment.authorId,
      author: comment.author,
      text: comment.text,
      date: new Date().toISOString().split("T")[0],
    }

    // In a real app, the new comment would be returned from the API
    return newComment
  } catch (error) {
    console.error(`Error adding comment to internal report with ID ${reportId}:`, error)
    throw error
  }
}

export async function getInternalReportsByProfessional(professionalId: string): Promise<InternalReport[]> {
  try {
    // In a real app, this would be a fetch call to the API
    // const response = await fetch(`${API_ENDPOINTS.INTERNAL_REPORTS}/professional/${professionalId}`)
    // if (!response.ok) throw new Error('Failed to fetch internal reports by professional')
    // return await response.json()

    // For development, filter the mock data by professional ID
    return mockInternalReports.filter((report) => report.professionalId === professionalId)
  } catch (error) {
    console.error(`Error fetching internal reports for professional ${professionalId}:`, error)
    throw error
  }
}

export async function getInternalReportsByTeam(teamId: string): Promise<InternalReport[]> {
  try {
    // In a real app, this would be a fetch call to the API
    // const response = await fetch(`${API_ENDPOINTS.INTERNAL_REPORTS}/team/${teamId}`)
    // if (!response.ok) throw new Error('Failed to fetch internal reports by team')
    // return await response.json()

    // For development, filter the mock data by team ID
    return mockInternalReports.filter((report) => report.teamId === teamId)
  } catch (error) {
    console.error(`Error fetching internal reports for team ${teamId}:`, error)
    throw error
  }
}

export async function getInternalReportsByCategory(category: string): Promise<InternalReport[]> {
  try {
    // In a real app, this would be a fetch call to the API
    // const response = await fetch(`${API_ENDPOINTS.INTERNAL_REPORTS}/category/${category}`)
    // if (!response.ok) throw new Error('Failed to fetch internal reports by category')
    // return await response.json()

    // For development, filter the mock data by category
    return mockInternalReports.filter((report) => report.category === category)
  } catch (error) {
    console.error(`Error fetching internal reports for category ${category}:`, error)
    throw error
  }
}

export async function getInternalReportsByStatus(status: string): Promise<InternalReport[]> {
  try {
    // In a real app, this would be a fetch call to the API
    // const response = await fetch(`${API_ENDPOINTS.INTERNAL_REPORTS}/status/${status}`)
    // if (!response.ok) throw new Error('Failed to fetch internal reports by status')
    // return await response.json()

    // For development, filter the mock data by status
    return mockInternalReports.filter((report) => report.status === status)
  } catch (error) {
    console.error(`Error fetching internal reports for status ${status}:`, error)
    throw error
  }
}

export async function getInternalReportsByPriority(priority: string): Promise<InternalReport[]> {
  try {
    // In a real app, this would be a fetch call to the API
    // const response = await fetch(`${API_ENDPOINTS.INTERNAL_REPORTS}/priority/${priority}`)
    // if (!response.ok) throw new Error('Failed to fetch internal reports by priority')
    // return await response.json()

    // For development, filter the mock data by priority
    return mockInternalReports.filter((report) => report.priority === priority)
  } catch (error) {
    console.error(`Error fetching internal reports for priority ${priority}:`, error)
    throw error
  }
}
