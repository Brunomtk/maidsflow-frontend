"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Users, MapPin, Edit, Trash2, User, Building } from "lucide-react"
import { format } from "date-fns"
import type { CompanyRecurrence } from "@/types/company-recurrence"

interface CompanyRecurrenceDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  recurrence: CompanyRecurrence | null
  onEdit: (recurrence: CompanyRecurrence) => void
  onDelete: (recurrence: CompanyRecurrence) => void
}

export function CompanyRecurrenceDetailsModal({
  isOpen,
  onClose,
  recurrence,
  onEdit,
  onDelete,
}: CompanyRecurrenceDetailsModalProps) {
  if (!recurrence) return null

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
      case 0:
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Inactive</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Unknown</Badge>
    }
  }

  const getTypeBadge = (type: number) => {
    switch (type) {
      case 1:
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Regular</Badge>
      case 2:
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Deep Cleaning</Badge>
      case 3:
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Specialized</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Unknown</Badge>
    }
  }

  const getFrequencyText = (frequency: number) => {
    switch (frequency) {
      case 1:
        return "Weekly"
      case 2:
        return "Biweekly"
      case 3:
        return "Monthly"
      case 4:
        return "Quarterly"
      case 5:
        return "Yearly"
      default:
        return "Custom"
    }
  }

  const getDayText = (day: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[day] || "Unknown"
  }

  const handleEdit = () => {
    onEdit(recurrence)
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this recurrence?")) {
      onDelete(recurrence)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a2234] border-[#2a3349] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            Recurrence Details
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleEdit}
                className="border-[#2a3349] text-white hover:bg-[#2a3349] bg-transparent"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                className="border-red-500/30 text-red-400 hover:bg-red-500/20 bg-transparent"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Title</label>
                <p className="text-white font-medium">{recurrence.title}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Status</label>
                <div className="mt-1">{getStatusBadge(recurrence.status)}</div>
              </div>
              <div>
                <label className="text-sm text-gray-400">Service Type</label>
                <div className="mt-1">{getTypeBadge(recurrence.type)}</div>
              </div>
              <div>
                <label className="text-sm text-gray-400">Duration</label>
                <p className="text-white font-medium">{recurrence.duration} minutes</p>
              </div>
            </div>
          </div>

          <Separator className="bg-[#2a3349]" />

          {/* Schedule Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Schedule Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Frequency</label>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <p className="text-white font-medium">{getFrequencyText(recurrence.frequency)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400">Day of Week</label>
                <p className="text-white font-medium">{getDayText(recurrence.day)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Time</label>
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <p className="text-white font-medium">{recurrence.time}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400">Start Date</label>
                <p className="text-white font-medium">{format(new Date(recurrence.startDate), "PPP")}</p>
              </div>
              {recurrence.endDate && (
                <div>
                  <label className="text-sm text-gray-400">End Date</label>
                  <p className="text-white font-medium">{format(new Date(recurrence.endDate), "PPP")}</p>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-[#2a3349]" />

          {/* Customer Information */}
          {recurrence.customer && (
            <>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Name</label>
                    <div className="flex items-center mt-1">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <p className="text-white font-medium">{recurrence.customer.name}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">SSN</label>
                    <p className="text-white font-medium">{recurrence.customer.document}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="text-white font-medium">{recurrence.customer.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Phone</label>
                    <p className="text-white font-medium">{recurrence.customer.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-400">Customer Address</label>
                    <p className="text-white font-medium">
                      {recurrence.customer.address}, {recurrence.customer.city} - {recurrence.customer.state}
                    </p>
                  </div>
                </div>
              </div>
              <Separator className="bg-[#2a3349]" />
            </>
          )}

          {/* Service Address */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Service Location</h3>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              <p className="text-white font-medium">{recurrence.address}</p>
            </div>
          </div>

          {/* Team Information */}
          {recurrence.team && (
            <>
              <Separator className="bg-[#2a3349]" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Assigned Team</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Team Name</label>
                    <div className="flex items-center mt-1">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      <p className="text-white font-medium">{recurrence.team.name}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Region</label>
                    <p className="text-white font-medium">{recurrence.team.region}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-400">Description</label>
                    <p className="text-white font-medium">{recurrence.team.description}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Company Information */}
          {recurrence.company && (
            <>
              <Separator className="bg-[#2a3349]" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Company Name</label>
                    <div className="flex items-center mt-1">
                      <Building className="h-4 w-4 mr-2 text-gray-400" />
                      <p className="text-white font-medium">{recurrence.company.name}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">CNPJ</label>
                    <p className="text-white font-medium">{recurrence.company.cnpj}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Responsible</label>
                    <p className="text-white font-medium">{recurrence.company.responsible}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Phone</label>
                    <p className="text-white font-medium">{recurrence.company.phone}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Execution Information */}
          {(recurrence.lastExecution || recurrence.nextExecution) && (
            <>
              <Separator className="bg-[#2a3349]" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Execution Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recurrence.lastExecution && (
                    <div>
                      <label className="text-sm text-gray-400">Last Execution</label>
                      <p className="text-white font-medium">{format(new Date(recurrence.lastExecution), "PPP")}</p>
                    </div>
                  )}
                  {recurrence.nextExecution && (
                    <div>
                      <label className="text-sm text-gray-400">Next Execution</label>
                      <p className="text-white font-medium">{format(new Date(recurrence.nextExecution), "PPP")}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {recurrence.notes && (
            <>
              <Separator className="bg-[#2a3349]" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
                <p className="text-white bg-[#0f172a] p-3 rounded-md border border-[#2a3349]">{recurrence.notes}</p>
              </div>
            </>
          )}

          {/* Timestamps */}
          <Separator className="bg-[#2a3349]" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Created Date</label>
                <p className="text-white font-medium">{format(new Date(recurrence.createdDate), "PPP 'at' p")}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Updated Date</label>
                <p className="text-white font-medium">{format(new Date(recurrence.updatedDate), "PPP 'at' p")}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
