namespace IAgentPublicProfileService {
  export interface ProfileDTO {
    userId: string;
    fullName: string;
    avatarUrl: string;
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
    leaderboard: null | {
      month: number;
      year: number;
      currency: "VND" | "USD";
      rank: number;
      revenue: number;
      deals: number;
      latestSoldAt?: string;
    };
  }
}
