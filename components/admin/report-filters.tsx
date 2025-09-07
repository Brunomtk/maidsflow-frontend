"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface ReportFiltersProps {
  onApply: () => void
}

export function ReportFilters({ onApply }: ReportFiltersProps) {
  const [filters, setFilters] = useState({
    minValue: "",
    maxValue: "",
    status: [] as string[],
    paymentMethod: "",
    services: [] as string[],
    sortBy: "date",
  })

  const handleStatusChange = (status: string) => {
    setFilters((prev) => {
      const newStatus = prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status]

      return { ...prev, status: newStatus }
    })
  }

  const handleServiceChange = (service: string) => {
    setFilters((prev) => {
      const newServices = prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service]

      return { ...prev, services: newServices }
    })
  }

  const handleApply = () => {
    // Here you would typically apply the filters to your data
    console.log("Applied filters:", filters)
    onApply()
  }

  const handleReset = () => {
    setFilters({
      minValue: "",
      maxValue: "",
      status: [],
      paymentMethod: "",
      services: [],
      sortBy: "date",
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          <h3 className="font-medium">Valor</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="min-value">Mínimo</Label>
              <Input
                id="min-value"
                placeholder="R$ 0,00"
                value={filters.minValue}
                onChange={(e) => setFilters({ ...filters, minValue: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-value">Máximo</Label>
              <Input
                id="max-value"
                placeholder="R$ 1.000,00"
                value={filters.maxValue}
                onChange={(e) => setFilters({ ...filters, maxValue: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Status</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status-paid"
                checked={filters.status.includes("paid")}
                onCheckedChange={() => handleStatusChange("paid")}
              />
              <Label htmlFor="status-paid">Pago</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status-pending"
                checked={filters.status.includes("pending")}
                onCheckedChange={() => handleStatusChange("pending")}
              />
              <Label htmlFor="status-pending">Pendente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status-canceled"
                checked={filters.status.includes("canceled")}
                onCheckedChange={() => handleStatusChange("canceled")}
              />
              <Label htmlFor="status-canceled">Cancelado</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status-refunded"
                checked={filters.status.includes("refunded")}
                onCheckedChange={() => handleStatusChange("refunded")}
              />
              <Label htmlFor="status-refunded">Reembolsado</Label>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Método de Pagamento</h3>
          <RadioGroup
            value={filters.paymentMethod}
            onValueChange={(value) => setFilters({ ...filters, paymentMethod: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="payment-all" />
              <Label htmlFor="payment-all">Todos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="credit" id="payment-credit" />
              <Label htmlFor="payment-credit">Cartão de Crédito</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="debit" id="payment-debit" />
              <Label htmlFor="payment-debit">Cartão de Débito</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pix" id="payment-pix" />
              <Label htmlFor="payment-pix">PIX</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cash" id="payment-cash" />
              <Label htmlFor="payment-cash">Dinheiro</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Serviços</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="service-residential"
                checked={filters.services.includes("residential")}
                onCheckedChange={() => handleServiceChange("residential")}
              />
              <Label htmlFor="service-residential">Limpeza Residencial</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="service-commercial"
                checked={filters.services.includes("commercial")}
                onCheckedChange={() => handleServiceChange("commercial")}
              />
              <Label htmlFor="service-commercial">Limpeza Comercial</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="service-post-construction"
                checked={filters.services.includes("post-construction")}
                onCheckedChange={() => handleServiceChange("post-construction")}
              />
              <Label htmlFor="service-post-construction">Limpeza Pós-obra</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="service-windows"
                checked={filters.services.includes("windows")}
                onCheckedChange={() => handleServiceChange("windows")}
              />
              <Label htmlFor="service-windows">Limpeza de Vidros</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="service-other"
                checked={filters.services.includes("other")}
                onCheckedChange={() => handleServiceChange("other")}
              />
              <Label htmlFor="service-other">Outros Serviços</Label>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Ordenar por</h3>
          <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Data (mais recente)</SelectItem>
              <SelectItem value="date-asc">Data (mais antiga)</SelectItem>
              <SelectItem value="value-desc">Valor (maior)</SelectItem>
              <SelectItem value="value-asc">Valor (menor)</SelectItem>
              <SelectItem value="name">Nome (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset}>
          Limpar Filtros
        </Button>
        <Button onClick={handleApply}>Aplicar Filtros</Button>
      </div>
    </div>
  )
}
