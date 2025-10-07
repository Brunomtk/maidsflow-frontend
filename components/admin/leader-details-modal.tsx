"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Calendar, User, MapPin } from "lucide-react"
import type { Leader } from "@/types/leader"

interface LeaderDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  leader: Leader | null
}

export function LeaderDetailsModal({ isOpen, onClose, leader }: LeaderDetailsModalProps) {
  if (!leader) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Active</Badge>
      case "Inactive":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/30">Inactive</Badge>
      default:
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/30">{status}</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Leader Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-primary/10 via-card to-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                {leader.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">{leader.name}</h3>
                <p className="text-sm text-muted-foreground">Leader ID: #{leader.id}</p>
              </div>
            </div>
            {getStatusBadge(leader.status)}
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact Information</h4>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">{leader.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground">{leader.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(leader.userId || leader.region) && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Additional Information
              </h4>
              <div className="grid gap-3">
                {leader.userId && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">User ID</p>
                      <p className="text-sm font-medium text-foreground">{leader.userId}</p>
                    </div>
                  </div>
                )}
                {leader.region && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Region</p>
                      <p className="text-sm font-medium text-foreground capitalize">{leader.region}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* System Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">System Information</h4>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Created Date</p>
                  <p className="text-sm font-medium text-foreground">{new Date(leader.createdDate).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
