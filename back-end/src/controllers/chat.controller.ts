import { BaseController } from "./base.controller";
import { NextFunction, Request, Response } from "express";
import { ChatService } from "@/services/chat.service";
import { ApiRequest } from "@/utils/apiRequest";

export class ChatController extends BaseController {
  constructor(private chatService: ChatService) {
    super();
  }

  getConversations = async (
    req: Request<
      {},
      {},
      {},
      {
        limit?: string;
        page?: string;
        sortField?: string;
        sortOrder?: string;
      }
    >,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const { userId, roleId } = req.user;
      const { limit, page, sortField, sortOrder } = req.query;
      let filter: Record<string, any> = {};
      if (userId) {
        filter.participants = userId._id;
      }
      return await this.chatService.getConversationsPaginated(
        {
          page: page ? Number(page) : 1,
          limit: limit ? Number(limit) : 10,
          sortBy: `${(sortField as string) || "updatedAt"}:${(sortOrder as string) || "desc"}`,
          populate: "participants:fullName ,lastMessageId",
        },
        filter,
      );
    });
  };

  getMessages = async (
    req: Request<
      { conversationId: string },
      {},
      { page: string; limit: string }
    >,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const { conversationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      return await this.chatService.getMessages(conversationId, page, limit);
    });
  };

  createConversation = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const { participantIds } = req.body;
      return await this.chatService.createConversation(participantIds);
    });
  };
}
