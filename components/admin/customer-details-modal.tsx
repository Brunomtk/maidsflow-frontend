"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, MapPin, Building, Calendar, FileText, MessageSquare } from "lucide-react"
import type { Customer } from "@/types/customer"

interface CustomerDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
}

export function CustomerDetailsModal({ open, onOpenChange, customer }: CustomerDetailsModalProps) {
  if (!customer) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const normalizePhone = (raw?: string | null) => {
    const digits = (raw || "").replace(/\D/g, "")
    if (!digits) return null
    let d = digits.replace(/^0+/, "")
    if (!d.startsWith("55") && d.length <= 12) d = "55" + d
    return d
  }

  const handleOnMyWay = () => {
    const phone = normalizePhone(customer?.phone as any)
    if (!phone) {
      alert("Client phone not available.")
      return
    }
    const name = customer?.name || ""
    const companyName =
      customer?.company?.name || (typeof window !== "undefined" ? localStorage.getItem("company_name") || "our" : "our")
    const eta = "15 minutes"
    const message = `Hi ${name}, hope your having a nice day. Your ${companyName} team is on the way, ${eta} from your house`
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    if (typeof window !== "undefined") window.open(url, "_blank")
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a2234] border-[#2a3349] text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-[#0f172a] border-[#2a3349]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Basic Information</CardTitle>
              <div className="mt-2">
                <Button
                  variant="outline"
                  className="border-[#2a3349] text-white hover:bg-[#2a3349] bg-transparent"
                  onClick={handleOnMyWay}
                >
                  On my way
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Name</span>
                  </div>
                  <p className="text-white font-medium">{customer.name}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Email</span>
                  </div>
                  <p className="text-white">{customer.email}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">SSN</span>
                  </div>
                  <p className="text-white">{customer.ssn || "Not provided"}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">Phone</span>
                  </div>
                  <p className="text-white">{customer.phone || "Not provided"}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">City</span>
                  </div>
                  <p className="text-white">{customer.city || "Not provided"}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">State</span>
                  </div>
                  <p className="text-white">{customer.state || "Not provided"}</p>
                </div>
              </div>

              {customer.address && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">Address</span>
                  </div>
                  <p className="text-white">{customer.address}</p>
                </div>
              )}

              {customer.observations && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">Observations</span>
                  </div>
                  <p className="text-white">{customer.observations}</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-sm">Status</span>
                </div>
                <Badge variant={customer.status === 1 ? "default" : "secondary"}>
                  {customer.status === 1 ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Billing & Profile */}
          <Card className="bg-[#0f172a] border-[#2a3349]">
            <CardHeader>
              <CardTitle className="text-white">Billing & Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
              <div>
                <div className="text-sm text-gray-400">SSN</div>
                <div className="text-white">{customer?.ssn || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Ticket</div>
                <div className="text-white">{customer?.ticket ?? "—"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Frequency</div>
                <div className="text-white">{customer?.frequency || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Payment Method</div>
                <div className="text-white">{customer?.paymentMethod || "—"}</div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          {customer.company && (
            <Card className="bg-[#0f172a] border-[#2a3349]">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Building className="h-4 w-4" />
                      <span className="text-sm">Company Name</span>
                    </div>
                    <p className="text-white font-medium">{customer.company.name}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">CNPJ</span>
                    </div>
                    <p className="text-white">{customer.company.cnpj}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <User className="h-4 w-4" />
                      <span className="text-sm">Responsible</span>
                    </div>
                    <p className="text-white">{customer.company.responsible}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">Company Email</span>
                    </div>
                    <p className="text-white">{customer.company.email}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">Company Phone</span>
                    </div>
                    <p className="text-white">{customer.company.phone}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="text-sm">Company Status</span>
                    </div>
                    <Badge variant={customer.company.status === 1 ? "default" : "secondary"}>
                      {customer.company.status === 1 ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Information */}
          <Card className="bg-[#0f172a] border-[#2a3349]">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Created at</span>
                  </div>
                  <p className="text-white">{formatDate(customer.createdDate)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Updated at</span>
                  </div>
                  <p className="text-white">{formatDate(customer.updatedDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
