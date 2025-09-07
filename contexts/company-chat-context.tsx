"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { Chat, ChatMessage, ChatFilters, ChatPagination } from "@/types"
import { companyChatApi } from "@/lib/api/company-chat"
import { useToast } from "@/hooks/use-toast"

interface CompanyChatContextType {
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

  // Ações
  fetchChats: (page?: number, limit?: number, filters?: ChatFilters) => Promise<void>
  fetchChatById: (id: string) => Promise<Chat | null>
  fetchMessages: (chatId: string, page?: number, limit?: number) => Promise<void>
  sendMessage: (content: string, attachments?: File[]) => Promise<boolean>
  markMessagesAsRead: (messageIds: string[]) => Promise<boolean>
  createChat: (
    participants: { id: string; type: "professional" | "customer" }[],
    isGroup?: boolean,
    groupName?: string,
  ) => Promise<Chat | null>
  addParticipantsToChat: (participants: { id: string; type: "professional" | "customer" }[]) => Promise<boolean>
  removeParticipantFromChat: (participantId: string) => Promise<boolean>
  updateGroupChat: (data: { groupName?: string }) => Promise<boolean>
  setActiveChat: (chat: Chat | null) => void
  setFilters: (newFilters: Partial<ChatFilters>) => void
  loadMoreMessages: () => Promise<boolean>
}

const CompanyChatContext = createContext<CompanyChatContextType | undefined>(undefined)

export function CompanyChatProvider({ children }: { children: ReactNode }) {
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

  const { toast } = useToast()

  // Buscar chats
  const fetchChats = useCallback(
    async (page = 1, limit = 20, newFilters?: ChatFilters) => {
      setIsLoadingChats(true)
      setError(null)

      try {
        const filtersToUse = newFilters || filters
        const response = await companyChatApi.getChats(page, limit, filtersToUse)

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
        const response = await companyChatApi.getChatById(id)

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
        const response = await companyChatApi.getChatMessages(chatId, page, limit)

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
      const response = await companyChatApi.getChatMessages(activeChat.id, nextPage, pagination.messages.limit)

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

        const response = await companyChatApi.sendMessage(activeChat.id, content, attachmentData)

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
        const response = await companyChatApi.markMessagesAsRead(activeChat.id, messageIds)

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
      participants: { id: string; type: "professional" | "customer" }[],
      isGroup = false,
      groupName?: string,
    ): Promise<Chat | null> => {
      setError(null)

      try {
        const response = await companyChatApi.createChat(participants, isGroup, groupName)

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

  // Adicionar participantes a um chat em grupo
  const addParticipantsToChat = useCallback(
    async (participants: { id: string; type: "professional" | "customer" }[]): Promise<boolean> => {
      if (!activeChat) {
        setError("Nenhuma conversa selecionada")
        return false
      }

      setError(null)

      try {
        const response = await companyChatApi.addParticipantsToChat(activeChat.id, participants)

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
          // Atualizar o chat ativo com os novos participantes
          setActiveChat(response.data)

          // Atualizar o chat na lista
          setChats((prev) =>
            prev.map((chat) => {
              if (chat.id === activeChat.id) {
                return response.data
              }
              return chat
            }),
          )

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
    [activeChat, toast],
  )

  // Remover participante de um chat em grupo
  const removeParticipantFromChat = useCallback(
    async (participantId: string): Promise<boolean> => {
      if (!activeChat) {
        setError("Nenhuma conversa selecionada")
        return false
      }

      setError(null)

      try {
        const response = await companyChatApi.removeParticipantFromChat(activeChat.id, participantId)

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
          // Atualizar o chat ativo sem o participante removido
          setActiveChat(response.data)

          // Atualizar o chat na lista
          setChats((prev) =>
            prev.map((chat) => {
              if (chat.id === activeChat.id) {
                return response.data
              }
              return chat
            }),
          )

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
    [activeChat, toast],
  )

  // Atualizar informações de um chat em grupo
  const updateGroupChat = useCallback(
    async (data: { groupName?: string }): Promise<boolean> => {
      if (!activeChat) {
        setError("Nenhuma conversa selecionada")
        return false
      }

      setError(null)

      try {
        const response = await companyChatApi.updateGroupChat(activeChat.id, data)

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
          // Atualizar o chat ativo
          setActiveChat(response.data)

          // Atualizar o chat na lista
          setChats((prev) =>
            prev.map((chat) => {
              if (chat.id === activeChat.id) {
                return response.data
              }
              return chat
            }),
          )

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
    [activeChat, toast],
  )

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
          .filter((msg) => !msg.read && msg.sender.type !== "company")
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
  }, [fetchChats])

  const value = {
    chats,
    activeChat,
    messages,
    isLoadingChats,
    isLoadingMessages,
    error,
    filters,
    pagination,
    fetchChats,
    fetchChatById,
    fetchMessages,
    sendMessage,
    markMessagesAsRead,
    createChat,
    addParticipantsToChat,
    removeParticipantFromChat,
    updateGroupChat,
    setActiveChat,
    setFilters,
    loadMoreMessages,
  }

  return <CompanyChatContext.Provider value={value}>{children}</CompanyChatContext.Provider>
}

export function useCompanyChat() {
  const context = useContext(CompanyChatContext)
  if (context === undefined) {
    throw new Error("useCompanyChat must be used within a CompanyChatProvider")
  }
  return context
}
