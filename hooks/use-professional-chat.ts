"use client"

import { useState, useCallback, useEffect } from "react"
import type { Chat, ChatMessage } from "@/types"
import { professionalChatApi } from "@/lib/api/professional-chat"
import { useToast } from "@/hooks/use-toast"

interface UseProfessionalChatReturn {
  // Estado
  chat: Chat | null
  messages: ChatMessage[]
  isLoading: boolean
  isLoadingMessages: boolean
  error: string | null
  hasMoreMessages: boolean
  contacts: {
    id: string
    name: string
    type: "professional" | "customer" | "company"
    role?: string
    avatar?: string
  }[]
  groups: {
    id: string
    name: string
    memberCount: number
    avatar?: string
  }[]
  isLoadingContacts: boolean
  isLoadingGroups: boolean

  // Ações
  fetchChat: (id: string) => Promise<void>
  fetchMessages: (page?: number, limit?: number) => Promise<void>
  sendMessage: (content: string, attachments?: File[]) => Promise<boolean>
  markAsRead: (messageIds: string[]) => Promise<boolean>
  loadMoreMessages: () => Promise<boolean>
  fetchContacts: () => Promise<void>
  fetchGroups: () => Promise<void>
  createChat: (
    participants: { id: string; type: "professional" | "customer" | "company" }[],
    isGroup?: boolean,
    groupName?: string,
  ) => Promise<Chat | null>
}

export function useProfessionalChat(initialChatId?: string): UseProfessionalChatReturn {
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
  const [contacts, setContacts] = useState<
    {
      id: string
      name: string
      type: "professional" | "customer" | "company"
      role?: string
      avatar?: string
    }[]
  >([])
  const [groups, setGroups] = useState<
    {
      id: string
      name: string
      memberCount: number
      avatar?: string
    }[]
  >([])
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const [isLoadingGroups, setIsLoadingGroups] = useState(false)

  const { toast } = useToast()

  const fetchChat = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await professionalChatApi.getChatById(id)

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
        const response = await professionalChatApi.getChatMessages(chat.id, page, limit)

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
      const response = await professionalChatApi.getChatMessages(chat.id, nextPage, messagePagination.limit)

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

        const response = await professionalChatApi.sendMessage(chat.id, content, attachmentData)

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
        const response = await professionalChatApi.markMessagesAsRead(chat.id, messageIds)

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

  // Buscar contatos disponíveis
  const fetchContacts = useCallback(async () => {
    setIsLoadingContacts(true)
    setError(null)

    try {
      const response = await professionalChatApi.getAvailableContacts()

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
        setContacts(response.data)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Falha ao buscar contatos"
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoadingContacts(false)
    }
  }, [toast])

  // Buscar grupos disponíveis
  const fetchGroups = useCallback(async () => {
    setIsLoadingGroups(true)
    setError(null)

    try {
      const response = await professionalChatApi.getAvailableGroups()

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
        setGroups(response.data)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Falha ao buscar grupos"
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoadingGroups(false)
    }
  }, [toast])

  // Criar novo chat
  const createChat = useCallback(
    async (
      participants: { id: string; type: "professional" | "customer" | "company" }[],
      isGroup = false,
      groupName?: string,
    ): Promise<Chat | null> => {
      setError(null)

      try {
        const response = await professionalChatApi.createChat(participants, isGroup, groupName)

        if (response.error) {
          setError(response.error)
          toast({
            title: "Erro",
            description: response.error,
            variant: "destructive",
          })
          return null
        }

        if (response.data) {
          toast({
            title: "Sucesso",
            description: "Conversa criada com sucesso",
          })

          return response.data
        }

        return null
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Falha ao criar conversa"
        setError(errorMessage)
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        })
        return null
      }
    },
    [toast],
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
          .filter((msg) => !msg.read && msg.sender.id !== "professional-1")
          .map((msg) => msg.id)

        if (unreadMessageIds.length > 0) {
          markAsRead(unreadMessageIds)
        }
      }
    }
  }, [chat, fetchMessages, markAsRead])

  // Carregar contatos e grupos ao montar o componente
  useEffect(() => {
    fetchContacts()
    fetchGroups()
  }, [fetchContacts, fetchGroups])

  return {
    chat,
    messages,
    isLoading,
    isLoadingMessages,
    error,
    hasMoreMessages: messagePagination.hasMore,
    contacts,
    groups,
    isLoadingContacts,
    isLoadingGroups,
    fetchChat,
    fetchMessages,
    sendMessage,
    markAsRead,
    loadMoreMessages,
    fetchContacts,
    fetchGroups,
    createChat,
  }
}
