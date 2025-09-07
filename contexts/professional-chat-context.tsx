"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { Chat, ChatMessage, ChatFilters, ChatPagination } from "@/types"
import { professionalChatApi } from "@/lib/api/professional-chat"
import { useToast } from "@/hooks/use-toast"

interface ProfessionalChatContextType {
  // Estado
  chats: Chat[]
  activeChat: Chat | null
  messages: ChatMessage[]
  isLoadingChats: boolean
  isLoadingMessages: boolean
  error: string | null
  filters: ChatFilters
  pagination: {
    chats: {
      currentPage: number
      totalPages: number
      totalItems: number
      itemsPerPage: number
    }
    messages: ChatPagination | null
  }
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
  fetchChats: (page?: number, limit?: number, filters?: ChatFilters) => Promise<void>
  fetchChatById: (id: string) => Promise<Chat | null>
  fetchMessages: (chatId: string, page?: number, limit?: number) => Promise<void>
  sendMessage: (content: string, attachments?: File[]) => Promise<boolean>
  markMessagesAsRead: (messageIds: string[]) => Promise<boolean>
  createChat: (
    participants: { id: string; type: "professional" | "customer" | "company" }[],
    isGroup?: boolean,
    groupName?: string,
  ) => Promise<Chat | null>
  setActiveChat: (chat: Chat | null) => void
  setFilters: (newFilters: Partial<ChatFilters>) => void
  loadMoreMessages: () => Promise<boolean>
  fetchContacts: () => Promise<void>
  fetchGroups: () => Promise<void>
}

const ProfessionalChatContext = createContext<ProfessionalChatContextType | undefined>(undefined)

export function ProfessionalChatProvider({ children }: { children: ReactNode }) {
  // Estado
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoadingChats, setIsLoadingChats] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<ChatFilters>({
    search: "",
    participantType: "all",
    unreadOnly: false,
  })
  const [pagination, setPagination] = useState({
    chats: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 20,
    },
    messages: null as ChatPagination | null,
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

  // Buscar chats
  const fetchChats = useCallback(
    async (page = 1, limit = 20, newFilters?: ChatFilters) => {
      setIsLoadingChats(true)
      setError(null)

      try {
        const filtersToUse = newFilters || filters
        const response = await professionalChatApi.getChats(page, limit, filtersToUse)

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
          setChats(response.data.data)
          setPagination((prev) => ({
            ...prev,
            chats: response.data.meta,
          }))
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Falha ao buscar conversas"
        setError(errorMessage)
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoadingChats(false)
      }
    },
    [filters, toast],
  )

  // Buscar chat por ID
  const fetchChatById = useCallback(
    async (id: string): Promise<Chat | null> => {
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
          return null
        }

        return response.data || null
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Falha ao buscar conversa"
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

  // Buscar mensagens
  const fetchMessages = useCallback(
    async (chatId: string, page = 1, limit = 50) => {
      setIsLoadingMessages(true)
      setError(null)

      try {
        const response = await professionalChatApi.getChatMessages(chatId, page, limit)

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
          setPagination((prev) => ({
            ...prev,
            messages: response.data.pagination,
          }))
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
    [toast],
  )

  // Carregar mais mensagens (paginação)
  const loadMoreMessages = useCallback(async (): Promise<boolean> => {
    if (!activeChat || !pagination.messages || !pagination.messages.hasMore) {
      return false
    }

    setIsLoadingMessages(true)
    setError(null)

    try {
      const nextPage = pagination.messages.page + 1
      const response = await professionalChatApi.getChatMessages(activeChat.id, nextPage, pagination.messages.limit)

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
        setPagination((prev) => ({
          ...prev,
          messages: response.data.pagination,
        }))
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
  }, [activeChat, pagination.messages, toast])

  // Enviar mensagem
  const sendMessage = useCallback(
    async (content: string, attachments?: File[]): Promise<boolean> => {
      if (!activeChat) {
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

        const response = await professionalChatApi.sendMessage(activeChat.id, content, attachmentData)

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

          // Atualizar o último chat com a nova mensagem
          setChats((prev) =>
            prev.map((chat) => {
              if (chat.id === activeChat.id) {
                return {
                  ...chat,
                  lastMessage: {
                    content: response.data.content,
                    timestamp: response.data.timestamp,
                    senderId: response.data.sender.id,
                  },
                  updatedAt: new Date().toISOString(),
                }
              }
              return chat
            }),
          )

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
    [activeChat, toast],
  )

  // Marcar mensagens como lidas
  const markMessagesAsRead = useCallback(
    async (messageIds: string[]): Promise<boolean> => {
      if (!activeChat || messageIds.length === 0) {
        return false
      }

      setError(null)

      try {
        const response = await professionalChatApi.markMessagesAsRead(activeChat.id, messageIds)

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
          setChats((prev) =>
            prev.map((chat) => {
              if (chat.id === activeChat.id) {
                return {
                  ...chat,
                  unreadCount: Math.max(0, chat.unreadCount - messageIds.length),
                }
              }
              return chat
            }),
          )

          return true
        }

        return false
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Falha ao marcar mensagens como lidas"
        setError(errorMessage)
        return false
      }
    },
    [activeChat],
  )

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
          // Adicionar o novo chat à lista
          setChats((prev) => [response.data, ...prev])

          // Atualizar paginação
          setPagination((prev) => ({
            ...prev,
            chats: {
              ...prev.chats,
              totalItems: prev.chats.totalItems + 1,
              totalPages: Math.ceil((prev.chats.totalItems + 1) / prev.chats.itemsPerPage),
            },
          }))

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

  // Atualizar filtros
  const setFilters = useCallback(
    (newFilters: Partial<ChatFilters>) => {
      const updatedFilters = {
        ...filters,
        ...newFilters,
      }
      setFiltersState(updatedFilters)
      fetchChats(1, pagination.chats.itemsPerPage, updatedFilters)
    },
    [filters, fetchChats, pagination.chats.itemsPerPage],
  )

  // Carregar mensagens quando o chat ativo mudar
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id)

      // Marcar mensagens não lidas como lidas
      if (activeChat.unreadCount > 0) {
        // Em uma implementação real, buscaríamos as IDs das mensagens não lidas
        // Por enquanto, simulamos isso
        const unreadMessageIds = messages
          .filter((msg) => !msg.read && msg.sender.id !== "professional-1")
          .map((msg) => msg.id)

        if (unreadMessageIds.length > 0) {
          markMessagesAsRead(unreadMessageIds)
        }
      }
    } else {
      setMessages([])
      setPagination((prev) => ({
        ...prev,
        messages: null,
      }))
    }
  }, [activeChat, fetchMessages, markMessagesAsRead])

  // Carregar chats ao montar o componente
  useEffect(() => {
    fetchChats()
    fetchContacts()
    fetchGroups()
  }, [fetchChats, fetchContacts, fetchGroups])

  const value = {
    chats,
    activeChat,
    messages,
    isLoadingChats,
    isLoadingMessages,
    error,
    filters,
    pagination,
    contacts,
    groups,
    isLoadingContacts,
    isLoadingGroups,
    fetchChats,
    fetchChatById,
    fetchMessages,
    sendMessage,
    markMessagesAsRead,
    createChat,
    setActiveChat,
    setFilters,
    loadMoreMessages,
    fetchContacts,
    fetchGroups,
  }

  return <ProfessionalChatContext.Provider value={value}>{children}</ProfessionalChatContext.Provider>
}

export function useProfessionalChat() {
  const context = useContext(ProfessionalChatContext)
  if (context === undefined) {
    throw new Error("useProfessionalChat must be used within a ProfessionalChatProvider")
  }
  return context
}
