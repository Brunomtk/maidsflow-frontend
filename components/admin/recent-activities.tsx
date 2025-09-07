import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle, Clock, XCircle } from "lucide-react"

const activities = [
  {
    id: 1,
    user: "João Silva",
    action: "realizou check-in no cliente ABC Ltda",
    time: "há 10 minutos",
    status: "success",
    avatar: "JS",
  },
  {
    id: 2,
    user: "Maria Oliveira",
    action: "cancelou agendamento #1234",
    time: "há 25 minutos",
    status: "error",
    avatar: "MO",
  },
  {
    id: 3,
    user: "Carlos Santos",
    action: "adicionou nova empresa: Tech Solutions",
    time: "há 1 hora",
    status: "success",
    avatar: "CS",
  },
  {
    id: 4,
    user: "Ana Pereira",
    action: "está atrasada para o agendamento #2345",
    time: "há 1 hora",
    status: "warning",
    avatar: "AP",
  },
  {
    id: 5,
    user: "Roberto Alves",
    action: "concluiu serviço no cliente XYZ S.A.",
    time: "há 2 horas",
    status: "success",
    avatar: "RA",
  },
]

export function RecentActivities() {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4">
          <Avatar className="h-9 w-9 border border-[#2a3349]">
            <AvatarFallback className="bg-[#0f172a] text-[#06b6d4]">{activity.avatar}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{activity.user}</span>
              <span className="text-sm text-gray-400">{activity.action}</span>
            </div>
            <p className="text-xs text-gray-400">{activity.time}</p>
          </div>

          <div>
            {activity.status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
            {activity.status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
            {activity.status === "warning" && <Clock className="h-5 w-5 text-yellow-500" />}
          </div>
        </div>
      ))}
    </div>
  )
}
