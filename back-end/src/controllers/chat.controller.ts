import { BaseController } from "./base.controller";
import { NextFunction, Request, Response } from "express";
import { ChatService } from "@/services/chat.service";
import { ApiRequest } from "@/utils/apiRequest";

export class ChatController extends BaseController {
  constructor(private chatService: ChatService) {
    super();
  }

  getConversations = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      // Assuming req.user is populated by auth middleware
      // Check type definition for req.user if necessary.
      // In user.controller it seems req.user has { userId: { _id: ... }, roleId: ... } structure?
      // Let's verify req.user structure from user.controller usage:
      // const { userId, roleId } = req.user;
      // and userId._id

      const userId =
        req.user?.userId?._id?.toString() || req.user?.userId?.toString();

      return await this.chatService.getUserConversations(userId);
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
