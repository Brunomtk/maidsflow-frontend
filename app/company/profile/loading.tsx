import { CompanyHeader } from "@/components/company/company-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageLoading } from "@/components/ui/page-loading"

export default function CompanyProfileLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <CompanyHeader title="Perfil da Empresa" description="Gerencie as informações do perfil da sua empresa" />

      <main className="flex-1 p-6 container max-w-7xl mx-auto">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="general">Informações Gerais</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="hours">Horário de Funcionamento</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
                <CardDescription>Atualize as informações básicas da sua empresa</CardDescription>
              </CardHeader>
              <CardContent>
                <PageLoading />
              </CardContent>
            </Card>
          </TabsContent>
          {/* rest of code here */}
        </Tabs>
      </main>
    </div>
  )
}
