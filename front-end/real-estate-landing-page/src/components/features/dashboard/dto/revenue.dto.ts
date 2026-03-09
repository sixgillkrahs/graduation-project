export interface IRevenueSummaryDto {
  month: number;
  year: number;
  currency: "VND" | "USD";
  revenue: number;
  deals: number;
}

export interface IRevenueLeaderboardItemDto {
  rank: number;
  agentUserId: string;
  fullName?: string;
  avatarUrl?: string;
  revenue: number;
  deals: number;
  latestSoldAt: string;
}

export interface IRevenueLeaderboardDto {
  month: number;
  year: number;
  currency: "VND" | "USD";
  results: IRevenueLeaderboardItemDto[];
}

export interface ISalesLogItemDto {
  id: string;
  propertyId: string;
  salePrice: number;
  normalizedSalePrice: number;
  currency: "VND" | "USD";
  priceUnit: "VND" | "MILLION" | "BILLION" | "MILLION_PER_M2";
  soldAt: string;
  soldTo?: string;
  soldToEmail?: string;
  propertySnapshot: {
    title: string;
    propertyType: string;
    province: string;
    ward: string;
    address: string;
  };
}
