declare namespace IAgentService {
  export interface AccountLock {
    lockType: "TEMPORARY" | "PERMANENT";
    reason?: string | null;
    lockedAt: string;
    lockedUntil?: string | null;
  }

  export interface Agent {
    basicInfo: BasicInfo;
    businessInfo: BusinessInfo;
    imageInfo: ImageInfo;
    status: AgentStatusEnum;
    userId?: string;
    accountLock?: AccountLock | null;
    createdAt: string;
    updatedAt: string;
    id: string;
  }

  export interface UnlockRequestItem {
    id: string;
    registrationId: string;
    fullName: string;
    email: string;
    phone?: string;
    requestedAt: string;
    contactEmail?: string | null;
    unlockReason: string;
    accountLock: AccountLock;
    createdAt?: string;
    updatedAt?: string;
  }

  export interface PublicProfile {
    userId: string;
    fullName: string;
    avatarUrl?: string;
    email: string;
    phone: string;
    role: string;
    location: string;
    rating: number;
    description: string;
    yearsOfExperience: string;
    specialties: string[];
    workingAreas: string[];
    verified: boolean;
    plan: "BASIC" | "PRO";
    isPro: boolean;
    stats: {
      activeSaleListingsCount: number;
      totalPublishedListingsCount: number;
      soldPropertiesCount: number;
      totalViews: number;
    };
    leaderboard?: {
      month: number;
      year: number;
      currency: "VND" | "USD";
      rank: number;
      revenue: number;
      deals: number;
      latestSoldAt?: string;
    } | null;
  }
}
