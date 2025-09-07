import type { ApiResponse, PaginatedResponse, Chat, ChatMessage, ChatFilters, ChatPagination } from "@/types"
import { apiDelay } from "./utils"

// Dados mock para chats
const mockChats: Chat[] = [
  {
    id: "1",
    participants: [
      {
        id: "company-1",
        type: "company",
        name: "Minha Empresa",
      },
      {
        id: "customer-1",
        type: "customer",
        name: "João Silva",
      },
    ],
    lastMessage: {
      content: "Olá, quando será o próximo serviço?",
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      senderId: "customer-1",
    },
    unreadCount: 2,
    isGroup: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: "2",
    participants: [
      {
        id: "company-1",
        type: "company",
        name: "Minha Empresa",
      },
      {
        id: "customer-2",
        type: "customer",
        name: "Maria Oliveira",
      },
    ],
    lastMessage: {
      content: "Obrigado pelo excelente trabalho!",
      timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
      senderId: "customer-2",
    },
    unreadCount: 0,
    isGroup: false,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
  },
  {
    id: "3",
    participants: [
      {
        id: "company-1",
        type: "company",
        name: "Minha Empresa",
      },
      {
        id: "professional-1",
        type: "professional",
        name: "Carlos Mendes",
      },
      {
        id: "customer-3",
        type: "customer",
        name: "Ana Souza",
      },
    ],
    lastMessage: {
      content: "Preciso remarcar o horário de amanhã",
      timestamp: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
      senderId: "customer-3",
    },
    unreadCount: 1,
    isGroup: true,
    groupName: "Projeto Residencial",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
  },
  {
    id: "4",
    participants: [
      {
        id: "company-1",
        type: "company",
        name: "Minha Empresa",
      },
      {
        id: "professional-2",
        type: "professional",
        name: "Roberto Alves",
      },
    ],
    lastMessage: {
      content: "Confirmando o horário de amanhã",
      timestamp: new Date(Date.now() - 36 * 60 * 60000).toISOString(),
      senderId: "professional-2",
    },
    unreadCount: 0,
    isGroup: false,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 36 * 60 * 60000).toISOString(),
  },
]

// Dados mock para mensagens
const mockMessages: Record<string, ChatMessage[]> = {
  "1": [
    {
      id: "1-1",
      chatId: "1",
      content: "Olá, tudo bem?",
      sender: {
        id: "customer-1",
        type: "customer",
        name: "João Silva",
      },
      timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
      read: true,
    },
    {
      id: "1-2",
      chatId: "1",
      content: "Olá! Tudo ótimo, e com você?",
      sender: {
        id: "company-1",
        type: "company",
        name: "Minha Empresa",
      },
      timestamp: new Date(Date.now() - 34 * 60000).toISOString(),
      read: true,
    },
    {
      id: "1-3",
      chatId: "1",
      content: "Estou bem! Gostaria de saber quando será o próximo serviço agendado.",
      sender: {
        id: "customer-1",
        type: "customer",
        name: "João Silva",
      },
      timestamp: new Date(Date.now() - 32 * 60000).toISOString(),
      read: true,
    },
    {
      id: "1-4",
      chatId: "1",
      content: "Claro! Temos um agendamento para a próxima terça-feira, às 14h. Está confirmado?",
      sender: {
        id: "company-1",
        type: "company",
        name: "Minha Empresa",
      },
      timestamp: new Date(Date.now() - 31 * 60000).toISOString(),
      read: true,
    },
    {
      id: "1-5",
      chatId: "1",
      content: "Perfeito! Confirmo para terça-feira. Obrigado pela informação!",
      sender: {
        id: "customer-1",
        type: "customer",
        name: "João Silva",
      },
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      read: false,
    },
  ],
  "2": [
    {
      id: "2-1",
      chatId: "2",
      content: "Bom dia! O serviço foi concluído ontem. Ficou tudo conforme esperado?",
      sender: {
        id: "company-1",
        type: "company",
        name: "Minha Empresa",
      },
      timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "2-2",
      chatId: "2",
      content: "Bom dia! Sim, ficou excelente! Estou muito satisfeita com o resultado.",
      sender: {
        id: "customer-2",
        type: "customer",
        name: "Maria Oliveira",
      },
      timestamp: new Date(Date.now() - 2.5 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "2-3",
      chatId: "2",
      content: "Obrigado pelo excelente trabalho!",
      sender: {
        id: "customer-2",
        type: "customer",
        name: "Maria Oliveira",
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
      read: true,
    },
  ],
  "3": [
    {
      id: "3-1",
      chatId: "3",
      content: "Olá a todos! Criamos este grupo para facilitar a comunicação sobre o projeto residencial.",
      sender: {
        id: "company-1",
        type: "company",
        name: "Minha Empresa",
      },
      timestamp: new Date(Date.now() - 90 * 24 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "3-2",
      chatId: "3",
      content: "Olá! Quando podemos agendar a primeira visita?",
      sender: {
        id: "customer-3",
        type: "customer",
        name: "Ana Souza",
      },
      timestamp: new Date(Date.now() - 85 * 24 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "3-3",
      chatId: "3",
      content: "Posso fazer a visita amanhã às 10h. Funciona para você?",
      sender: {
        id: "professional-1",
        type: "professional",
        name: "Carlos Mendes",
      },
      timestamp: new Date(Date.now() - 84 * 24 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "3-4",
      chatId: "3",
      content: "Perfeito! Amanhã às 10h está confirmado.",
      sender: {
        id: "customer-3",
        type: "customer",
        name: "Ana Souza",
      },
      timestamp: new Date(Date.now() - 84 * 24 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "3-5",
      chatId: "3",
      content: "Preciso remarcar o horário de amanhã. Podemos reagendar para a próxima semana?",
      sender: {
        id: "customer-3",
        type: "customer",
        name: "Ana Souza",
      },
      timestamp: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
      read: false,
    },
  ],
  "4": [
    {
      id: "4-1",
      chatId: "4",
      content: "Olá Roberto, tudo bem?",
      sender: {
        id: "company-1",
        type: "company",
        name: "Minha Empresa",
      },
      timestamp: new Date(Date.now() - 48 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "4-2",
      chatId: "4",
      content: "Tudo bem! Como posso ajudar?",
      sender: {
        id: "professional-2",
        type: "professional",
        name: "Roberto Alves",
      },
      timestamp: new Date(Date.now() - 47 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "4-3",
      chatId: "4",
      content: "Precisamos agendar uma visita ao cliente novo. Você está disponível amanhã?",
      sender: {
        id: "company-1",
        type: "company",
        name: "Minha Empresa",
      },
      timestamp: new Date(Date.now() - 46 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "4-4",
      chatId: "4",
      content: "Sim, estou disponível. Qual horário?",
      sender: {
        id: "professional-2",
        type: "professional",
        name: "Roberto Alves",
      },
      timestamp: new Date(Date.now() - 45 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "4-5",
      chatId: "4",
      content: "Às 15h seria bom. Vou enviar o endereço.",
      sender: {
        id: "company-1",
        type: "company",
        name: "Minha Empresa",
      },
      timestamp: new Date(Date.now() - 44 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "4-6",
      chatId: "4",
      content: "Confirmando o horário de amanhã. Estarei lá às 15h.",
      sender: {
        id: "professional-2",
        type: "professional",
        name: "Roberto Alves",
      },
      timestamp: new Date(Date.now() - 36 * 60 * 60000).toISOString(),
      read: true,
    },
  ],
}

// API de Chat para Empresas
export const companyChatApi = {
  // Listar chats (com paginação e filtros)
  async getChats(page = 1, limit = 20, filters?: ChatFilters): Promise<ApiResponse<PaginatedResponse<Chat>>> {
    try {
      await apiDelay(600)

      // Filtrar chats com base nos parâmetros
      let filteredChats = [...mockChats]

      // Aplicar filtros
      if (filters) {
        // Filtrar por termo de busca
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          filteredChats = filteredChats.filter((chat) => {
            // Buscar em nomes de participantes
            const participantMatch = chat.participants.some((p) => p.name.toLowerCase().includes(searchLower))

            // Buscar em nome do grupo
            const groupNameMatch = chat.groupName ? chat.groupName.toLowerCase().includes(searchLower) : false

            // Buscar na última mensagem
            const messageMatch = chat.lastMessage ? chat.lastMessage.content.toLowerCase().includes(searchLower) : false

            return participantMatch || groupNameMatch || messageMatch
          })
        }

        // Filtrar por tipo de participante
        if (filters.participantType && filters.participantType !== "all") {
          filteredChats = filteredChats.filter((chat) =>
            chat.participants.some((p) => p.type === filters.participantType),
          )
        }

        // Filtrar apenas não lidas
        if (filters.unreadOnly) {
          filteredChats = filteredChats.filter((chat) => chat.unreadCount > 0)
        }

        // Filtrar por intervalo de datas
        if (filters.dateRange) {
          const startDate = new Date(filters.dateRange.start).getTime()
          const endDate = new Date(filters.dateRange.end).getTime()

          filteredChats = filteredChats.filter((chat) => {
            const chatDate = new Date(chat.updatedAt).getTime()
            return chatDate >= startDate && chatDate <= endDate
          })
        }
      }

      // Ordenar por data de atualização (mais recente primeiro)
      filteredChats.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

      // Calcular paginação
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedChats = filteredChats.slice(startIndex, endIndex)

      const paginatedResponse: PaginatedResponse<Chat> = {
        data: paginatedChats,
        meta: {
          currentPage: page,
          totalPages: Math.ceil(filteredChats.length / limit),
          totalItems: filteredChats.length,
          itemsPerPage: limit,
        },
      }

      return { data: paginatedResponse, status: 200 }
    } catch (error) {
      console.error("Failed to fetch chats:", error)
      return {
        error: "Failed to fetch chats",
        status: 500,
      }
    }
  },

  // Obter chat por ID
  async getChatById(id: string): Promise<ApiResponse<Chat>> {
    try {
      await apiDelay(400)

      const chat = mockChats.find((c) => c.id === id)

      if (!chat) {
        return {
          error: "Chat not found",
          status: 404,
        }
      }

      return { data: chat, status: 200 }
    } catch (error) {
      console.error("Failed to fetch chat:", error)
      return {
        error: "Failed to fetch chat",
        status: 500,
      }
    }
  },

  // Obter mensagens de um chat (com paginação)
  async getChatMessages(
    chatId: string,
    page = 1,
    limit = 50,
  ): Promise<ApiResponse<{ messages: ChatMessage[]; pagination: ChatPagination }>> {
    try {
      await apiDelay(500)

      const messages = mockMessages[chatId] || []

      // Ordenar mensagens por data (mais antigas primeiro)
      const sortedMessages = [...messages].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )

      // Calcular paginação
      const startIndex = Math.max(0, sortedMessages.length - page * limit)
      const endIndex = sortedMessages.length
      const paginatedMessages = sortedMessages.slice(startIndex, endIndex)

      const pagination: ChatPagination = {
        page,
        limit,
        hasMore: startIndex > 0,
        total: sortedMessages.length,
      }

      return {
        data: {
          messages: paginatedMessages,
          pagination,
        },
        status: 200,
      }
    } catch (error) {
      console.error("Failed to fetch chat messages:", error)
      return {
        error: "Failed to fetch chat messages",
        status: 500,
      }
    }
  },

  // Enviar mensagem
  async sendMessage(
    chatId: string,
    content: string,
    attachments?: { url: string; name: string; type: string; size: number }[],
  ): Promise<ApiResponse<ChatMessage>> {
    try {
      await apiDelay(300)

      // Verificar se o chat existe
      const chat = mockChats.find((c) => c.id === chatId)
      if (!chat) {
        return {
          error: "Chat not found",
          status: 404,
        }
      }

      // Criar nova mensagem
      const newMessage: ChatMessage = {
        id: `${chatId}-${Date.now()}`,
        chatId,
        content,
        sender: {
          id: "company-1", // ID da empresa atual
          type: "company",
          name: "Minha Empresa",
        },
        timestamp: new Date().toISOString(),
        read: false,
        attachments: attachments?.map((att) => ({
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: att.type.includes("image")
            ? "image"
            : att.type.includes("audio")
              ? "audio"
              : att.type.includes("video")
                ? "video"
                : "document",
          url: att.url,
          name: att.name,
          size: att.size,
          mimeType: att.type,
        })),
      }

      // Em uma implementação real, a mensagem seria salva no banco de dados
      // e enviada para os outros participantes do chat

      return { data: newMessage, status: 201 }
    } catch (error) {
      console.error("Failed to send message:", error)
      return {
        error: "Failed to send message",
        status: 500,
      }
    }
  },

  // Marcar mensagens como lidas
  async markMessagesAsRead(chatId: string, messageIds: string[]): Promise<ApiResponse<{ success: boolean }>> {
    try {
      await apiDelay(200)

      // Em uma implementação real, as mensagens seriam marcadas como lidas no banco de dados

      return { data: { success: true }, status: 200 }
    } catch (error) {
      console.error("Failed to mark messages as read:", error)
      return {
        error: "Failed to mark messages as read",
        status: 500,
      }
    }
  },

  // Criar novo chat
  async createChat(
    participants: { id: string; type: "professional" | "customer" }[],
    isGroup = false,
    groupName?: string,
  ): Promise<ApiResponse<Chat>> {
    try {
      await apiDelay(600)

      // Criar novo chat
      const newChat: Chat = {
        id: `chat-${Date.now()}`,
        participants: [
          {
            id: "company-1", // ID da empresa atual
            type: "company",
            name: "Minha Empresa",
          },
          ...participants.map((p) => ({
            id: p.id,
            type: p.type,
            name: `Participante ${p.id}`, // Em uma implementação real, buscaria o nome do participante
          })),
        ],
        unreadCount: 0,
        isGroup,
        groupName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Em uma implementação real, o chat seria salvo no banco de dados

      return { data: newChat, status: 201 }
    } catch (error) {
      console.error("Failed to create chat:", error)
      return {
        error: "Failed to create chat",
        status: 500,
      }
    }
  },

  // Adicionar participantes a um chat em grupo
  async addParticipantsToChat(
    chatId: string,
    participants: { id: string; type: "professional" | "customer" }[],
  ): Promise<ApiResponse<Chat>> {
    try {
      await apiDelay(500)

      // Verificar se o chat existe
      const chat = mockChats.find((c) => c.id === chatId)
      if (!chat) {
        return {
          error: "Chat not found",
          status: 404,
        }
      }

      // Verificar se o chat é um grupo
      if (!chat.isGroup) {
        return {
          error: "Cannot add participants to a non-group chat",
          status: 400,
        }
      }

      // Em uma implementação real, os participantes seriam adicionados ao chat no banco de dados

      return { data: chat, status: 200 }
    } catch (error) {
      console.error("Failed to add participants to chat:", error)
      return {
        error: "Failed to add participants to chat",
        status: 500,
      }
    }
  },

  // Remover participante de um chat em grupo
  async removeParticipantFromChat(chatId: string, participantId: string): Promise<ApiResponse<Chat>> {
    try {
      await apiDelay(500)

      // Verificar se o chat existe
      const chat = mockChats.find((c) => c.id === chatId)
      if (!chat) {
        return {
          error: "Chat not found",
          status: 404,
        }
      }

      // Verificar se o chat é um grupo
      if (!chat.isGroup) {
        return {
          error: "Cannot remove participants from a non-group chat",
          status: 400,
        }
      }

      // Em uma implementação real, o participante seria removido do chat no banco de dados

      return { data: chat, status: 200 }
    } catch (error) {
      console.error("Failed to remove participant from chat:", error)
      return {
        error: "Failed to remove participant from chat",
        status: 500,
      }
    }
  },

  // Atualizar informações de um chat em grupo (nome, etc.)
  async updateGroupChat(chatId: string, data: { groupName?: string }): Promise<ApiResponse<Chat>> {
    try {
      await apiDelay(400)

      // Verificar se o chat existe
      const chat = mockChats.find((c) => c.id === chatId)
      if (!chat) {
        return {
          error: "Chat not found",
          status: 404,
        }
      }

      // Verificar se o chat é um grupo
      if (!chat.isGroup) {
        return {
          error: "Cannot update a non-group chat",
          status: 400,
        }
      }

      // Em uma implementação real, as informações do chat seriam atualizadas no banco de dados

      return { data: chat, status: 200 }
    } catch (error) {
      console.error("Failed to update group chat:", error)
      return {
        error: "Failed to update group chat",
        status: 500,
      }
    }
  },
}
