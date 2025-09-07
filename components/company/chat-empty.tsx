import { MessageSquare } from "lucide-react"

export function ChatEmpty() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <MessageSquare className="h-8 w-8 text-gray-500 dark:text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Nenhuma conversa selecionada</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
        Selecione uma conversa na lista ao lado ou inicie uma nova conversa para começar a trocar mensagens.
      </p>
    </div>
  )
}
