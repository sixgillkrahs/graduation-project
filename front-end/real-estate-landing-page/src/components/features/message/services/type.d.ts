namespace IConversationService {
  export interface ConversationDTO {
    participants: Participant[];
    createdAt: string;
    updatedAt: string;
    lastMessageId: LastMessageId;
    id: string;
  }

  export interface Participant {
    email: string;
    fullName: string;
    id: string;
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

}
