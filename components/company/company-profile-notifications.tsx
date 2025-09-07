"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Loader2, Bell } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export function CompanyProfileNotifications() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [whatsappNotifications, setWhatsappNotifications] = useState(true)

  // Notification types
  const [appointmentNotifications, setAppointmentNotifications] = useState(true)
  const [rescheduleNotifications, setRescheduleNotifications] = useState(true)
  const [cancellationNotifications, setCancellationNotifications] = useState(true)
  const [reviewNotifications, setReviewNotifications] = useState(true)
  const [paymentNotifications, setPaymentNotifications] = useState(true)
  const [professionalNotifications, setProfessionalNotifications] = useState(true)

  // Notification frequency
  const [notificationFrequency, setNotificationFrequency] = useState("immediate")

  async function saveNotificationPreferences() {
    setIsLoading(true)
    try {
      // Simulação de atualização
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Aqui seria a chamada real para atualizar as preferências de notificação
      // await updateNotificationPreferences({
      //   email: emailNotifications,
      //   sms: smsNotifications,
      //   push: pushNotifications,
      //   whatsapp: whatsappNotifications,
      //   types: {
      //     appointments: appointmentNotifications,
      //     reschedules: rescheduleNotifications,
      //     cancellations: cancellationNotifications,
      //     reviews: reviewNotifications,
      //     payments: paymentNotifications,
      //     professionals: professionalNotifications,
      //   },
      //   frequency: notificationFrequency,
      // });

      toast({
        title: "Preferências atualizadas",
        description: "Suas preferências de notificação foram atualizadas com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar suas preferências de notificação.",
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
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h3 className="text-lg font-medium">Preferências de Notificação</h3>
            <p className="text-sm text-muted-foreground">Escolha como e quando deseja receber notificações</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-6">
          <div>
            <h4 className="text-base font-medium mb-4">Canais de Notificação</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h5 className="text-sm font-medium">Email</h5>
                  <p className="text-xs text-muted-foreground">Receba notificações por email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h5 className="text-sm font-medium">SMS</h5>
                  <p className="text-xs text-muted-foreground">Receba notificações por SMS</p>
                </div>
                <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h5 className="text-sm font-medium">Notificações Push</h5>
                  <p className="text-xs text-muted-foreground">Receba notificações push no navegador ou aplicativo</p>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h5 className="text-sm font-medium">WhatsApp</h5>
                  <p className="text-xs text-muted-foreground">Receba notificações por WhatsApp</p>
                </div>
                <Switch checked={whatsappNotifications} onCheckedChange={setWhatsappNotifications} />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-base font-medium mb-4">Tipos de Notificação</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h5 className="text-sm font-medium">Agendamentos</h5>
                  <p className="text-xs text-muted-foreground">Notificações sobre novos agendamentos</p>
                </div>
                <Switch checked={appointmentNotifications} onCheckedChange={setAppointmentNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h5 className="text-sm font-medium">Reagendamentos</h5>
                  <p className="text-xs text-muted-foreground">Notificações sobre reagendamentos</p>
                </div>
                <Switch checked={rescheduleNotifications} onCheckedChange={setRescheduleNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h5 className="text-sm font-medium">Cancelamentos</h5>
                  <p className="text-xs text-muted-foreground">Notificações sobre cancelamentos</p>
                </div>
                <Switch checked={cancellationNotifications} onCheckedChange={setCancellationNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h5 className="text-sm font-medium">Avaliações</h5>
                  <p className="text-xs text-muted-foreground">Notificações sobre novas avaliações</p>
                </div>
                <Switch checked={reviewNotifications} onCheckedChange={setReviewNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h5 className="text-sm font-medium">Pagamentos</h5>
                  <p className="text-xs text-muted-foreground">Notificações sobre pagamentos</p>
                </div>
                <Switch checked={paymentNotifications} onCheckedChange={setPaymentNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h5 className="text-sm font-medium">Profissionais</h5>
                  <p className="text-xs text-muted-foreground">Notificações sobre atividades dos profissionais</p>
                </div>
                <Switch checked={professionalNotifications} onCheckedChange={setProfessionalNotifications} />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-base font-medium mb-4">Frequência de Notificações</h4>
            <RadioGroup value={notificationFrequency} onValueChange={setNotificationFrequency} className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="immediate" id="immediate" />
                <Label htmlFor="immediate" className="font-normal">
                  Imediato - Receba notificações assim que ocorrerem
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hourly" id="hourly" />
                <Label htmlFor="hourly" className="font-normal">
                  Horário - Receba um resumo a cada hora
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily" className="font-normal">
                  Diário - Receba um resumo diário
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly" className="font-normal">
                  Semanal - Receba um resumo semanal
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      <Button onClick={saveNotificationPreferences} disabled={isLoading} className="w-full sm:w-auto">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Salvar Preferências
      </Button>
    </div>
  )
}
