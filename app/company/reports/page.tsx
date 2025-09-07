"use client"

import { useState } from "react"
import {
  BarChart,
  Calendar,
  Download,
  FileText,
  Filter,
  PieChart,
  RefreshCw,
  Save,
  Share2,
  Users,
  Clock,
  Star,
  DollarSign,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/admin/date-range-picker"
import { ReportChart } from "@/components/admin/report-chart"
import { ReportTable } from "@/components/admin/report-table"
import { ReportFilters } from "@/components/admin/report-filters"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"

export default function CompanyReportsPage() {
  const [activeTab, setActiveTab] = useState("financial")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [dateRange, setDateRange] = useState({ from: new Date(2023, 0, 1), to: new Date() })
  const [showFilters, setShowFilters] = useState(false)

  const handleGenerateReport = () => {
    setIsGenerating(true)
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false)
      toast({
        title: "Relatório gerado com sucesso",
        description: "Os dados foram atualizados com as informações mais recentes.",
      })
    }, 1500)
  }

  const handleExportReport = (format: string) => {
    setIsExporting(true)
    // Simulate export
    setTimeout(() => {
      setIsExporting(false)
      toast({
        title: `Relatório exportado como ${format.toUpperCase()}`,
        description: "O download começará automaticamente em alguns segundos.",
      })
    }, 1500)
  }

  const handleScheduleReport = () => {
    toast({
      title: "Relatório agendado",
      description: "Este relatório será enviado automaticamente conforme o agendamento definido.",
    })
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Visualize e exporte relatórios detalhados sobre o desempenho da sua empresa.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="w-full sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="w-full sm:w-auto bg-transparent"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </>
            )}
          </Button>
          <Select onValueChange={(value) => handleExportReport(value)}>
            <SelectTrigger className="w-full sm:w-[140px]" disabled={isExporting}>
              <SelectValue placeholder={isExporting ? "Exportando..." : "Exportar"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">Exportar PDF</SelectItem>
              <SelectItem value="excel">Exportar Excel</SelectItem>
              <SelectItem value="csv">Exportar CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <ReportFilters onApply={() => setShowFilters(false)} />
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4">
        <div className="w-full">
          <DatePickerWithRange dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs py-1">
            Último trimestre
          </Badge>
          <Badge variant="outline" className="text-xs py-1">
            Último mês
          </Badge>
          <Badge variant="outline" className="text-xs py-1">
            Últimos 7 dias
          </Badge>
          <Badge variant="outline" className="text-xs py-1">
            Hoje
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="financial" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="financial" className="text-xs sm:text-sm">
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Financeiro</span>
          </TabsTrigger>
          <TabsTrigger value="operational" className="text-xs sm:text-sm">
            <BarChart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Operacional</span>
          </TabsTrigger>
          <TabsTrigger value="customers" className="text-xs sm:text-sm">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Clientes</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="text-xs sm:text-sm">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Serviços</span>
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-xs sm:text-sm">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Personalizado</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">R$ 45.231,89</div>
                <p className="text-xs text-muted-foreground">+20,1% em relação ao período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Ticket Médio</CardTitle>
                <BarChart className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">R$ 320,50</div>
                <p className="text-xs text-muted-foreground">+2,5% em relação ao período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Taxa de Conversão</CardTitle>
                <PieChart className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">24,8%</div>
                <p className="text-xs text-muted-foreground">+4,1% em relação ao período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Cancelamentos</CardTitle>
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">3,2%</div>
                <p className="text-xs text-muted-foreground">-1,1% em relação ao período anterior</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">Receita por Serviço</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Distribuição de receita por tipo de serviço
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ReportChart type="pie" />
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">Tendência de Receita</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Receita mensal nos últimos 12 meses</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ReportChart type="line" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">Transações Recentes</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Lista de transações financeiras recentes</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <ReportTable type="financial" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational" className="space-y-4">
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Total de Agendamentos</CardTitle>
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">1.248</div>
                <p className="text-xs text-muted-foreground">+12,3% em relação ao período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Taxa de Ocupação</CardTitle>
                <BarChart className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">78,5%</div>
                <p className="text-xs text-muted-foreground">+5,2% em relação ao período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Tempo Médio</CardTitle>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">42 min</div>
                <p className="text-xs text-muted-foreground">-3,1% em relação ao período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Satisfação</CardTitle>
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">4,8/5</div>
                <p className="text-xs text-muted-foreground">+0,2 em relação ao período anterior</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">Agendamentos por Dia da Semana</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Distribuição de agendamentos por dia</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ReportChart type="bar" />
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">Duração do Serviço</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Tempo médio por tipo de serviço</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ReportChart type="bar-horizontal" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">Desempenho dos Profissionais</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Métricas de desempenho por profissional</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <ReportTable type="operational" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Novos Clientes</CardTitle>
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">842</div>
                <p className="text-xs text-muted-foreground">+18,2% em relação ao período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Clientes Ativos</CardTitle>
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">3.427</div>
                <p className="text-xs text-muted-foreground">+7,4% em relação ao período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Taxa de Retenção</CardTitle>
                <PieChart className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">76,3%</div>
                <p className="text-xs text-muted-foreground">+2,1% em relação ao período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Avaliações</CardTitle>
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">4,7/5</div>
                <p className="text-xs text-muted-foreground">+0,3 em relação ao período anterior</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">Crescimento de Clientes</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Novos clientes por mês</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ReportChart type="line" />
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">Distribuição Demográfica</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Clientes por faixa etária e gênero</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ReportChart type="bar-stacked" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">Atividade dos Clientes</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Últimas atividades registradas na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <ReportTable type="users" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Serviços Realizados</CardTitle>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">3.842</div>
                <p className="text-xs text-muted-foreground">+15,2% em relação ao período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Serviço Mais Popular</CardTitle>
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-base sm:text-2xl font-bold">Limpeza Residencial</div>
                <p className="text-xs text-muted-foreground">42% do total de serviços</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Tempo Médio de Serviço</CardTitle>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">2h 15min</div>
                <p className="text-xs text-muted-foreground">-10 min em relação ao período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Áreas Atendidas</CardTitle>
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">27</div>
                <p className="text-xs text-muted-foreground">+3 em relação ao período anterior</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">Distribuição de Serviços</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Proporção de cada tipo de serviço</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ReportChart type="pie" />
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">Tendência de Serviços</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Evolução mensal por tipo de serviço</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ReportChart type="line" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">Detalhamento de Serviços</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Análise detalhada por tipo de serviço</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h3 className="text-base sm:text-lg font-medium mb-4">Limpeza Residencial</h3>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-medium">Total de Serviços</p>
                      <p className="text-xl sm:text-2xl font-bold">1.624</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-medium">Receita Gerada</p>
                      <p className="text-xl sm:text-2xl font-bold">R$ 19.488,00</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-medium">Avaliação Média</p>
                      <p className="text-xl sm:text-2xl font-bold">4,8/5</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-base sm:text-lg font-medium mb-4">Limpeza Comercial</h3>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-medium">Total de Serviços</p>
                      <p className="text-xl sm:text-2xl font-bold">968</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-medium">Receita Gerada</p>
                      <p className="text-xl sm:text-2xl font-bold">R$ 14.520,00</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-medium">Avaliação Média</p>
                      <p className="text-xl sm:text-2xl font-bold">4,6/5</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-base sm:text-lg font-medium mb-4">Limpeza Pós-obra</h3>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-medium">Total de Serviços</p>
                      <p className="text-xl sm:text-2xl font-bold">576</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-medium">Receita Gerada</p>
                      <p className="text-xl sm:text-2xl font-bold">R$ 8.640,00</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-medium">Avaliação Média</p>
                      <p className="text-xl sm:text-2xl font-bold">4,7/5</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">Relatórios Personalizados</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Crie e gerencie relatórios personalizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-medium">Meus Relatórios</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Relatórios salvos anteriormente</p>
                  </div>
                  <Button className="w-full sm:w-auto">
                    <FileText className="h-4 w-4 mr-2" />
                    Novo Relatório
                  </Button>
                </div>

                <Separator />

                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <CardTitle className="text-sm sm:text-base">Relatório Personalizado {i}</CardTitle>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon">
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription className="text-xs">
                          Criado em {new Date().toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs sm:text-sm">
                          {i === 1 && "Análise de desempenho dos profissionais por região"}
                          {i === 2 && "Comparação de receita por serviço nos últimos 6 meses"}
                          {i === 3 && "Relatório de satisfação do cliente por categoria de serviço"}
                          {i === 4 && "Análise de tendência de agendamentos por horário do dia"}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {i === 1 && "Profissionais"}
                            {i === 2 && "Financeiro"}
                            {i === 3 && "Clientes"}
                            {i === 4 && "Agendamentos"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Atualizado semanalmente
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex flex-col gap-4 mt-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-medium">Relatórios Agendados</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Relatórios enviados automaticamente</p>
                  </div>
                  <Button variant="outline" onClick={handleScheduleReport} className="w-full sm:w-auto bg-transparent">
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Relatório
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-sm sm:text-base">
                          {i === 1 ? "Relatório Financeiro Mensal" : "Relatório de Desempenho Semanal"}
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {i === 1 ? "Enviado todo dia 1º do mês" : "Enviado toda segunda-feira"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {i === 1 ? "Mensal" : "Semanal"}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
