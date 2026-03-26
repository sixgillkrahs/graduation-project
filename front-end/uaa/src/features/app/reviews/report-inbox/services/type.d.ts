declare namespace IReportNoticeService {
  export type NoticeType = "REPORT";
  export type ReportTargetType = "LISTING" | "AGENT";
  export type ReportReason = "WRONG_DATA" | "SPAM" | "FAKE_PRICE" | "OTHER";
  export type ReportStatus = "OPEN" | "CONFIRMED" | "DISMISSED";

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
      reportStatus?: ReportStatus;
      adminNote?: string;
      resolvedAt?: string;
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

  export interface ReportDetail {
    id: string;
    targetType: ReportTargetType;
    targetId: string;
    reason: ReportReason;
    details?: string;
    status: ReportStatus;
    reportedAt: string;
    adminNote?: string;
    resolvedAt?: string | null;
    reporter?: {
      id?: string;
      fullName?: string;
      email?: string;
      phone?: string;
    } | null;
    resolver?: {
      id?: string;
      fullName?: string;
      email?: string;
    } | null;
    target?: ListingTarget | AgentTarget | null;
  }

  export interface ListingTarget {
    kind: "LISTING";
    id: string;
    title: string;
    projectName?: string;
    status: string;
    rejectReason?: string;
    adminNote?: string;
    createdAt?: string;
    updatedAt?: string;
    location?: {
      province?: string;
      district?: string;
      ward?: string;
      address?: string;
    };
    owner?: {
      id?: string;
      fullName?: string;
      email?: string;
      phone?: string;
    } | null;
    features?: {
      price?: number;
      currency?: string;
      priceUnit?: string;
    };
    media?: {
      thumbnail?: string;
    };
  }

  export interface AgentTarget {
    kind: "AGENT";
    id: string;
    registrationId?: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
    basicInfo?: {
      nameRegister?: string;
      email?: string;
      phoneNumber?: string;
    };
    businessInfo?: {
      yearsOfExperience?: string;
      workingArea?: string[];
      specialization?: string[];
    };
    note?: string;
    reasonReject?: string;
    user?: {
      id?: string;
      fullName?: string;
      email?: string;
      phone?: string;
      isActive?: boolean;
      avatarUrl?: string;
    };
    accountLock?: {
      lockType: "TEMPORARY" | "PERMANENT";
      reason?: string | null;
      lockedAt: string;
      lockedUntil?: string | null;
    } | null;
  }

  export interface ResolveBody {
    status: "CONFIRMED" | "DISMISSED";
    adminNote?: string;
  }
}
