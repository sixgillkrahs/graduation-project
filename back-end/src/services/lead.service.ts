import { singleton } from "@/decorators/singleton";
import LeadModel, { ILead, LeadStatusEnum } from "@/models/lead.model";
import mongoose from "mongoose";

type CreateOrRefreshLeadPayload = Omit<
  ILead,
  "createdAt" | "updatedAt" | "lastSubmittedAt" | "submissionCount" | "status"
> & {
  status?: LeadStatusEnum;
};

@singleton
export class LeadService {
  private normalizePhone(value: string) {
    return value.replace(/[^\d+]/g, "").trim();
  }

  private normalizeEmail(value?: string) {
    return (value || "").trim().toLowerCase();
  }

  async createOrRefreshLead(payload: CreateOrRefreshLeadPayload) {
    const normalizedPhone = this.normalizePhone(payload.customerPhone);
    const normalizedEmail = this.normalizeEmail(payload.customerEmail);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const duplicateConditions: Record<string, any>[] = [
      {
        customerPhone: normalizedPhone,
      },
    ];

    if (normalizedEmail) {
      duplicateConditions.push({
        customerEmail: normalizedEmail,
      });
    }

    const existingLead = await LeadModel.findOne({
      listingId: payload.listingId,
      createdAt: { $gte: since },
      $or: duplicateConditions,
    }).exec();

    if (existingLead) {
      existingLead.customerName = payload.customerName;
      existingLead.customerPhone = normalizedPhone;
      existingLead.customerEmail = normalizedEmail;
      existingLead.intent = payload.intent;
      existingLead.interestTopics = payload.interestTopics;
      existingLead.budgetRange = payload.budgetRange;
      existingLead.preferredContactTime = payload.preferredContactTime;
      existingLead.preferredContactChannel = payload.preferredContactChannel;
      existingLead.message = payload.message || "";
      existingLead.source = payload.source;
      existingLead.lastSubmittedAt = new Date();
      existingLead.submissionCount += 1;
      existingLead.metadata = payload.metadata;

      if (
        [LeadStatusEnum.LOST, LeadStatusEnum.SPAM_REJECTED].includes(
          existingLead.status,
        )
      ) {
        existingLead.status = LeadStatusEnum.NEW;
      }

      await existingLead.save();

      return { lead: existingLead.toObject(), isDuplicate: true };
    }

    const lead = await LeadModel.create({
      ...payload,
      customerPhone: normalizedPhone,
      customerEmail: normalizedEmail,
      status: payload.status || LeadStatusEnum.NEW,
      lastSubmittedAt: new Date(),
      submissionCount: 1,
    });

    return { lead: lead.toObject(), isDuplicate: false };
  }

  async getAgentLeads(agentId: string) {
    return await LeadModel.find({
      agentId: new mongoose.Types.ObjectId(agentId),
      status: { $ne: LeadStatusEnum.SPAM_REJECTED },
    })
      .sort({ updatedAt: -1 })
      .populate("listingId")
      .lean()
      .exec();
  }

  async updateLeadStatus(id: string, agentId: string, status: LeadStatusEnum) {
    return await LeadModel.findOneAndUpdate(
      {
        _id: id,
        agentId: new mongoose.Types.ObjectId(agentId),
      },
      { $set: { status } },
      { new: true, runValidators: true },
    )
      .populate("listingId")
      .lean()
      .exec();
  }
}
