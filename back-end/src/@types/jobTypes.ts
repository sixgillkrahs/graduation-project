import { CurrencyEnum } from "@/models/property.model";

export interface EmailJob {
  to: string;
  subject: string;
  body: string;
}

export type SendVerifyEmailJob = {
  email: string;
  name?: string;
  token: string;
};

export type SendPasswordResetEmailJob = {
  to: string;
  name: string;
  resetToken: string;
};

export type SendRejectEmailJob = {
  to: string;
  name: string;
  reason: string;
};

export type SendOTPEmailJob = {
  to: string;
  otp: string;
};

export type UpsertPropertyEmbeddingJob = {
  propertyId: string;
  textData: string;
  payload?: any;
};

export type SendAppointmentConfirmedEmailJob = {
  to: string;
  customerName: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
};

export type SendDealClosedEmailJob = {
  to: string;
  customerName: string;
  propertyName: string;
};

export type SendReviewInvitationEmailJob = {
  to: string;
  customerName: string;
  agentName: string;
  propertyName: string;
  reviewUrl: string;
};

export type SendNotificationJob = {
  userId: string;
  title: string;
  content: string;
  type: "SYSTEM" | "PROPERTY" | "ACCOUNT" | "SCHEDULE";
  metadata?: Record<string, any>;
  /** Socket event name to emit (e.g. "schedule:new_request") */
  socketEvent?: string;
};

export type RefreshMonthlyLeaderboardJob = {
  month: number;
  year: number;
  currency: CurrencyEnum;
};
