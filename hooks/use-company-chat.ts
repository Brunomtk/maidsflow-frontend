"use client"

import { useState, useCallback, useEffect } from "react"
import type { Chat, ChatMessage } from "@/types"
import { companyChatApi } from "@/lib/api/company-chat"
import { useToast } from "@/hooks/use-toast"

interface UseCompanyChatReturn {
  // Estado
  chat: Chat | null
  messages: ChatMessage[]
  isLoading: boolean
  isLoadingMessages: boolean
  error: string | null
  hasMoreMessages: boolean

  // Ações
  fetchChat: (id: string) => Promise<void>
  fetchMessages: (page?: number, limit?: number) => Promise<void>
  sendMessage: (content: string, attachments?: File[]) => Promise<boolean>
  markAsRead: (messageIds: string[]) => Promise<boolean>
  loadMoreMessages: () => Promise<boolean>
  addParticipants: (participants: { id: string; type: "professional" | "customer" }[]) => Promise<boolean>
  removeParticipant: (participantId: string) => Promise<boolean>
  updateGroupInfo: (data: { groupName?: string }) => Promise<boolean>
}

export function useCompanyChat(initialChatId?: string): UseCompanyChatReturn {
  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messagePagination, setMessagePagination] = useState({
    page: 1,
    limit: 50,
    hasMore: false,
    total: 0,
  })

  const { toast } = useToast()

  const fetchChat = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await companyChatApi.getChatById(id)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Erro",
            description: response.error,
            variant: "destructive",
          })
          return
        }

        setChat(response.data || null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Falha ao buscar conversa"
        setError(errorMessage)
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const fetchMessages = useCallback(
    async (page = 1, limit = 50) => {
      if (!chat) {
        setError("Nenhuma conversa selecionada")
        return
      }

      setIsLoadingMessages(true)
      setError(null)

      try {
        const response = await companyChatApi.getChatMessages(chat.id, page, limit)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Erro",
            description: response.error,
            variant: "destructive",
          })
          return
        }

        if (response.data) {
          setMessages(response.data.messages)
          setMessagePagination(response.data.pagination)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Falha ao buscar mensagens"
        setError(errorMessage)
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoadingMessages(false)
      }
    },
    [chat, toast],
  )

  const loadMoreMessages = useCallback(async (): Promise<boolean> => {
    if (!chat || !messagePagination.hasMore) {
      return false
    }

    setIsLoadingMessages(true)
    setError(null)

    try {
      const nextPage = messagePagination.page + 1
      const response = await companyChatApi.getChatMessages(chat.id, nextPage, messagePagination.limit)

      if (response.error) {
        setError(response.error)
        toast({
          title: "Erro",
          description: response.error,
          variant: "destructive",
        })
        return false
      }

      if (response.data) {
        // Adicionar mensagens mais antigas ao início do array
        setMessages((prev) => [...response.data.messages, ...prev])
        setMessagePagination(response.data.pagination)
        return true
      }

      return false
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Falha ao carregar mais mensagens"
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoadingMessages(false)
    }
  }, [chat, messagePagination, toast])

  const sendMessage = useCallback(
    async (content: string, attachments?: File[]): Promise<boolean> => {
      if (!chat) {
        setError("Nenhuma conversa selecionada")
        return false
      }

      if (!content.trim() && (!attachments || attachments.length === 0)) {
        setError("Mensagem vazia")
        return false
      }

      setError(null)

      try {
        // Em uma implementação real, os arquivos seriam enviados para um serviço de armazenamento
        // e os URLs resultantes seriam passados para a API
        const attachmentData = attachments
          ? attachments.map((file) => ({
              url: URL.createObjectURL(file), // Simulação - em produção seria a URL do arquivo no servidor
              name: file.name,
              type: file.type,
              size: file.size,
            }))
          : undefined

        const response = await companyChatApi.sendMessage(chat.id, content, attachmentData)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Erro",
            description: response.error,
            variant: "destructive",
          })
          return false
        }

        if (response.data) {
          // Adicionar a nova mensagem à lista
          setMessages((prev) => [...prev, response.data])

          // Atualizar o chat com a nova mensagem
          setChat((prev) => {
            if (!prev) return null
            return {
              ...prev,
              lastMessage: {
                content: response.data.content,
                timestamp: response.data.timestamp,
                senderId: response.data.sender.id,
              },
              updatedAt: new Date().toISOString(),
            }
          })

          return true
        }

        return false
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Falha ao enviar mensagem"
        setError(errorMessage)
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      }
    },
    [chat, toast],
  )

  const markAsRead = useCallback(
    async (messageIds: string[]): Promise<boolean> => {
      if (!chat || messageIds.length === 0) {
        return false
      }

      setError(null)

      try {
        const response = await companyChatApi.markMessagesAsRead(chat.id, messageIds)

        if (response.error) {
          setError(response.error)
          return false
        }

        if (response.data?.success) {
          // Atualizar mensagens marcadas como lidas
          setMessages((prev) =>
            prev.map((msg) => {
              if (messageIds.includes(msg.id)) {
                return { ...msg, read: true }
              }
              return msg
            }),
          )

          // Atualizar contador de não lidas no chat
          setChat((prev) => {
            if (!prev) return null
            return {
              ...prev,
              unreadCount: Math.max(0, prev.unreadCount - messageIds.length),
            }
          })

          return true
        }

        return false
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Falha ao marcar mensagens como lidas"
        setError(errorMessage)
        return false
      }
    },
    [chat],
  )

  const addParticipants = useCallback(
    async (participants: { id: string; type: "professional" | "customer" }[]): Promise<boolean> => {
      if (!chat) {
        setError("Nenhuma conversa selecionada")
        return false
      }

      setError(null)

      try {
        const response = await companyChatApi.addParticipantsToChat(chat.id, participants)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Erro",
            description: response.error,
            variant: "destructive",
          })
          return false
        }

        if (response.data) {
          // Atualizar o chat com os novos participantes
          setChat(response.data)

          toast({
            title: "Sucesso",
            description: "Participantes adicionados com sucesso",
          })

          return true
        }

        return false
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Falha ao adicionar participantes"
        setError(errorMessage)
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      }
    },
    [chat, toast],
  )

  const removeParticipant = useCallback(
    async (participantId: string): Promise<boolean> => {
      if (!chat) {
        setError("Nenhuma conversa selecionada")
        return false
      }

      setError(null)

      try {
        const response = await companyChatApi.removeParticipantFromChat(chat.id, participantId)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Erro",
            description: response.error,
            variant: "destructive",
          })
          return false
        }

        if (response.data) {
          // Atualizar o chat sem o participante removido
          setChat(response.data)

          toast({
            title: "Sucesso",
            description: "Participante removido com sucesso",
          })

          return true
        }

        return false
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Falha ao remover participante"
        setError(errorMessage)
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      }
    },
    [chat, toast],
  )

  const updateGroupInfo = useCallback(
    async (data: { groupName?: string }): Promise<boolean> => {
      if (!chat) {
        setError("Nenhuma conversa selecionada")
        return false
      }

      setError(null)

      try {
        const response = await companyChatApi.updateGroupChat(chat.id, data)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Erro",
            description: response.error,
            variant: "destructive",
          })
          return false
        }

        if (response.data) {
          // Atualizar o chat
          setChat(response.data)

          toast({
            title: "Sucesso",
            description: "Conversa atualizada com sucesso",
          })

          return true
        }

        return false
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Falha ao atualizar conversa"
        setError(errorMessage)
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      }
    },
    [chat, toast],
  )

  // Carregar chat inicial se fornecido
  useEffect(() => {
    if (initialChatId) {
      fetchChat(initialChatId)
    }
  }, [initialChatId, fetchChat])

  // Carregar mensagens quando o chat mudar
  useEffect(() => {
    if (chat) {
      fetchMessages()

      // Marcar mensagens não lidas como lidas
      if (chat.unreadCount > 0) {
        // Em uma implementação real, buscaríamos as IDs das mensagens não lidas
        // Por enquanto, simulamos isso
        const unreadMessageIds = messages
          .filter((msg) => !msg.read && msg.sender.type !== "company")
          .map((msg) => msg.id)

        if (unreadMessageIds.length > 0) {
          markAsRead(unreadMessageIds)
        }
      }
    }
  }, [chat, fetchMessages, markAsRead])

  return {
    chat,
    messages,
    isLoading,
    isLoadingMessages,
    error,
    hasMoreMessages: messagePagination.hasMore,
    fetchChat,
    fetchMessages,
    sendMessage,
    markAsRead,
    loadMoreMessages,
    addParticipants,
    removeParticipant,
    updateGroupInfo,
  }
}
