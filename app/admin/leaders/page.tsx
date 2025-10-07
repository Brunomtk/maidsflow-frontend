"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Eye, Edit, Trash2, Users, UserCheck, UserX, Crown } from "lucide-react"
import { LeaderModal } from "@/components/admin/leader-modal"
import { LeaderDetailsModal } from "@/components/admin/leader-details-modal"
import { useToast } from "@/hooks/use-toast"
import { leadersApi } from "@/lib/api/leaders"
import { useLeadersContext } from "@/contexts/leaders-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Leader } from "@/types/leader"

export default function LeadersPage() {
  const { leaders, dispatch } = useLeadersContext()
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null)
  const [leaderToDelete, setLeaderToDelete] = useState<Leader | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    loadLeaders()
  }, [])

  async function loadLeaders() {
    setIsLoading(true)
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const data = await leadersApi.getAll()
      dispatch({ type: "SET_LEADERS", payload: Array.isArray(data) ? data : [] })
    } catch (error) {
      console.error("Failed to load leaders:", error)
      toast({
        title: "Error",
        description: "Failed to load leaders",
        variant: "destructive",
      })
      dispatch({ type: "SET_LEADERS", payload: [] })
    } finally {
      setIsLoading(false)
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  async function handleDeleteLeader() {
    if (!leaderToDelete) return
    try {
      await leadersApi.delete(leaderToDelete.id)
      dispatch({ type: "DELETE_LEADER", payload: leaderToDelete.id })
      toast({
        title: "Success",
        description: "Leader deleted successfully",
        variant: "destructive",
      })
      setLeaderToDelete(null)
    } catch (error) {
      console.error("Failed to delete leader:", error)
      toast({
        title: "Error",
        description: "Failed to delete leader",
        variant: "destructive",
      })
    }
  }

  const handleViewDetails = (leader: Leader) => {
    setSelectedLeader(leader)
    setIsDetailsModalOpen(true)
  }

  const handleEdit = (leader: Leader) => {
    setSelectedLeader(leader)
    setIsModalOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return { label: "Active", className: "border-green-500 text-green-500" }
      case "Inactive":
        return { label: "Inactive", className: "border-red-500 text-red-500" }
      default:
        return { label: status, className: "border-gray-500 text-gray-500" }
    }
  }

  const filteredLeaders = leaders.filter((leader) => {
    const matchesSearch =
      leader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leader.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leader.phone.includes(searchQuery)
    const matchesStatus = statusFilter === "all" || leader.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: leaders.length,
    active: leaders.filter((l) => l.status === "Active").length,
    inactive: leaders.filter((l) => l.status === "Inactive").length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground">Loading leaders...</div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Leaders Management</h1>
            <p className="text-muted-foreground">Manage all leaders in the system.</p>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/20 transition-all"
            onClick={() => {
              setSelectedLeader(null)
              setIsModalOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Leader
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 via-card to-blue-500/5 border-blue-500/30 shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Leaders</p>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                  <Users className="h-7 w-7 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 via-card to-green-500/5 border-green-500/30 shadow-lg hover:shadow-green-500/20 hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Active Leaders</p>
                  <p className="text-3xl font-bold text-foreground">{stats.active}</p>
                </div>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 border border-green-500/30 flex items-center justify-center">
                  <UserCheck className="h-7 w-7 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 via-card to-red-500/5 border-red-500/30 shadow-lg hover:shadow-red-500/20 hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Inactive Leaders</p>
                  <p className="text-3xl font-bold text-foreground">{stats.inactive}</p>
                </div>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <UserX className="h-7 w-7 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full lg:w-[400px]"
            />
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              className="flex-1 lg:flex-none"
            >
              All Status
            </Button>
            <Button
              variant={statusFilter === "Active" ? "default" : "outline"}
              onClick={() => setStatusFilter("Active")}
              className="flex-1 lg:flex-none"
            >
              Active
            </Button>
            <Button
              variant={statusFilter === "Inactive" ? "default" : "outline"}
              onClick={() => setStatusFilter("Inactive")}
              className="flex-1 lg:flex-none"
            >
              Inactive
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border border-border overflow-hidden shadow-lg bg-gradient-to-br from-card via-card to-muted/20">
          <Table>
            <TableHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
              <TableRow className="border-border hover:bg-muted/70">
                <TableHead className="text-foreground">Leader</TableHead>
                <TableHead className="text-foreground">Email</TableHead>
                <TableHead className="text-foreground">Phone</TableHead>
                <TableHead className="text-foreground">Region</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
                <TableHead className="text-foreground text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeaders.map((leader) => (
                <TableRow key={leader.id} className="border-border hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/30 shadow-md">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                          {leader.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {leader.name}
                          <Crown className="h-4 w-4 text-yellow-500" />
                        </p>
                        <p className="text-xs text-muted-foreground">ID: #{leader.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{leader.email}</TableCell>
                  <TableCell className="text-muted-foreground">{leader.phone}</TableCell>
                  <TableCell className="text-muted-foreground capitalize">{leader.region || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadge(leader.status).className}>
                      {getStatusBadge(leader.status).label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(leader)}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Details</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(leader)} className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setLeaderToDelete(leader)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredLeaders.length === 0 && (
          <div className="text-center py-12">
            <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No leaders found</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredLeaders.length}</span> of{" "}
            <span className="font-medium text-foreground">{leaders.length}</span> leaders
          </p>
        </div>

        <LeaderModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedLeader(null)
          }}
          leader={selectedLeader}
          mode={selectedLeader ? "edit" : "create"}
        />

        <LeaderDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedLeader(null)
          }}
          leader={selectedLeader}
        />

        <AlertDialog open={!!leaderToDelete} onOpenChange={() => setLeaderToDelete(null)}>
          <AlertDialogContent className="bg-card border-border text-card-foreground">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                This action cannot be undone. This will permanently delete the leader{" "}
                <span className="font-semibold text-foreground">{leaderToDelete?.name}</span> from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteLeader}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
