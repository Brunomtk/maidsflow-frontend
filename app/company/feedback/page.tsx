"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare, AlertTriangle, CheckCircle, Calendar } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { fetchApi } from "@/lib/api/utils"
import type { InternalFeedback } from "@/types/internal-feedback"

interface Professional {
  id: number
  name: string
  companyId: number
}

interface Team {
  id: number
  name: string
  companyId: number
}

export default function FeedbackPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [feedbacks, setFeedbacks] = useState<InternalFeedback[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const loadData = async () => {
    if (!user?.companyId) return

    setIsLoading(true)
    try {
      // Load professionals for this company
      const profResponse = await fetchApi<{ results: Professional[] }>(
        `/Professional/paged?CompanyId=${user.companyId}&PageSize=100`,
      )
      setProfessionals(Array.isArray(profResponse) ? profResponse : profResponse?.results || [])

      // Load teams for this company
      const teamResponse = await fetchApi<{ results: Team[] }>(`/Team/paged?CompanyId=${user.companyId}&PageSize=100`)
      setTeams(Array.isArray(teamResponse) ? teamResponse : teamResponse?.results || [])

      // Load feedback (filtered by professionals and teams from this company)
      const feedbackResponse = await fetchApi<{ data: InternalFeedback[] }>(`/InternalFeedback/paged?PageSize=100`)
      const allFeedback = Array.isArray(feedbackResponse) ? feedbackResponse : feedbackResponse?.data || []

      // Filter feedback to only show items from company professionals/teams
      const companyProfIds = professionals.map((p) => p.id)
      const companyTeamIds = teams.map((t) => t.id)
      const companyFeedback = allFeedback.filter(
        (f) => companyProfIds.includes(f.professionalId) || companyTeamIds.includes(f.teamId),
      )

      setFeedbacks(companyFeedback)
    } catch (error) {
      console.error("Error loading feedback data:", error)
      toast({
        title: "Error",
        description: "Failed to load feedback data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.companyId])

  const getProfessionalName = (professionalId: number) => {
    const professional = professionals.find((p) => p.id === professionalId)
    return professional?.name || `Professional ${professionalId}`
  }

  const getTeamName = (teamId: number) => {
    const team = teams.find((t) => t.id === teamId)
    return team?.name || `Team ${teamId}`
  }

  const filteredFeedback = feedbacks.filter((feedback) => {
    const professionalName = getProfessionalName(feedback.professionalId)
    const teamName = getTeamName(feedback.teamId)

    const matchesSearch =
      professionalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || feedback.category.toLowerCase() === typeFilter.toLowerCase()
    const matchesStatus = statusFilter === "all" || getStatusString(feedback.status) === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusString = (status: number) => {
    switch (status) {
      case 0:
        return "pending"
      case 1:
        return "in_progress"
      case 2:
        return "resolved"
      default:
        return "pending"
    }
  }

  const getPriorityString = (priority: number) => {
    switch (priority) {
      case 0:
        return "Low"
      case 1:
        return "Medium"
      case 2:
        return "High"
      default:
        return "Medium"
    }
  }

  const getTypeIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "equipment":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "scheduling":
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "equipment":
        return "bg-amber-500/20 text-amber-500 border-amber-500"
      case "scheduling":
        return "bg-blue-500/20 text-blue-500 border-blue-500"
      case "safety":
        return "bg-red-500/20 text-red-500 border-red-500"
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading feedback data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Internal Feedback</h1>
          <p className="text-gray-400">Review feedback and issues reported by cleaning professionals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Total Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-[#2a3349] p-2 rounded-full">
                  <MessageSquare className="h-5 w-5 text-[#06b6d4]" />
                </div>
              </div>
              <span className="text-3xl font-bold text-white">{feedbacks.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Pending Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-[#2a3349] p-2 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <span className="text-3xl font-bold text-white">{feedbacks.filter((f) => f.status === 0).length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Resolved Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-[#2a3349] p-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <span className="text-3xl font-bold text-white">{feedbacks.filter((f) => f.status === 2).length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1a2234] border-[#2a3349]">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search feedback..."
                className="pl-8 bg-[#2a3349] border-0 text-white placeholder:text-gray-500 focus-visible:ring-[#06b6d4]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-40 bg-[#2a3349] border-0 text-white focus:ring-[#06b6d4]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="scheduling">Scheduling</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40 bg-[#2a3349] border-0 text-white focus:ring-[#06b6d4]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2234] border-[#2a3349] text-white">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#2a3349] hover:bg-[#2a3349]">
                <TableHead className="text-gray-400">Professional</TableHead>
                <TableHead className="text-gray-400">Team</TableHead>
                <TableHead className="text-gray-400">Date</TableHead>
                <TableHead className="text-gray-400">Category</TableHead>
                <TableHead className="text-gray-400 w-1/3">Title</TableHead>
                <TableHead className="text-gray-400">Priority</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedback.length > 0 ? (
                filteredFeedback.map((feedback) => (
                  <TableRow key={feedback.id} className="border-[#2a3349] hover:bg-[#2a3349]">
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarFallback className="bg-[#2a3349] text-[#06b6d4]">
                            {getProfessionalName(feedback.professionalId)
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {getProfessionalName(feedback.professionalId)}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400">{getTeamName(feedback.teamId)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        {new Date(feedback.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(feedback.category)}>
                        <div className="flex items-center gap-1">
                          {getTypeIcon(feedback.category)}
                          {feedback.category}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-400">
                      <div className="line-clamp-2">{feedback.title}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          feedback.priority === 2
                            ? "bg-red-500/20 text-red-500 border-red-500"
                            : feedback.priority === 1
                              ? "bg-amber-500/20 text-amber-500 border-amber-500"
                              : "bg-green-500/20 text-green-500 border-green-500"
                        }
                      >
                        {getPriorityString(feedback.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          feedback.status === 2
                            ? "bg-green-500/20 text-green-500 border-green-500"
                            : feedback.status === 1
                              ? "bg-blue-500/20 text-blue-500 border-blue-500"
                              : "bg-amber-500/20 text-amber-500 border-amber-500"
                        }
                      >
                        {getStatusString(feedback.status) === "pending"
                          ? "Pending"
                          : getStatusString(feedback.status) === "in_progress"
                            ? "In Progress"
                            : "Resolved"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-[#2a3349] text-white hover:bg-[#2a3349] bg-transparent"
                        >
                          View
                        </Button>
                        {feedback.status !== 2 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-[#2a3349] text-white hover:bg-[#2a3349] bg-transparent"
                          >
                            Update
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-gray-400">
                    No feedback found matching your search criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
