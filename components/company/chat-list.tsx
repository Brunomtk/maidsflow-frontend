"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

type Chat = {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  timestamp: string
  unread: number
}

type ChatListProps = {
  onSelectChat: (chatId: string) => void
  selectedChatId: string | null
}

export function ChatList({ onSelectChat, selectedChatId }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [chats, setChats] = useState<Chat[]>([])

  useEffect(() => {
    // Simulating API call to fetch chats
    const mockChats: Chat[] = [
      {
        id: "1",
        name: "João Silva",
        lastMessage: "Olá, quando será o próximo serviço?",
        timestamp: "10:30",
        unread: 2,
      },
      {
        id: "2",
        name: "Maria Oliveira",
        lastMessage: "Obrigado pelo excelente trabalho!",
        timestamp: "09:15",
        unread: 0,
      },
      {
        id: "3",
        name: "Carlos Mendes",
        lastMessage: "Preciso remarcar o horário de amanhã",
        timestamp: "Ontem",
        unread: 1,
      },
      {
        id: "4",
        name: "Ana Souza",
        lastMessage: "O profissional já está a caminho?",
        timestamp: "Ontem",
        unread: 0,
      },
      {
        id: "5",
        name: "Roberto Alves",
        lastMessage: "Qual o valor do orçamento?",
        timestamp: "Seg",
        unread: 0,
      },
    ]

    setChats(mockChats)
  }, [])

  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="search"
            placeholder="Buscar conversas..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {filteredChats.length > 0 ? (
          <div className="space-y-1 p-2">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                className={cn(
                  "w-full flex items-center space-x-3 p-2 rounded-lg text-left transition-colors",
                  selectedChatId === chat.id ? "bg-[#06b6d4] text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800",
                )}
                onClick={() => onSelectChat(chat.id)}
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={chat.name} />
                  <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {chat.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        selectedChatId === chat.id ? "text-white" : "text-gray-900 dark:text-gray-100",
                      )}
                    >
                      {chat.name}
                    </p>
                    <p
                      className={cn(
                        "text-xs",
                        selectedChatId === chat.id ? "text-white" : "text-gray-500 dark:text-gray-400",
                      )}
                    >
                      {chat.timestamp}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p
                      className={cn(
                        "text-xs truncate",
                        selectedChatId === chat.id ? "text-white" : "text-gray-500 dark:text-gray-400",
                      )}
                    >
                      {chat.lastMessage}
                    </p>
                    {chat.unread > 0 && (
                      <span
                        className={cn(
                          "flex items-center justify-center h-5 w-5 rounded-full text-xs font-medium",
                          selectedChatId === chat.id ? "bg-white text-[#06b6d4]" : "bg-[#06b6d4] text-white",
                        )}
                      >
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">Nenhuma conversa encontrada</div>
        )}
      </div>
    </div>
  )
}
