import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { NoticeTypeEnum } from "@/models/notice.model";
import { ReportService } from "@/services/report.service";
import { NoticeService } from "@/services/notice.service";
import {
  ReportReasonEnum,
  ReportTargetTypeEnum,
} from "@/models/report.model";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";

export class ReportController extends BaseController {
  constructor(
    private reportService: ReportService,
    private noticeService: NoticeService,
  ) {
    super();
  }

  createReport = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const reporterUserId = req.user?.userId?._id?.toString();

      if (!reporterUserId) {
        throw new AppError("Unauthorized", 401, ErrorCode.UNAUTHORIZED);
      }

      const { targetType, targetId, reason, details } = req.body as {
        targetType: ReportTargetTypeEnum;
        targetId: string;
        reason: ReportReasonEnum;
        details?: string;
      };

      const report = await this.reportService.createOrUpdateReport({
        reporterUserId,
        targetType,
        targetId,
        reason,
        details,
      });

      if (!report) {
        throw new AppError("Report target not found", 404, ErrorCode.NOT_FOUND);
      }

      const adminUserIds = await this.reportService.getAdminUserIds();

      if (adminUserIds.length > 0) {
        const noticeTitle =
          targetType === ReportTargetTypeEnum.LISTING
            ? "New listing report"
            : "New agent report";
        const noticeContent =
          targetType === ReportTargetTypeEnum.LISTING
            ? `A listing was reported for ${reason}.`
            : `An agent was reported for ${reason}.`;

        const notices = await Promise.all(
          adminUserIds.map((userId) =>
            this.noticeService.createNotice({
              userId: userId as any,
              title: noticeTitle,
              content: noticeContent,
              isRead: false,
              type: NoticeTypeEnum.REPORT,
              metadata: {
                reportId: (report as any)._id?.toString?.() || (report as any).id,
                targetType,
                targetId,
                reason,
                details: details?.trim() || "",
                reporterUserId,
                reportedAt: (report as any).reportedAt || new Date(),
              },
            }),
          ),
        );

        const io = (req as any).io;
        if (io) {
          notices.forEach((notice) => {
            io.to(notice.userId.toString()).emit("new_notice", notice);
          });
        }
      }

      return report;
    });
  };
}
