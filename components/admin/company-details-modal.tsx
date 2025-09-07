"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Building2, Mail, Phone, User, Calendar, CreditCard } from "lucide-react"
import type { Company } from "@/types"

interface CompanyDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  company: Company | null
}

export function CompanyDetailsModal({ isOpen, onClose, company }: CompanyDetailsModalProps) {
  if (!company) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#1a2234] border-[#2a3349] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#06b6d4]" />
            Company Details
          </DialogTitle>
          <DialogDescription className="text-gray-400">Complete information about {company.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Basic Information</h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Company Name</p>
                  <p className="text-white font-medium">{company.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">CNPJ</p>
                  <p className="text-white font-medium">{company.cnpj}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Responsible Person</p>
                  <p className="text-white font-medium">{company.responsible}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-[#2a3349]" />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Information</h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white font-medium">{company.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="text-white font-medium">{company.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-[#2a3349]" />

          {/* Plan Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Plan Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Current Plan</p>
                <p className="text-white font-medium">{company.plan?.name || "N/A"}</p>
                {company.plan && <p className="text-sm text-gray-400">${company.plan.price}/month</p>}
              </div>
              {company.plan && company.plan.features && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Features</p>
                  <div className="flex flex-wrap gap-1">
                    {company.plan.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="border-[#06b6d4] text-[#06b6d4] text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-[#2a3349]" />

          {/* Status and Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Status & Dates</h3>
            <div className="grid gap-3">
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <Badge
                  variant="outline"
                  className={company.status === 1 ? "border-green-500 text-green-500" : "border-red-500 text-red-500"}
                >
                  {company.status === 1 ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Created</p>
                  <p className="text-white font-medium">{formatDate(company.createdDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Last Updated</p>
                  <p className="text-white font-medium">{formatDate(company.updatedDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="bg-[#06b6d4] hover:bg-[#0891b2] text-white">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
