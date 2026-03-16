namespace IReportService {
  export type ReportTargetType = "LISTING" | "AGENT";
  export type ReportReason = "WRONG_DATA" | "SPAM" | "FAKE_PRICE" | "OTHER";

  export interface ReportItem {
    id: string;
    reporterUserId: string;
    targetType: ReportTargetType;
    targetId: string;
    reason: ReportReason;
    details?: string;
    status: "OPEN";
    reportedAt: string;
    createdAt?: string;
    updatedAt?: string;
  }

  export interface CreateReportPayload {
    targetType: ReportTargetType;
    targetId: string;
    reason: ReportReason;
    details?: string;
  }
}
