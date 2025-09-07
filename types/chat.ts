// Tipos para o sistema de chat

// Tipo para uma mensagem individual
export interface ChatMessage {
  id: string
  chatId: string
  content: string
  sender: {
    id: string
    type: "company" | "professional" | "customer" | "system"
    name: string
    avatar?: string
  }
  timestamp: string
  read: boolean
  attachments?: ChatAttachment[]
}

// Tipo para anexos em mensagens
export interface ChatAttachment {
  id: string
  type: "image" | "document" | "audio" | "video" | "other"
  url: string
  name: string
  size: number
  mimeType: string
  thumbnailUrl?: string
}

// Tipo para uma conversa/chat
export interface Chat {
  id: string
  participants: ChatParticipant[]
  lastMessage?: {
    content: string
    timestamp: string
    senderId: string
  }
  unreadCount: number
  isGroup: boolean
  groupName?: string
  groupAvatar?: string
  createdAt: string
  updatedAt: string
}

// Tipo para um participante do chat
export interface ChatParticipant {
  id: string
  type: "company" | "professional" | "customer"
  name: string
  avatar?: string
  isOnline?: boolean
  lastSeen?: string
}

// Tipo para filtros de busca de chats
export interface ChatFilters {
  search?: string
  participantType?: "professional" | "customer" | "all"
  unreadOnly?: boolean
  dateRange?: {
    start: string
    end: string
  }
}

// Tipo para paginação de mensagens
export interface ChatPagination {
  page: number
  limit: number
  hasMore: boolean
  total: number
}
