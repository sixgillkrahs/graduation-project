import { IResp } from "@/@types/service";

export enum LeadIntent {
  BUY_TO_LIVE = "BUY_TO_LIVE",
  INVEST = "INVEST",
  RENT = "RENT",
  CONSULTATION = "CONSULTATION",
}

export enum LeadContactChannel {
  PHONE = "PHONE",
  CHAT = "CHAT",
  ZALO = "ZALO",
  EMAIL = "EMAIL",
}

export enum LeadSource {
  PROPERTY_CALL = "PROPERTY_CALL",
  PROPERTY_CHAT = "PROPERTY_CHAT",
  PROPERTY_REQUEST = "PROPERTY_REQUEST",
}

export enum LeadContactTime {
  ASAP = "ASAP",
  TODAY = "TODAY",
  NEXT_24_HOURS = "NEXT_24_HOURS",
  THIS_WEEKEND = "THIS_WEEKEND",
}

export enum LeadStatus {
  NEW = "NEW",
  CONTACTED = "CONTACTED",
  QUALIFIED = "QUALIFIED",
  SCHEDULED = "SCHEDULED",
  WON = "WON",
  LOST = "LOST",
}

export interface ILeadListing {
  _id: string;
  id?: string;
  title: string;
  media?: {
    thumbnail?: string;
    images?: string[];
  };
  location?: {
    address?: string;
  };
}

export interface ILeadDto {
  _id: string;
  agentId: string;
  userId?: string;
  listingId: ILeadListing;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  intent: LeadIntent;
  interestTopics: string[];
  budgetRange: string;
  preferredContactTime: LeadContactTime;
  preferredContactChannel: LeadContactChannel;
  message?: string;
  source: LeadSource | string;
  status: LeadStatus;
  submissionCount: number;
  lastSubmittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadRequest {
  listingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  intent: LeadIntent;
  interestTopics: string[];
  budgetRange: string;
  preferredContactTime: LeadContactTime;
  preferredContactChannel: LeadContactChannel;
  source?: LeadSource;
  message?: string;
  website?: string;
}

export interface CreateLeadResponse {
  leadId: string;
  status: LeadStatus;
  isDuplicate: boolean;
}

export interface UpdateLeadStatusRequest {
  id: string;
  status: LeadStatus;
}
