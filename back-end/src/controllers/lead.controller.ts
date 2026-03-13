import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { LeadService } from "@/services/lead.service";
import { PropertyService } from "@/services/property.service";
import {
  LeadContactChannelEnum,
  LeadContactTimeEnum,
  LeadIntentEnum,
  LeadSourceEnum,
  LeadStatusEnum,
} from "@/models/lead.model";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";
import { NotificationQueue } from "@/queues/notification.queue";
import { NoticeService } from "@/services/notice.service";
import { NoticeTypeEnum } from "@/models/notice.model";
import { InteractionType } from "@/models/property-interaction.model";

export class LeadController extends BaseController {
  constructor(
    private leadService: LeadService,
    private propertyService: PropertyService,
    private notificationQueue: NotificationQueue,
    private noticeService: NoticeService,
  ) {
    super();
  }

  createLead = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const {
        listingId,
        customerName,
        customerPhone,
        customerEmail,
        intent,
        interestTopics,
        budgetRange,
        preferredContactTime,
        preferredContactChannel,
        source,
        message,
        website,
      } = req.body as {
        listingId: string;
        customerName: string;
        customerPhone: string;
        customerEmail?: string;
        intent: LeadIntentEnum;
        interestTopics: string[];
        budgetRange: string;
        preferredContactTime: LeadContactTimeEnum;
        preferredContactChannel: LeadContactChannelEnum;
        source?: LeadSourceEnum;
        message?: string;
        website?: string;
      };

      // Honeypot field: silently accept and ignore bot submissions.
      if (website?.trim()) {
        return {
          accepted: true,
          ignored: true,
        };
      }

      const property = await this.propertyService.getPropertyById(listingId, "userId");
      if (!property) {
        throw new AppError("Property not found", 404, ErrorCode.NOT_FOUND);
      }

      const agentId =
        (property as any).userId?._id?.toString?.() ||
        (property as any).userId?.toString?.();

      if (!agentId) {
        throw new AppError(
          "Agent not found for property",
          400,
          ErrorCode.INVALID_INPUT,
        );
      }

      const leadSource = source || LeadSourceEnum.PROPERTY_REQUEST;
      const { lead, isDuplicate } = await this.leadService.createOrRefreshLead({
        agentId: agentId as any,
        userId: req.user?.userId?._id as any,
        listingId: (property as any)._id,
        customerName,
        customerPhone,
        customerEmail,
        intent,
        interestTopics,
        budgetRange,
        preferredContactTime,
        preferredContactChannel,
        message,
        source: leadSource,
        metadata: {
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.get("User-Agent"),
        },
      });

      await this.propertyService.recordInteraction(
        listingId,
        leadSource === LeadSourceEnum.PROPERTY_CALL
          ? InteractionType.VIEW_PHONE
          : InteractionType.CONTACT_FORM,
        req.user?.userId?._id?.toString(),
        {
          source: leadSource,
          intent,
          preferredContactTime,
          preferredContactChannel,
          duplicate: isDuplicate,
        },
      );

      const propertyTitle =
        (property as any).title ||
        (property as any).projectName ||
        (property as any).location?.address ||
        "listing";
      const sourceMeta = {
        [LeadSourceEnum.PROPERTY_CALL]: {
          title: isDuplicate ? "Khach hang goi lai" : "Khach hang yeu cau goi",
          content: isDuplicate
            ? `${customerName} vua tap lai hanh dong goi cho ${propertyTitle}.`
            : `${customerName} vua yeu cau goi tu trang chi tiet cho ${propertyTitle}.`,
        },
        [LeadSourceEnum.PROPERTY_CHAT]: {
          title: isDuplicate ? "Khach hang chat lai" : "Khach hang bat dau chat",
          content: isDuplicate
            ? `${customerName} vua mo lai chat ve ${propertyTitle}.`
            : `${customerName} vua bat dau chat tu trang chi tiet ve ${propertyTitle}.`,
        },
        [LeadSourceEnum.PROPERTY_REQUEST]: {
          title: isDuplicate
            ? "Khach hang gui lai yeu cau"
            : "Lead moi tu yeu cau chi tiet",
          content: isDuplicate
            ? `${customerName} vua gui lai yeu cau tu van cho ${propertyTitle}.`
            : `${customerName} vua gui yeu cau tu van cho ${propertyTitle}.`,
        },
      } as const;
      const notificationTitle = isDuplicate
        ? sourceMeta[leadSource].title
        : sourceMeta[leadSource].title;
      const notificationContent = sourceMeta[leadSource].content;

      this.notificationQueue.enqueueNotification({
        userId: agentId,
        title: notificationTitle,
        content: notificationContent,
        type: "ACCOUNT",
        socketEvent: "lead:new_request",
        metadata: {
          leadId: String((lead as any)._id || (lead as any).id),
          listingId,
          propertyTitle,
          customerName,
          customerPhone,
          customerEmail,
          intent,
          interestTopics,
          budgetRange,
          preferredContactTime,
          preferredContactChannel,
          source: leadSource,
          duplicate: isDuplicate,
        },
      });

      await this.noticeService.createNotice({
        userId: agentId as any,
        title: notificationTitle,
        content: notificationContent,
        isRead: false,
        type: NoticeTypeEnum.ACCOUNT,
        metadata: {
          leadId: String((lead as any)._id || (lead as any).id),
          listingId,
          propertyTitle,
          status: (lead as any).status,
          source: leadSource,
          duplicate: isDuplicate,
        },
      });

      return {
        leadId: (lead as any)._id || (lead as any).id,
        status: (lead as any).status,
        isDuplicate,
      };
    });
  };

  getAgentLeads = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const currentUser = req.user;
      const leads = await this.leadService.getAgentLeads(currentUser.userId._id);
      return leads;
    });
  };

  updateLeadStatus = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const currentUser = req.user;
      const { id } = req.params;
      const { status } = req.body as { status: LeadStatusEnum };

      const lead = await this.leadService.updateLeadStatus(
        id,
        currentUser.userId._id,
        status,
      );

      if (!lead) {
        throw new AppError("Lead not found", 404, ErrorCode.NOT_FOUND);
      }

      return lead;
    });
  };
}
