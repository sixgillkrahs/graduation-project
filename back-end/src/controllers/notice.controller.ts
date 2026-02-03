import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { NoticeService } from "@/services/notice.service";
import { ApiRequest } from "@/utils/apiRequest";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";

export class NoticeController extends BaseController {
  constructor(private noticeService: NoticeService) {
    super();
  }

  createNotice = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      // Typically created by system, but allowing manual creation if needed
      const notice = await this.noticeService.createNotice(req.body);

      const io = (req as any).io;
      if (io) {
        io.to(notice.userId.toString()).emit("new_notice", notice);
      }

      return notice;
    });
  };

  getMyNotices = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const user = (req as any).user;
      if (!user || !user.userId) {
        throw new AppError("Unauthorized", 401, ErrorCode.UNAUTHORIZED);
      }

      const { limit, page, sortField, sortOrder, ...filters } = req.query;

      const options = {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        sortBy: `${(sortField as string) || "createdAt"}:${(sortOrder as string) || "desc"}`,
      };

      const queryFilters = {
        ...filters,
        userId: user.userId,
      };

      // use promise all
      const [totalUnread, notices] = await Promise.all([
        this.noticeService.countUnreadNotices(user.userId),
        this.noticeService.getNotices(options, queryFilters),
      ]);
      return { totalUnread, ...notices };
    });
  };

  getNoticeById = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const user = (req as any).user;
      const lang = ApiRequest.getCurrentLang(req);

      const notice = await this.noticeService.getNoticeById(id);

      if (!notice) {
        throw new AppError(
          lang === "vi" ? "Thông báo không tồn tại" : "Notice not found",
          404,
          ErrorCode.NOT_FOUND,
        );
      }

      // Check ownership
      if (notice.userId.toString() !== user.userId) {
        throw new AppError(
          lang === "vi"
            ? "Bạn không có quyền xem thông báo này"
            : "Permission denied",
          403,
          ErrorCode.FORBIDDEN,
        );
      }

      return notice;
    });
  };

  markAsRead = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const user = req.user;
      const lang = ApiRequest.getCurrentLang(req);

      const notice = await this.noticeService.getNoticeById(id);
      if (!notice) {
        throw new AppError(
          lang === "vi" ? "Thông báo không tồn tại" : "Notice not found",
          404,
          ErrorCode.NOT_FOUND,
        );
      }

      if (notice.userId.toString() !== user.userId._id.toString()) {
        throw new AppError(
          lang === "vi"
            ? "Bạn không có quyền sửa thông báo này"
            : "Permission denied",
          403,
          ErrorCode.FORBIDDEN,
        );
      }

      const updatedNotice = await this.noticeService.updateNotice(id, {
        isRead: true,
      });
      return updatedNotice;
    });
  };

  deleteNotice = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const user = req.user;
      const lang = ApiRequest.getCurrentLang(req);

      const notice = await this.noticeService.getNoticeById(id);
      if (!notice) {
        throw new AppError(
          lang === "vi" ? "Thông báo không tồn tại" : "Notice not found",
          404,
          ErrorCode.NOT_FOUND,
        );
      }

      if (notice.userId.toString() !== user.userId._id.toString()) {
        throw new AppError(
          lang === "vi"
            ? "Bạn không có quyền xóa thông báo này"
            : "Permission denied",
          403,
          ErrorCode.FORBIDDEN,
        );
      }

      await this.noticeService.deleteNotice(id);
      return { success: true };
    });
  };

  deleteAllNotices = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const user = req.user;

      if (!user || !user.userId._id) {
        throw new AppError("Unauthorized", 401, ErrorCode.UNAUTHORIZED);
      }

      await this.noticeService.deleteAllNotices(user.userId._id);
      return { success: true };
    });
  };
}
