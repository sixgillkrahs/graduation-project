import ConversationModel from "@/models/chat/conversation.model";
import MessageModel from "@/models/chat/message.model";
import { singleton } from "@/decorators/singleton";
import mongoose from "mongoose";

@singleton
export class ChatService {
  constructor() {
    console.log("init chat service");
  }
  /**
   * Create or get existing conversation between participants
   */
  public async createConversation(participantIds: string[]) {
    // Check if conversation exists
    const query = {
      participants: {
        $all: participantIds,
        $size: participantIds.length,
      },
    };

    let conversation = await ConversationModel.findOne(query);

    if (!conversation) {
      conversation = await ConversationModel.create({
        participants: participantIds,
      });
    }

    return conversation;
  }

  /**
   * Send a message in a conversation
   */
  public async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ) {
    const message = await MessageModel.create({
      conversationId,
      senderId,
      content,
    });

    // Update conversation last message
    await ConversationModel.findByIdAndUpdate(conversationId, {
      lastMessageId: message._id,
      updatedAt: new Date(),
    });

    return message;
  }

  /**
   * Get conversations for a user
   */
  // public async getUserConversations(userId: string) {
  //   return await ConversationModel?.paginate()
  //     // .populate("participants", "fullName email avatar") // Adjust fields based on User model
  //     // .populate("lastMessageId")
  //     // .sort({ updatedAt: -1 });
  // }

  public async getConversationsPaginated(
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter?: Record<string, any>,
    select?: string,
  ) {
    filter = filter || {};
    return await ConversationModel.paginate?.(options, filter, select);
  }

  /**
   * Get messages for a conversation
   */
  public async getMessages(conversationId: string, page = 1, limit = 50) {
    // @ts-ignore
    return await MessageModel.paginate(
      {
        page,
        limit,
        sortBy: "createdAt:desc", // Latest first
        populate: "senderId",
      },
      { conversationId },
    );
  }

  /**
   * Mark messages as read
   */
  public async markMessagesAsRead(conversationId: string, userId: string) {
    // We want to mark messages NOT sent by this user as read
    await MessageModel.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        isRead: false,
      },
      {
        $set: { isRead: true },
      },
    );
  }
}
