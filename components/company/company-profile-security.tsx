"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Shield } from "lucide-react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(8, {
      message: "A senha atual deve ter pelo menos 8 caracteres.",
    }),
    newPassword: z.string().min(8, {
      message: "A nova senha deve ter pelo menos 8 caracteres.",
    }),
    confirmPassword: z.string().min(8, {
      message: "A confirmação de senha deve ter pelo menos 8 caracteres.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  })

type PasswordFormValues = z.infer<typeof passwordFormSchema>

export function CompanyProfileSecurity() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [sessionNotificationsEnabled, setSessionNotificationsEnabled] = useState(true)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  })

  async function onSubmit(data: PasswordFormValues) {
    setIsLoading(true)
    try {
      // Simulação de atualização
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Aqui seria a chamada real para atualizar a senha
      // await updatePassword(data.currentPassword, data.newPassword);

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso.",
      })

      form.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      toast({
        title: "Erro ao atualizar senha",
        description: "Ocorreu um erro ao atualizar sua senha. Verifique se a senha atual está correta.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTwoFactorToggle = async (checked: boolean) => {
    setTwoFactorEnabled(checked)

    toast({
      title: checked ? "Autenticação de dois fatores ativada" : "Autenticação de dois fatores desativada",
      description: checked
        ? "A autenticação de dois fatores foi ativada com sucesso."
        : "A autenticação de dois fatores foi desativada com sucesso.",
    })
  }

  const handleSessionNotificationsToggle = async (checked: boolean) => {
    setSessionNotificationsEnabled(checked)

    toast({
      title: checked ? "Notificações de sessão ativadas" : "Notificações de sessão desativadas",
      description: checked
        ? "Você receberá notificações sobre novos logins na sua conta."
        : "Você não receberá mais notificações sobre novos logins na sua conta.",
    })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h3 className="text-lg font-medium">Segurança da Conta</h3>
            <p className="text-sm text-muted-foreground">Gerencie as configurações de segurança da sua conta</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-base font-medium">Autenticação de dois fatores</h4>
              <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança à sua conta</p>
            </div>
            <Switch checked={twoFactorEnabled} onCheckedChange={handleTwoFactorToggle} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-base font-medium">Notificações de sessão</h4>
              <p className="text-sm text-muted-foreground">
                Receba notificações quando houver um novo login na sua conta
              </p>
            </div>
            <Switch checked={sessionNotificationsEnabled} onCheckedChange={handleSessionNotificationsToggle} />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Alterar Senha</h3>
          <p className="text-sm text-muted-foreground">Atualize sua senha para manter sua conta segura</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha Atual</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormDescription>A senha deve ter pelo menos 8 caracteres.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Nova Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Atualizar Senha
            </Button>
          </form>
        </Form>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-destructive">Zona de Perigo</h3>
          <p className="text-sm text-muted-foreground">Ações irreversíveis para sua conta</p>
        </div>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle>Desativar Conta</CardTitle>
            <CardDescription>
              Desativar sua conta removerá temporariamente seu acesso ao sistema. Você poderá reativá-la posteriormente.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="text-destructive">
              Desativar Conta
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
