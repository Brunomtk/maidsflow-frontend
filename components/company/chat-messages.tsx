"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, MoreVertical, Phone, Video } from "lucide-react"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  content: string
  sender: "user" | "contact"
  timestamp: string
  read: boolean
}

type ChatMessagesProps = {
  chatId: string
}

export function ChatMessages({ chatId }: ChatMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [contactInfo, setContactInfo] = useState({ name: "", avatar: "" })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulating API call to fetch chat details and messages
    const mockContactInfo = {
      "1": { name: "João Silva", avatar: "" },
      "2": { name: "Maria Oliveira", avatar: "" },
      "3": { name: "Carlos Mendes", avatar: "" },
      "4": { name: "Ana Souza", avatar: "" },
      "5": { name: "Roberto Alves", avatar: "" },
    }[chatId] || { name: "Contato", avatar: "" }

    setContactInfo(mockContactInfo)

    const mockMessages: Message[] = [
      {
        id: "1",
        content: "Olá, tudo bem?",
        sender: "contact",
        timestamp: "10:25",
        read: true,
      },
      {
        id: "2",
        content: "Olá! Tudo ótimo, e com você?",
        sender: "user",
        timestamp: "10:26",
        read: true,
      },
      {
        id: "3",
        content: "Estou bem! Gostaria de saber quando será o próximo serviço agendado.",
        sender: "contact",
        timestamp: "10:28",
        read: true,
      },
      {
        id: "4",
        content: "Claro! Temos um agendamento para a próxima terça-feira, às 14h. Está confirmado?",
        sender: "user",
        timestamp: "10:30",
        read: true,
      },
      {
        id: "5",
        content: "Perfeito! Confirmo para terça-feira. Obrigado pela informação!",
        sender: "contact",
        timestamp: "10:32",
        read: false,
      },
    ]

    setMessages(mockMessages)
  }, [chatId])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return

    const newMsg: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
    }

    setMessages([...messages, newMsg])
    setNewMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={contactInfo.avatar || "/placeholder.svg"} alt={contactInfo.name} />
            <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {contactInfo.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{contactInfo.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}>
            <div className="flex items-end space-x-2">
              {message.sender === "contact" && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={contactInfo.avatar || "/placeholder.svg"} alt={contactInfo.name} />
                  <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                    {contactInfo.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={cn(
                  "max-w-md rounded-lg p-3",
                  message.sender === "user"
                    ? "bg-[#06b6d4] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                )}
              >
                <p className="text-sm">{message.content}</p>
                <div
                  className={cn(
                    "text-xs mt-1 flex justify-end",
                    message.sender === "user" ? "text-white/80" : "text-gray-500",
                  )}
                >
                  {message.timestamp}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="icon" className="rounded-full bg-[#06b6d4] hover:bg-[#0891b2]">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
