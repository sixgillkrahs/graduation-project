namespace IReportNoticeService {
  export type NoticeType = "REPORT";
  export type ReportTargetType = "LISTING" | "AGENT";
  export type ReportReason = "WRONG_DATA" | "SPAM" | "FAKE_PRICE" | "OTHER";

  export interface ReportNoticeDTO {
    id: string;
    title: string;
    content: string;
    isRead: boolean;
    type: NoticeType;
    metadata?: {
      reportId?: string;
      targetType?: ReportTargetType;
      targetId?: string;
      reason?: ReportReason;
      details?: string;
      reporterUserId?: string;
      reportedAt?: string;
    };
    createdAt?: string;
    updatedAt?: string;
  }

  export interface ReportNoticeListResponse {
    totalUnread: number;
    results: ReportNoticeDTO[];
    totalPages: number;
    totalResults: number;
    page: number;
    limit: number;
  }
}
