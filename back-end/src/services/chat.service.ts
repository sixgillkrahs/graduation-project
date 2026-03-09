import ConversationModel from "@/models/chat/conversation.model";
import MessageModel from "@/models/chat/message.model";
import { singleton } from "@/decorators/singleton";
import mongoose from "mongoose";
import { AppError } from "@/utils/appError";

@singleton
export class ChatService {
  constructor() {
    console.log("init chat service");
  }

  public async createConversationFromParticipantSet(participantIds: string[]) {
    const normalizedParticipantIds = Array.from(
      new Set((participantIds || []).filter(Boolean)),
    );

    if (normalizedParticipantIds.length < 2) {
      throw new AppError("Conversation requires at least 2 participants", 400);
    }

    const query = {
      participants: {
        $all: normalizedParticipantIds,
        $size: normalizedParticipantIds.length,
      },
    };

    let conversation = await ConversationModel.findOne(query);

    if (!conversation) {
      conversation = await ConversationModel.create({
        participants: normalizedParticipantIds,
      });
    }

    return conversation;
  }

  private buildConversationDTO(conv: any, currentUserId: string) {
    const participants = Array.isArray(conv.participants) ? conv.participants : [];
    const otherParticipant =
      participants.find((p: any) => p.id?.toString() !== currentUserId) ||
      participants.find((p: any) => p._id?.toString() !== currentUserId) ||
      participants[0];
    const lastMsg = conv.lastMessageId;

    let senderName = "Unknown";
    let senderId = lastMsg?.senderId;

    if (lastMsg?.senderId && typeof lastMsg.senderId === "object") {
      senderName = lastMsg.senderId.fullName || "User";
      senderId = lastMsg.senderId._id || lastMsg.senderId.id;
    } else if (typeof lastMsg?.senderId === "string") {
      const senderObj = participants.find(
        (p: any) =>
          p.id?.toString() === lastMsg.senderId ||
          p._id?.toString() === lastMsg.senderId,
      );
      if (senderObj) {
        senderName = senderObj.fullName;
      }
    }

    return {
      id: conv.id,
      type: "PRIVATE",
      displayName: otherParticipant?.fullName || "Chat",
      displayAvatar: otherParticipant?.avatarUrl || otherParticipant?.avatar || "",
      participants: participants.map((participant: any) => ({
        id: participant.id || participant._id?.toString(),
        fullName: participant.fullName,
        email: participant.email,
        avatar: participant.avatarUrl || participant.avatar || "",
      })),
      lastMessage: lastMsg
        ? {
            id: lastMsg._id || lastMsg.id,
            content: lastMsg.content,
            type: "TEXT",
            senderId: senderId,
            createdAt: lastMsg.createdAt,
            isRead: lastMsg.isRead,
          }
        : null,
      lastMessageSender: {
        id: senderId,
        name: senderName,
      },
      unreadCount:
        lastMsg && !lastMsg.isRead && senderId?.toString() !== currentUserId
          ? 1
          : 0,
      updatedAt: conv.updatedAt,
      isPinned: false,
      isMuted: false,
    };
  }
  /**
   * Create or get existing conversation between participants
   */
  public async createConversation(
    currentUserId: string,
    participantIds: string[],
  ) {
    const conversation = await this.createConversationFromParticipantSet([
      currentUserId,
      ...(participantIds || []),
    ]);

    const populatedConversation = await ConversationModel.findById(conversation._id)
      .populate("participants", "fullName email avatarUrl")
      .populate("lastMessageId");

    return this.buildConversationDTO(populatedConversation || conversation, currentUserId);
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
    currentUserId?: string,
    select?: string,
  ) {
    filter = filter || {};
    // @ts-ignore
    const result: any = await ConversationModel.paginate?.(
      options,
      filter,
      select,
    );

    if (result?.results && currentUserId) {
      result.results = result.results.map((conv: any) =>
        this.buildConversationDTO(conv, currentUserId),
      );
    }

    return result;
  }

  /**
   * Get messages for a conversation
   */
  public async getMessages(
    conversationId: string,
    page = 1,
    limit = 50,
    currentUserId?: string,
  ) {
    // @ts-ignore
    const result: any = await MessageModel.paginate(
      {
        page,
        limit,
        sortBy: "createdAt:desc", // Latest first
        populate: "senderId",
      },
      { conversationId },
    );

    if (result?.results) {
      result.results = result.results.map((msg: any) => {
        let senderIdStr = "";
        if (typeof msg.senderId === "string") {
          senderIdStr = msg.senderId;
        } else if (msg.senderId?._id) {
          senderIdStr = msg.senderId._id.toString();
        } else if (msg.senderId?.id) {
          senderIdStr = msg.senderId.id;
        }

        return {
          ...msg.toObject(),
          isMine: currentUserId ? senderIdStr === currentUserId : false,
        };
      });
      result.results = result.results.reverse();
    }

    return result;
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
