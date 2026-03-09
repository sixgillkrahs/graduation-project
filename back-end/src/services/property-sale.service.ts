import { singleton } from "@/decorators/singleton";
import PropertySaleModel, {
  PropertySaleRecordStatusEnum,
} from "@/models/property-sale.model";
import {
  CurrencyEnum,
  IProperty,
  PriceUnitEnum,
} from "@/models/property.model";
import mongoose from "mongoose";

@singleton
export class PropertySaleService {
  private hasExplicitSoldPrice(saleInfo?: IProperty["salesInfo"]) {
    if (typeof saleInfo?.soldPrice === "number") {
      return Number.isFinite(saleInfo.soldPrice);
    }

    if (typeof saleInfo?.soldPrice === "string") {
      return saleInfo.soldPrice.trim().length > 0;
    }

    return false;
  }

  private parseSalePrice(
    salePrice: string | number | undefined,
    fallbackPrice: number,
  ) {
    if (typeof salePrice === "number" && Number.isFinite(salePrice)) {
      return salePrice;
    }

    if (typeof salePrice === "string") {
      const normalizedValue = salePrice.replace(/[,\s]/g, "").trim();
      const parsedValue = Number(normalizedValue);

      if (Number.isFinite(parsedValue)) {
        return parsedValue;
      }
    }

    return fallbackPrice;
  }

  private normalizeSalePrice(
    salePrice: number,
    priceUnit: PriceUnitEnum,
    area?: number,
  ) {
    if (!Number.isFinite(salePrice) || salePrice <= 0) {
      return 0;
    }

    switch (priceUnit) {
      case PriceUnitEnum.VND:
        return salePrice;
      case PriceUnitEnum.MILLION:
        return salePrice * 1_000_000;
      case PriceUnitEnum.BILLION:
        return salePrice * 1_000_000_000;
      case PriceUnitEnum.MILLION_PER_M2:
        return area && area > 0 ? salePrice * 1_000_000 * area : 0;
      default:
        return salePrice;
    }
  }

  private getDateRange(month?: number, year?: number) {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    const start = new Date(targetYear, targetMonth - 1, 1, 0, 0, 0, 0);
    const end = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    return { start, end, month: targetMonth, year: targetYear };
  }

  upsertPropertySale = async (
    property: IProperty & { _id?: mongoose.Types.ObjectId | string },
    saleInfo?: IProperty["salesInfo"],
  ) => {
    const propertyId = property?._id?.toString();
    if (!propertyId) {
      return null;
    }

    const salePrice = this.parseSalePrice(
      saleInfo?.soldPrice,
      Number(property.features?.price ?? 0),
    );
    const hasExplicitSoldPrice = this.hasExplicitSoldPrice(saleInfo);
    const priceUnit = hasExplicitSoldPrice
      ? PriceUnitEnum.VND
      : property.features?.priceUnit || PriceUnitEnum.MILLION;
    const currency = property.features?.currency || CurrencyEnum.VND;
    const soldAt = saleInfo?.soldAt ? new Date(saleInfo.soldAt) : new Date();
    const normalizedSalePrice = hasExplicitSoldPrice
      ? salePrice
      : this.normalizeSalePrice(salePrice, priceUnit, property.features?.area);

    return await PropertySaleModel.findOneAndUpdate(
      { propertyId },
      {
        propertyId,
        agentUserId: property.userId,
        salePrice,
        normalizedSalePrice,
        currency,
        priceUnit,
        soldAt,
        soldTo: saleInfo?.soldTo || undefined,
        soldToEmail: saleInfo?.soldToEmail || undefined,
        recordStatus: PropertySaleRecordStatusEnum.ACTIVE,
        revokedAt: undefined,
        propertySnapshot: {
          title: property.title,
          propertyType: property.propertyType,
          province: property.location?.province || "",
          ward: property.location?.ward || "",
          address: property.location?.address || "",
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    )
      .lean()
      .exec();
  };

  revokePropertySale = async (propertyId: string) => {
    return await PropertySaleModel.findOneAndUpdate(
      { propertyId },
      {
        recordStatus: PropertySaleRecordStatusEnum.REVOKED,
        revokedAt: new Date(),
      },
      { new: true },
    )
      .lean()
      .exec();
  };

  getAgentRevenueSummary = async (
    agentUserId: string,
    options?: { month?: number; year?: number; currency?: CurrencyEnum },
  ) => {
    const { start, end, month, year } = this.getDateRange(
      options?.month,
      options?.year,
    );

    const currency = options?.currency || CurrencyEnum.VND;
    const match: Record<string, any> = {
      agentUserId: new mongoose.Types.ObjectId(agentUserId),
      recordStatus: PropertySaleRecordStatusEnum.ACTIVE,
      soldAt: { $gte: start, $lte: end },
      currency,
    };

    const [summary] = await PropertySaleModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$currency",
          revenue: { $sum: "$normalizedSalePrice" },
          deals: { $sum: 1 },
        },
      },
    ]);

    return {
      month,
      year,
      currency,
      revenue: summary?.revenue || 0,
      deals: summary?.deals || 0,
    };
  };

  getAgentSalesLog = async (
    agentUserId: string,
    options: {
      page: number;
      limit: number;
      month?: number;
      year?: number;
      currency?: CurrencyEnum;
    },
  ) => {
    const { start, end } = this.getDateRange(options.month, options.year);
    const currency = options.currency || CurrencyEnum.VND;
    const filter: Record<string, any> = {
      agentUserId: new mongoose.Types.ObjectId(agentUserId),
      recordStatus: PropertySaleRecordStatusEnum.ACTIVE,
      soldAt: { $gte: start, $lte: end },
      currency,
    };

    return await (PropertySaleModel as any).paginate?.(
      {
        page: options.page,
        limit: options.limit,
        sortBy: "soldAt:desc",
      },
      filter,
    );
  };

  getRevenueLeaderboard = async (options?: {
    month?: number;
    year?: number;
    currency?: CurrencyEnum;
    limit?: number;
  }) => {
    const { start, end, month, year } = this.getDateRange(
      options?.month,
      options?.year,
    );
    const limit = options?.limit || 10;
    const currency = options?.currency || CurrencyEnum.VND;

    const match: Record<string, any> = {
      recordStatus: PropertySaleRecordStatusEnum.ACTIVE,
      soldAt: { $gte: start, $lte: end },
      currency,
    };

    const leaderboard = await PropertySaleModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$agentUserId",
          revenue: { $sum: "$normalizedSalePrice" },
          deals: { $sum: 1 },
          latestSoldAt: { $max: "$soldAt" },
        },
      },
      { $sort: { revenue: -1, deals: -1, latestSoldAt: 1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          agentUserId: "$_id",
          fullName: "$user.fullName",
          avatarUrl: "$user.avatarUrl",
          revenue: 1,
          deals: 1,
          latestSoldAt: 1,
        },
      },
    ]);

    return {
      month,
      year,
      currency,
      results: leaderboard.map((item, index) => ({
        rank: index + 1,
        ...item,
      })),
    };
  };
}
