namespace IConversationService {
  export interface ConversationDTO {
    id: string;
    type: string;
    displayName: string;
    displayAvatar: string;
    lastMessage?: {
      id: string;
      content: string;
      type: string;
      senderId: string;
      createdAt: string;
      isRead: boolean;
    };
    lastMessageSender?: {
      id: string;
      name: string;
    };
    unreadCount: number;
    updatedAt: string;
    isPinned: boolean;
    isMuted: boolean;
    participants?: Participant[];
  }

  export interface Participant {
    email: string;
    fullName: string;
    id: string;
    avatar?: string;
  }

  export interface LastMessageId {
    conversationId: string;
    senderId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
    id: string;
  }

  export interface ConversationDetailDTO {
    conversationId: string;
    senderId: SenderId;
    content: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
    id: string;
    isMine: boolean;
  }

  export interface SenderId {
    email: string;
    fullName: string;
    prefixPhone: string;
    phone: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    id: string;
  }
}
