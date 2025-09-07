import type { ApiResponse, PaginatedResponse, Chat, ChatMessage, ChatFilters, ChatPagination } from "@/types"
import { apiDelay } from "./utils"

// Dados mock para chats do profissional
const mockProfessionalChats: Chat[] = [
  {
    id: "p-1",
    participants: [
      {
        id: "professional-1",
        type: "professional",
        name: "Carlos Mendes",
      },
      {
        id: "company-1",
        type: "company",
        name: "Minha Empresa",
      },
    ],
    lastMessage: {
      content: "Bom trabalho no serviço de hoje!",
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      senderId: "company-1",
    },
    unreadCount: 1,
    isGroup: false,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: "p-2",
    participants: [
      {
        id: "professional-1",
        type: "professional",
        name: "Carlos Mendes",
      },
      {
        id: "supervisor-1",
        type: "professional",
        name: "Mark Smith",
      },
    ],
    lastMessage: {
      content: "Como está o andamento do serviço na residência Flores?",
      timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
      senderId: "supervisor-1",
    },
    unreadCount: 2,
    isGroup: false,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
  },
  {
    id: "p-3",
    participants: [
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
      content: "Obrigada pelo excelente serviço!",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60000).toISOString(),
      senderId: "customer-3",
    },
    unreadCount: 0,
    isGroup: false,
    createdAt: new Date(Date.now() - 95 * 24 * 60 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "p-4",
    participants: [
      {
        id: "professional-1",
        type: "professional",
        name: "Carlos Mendes",
      },
      {
        id: "professional-2",
        type: "professional",
        name: "Roberto Alves",
      },
      {
        id: "professional-3",
        type: "professional",
        name: "Maria Silva",
      },
      {
        id: "supervisor-1",
        type: "professional",
        name: "Mark Smith",
      },
    ],
    lastMessage: {
      content: "Reunião de equipe amanhã às 9h",
      timestamp: new Date(Date.now() - 12 * 60 * 60000).toISOString(),
      senderId: "supervisor-1",
    },
    unreadCount: 1,
    isGroup: true,
    groupName: "Equipe A",
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60000).toISOString(),
  },
]

// Dados mock para mensagens
const mockProfessionalMessages: Record<string, ChatMessage[]> = {
  "p-1": [
    {
      id: "p-1-1",
      chatId: "p-1",
      content: "Olá Carlos, tudo bem?",
      sender: {
        id: "company-1",
        type: "company",
        name: "Minha Empresa",
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "p-1-2",
      chatId: "p-1",
      content: "Olá! Tudo ótimo, e com você?",
      sender: {
        id: "professional-1",
        type: "professional",
        name: "Carlos Mendes",
      },
      timestamp: new Date(Date.now() - 119 * 60000).toISOString(),
      read: true,
    },
    {
      id: "p-1-3",
      chatId: "p-1",
      content: "Tudo bem! Queria saber como foi o serviço de hoje na casa do cliente Silva.",
      sender: {
        id: "company-1",
        type: "company",
        name: "Minha Empresa",
      },
      timestamp: new Date(Date.now() - 118 * 60000).toISOString(),
      read: true,
    },
    {
      id: "p-1-4",
      chatId: "p-1",
      content: "Foi muito bem! Consegui finalizar todas as tarefas no prazo e o cliente ficou satisfeito.",
      sender: {
        id: "professional-1",
        type: "professional",
        name: "Carlos Mendes",
      },
      timestamp: new Date(Date.now() - 115 * 60000).toISOString(),
      read: true,
    },
    {
      id: "p-1-5",
      chatId: "p-1",
      content: "Bom trabalho no serviço de hoje!",
      sender: {
        id: "company-1",
        type: "company",
        name: "Minha Empresa",
      },
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      read: false,
    },
  ],
  "p-2": [
    {
      id: "p-2-1",
      chatId: "p-2",
      content: "Bom dia, Carlos!",
      sender: {
        id: "supervisor-1",
        type: "professional",
        name: "Mark Smith",
      },
      timestamp: new Date(Date.now() - 5 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "p-2-2",
      chatId: "p-2",
      content: "Bom dia, Mark! Como posso ajudar?",
      sender: {
        id: "professional-1",
        type: "professional",
        name: "Carlos Mendes",
      },
      timestamp: new Date(Date.now() - 4.9 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "p-2-3",
      chatId: "p-2",
      content: "Você está escalado para o serviço na residência Flores amanhã às 10h. Pode confirmar?",
      sender: {
        id: "supervisor-1",
        type: "professional",
        name: "Mark Smith",
      },
      timestamp: new Date(Date.now() - 4.8 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "p-2-4",
      chatId: "p-2",
      content: "Sim, confirmo. Estarei lá no horário.",
      sender: {
        id: "professional-1",
        type: "professional",
        name: "Carlos Mendes",
      },
      timestamp: new Date(Date.now() - 4.7 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "p-2-5",
      chatId: "p-2",
      content: "Ótimo! Lembre-se que este cliente é muito exigente com a limpeza da cozinha.",
      sender: {
        id: "supervisor-1",
        type: "professional",
        name: "Mark Smith",
      },
      timestamp: new Date(Date.now() - 4.6 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "p-2-6",
      chatId: "p-2",
      content: "Como está o andamento do serviço na residência Flores?",
      sender: {
        id: "supervisor-1",
        type: "professional",
        name: "Mark Smith",
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
      read: false,
    },
  ],
  "p-3": [
    {
      id: "p-3-1",
      chatId: "p-3",
      content: "Olá, sou o Carlos da empresa de limpeza. Confirmo que estarei em sua residência amanhã às 14h.",
      sender: {
        id: "professional-1",
        type: "professional",
        name: "Carlos Mendes",
      },
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "p-3-2",
      chatId: "p-3",
      content: "Olá Carlos! Perfeito, estarei aguardando. Preciso que dê atenção especial aos banheiros, por favor.",
      sender: {
        id: "customer-3",
        type: "customer",
        name: "Ana Souza",
      },
      timestamp: new Date(Date.now() - 2.9 * 24 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "p-3-3",
      chatId: "p-3",
      content: "Pode deixar, darei atenção especial aos banheiros conforme solicitado.",
      sender: {
        id: "professional-1",
        type: "professional",
        name: "Carlos Mendes",
      },
      timestamp: new Date(Date.now() - 2.8 * 24 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "p-3-4",
      chatId: "p-3",
      content: "Bom dia! Estou a caminho da sua residência, devo chegar em aproximadamente 15 minutos.",
      sender: {
        id: "professional-1",
        type: "professional",
        name: "Carlos Mendes",
      },
      timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "p-3-5",
      chatId: "p-3",
      content: "Obrigada pelo excelente serviço!",
      sender: {
        id: "customer-3",
        type: "customer",
        name: "Ana Souza",
      },
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60000).toISOString(),
      read: true,
    },
  ],
  "p-4": [
    {
      id: "p-4-1",
      chatId: "p-4",
      content: "Bem-vindos ao grupo da Equipe A!",
      sender: {
        id: "supervisor-1",
        type: "professional",
        name: "Mark Smith",
      },
      timestamp: new Date(Date.now() - 180 * 24 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "p-4-2",
      chatId: "p-4",
      content: "Olá a todos!",
      sender: {
        id: "professional-1",
        type: "professional",
        name: "Carlos Mendes",
      },
      timestamp: new Date(Date.now() - 179.9 * 24 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "p-4-3",
      chatId: "p-4",
      content: "Olá equipe!",
      sender: {
        id: "professional-2",
        type: "professional",
        name: "Roberto Alves",
      },
      timestamp: new Date(Date.now() - 179.8 * 24 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "p-4-4",
      chatId: "p-4",
      content: "Presente!",
      sender: {
        id: "professional-3",
        type: "professional",
        name: "Maria Silva",
      },
      timestamp: new Date(Date.now() - 179.7 * 24 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "p-4-5",
      chatId: "p-4",
      content: "Pessoal, temos um novo cliente importante. Vamos discutir na reunião de amanhã.",
      sender: {
        id: "supervisor-1",
        type: "professional",
        name: "Mark Smith",
      },
      timestamp: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: "p-4-6",
      chatId: "p-4",
      content: "Reunião de equipe amanhã às 9h",
      sender: {
        id: "supervisor-1",
        type: "professional",
        name: "Mark Smith",
      },
      timestamp: new Date(Date.now() - 12 * 60 * 60000).toISOString(),
      read: false,
    },
  ],
}

// API de Chat para Profissionais
export const professionalChatApi = {
  // Listar chats (com paginação e filtros)
  async getChats(page = 1, limit = 20, filters?: ChatFilters): Promise<ApiResponse<PaginatedResponse<Chat>>> {
    try {
      await apiDelay(600)

      // Filtrar chats com base nos parâmetros
      let filteredChats = [...mockProfessionalChats]

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

      const chat = mockProfessionalChats.find((c) => c.id === id)

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

      const messages = mockProfessionalMessages[chatId] || []

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
      const chat = mockProfessionalChats.find((c) => c.id === chatId)
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
          id: "professional-1", // ID do profissional atual
          type: "professional",
          name: "Carlos Mendes",
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
    participants: { id: string; type: "professional" | "customer" | "company" }[],
    isGroup = false,
    groupName?: string,
  ): Promise<ApiResponse<Chat>> {
    try {
      await apiDelay(600)

      // Criar novo chat
      const newChat: Chat = {
        id: `p-chat-${Date.now()}`,
        participants: [
          {
            id: "professional-1", // ID do profissional atual
            type: "professional",
            name: "Carlos Mendes",
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

  // Obter contatos disponíveis para chat
  async getAvailableContacts(): Promise<
    ApiResponse<
      {
        id: string
        name: string
        type: "professional" | "customer" | "company"
        role?: string
        avatar?: string
      }[]
    >
  > {
    try {
      await apiDelay(500)

      // Em uma implementação real, buscaríamos os contatos do banco de dados
      const contacts = [
        {
          id: "supervisor-1",
          name: "Mark Smith",
          type: "professional" as const,
          role: "Supervisor",
        },
        {
          id: "supervisor-2",
          name: "Rachel Cooper",
          type: "professional" as const,
          role: "Coordenadora Geral",
        },
        {
          id: "professional-2",
          name: "Roberto Alves",
          type: "professional" as const,
          role: "Técnico",
        },
        {
          id: "professional-3",
          name: "Maria Silva",
          type: "professional" as const,
          role: "Técnica",
        },
        {
          id: "company-1",
          name: "Minha Empresa",
          type: "company" as const,
        },
        {
          id: "customer-1",
          name: "João Silva",
          type: "customer" as const,
        },
        {
          id: "customer-2",
          name: "Maria Oliveira",
          type: "customer" as const,
        },
        {
          id: "customer-3",
          name: "Ana Souza",
          type: "customer" as const,
        },
      ]

      return { data: contacts, status: 200 }
    } catch (error) {
      console.error("Failed to fetch contacts:", error)
      return {
        error: "Failed to fetch contacts",
        status: 500,
      }
    }
  },

  // Obter grupos disponíveis
  async getAvailableGroups(): Promise<
    ApiResponse<
      {
        id: string
        name: string
        memberCount: number
        avatar?: string
      }[]
    >
  > {
    try {
      await apiDelay(500)

      // Em uma implementação real, buscaríamos os grupos do banco de dados
      const groups = [
        {
          id: "p-4",
          name: "Equipe A",
          memberCount: 4,
        },
        {
          id: "group-2",
          name: "Projeto Residencial",
          memberCount: 3,
        },
        {
          id: "group-3",
          name: "Suporte Técnico",
          memberCount: 5,
        },
      ]

      return { data: groups, status: 200 }
    } catch (error) {
      console.error("Failed to fetch groups:", error)
      return {
        error: "Failed to fetch groups",
        status: 500,
      }
    }
  },
}
