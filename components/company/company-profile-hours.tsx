"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Loader2, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

type DaySchedule = {
  enabled: boolean
  openTime: string
  closeTime: string
  breakStart?: string
  breakEnd?: string
  hasBreak: boolean
}

type WeekSchedule = {
  [key: string]: DaySchedule
}

const timeOptions = [
  "00:00",
  "00:30",
  "01:00",
  "01:30",
  "02:00",
  "02:30",
  "03:00",
  "03:30",
  "04:00",
  "04:30",
  "05:00",
  "05:30",
  "06:00",
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
  "22:30",
  "23:00",
  "23:30",
]

const defaultSchedule: WeekSchedule = {
  monday: {
    enabled: true,
    openTime: "08:00",
    closeTime: "18:00",
    hasBreak: true,
    breakStart: "12:00",
    breakEnd: "13:00",
  },
  tuesday: {
    enabled: true,
    openTime: "08:00",
    closeTime: "18:00",
    hasBreak: true,
    breakStart: "12:00",
    breakEnd: "13:00",
  },
  wednesday: {
    enabled: true,
    openTime: "08:00",
    closeTime: "18:00",
    hasBreak: true,
    breakStart: "12:00",
    breakEnd: "13:00",
  },
  thursday: {
    enabled: true,
    openTime: "08:00",
    closeTime: "18:00",
    hasBreak: true,
    breakStart: "12:00",
    breakEnd: "13:00",
  },
  friday: {
    enabled: true,
    openTime: "08:00",
    closeTime: "18:00",
    hasBreak: true,
    breakStart: "12:00",
    breakEnd: "13:00",
  },
  saturday: { enabled: false, openTime: "09:00", closeTime: "13:00", hasBreak: false },
  sunday: { enabled: false, openTime: "09:00", closeTime: "13:00", hasBreak: false },
}

export function CompanyProfileHours() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [schedule, setSchedule] = useState<WeekSchedule>(defaultSchedule)

  const dayNames: { [key: string]: string } = {
    monday: "Segunda-feira",
    tuesday: "Terça-feira",
    wednesday: "Quarta-feira",
    thursday: "Quinta-feira",
    friday: "Sexta-feira",
    saturday: "Sábado",
    sunday: "Domingo",
  }

  const handleDayToggle = (day: string, enabled: boolean) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        enabled,
      },
    })
  }

  const handleBreakToggle = (day: string, hasBreak: boolean) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        hasBreak,
        breakStart: hasBreak ? schedule[day].breakStart || "12:00" : undefined,
        breakEnd: hasBreak ? schedule[day].breakEnd || "13:00" : undefined,
      },
    })
  }

  const handleTimeChange = (day: string, field: string, value: string) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        [field]: value,
      },
    })
  }

  const copyToAllDays = (fromDay: string) => {
    const daySchedule = schedule[fromDay]
    const newSchedule = { ...schedule }

    Object.keys(schedule).forEach((day) => {
      if (day !== fromDay) {
        newSchedule[day] = { ...daySchedule }
      }
    })

    setSchedule(newSchedule)

    toast({
      title: "Horário copiado",
      description: `O horário de ${dayNames[fromDay]} foi copiado para todos os dias.`,
    })
  }

  async function saveBusinessHours() {
    setIsLoading(true)
    try {
      // Simulação de atualização
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Aqui seria a chamada real para atualizar os horários de funcionamento
      // await updateBusinessHours(schedule);

      toast({
        title: "Horários atualizados",
        description: "Os horários de funcionamento foram atualizados com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar os horários de funcionamento.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Clock className="h-8 w-8 text-primary" />
          <div>
            <h3 className="text-lg font-medium">Horário de Funcionamento</h3>
            <p className="text-sm text-muted-foreground">
              Configure os horários em que sua empresa está aberta para atendimento
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-6">
          {Object.keys(schedule).map((day) => (
            <Card key={day} className={!schedule[day].enabled ? "opacity-75" : ""}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={schedule[day].enabled}
                        onCheckedChange={(checked) => handleDayToggle(day, checked)}
                        id={`${day}-toggle`}
                      />
                      <Label htmlFor={`${day}-toggle`} className="font-medium">
                        {dayNames[day]}
                      </Label>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToAllDays(day)}
                      disabled={!schedule[day].enabled}
                    >
                      Copiar para todos
                    </Button>
                  </div>

                  {schedule[day].enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${day}-open`}>Horário de Abertura</Label>
                        <Select
                          value={schedule[day].openTime}
                          onValueChange={(value) => handleTimeChange(day, "openTime", value)}
                          disabled={!schedule[day].enabled}
                        >
                          <SelectTrigger id={`${day}-open`}>
                            <SelectValue placeholder="Selecione um horário" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((time) => (
                              <SelectItem key={`${day}-open-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`${day}-close`}>Horário de Fechamento</Label>
                        <Select
                          value={schedule[day].closeTime}
                          onValueChange={(value) => handleTimeChange(day, "closeTime", value)}
                          disabled={!schedule[day].enabled}
                        >
                          <SelectTrigger id={`${day}-close`}>
                            <SelectValue placeholder="Selecione um horário" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((time) => (
                              <SelectItem key={`${day}-close-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2 flex items-center gap-2">
                        <Switch
                          checked={schedule[day].hasBreak}
                          onCheckedChange={(checked) => handleBreakToggle(day, checked)}
                          id={`${day}-break-toggle`}
                          disabled={!schedule[day].enabled}
                        />
                        <Label htmlFor={`${day}-break-toggle`}>Intervalo para almoço/descanso</Label>
                      </div>

                      {schedule[day].hasBreak && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor={`${day}-break-start`}>Início do Intervalo</Label>
                            <Select
                              value={schedule[day].breakStart}
                              onValueChange={(value) => handleTimeChange(day, "breakStart", value)}
                              disabled={!schedule[day].enabled || !schedule[day].hasBreak}
                            >
                              <SelectTrigger id={`${day}-break-start`}>
                                <SelectValue placeholder="Selecione um horário" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map((time) => (
                                  <SelectItem key={`${day}-break-start-${time}`} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`${day}-break-end`}>Fim do Intervalo</Label>
                            <Select
                              value={schedule[day].breakEnd}
                              onValueChange={(value) => handleTimeChange(day, "breakEnd", value)}
                              disabled={!schedule[day].enabled || !schedule[day].hasBreak}
                            >
                              <SelectTrigger id={`${day}-break-end`}>
                                <SelectValue placeholder="Selecione um horário" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map((time) => (
                                  <SelectItem key={`${day}-break-end-${time}`} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Button onClick={saveBusinessHours} disabled={isLoading} className="w-full sm:w-auto">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Salvar Horários
      </Button>
    </div>
  )
}
