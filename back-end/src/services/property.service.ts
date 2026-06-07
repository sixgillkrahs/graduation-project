import { singleton } from "@/decorators/singleton";
import { ENV } from "@/config/env";
import { logger } from "@/config/logger";
import PropertyModel, {
  IProperty,
  PropertyDemandTypeEnum,
  PropertyStatusEnum,
  PropertyTypeEnum,
} from "@/models/property.model";
import { PropertyViewModel } from "@/models/property-view.model";
import mongoose, { PopulateOptions } from "mongoose";
import {
  InteractionType,
  PropertyInteractionModel,
} from "@/models/property-interaction.model";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { QdrantService } from "./qdrant.service";
import { QdrantQueue } from "@/queues/qdrant.queue";

interface GetPropertiesOptions {
  page: number;
  limit: number;
  sortBy?: string;
  populate?: string;
}

interface GeoSearchOptions {
  latitude: number;
  longitude: number;
  radiusKm: number;
}

interface AiSearchFilters {
  demandType?: PropertyDemandTypeEnum;
  propertyType?: PropertyTypeEnum;
  province?: string;
  district?: string;
  ward?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  amenities?: string[];
}

interface AiSearchInput {
  query: string;
  filters?: Partial<AiSearchFilters>;
  limit?: number;
  page?: number;
}

interface AiSearchCandidate {
  propertyId: string;
  property: any;
  vectorScore: number;
  filterScore: number;
  rerankScore: number;
  finalScore: number;
  reasons: string[];
}

interface AiSearchResponse {
  query: string;
  appliedFilters: Partial<AiSearchFilters>;
  retrieval: {
    retrievedCandidates: number;
    matchedCandidates: number;
    rerankModel: string;
  };
  results: Array<{
    property: any;
    vectorScore: number;
    filterScore: number;
    rerankScore: number;
    finalScore: number;
    reasons: string[];
  }>;
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  answer?: string;
}

@singleton
export class PropertyService {
  private qdrantService: QdrantService;
  private qdrantQueue: QdrantQueue;
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.qdrantService = new QdrantService();
    this.qdrantQueue = new QdrantQueue();
    this.genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
  }

  createProperty = async (propertyData: IProperty) => {
    const property = await PropertyModel.create(propertyData);

    return property;
  };

  private buildPropertyEmbeddingText(property: any) {
    const sections = [
      property?.title,
      property?.projectName ? `Project: ${property.projectName}` : undefined,
      property?.description,
      property?.demandType ? `Demand type: ${property.demandType}` : undefined,
      property?.propertyType
        ? `Property type: ${property.propertyType}`
        : undefined,
      property?.location?.address
        ? `Address: ${property.location.address}`
        : undefined,
      [
        property?.location?.ward,
        property?.location?.district,
        property?.location?.province,
      ]
        .filter(Boolean)
        .join(", "),
      Number.isFinite(property?.features?.area)
        ? `Area: ${property.features.area} m2`
        : undefined,
      Number.isFinite(property?.features?.price)
        ? `Price: ${property.features.price} ${property?.features?.currency || ""} ${property?.features?.priceUnit || ""}`.trim()
        : undefined,
      Number.isFinite(property?.features?.bedrooms)
        ? `Bedrooms: ${property.features.bedrooms}`
        : undefined,
      Number.isFinite(property?.features?.bathrooms)
        ? `Bathrooms: ${property.features.bathrooms}`
        : undefined,
      property?.features?.furniture
        ? `Furniture: ${property.features.furniture}`
        : undefined,
      property?.features?.direction
        ? `Direction: ${property.features.direction}`
        : undefined,
      property?.features?.legalStatus
        ? `Legal status: ${property.features.legalStatus}`
        : undefined,
      Array.isArray(property?.amenities) && property.amenities.length > 0
        ? `Amenities: ${property.amenities.join(", ")}`
        : undefined,
    ];

    return sections
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter(Boolean)
      .join(". ");
  }

  private buildPropertyEmbeddingPayload(property: any) {
    return {
      propertyId: property._id.toString(),
      status: property.status,
      demandType: property.demandType,
      type: property.propertyType,
      province: property.location?.province,
      district: property.location?.district,
      ward: property.location?.ward,
      price: property.features?.price,
      area: property.features?.area,
      bedrooms: property.features?.bedrooms,
      bathrooms: property.features?.bathrooms,
      amenities: property.amenities || [],
    };
  }

  private normalizeText(value: string) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  }

  private escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private parseLocalizedNumber(raw: string) {
    return Number(String(raw).replace(/,/g, "."));
  }

  private moneyUnitToVnd(amount: number, unit: string) {
    const normalizedUnit = this.normalizeText(unit);

    if (
      normalizedUnit.includes("ty") ||
      normalizedUnit.includes("ti") ||
      normalizedUnit.includes("billion")
    ) {
      return amount * 1_000_000_000;
    }

    if (
      normalizedUnit.includes("tr") ||
      normalizedUnit.includes("trieu") ||
      normalizedUnit.includes("million")
    ) {
      return amount * 1_000_000;
    }

    return amount;
  }

  private pickLocationToken(query: string, prefixes: string[]) {
    for (const prefix of prefixes) {
      const regex = new RegExp(
        `${prefix}\\s+([\\p{L}0-9]+(?:\\s+[\\p{L}0-9]+){0,3})`,
        "iu",
      );
      const match = query.match(regex);
      const value = match?.[1]?.trim();

      if (value) {
        return value;
      }
    }

    return undefined;
  }

  private inferAiSearchFilters(query: string): Partial<AiSearchFilters> {
    const normalized = this.normalizeText(query);
    const inferred: Partial<AiSearchFilters> = {};

    if (
      /\b(thue|cho thue|can thue|rent)\b/i.test(normalized) &&
      !/\b(ban|can ban|sale)\b/i.test(normalized)
    ) {
      inferred.demandType = PropertyDemandTypeEnum.RENT;
    } else if (/\b(ban|can mua|mua|sale)\b/i.test(normalized)) {
      inferred.demandType = PropertyDemandTypeEnum.SALE;
    }

    if (/\b(can ho|chung cu|apartment)\b/i.test(normalized)) {
      inferred.propertyType = PropertyTypeEnum.APARTMENT;
    } else if (/\b(nha pho|mat pho|street house)\b/i.test(normalized)) {
      inferred.propertyType = PropertyTypeEnum.STREET_HOUSE;
    } else if (/\b(biet thu|villa)\b/i.test(normalized)) {
      inferred.propertyType = PropertyTypeEnum.VILLA;
    } else if (/\b(dat|dat nen|land)\b/i.test(normalized)) {
      inferred.propertyType = PropertyTypeEnum.LAND;
    } else if (/\b(nha|house)\b/i.test(normalized)) {
      inferred.propertyType = PropertyTypeEnum.HOUSE;
    }

    const bedroomsMatch = normalized.match(
      /(\d+)\s*(phong ngu|pn|bedroom|bedrooms)\b/i,
    );
    if (bedroomsMatch) {
      inferred.minBedrooms = Number(bedroomsMatch[1]);
    }

    const bathroomsMatch = normalized.match(
      /(\d+)\s*(phong tam|wc|bathroom|bathrooms)\b/i,
    );
    if (bathroomsMatch) {
      inferred.minBathrooms = Number(bathroomsMatch[1]);
    }

    const minPriceMatch = normalized.match(
      /(tren|toi thieu|min|hon)\s*(\d+(?:[.,]\d+)?)\s*(ty|ti|trieu|tr|million|billion|vnd)\b/i,
    );
    if (minPriceMatch) {
      inferred.minPrice = this.moneyUnitToVnd(
        this.parseLocalizedNumber(minPriceMatch[2]),
        minPriceMatch[3],
      );
    }

    const maxPriceMatch = normalized.match(
      /(duoi|toi da|max|nho hon)\s*(\d+(?:[.,]\d+)?)\s*(ty|ti|trieu|tr|million|billion|vnd)\b/i,
    );
    if (maxPriceMatch) {
      inferred.maxPrice = this.moneyUnitToVnd(
        this.parseLocalizedNumber(maxPriceMatch[2]),
        maxPriceMatch[3],
      );
    }

    const rangePriceMatch = normalized.match(
      /tu\s*(\d+(?:[.,]\d+)?)\s*(ty|ti|trieu|tr|million|billion|vnd)\s*(?:den|toi|-)\s*(\d+(?:[.,]\d+)?)\s*(ty|ti|trieu|tr|million|billion|vnd)?/i,
    );
    if (rangePriceMatch) {
      const startUnit = rangePriceMatch[2];
      const endUnit = rangePriceMatch[4] || startUnit;
      inferred.minPrice = this.moneyUnitToVnd(
        this.parseLocalizedNumber(rangePriceMatch[1]),
        startUnit,
      );
      inferred.maxPrice = this.moneyUnitToVnd(
        this.parseLocalizedNumber(rangePriceMatch[3]),
        endUnit,
      );
    }

    const minAreaMatch = normalized.match(
      /(tren|toi thieu|min)\s*(\d+(?:[.,]\d+)?)\s*m2\b/i,
    );
    if (minAreaMatch) {
      inferred.minArea = this.parseLocalizedNumber(minAreaMatch[2]);
    }

    const maxAreaMatch = normalized.match(
      /(duoi|toi da|max)\s*(\d+(?:[.,]\d+)?)\s*m2\b/i,
    );
    if (maxAreaMatch) {
      inferred.maxArea = this.parseLocalizedNumber(maxAreaMatch[2]);
    }

    inferred.district = this.pickLocationToken(query, [
      "quận",
      "quan",
      "huyện",
      "huyen",
      "district",
    ]);
    inferred.ward = this.pickLocationToken(query, [
      "phường",
      "phuong",
      "xã",
      "xa",
      "ward",
    ]);
    inferred.province = this.pickLocationToken(query, [
      "thành phố",
      "thanh pho",
      "tp",
      "tỉnh",
      "tinh",
      "city",
      "province",
    ]);

    return inferred;
  }

  private mergeAiSearchFilters(
    inferred: Partial<AiSearchFilters>,
    explicit?: Partial<AiSearchFilters>,
  ) {
    const merged = {
      ...inferred,
      ...(explicit || {}),
    };

    if (explicit?.amenities?.length) {
      merged.amenities = explicit.amenities;
    }

    return merged;
  }

  private buildAiSearchMongoFilter(
    ids: string[],
    filters: Partial<AiSearchFilters>,
  ) {
    const objectIds = ids
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const filter: Record<string, any> = {
      _id: { $in: objectIds },
      status: PropertyStatusEnum.PUBLISHED,
    };

    if (filters.demandType) {
      filter.demandType = filters.demandType;
    }

    if (filters.propertyType) {
      filter.propertyType = filters.propertyType;
    }

    if (filters.province) {
      filter["location.province"] = {
        $regex: this.escapeRegex(filters.province),
        $options: "i",
      };
    }

    if (filters.district) {
      filter["location.district"] = {
        $regex: this.escapeRegex(filters.district),
        $options: "i",
      };
    }

    if (filters.ward) {
      filter["location.ward"] = {
        $regex: this.escapeRegex(filters.ward),
        $options: "i",
      };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filter["features.totalPrice"] = {};
      if (filters.minPrice !== undefined) {
        filter["features.totalPrice"].$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        filter["features.totalPrice"].$lte = filters.maxPrice;
      }
    }

    if (filters.minArea !== undefined || filters.maxArea !== undefined) {
      filter["features.area"] = {};
      if (filters.minArea !== undefined) {
        filter["features.area"].$gte = filters.minArea;
      }
      if (filters.maxArea !== undefined) {
        filter["features.area"].$lte = filters.maxArea;
      }
    }

    if (filters.minBedrooms !== undefined) {
      filter["features.bedrooms"] = { $gte: filters.minBedrooms };
    }

    if (filters.minBathrooms !== undefined) {
      filter["features.bathrooms"] = { $gte: filters.minBathrooms };
    }

    if (filters.amenities?.length) {
      filter.amenities = { $all: filters.amenities };
    }

    return filter;
  }

  private normalizeVectorScore(score: number) {
    return Math.max(0, Math.min(1, (score + 1) / 2));
  }

  private computeFilterScore(
    property: any,
    filters: Partial<AiSearchFilters>,
  ) {
    const reasons: string[] = [];
    let matched = 0;
    let total = 0;

    const normalizedProvince = this.normalizeText(
      property?.location?.province || "",
    );
    const normalizedDistrict = this.normalizeText(
      property?.location?.district || "",
    );
    const normalizedWard = this.normalizeText(property?.location?.ward || "");

    if (filters.demandType) {
      total += 1;
      if (property?.demandType === filters.demandType) {
        matched += 1;
        reasons.push(`Đúng nhu cầu ${filters.demandType === "RENT" ? "thuê" : "mua/bán"}`);
      }
    }

    if (filters.propertyType) {
      total += 1;
      if (property?.propertyType === filters.propertyType) {
        matched += 1;
        reasons.push("Đúng loại bất động sản");
      }
    }

    if (filters.province) {
      total += 1;
      if (normalizedProvince.includes(this.normalizeText(filters.province))) {
        matched += 1;
        reasons.push(`Đúng khu vực ${property.location?.province}`);
      }
    }

    if (filters.district) {
      total += 1;
      if (normalizedDistrict.includes(this.normalizeText(filters.district))) {
        matched += 1;
        reasons.push(`Đúng quận/huyện ${property.location?.district}`);
      }
    }

    if (filters.ward) {
      total += 1;
      if (normalizedWard.includes(this.normalizeText(filters.ward))) {
        matched += 1;
        reasons.push(`Đúng phường/xã ${property.location?.ward}`);
      }
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      total += 1;
      const totalPrice = Number(property?.features?.totalPrice);
      const minOk =
        filters.minPrice === undefined || totalPrice >= filters.minPrice;
      const maxOk =
        filters.maxPrice === undefined || totalPrice <= filters.maxPrice;
      if (Number.isFinite(totalPrice) && minOk && maxOk) {
        matched += 1;
        reasons.push("Mức giá phù hợp");
      }
    }

    if (filters.minArea !== undefined || filters.maxArea !== undefined) {
      total += 1;
      const area = Number(property?.features?.area);
      const minOk = filters.minArea === undefined || area >= filters.minArea;
      const maxOk = filters.maxArea === undefined || area <= filters.maxArea;
      if (Number.isFinite(area) && minOk && maxOk) {
        matched += 1;
        reasons.push("Diện tích phù hợp");
      }
    }

    if (filters.minBedrooms !== undefined) {
      total += 1;
      if (Number(property?.features?.bedrooms || 0) >= filters.minBedrooms) {
        matched += 1;
        reasons.push(`${property.features?.bedrooms || 0} phòng ngủ`);
      }
    }

    if (filters.minBathrooms !== undefined) {
      total += 1;
      if (Number(property?.features?.bathrooms || 0) >= filters.minBathrooms) {
        matched += 1;
        reasons.push(`${property.features?.bathrooms || 0} phòng tắm`);
      }
    }

    if (filters.amenities?.length) {
      total += 1;
      const amenities = new Set((property?.amenities || []).map(String));
      if (filters.amenities.every((item) => amenities.has(item))) {
        matched += 1;
        reasons.push("Đủ tiện ích yêu cầu");
      }
    }

    return {
      score: total > 0 ? matched / total : 0,
      reasons,
    };
  }

  private buildAiCandidateSummary(property: any) {
    return [
      `ID: ${property._id}`,
      property?.title ? `Tiêu đề: ${property.title}` : "",
      property?.propertyType ? `Loại: ${property.propertyType}` : "",
      property?.demandType ? `Giao dịch: ${property.demandType}` : "",
      property?.location
        ? `Vị trí: ${[
            property.location.address,
            property.location.ward,
            property.location.district,
            property.location.province,
          ]
            .filter(Boolean)
            .join(", ")}`
        : "",
      Number.isFinite(property?.features?.area)
        ? `Diện tích: ${property.features.area} m2`
        : "",
      Number.isFinite(property?.features?.price)
        ? `Giá: ${property.features.price} ${property.features?.currency || ""} ${property.features?.priceUnit || ""}`.trim()
        : "",
      Number.isFinite(property?.features?.bedrooms)
        ? `Phòng ngủ: ${property.features.bedrooms}`
        : "",
      Number.isFinite(property?.features?.bathrooms)
        ? `Phòng tắm: ${property.features.bathrooms}`
        : "",
      property?.features?.furniture
        ? `Nội thất: ${property.features.furniture}`
        : "",
      Array.isArray(property?.amenities) && property.amenities.length > 0
        ? `Tiện ích: ${property.amenities.join(", ")}`
        : "",
      property?.description ? `Mô tả: ${property.description}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  private parseModelJson<T>(text: string): T | null {
    const trimmed = text.trim();
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      return null;
    }

    try {
      return JSON.parse(trimmed.slice(start, end + 1)) as T;
    } catch {
      return null;
    }
  }

  private async rerankCandidatesWithModel(
    query: string,
    candidates: AiSearchCandidate[],
  ) {
    if (candidates.length === 0) {
      return candidates;
    }

    const modelName = ENV.PROPERTY_SEARCH_GEMINI_MODEL;
    const model = this.genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: [
        "You rerank Vietnamese real-estate search results.",
        "Return strict JSON only.",
        'Format: {"rankings":[{"propertyId":"string","relevanceScore":0.0,"reasons":["..."]}]}',
        "relevanceScore must be between 0 and 1.",
        "Reasons must be short Vietnamese phrases.",
        "Only include propertyIds from the provided candidate list.",
      ].join(" "),
    });

    const topCandidates = candidates.slice(0, 10);
    const prompt = [
      "Truy vấn người dùng:",
      query,
      "",
      "Ứng viên:",
      JSON.stringify(
        topCandidates.map((candidate) => ({
          propertyId: candidate.propertyId,
          vectorScore: Number(candidate.vectorScore.toFixed(4)),
          filterScore: Number(candidate.filterScore.toFixed(4)),
          summary: this.buildAiCandidateSummary(candidate.property),
        })),
      ),
      "",
      "Hãy sắp xếp lại theo mức độ phù hợp với truy vấn tìm nhà đất.",
    ].join("\n");

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
        },
      });

      const parsed = this.parseModelJson<{
        rankings?: Array<{
          propertyId: string;
          relevanceScore: number;
          reasons?: string[];
        }>;
      }>(result.response.text());

      if (!parsed?.rankings?.length) {
        return candidates;
      }

      const rankingMap = new Map(
        parsed.rankings.map((item) => [
          item.propertyId,
          {
            rerankScore: Math.max(
              0,
              Math.min(1, Number(item.relevanceScore || 0)),
            ),
            reasons:
              item.reasons?.filter(
                (reason) => typeof reason === "string" && reason.trim(),
              ) || [],
          },
        ]),
      );

      return candidates
        .map((candidate) => {
          const modelRank = rankingMap.get(candidate.propertyId);
          const rerankScore = modelRank?.rerankScore ?? candidate.rerankScore;
          const reasons = modelRank?.reasons?.length
            ? modelRank.reasons
            : candidate.reasons;

          return {
            ...candidate,
            rerankScore,
            reasons,
            finalScore:
              candidate.vectorScore * 0.35 +
              candidate.filterScore * 0.2 +
              rerankScore * 0.45,
          };
        })
        .sort((a, b) => b.finalScore - a.finalScore);
    } catch (error) {
      logger.error("[PropertyService] model rerank failed", {
        context: "PropertyService.rerankCandidatesWithModel",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return candidates;
    }
  }

  private async generateAiSearchAnswer(
    query: string,
    filters: Partial<AiSearchFilters>,
    results: AiSearchCandidate[],
  ) {
    if (results.length === 0) {
      return "Hiện chưa tìm thấy bất động sản phù hợp với yêu cầu này. Bạn có thể nới giá, khu vực hoặc số phòng để hệ thống tìm rộng hơn.";
    }

    const model = this.genAI.getGenerativeModel({
      model: ENV.PROPERTY_SEARCH_GEMINI_MODEL,
      systemInstruction: [
        "You are a Vietnamese real-estate search assistant.",
        "Answer in Vietnamese only.",
        "Keep the answer concise, factual, and under 120 words.",
        "Do not invent listing details.",
        "Mention why the top results match and suggest one refinement if useful.",
      ].join(" "),
    });

    const prompt = [
      `Yêu cầu tìm kiếm: ${query}`,
      `Bộ lọc áp dụng: ${JSON.stringify(filters)}`,
      "Top kết quả:",
      JSON.stringify(
        results.slice(0, 5).map((candidate) => ({
          propertyId: candidate.propertyId,
          title: candidate.property.title,
          district: candidate.property.location?.district,
          province: candidate.property.location?.province,
          price: candidate.property.features?.price,
          priceUnit: candidate.property.features?.priceUnit,
          bedrooms: candidate.property.features?.bedrooms,
          bathrooms: candidate.property.features?.bathrooms,
          reasons: candidate.reasons,
        })),
      ),
      "Hãy tóm tắt kết quả tốt nhất cho người dùng.",
    ].join("\n");

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 220,
        },
      });

      const answer = result.response.text().trim();
      return answer || "Đây là các bất động sản gần nhất với yêu cầu của bạn.";
    } catch (error) {
      logger.error("[PropertyService] answer generation failed", {
        context: "PropertyService.generateAiSearchAnswer",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return "Đây là các bất động sản gần nhất với yêu cầu của bạn, ưu tiên theo độ phù hợp ngữ nghĩa và bộ lọc đã chọn.";
    }
  }

  private async runAiSearch(
    input: AiSearchInput,
    withAnswer: boolean,
  ): Promise<AiSearchResponse> {
    const limit = Math.min(Math.max(Number(input.limit) || 8, 1), 20);
    const page = Math.max(Number(input.page) || 1, 1);
    const inferredFilters = this.inferAiSearchFilters(input.query);
    const appliedFilters = this.mergeAiSearchFilters(
      inferredFilters,
      input.filters,
    );
    const retrievalLimit = Math.min(Math.max(limit * page * 4, 20), 40);

    const retrieved = await this.qdrantService.searchPropertiesByQuery(
      input.query,
      retrievalLimit,
    );

    if (retrieved.length === 0) {
      return {
        query: input.query,
        appliedFilters,
        retrieval: {
          retrievedCandidates: 0,
          matchedCandidates: 0,
          rerankModel: ENV.PROPERTY_SEARCH_GEMINI_MODEL,
        },
        results: [],
        page,
        limit,
        totalPages: 0,
        totalResults: 0,
        answer: withAnswer
          ? "Hiện chưa có dữ liệu phù hợp để trả lời yêu cầu tìm kiếm này."
          : undefined,
      };
    }

    const mongoFilter = this.buildAiSearchMongoFilter(
      retrieved.map((item) => item.id),
      appliedFilters,
    );

    const properties = await PropertyModel.find(mongoFilter)
      .populate("userId", "fullName avatarUrl")
      .lean()
      .exec();

    const propertyMap = new Map(
      properties.map((property: any) => [property._id.toString(), property]),
    );

    const initialCandidates = retrieved
      .map((item) => {
        const property = propertyMap.get(item.id);
        if (!property) {
          return null;
        }

        const filterMatch = this.computeFilterScore(property, appliedFilters);
        const vectorScore = this.normalizeVectorScore(item.score);
        const rerankScore = vectorScore * 0.8 + filterMatch.score * 0.2;

        return {
          propertyId: item.id,
          property,
          vectorScore,
          filterScore: filterMatch.score,
          rerankScore,
          finalScore: vectorScore * 0.6 + filterMatch.score * 0.4,
          reasons:
            filterMatch.reasons.length > 0
              ? filterMatch.reasons
              : ["Phù hợp ngữ nghĩa với truy vấn"],
        } satisfies AiSearchCandidate;
      })
      .filter(Boolean) as AiSearchCandidate[];

    const rerankedCandidates = await this.rerankCandidatesWithModel(
      input.query,
      initialCandidates.sort((a, b) => b.finalScore - a.finalScore),
    );

    const totalResults = rerankedCandidates.length;
    const totalPages = Math.ceil(totalResults / limit);
    const startIndex = (page - 1) * limit;
    const pagedResults = rerankedCandidates.slice(startIndex, startIndex + limit);

    const response: AiSearchResponse = {
      query: input.query,
      appliedFilters,
      retrieval: {
        retrievedCandidates: retrieved.length,
        matchedCandidates: totalResults,
        rerankModel: ENV.PROPERTY_SEARCH_GEMINI_MODEL,
      },
      results: pagedResults.map((candidate) => ({
        property: candidate.property,
        vectorScore: Number(candidate.vectorScore.toFixed(4)),
        filterScore: Number(candidate.filterScore.toFixed(4)),
        rerankScore: Number(candidate.rerankScore.toFixed(4)),
        finalScore: Number(candidate.finalScore.toFixed(4)),
        reasons: candidate.reasons.slice(0, 3),
      })),
      page,
      limit,
      totalPages,
      totalResults,
    };

    if (withAnswer) {
      response.answer = await this.generateAiSearchAnswer(
        input.query,
        appliedFilters,
        rerankedCandidates,
      );
    }

    return response;
  }

  embedAndUpsertProperty = async (property: any) => {
    try {
      if (!property?._id) {
        return;
      }

      const textData = this.buildPropertyEmbeddingText(property);
      if (!textData) {
        return;
      }

      await this.qdrantQueue.enqueueUpsertPropertyEmbedding({
        propertyId: property._id.toString(),
        textData,
        payload: this.buildPropertyEmbeddingPayload(property),
      });
    } catch (error) {
      console.error("Failed to enqueue property embedding sync:", error);
    }
  };

  removePropertyEmbedding = async (propertyId: string) => {
    try {
      if (!propertyId) {
        return;
      }

      await this.qdrantQueue.enqueueDeletePropertyEmbedding({
        propertyId,
        operation: "DELETE",
      });
    } catch (error) {
      console.error("Failed to enqueue property embedding removal:", error);
    }
  };

  getPropertyById = async (
    id: string,
    populate?: string | PopulateOptions | (string | PopulateOptions)[],
    select?: string,
  ) => {
    const query = PropertyModel.findById(id);

    if (populate) {
      query.populate(Array.isArray(populate) ? populate : [populate]);
    }

    if (select) {
      query.select(select);
    }
    return query.lean().exec() as Promise<IProperty | null>;
  };

  updateProperty = async (id: string, updateData: Partial<IProperty>) => {
    const property = await PropertyModel.findById(id).exec();

    if (!property) {
      return null;
    }

    property.set(updateData);
    await property.save();

    return property.toObject();
  };

  deleteProperty = async (id: string) => {
    return await PropertyModel.findByIdAndDelete(id).lean().exec();
  };

  increaseViewCount = async (id: string, amount: number = 1) => {
    return await PropertyModel.findByIdAndUpdate(
      id,
      { $inc: { viewCount: amount } },
      { new: true },
    )
      .select("viewCount")
      .lean();
  };

  private buildSortObject(sortBy?: string) {
    const sortEntries = (sortBy || "createdAt:desc")
      .split(",")
      .map((sortOption) => sortOption.trim())
      .filter(Boolean)
      .map((sortOption) => {
        const [key, order] = sortOption.split(":");
        return [key, order === "desc" ? -1 : 1] as const;
      });

    if (!sortEntries.some(([field]) => field === "_id")) {
      sortEntries.push(["_id", -1]);
    }

    return Object.fromEntries(sortEntries);
  }

  private parsePopulateOptions(
    populate?: string,
  ): Array<string | PopulateOptions> {
    if (!populate) {
      return [];
    }

    return populate
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        if (item.includes(":")) {
          const [path, select] = item.split(":");
          return { path, select };
        }

        return item;
      });
  }

  private async getGeoFilteredProperties(
    options: GetPropertiesOptions,
    filter: Record<string, any>,
  ) {
    const geoSearch = filter.__geoSearch as GeoSearchOptions | undefined;
    if (!geoSearch) {
      return null;
    }

    const { __geoSearch, ...mongoFilter } = filter;
    const limit =
      options.limit && Number(options.limit) > 0 ? Number(options.limit) : 10;
    const page =
      options.page && Number(options.page) > 0 ? Number(options.page) : 1;
    const skip = (page - 1) * limit;
    const sort = this.buildSortObject(options.sortBy);

    const radiusKm = geoSearch.radiusKm > 0 ? geoSearch.radiusKm : 5;
    const latitudeDelta = radiusKm / 111.32;
    const safeCosine = Math.max(
      Math.cos((geoSearch.latitude * Math.PI) / 180),
      0.01,
    );
    const longitudeDelta = radiusKm / (111.32 * safeCosine);
    const centerLatitudeRadians = (geoSearch.latitude * Math.PI) / 180;
    const centerLongitudeRadians = (geoSearch.longitude * Math.PI) / 180;
    const sinCenterLatitude = Math.sin(centerLatitudeRadians);
    const cosCenterLatitude = Math.cos(centerLatitudeRadians);

    const geoMatch = {
      ...mongoFilter,
      "location.coordinates.lat": {
        $gte: geoSearch.latitude - latitudeDelta,
        $lte: geoSearch.latitude + latitudeDelta,
      },
      "location.coordinates.long": {
        $gte: geoSearch.longitude - longitudeDelta,
        $lte: geoSearch.longitude + longitudeDelta,
      },
    };

    const distanceExpression = {
      $multiply: [
        6371,
        {
          $acos: {
            $max: [
              -1,
              {
                $min: [
                  1,
                  {
                    $add: [
                      {
                        $multiply: [
                          {
                            $sin: {
                              $degreesToRadians:
                                "$location.coordinates.lat",
                            },
                          },
                          sinCenterLatitude,
                        ],
                      },
                      {
                        $multiply: [
                          {
                            $cos: {
                              $degreesToRadians:
                                "$location.coordinates.lat",
                            },
                          },
                          cosCenterLatitude,
                          {
                            $cos: {
                              $subtract: [
                                {
                                  $degreesToRadians:
                                    "$location.coordinates.long",
                                },
                                centerLongitudeRadians,
                              ],
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    };

    const basePipeline: mongoose.PipelineStage[] = [
      { $match: geoMatch },
      {
        $addFields: {
          distanceKm: distanceExpression,
        },
      },
      {
        $match: {
          distanceKm: { $lte: radiusKm },
        },
      },
    ];

    const [countResult, results] = await Promise.all([
      PropertyModel.aggregate([
        ...basePipeline,
        {
          $count: "totalResults",
        },
      ]).exec(),
      PropertyModel.aggregate([
        ...basePipeline,
        {
          $sort: sort,
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]).exec(),
    ]);

    const totalResults = countResult[0]?.totalResults || 0;
    const populateOptions = this.parsePopulateOptions(options.populate);
    let populatedResults = results;

    for (const populateOption of populateOptions) {
      populatedResults = await PropertyModel.populate(
        populatedResults,
        populateOption,
      );
    }

    return {
      results: populatedResults,
      page,
      limit,
      totalPages: Math.ceil(totalResults / limit),
      totalResults,
    };
  }

  getProperties = async (
    options: GetPropertiesOptions,
    filter: Record<string, any> = {},
    select?: string,
  ) => {
    const geoFilteredProperties = await this.getGeoFilteredProperties(
      options,
      filter,
    );

    if (geoFilteredProperties) {
      return geoFilteredProperties;
    }

    return await PropertyModel.paginate?.(options, filter, select);
  };

  count = async (filter: Record<string, any> = {}) => {
    return await PropertyModel.countDocuments(filter).exec();
  };

  getTotalViews = async (userId: string) => {
    const matchStage: any = {
      userId: new mongoose.Types.ObjectId(userId),
      status: "PUBLISHED",
    };

    const result = await PropertyModel.aggregate([
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: null,
          totalViews: {
            $sum: "$viewCount",
          },
        },
      },
    ]);
    return result[0]?.totalViews || 0;
  };

  recordView = async (
    propertyId: string,
    userId?: string,
    metadata: { ip?: string; userAgent?: string } = {},
  ) => {
    // 1. Create View Log
    await PropertyViewModel.create({
      propertyId,
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      ipAddress: metadata.ip,
      userAgent: metadata.userAgent,
    });

    // 2. Increase total view count
    await this.increaseViewCount(propertyId, 1);
  };

  recordInteraction = async (
    propertyId: string,
    type: InteractionType,
    userId?: string,
    metadata: any = {},
  ) => {
    return await PropertyInteractionModel.create({
      propertyId,
      type,
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      metadata,
    });
  };

  getViewsAnalytics = async (
    userId: string,
    groupBy: "day" | "month" | "year" = "day",
  ) => {
    // 1. Get user's properties
    const userProperties = await PropertyModel.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).select("_id");

    const propertyIds = userProperties.map((p) => p._id);

    // If no properties, return empty result
    if (propertyIds.length === 0) {
      return [];
    }

    let dateFormat = "%Y-%m-%d";
    if (groupBy === "month") dateFormat = "%Y-%m-%d"; // Daily in month
    if (groupBy === "year") dateFormat = "%Y-%m"; // Monthly in year

    const matchFilter: any = {
      propertyId: { $in: propertyIds },
    };

    const now = new Date();
    if (groupBy === "month") {
      // Last 30 days
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchFilter.createdAt = { $gte: last30Days };
    } else if (groupBy === "year") {
      // This year (Jan-Dec)
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      matchFilter.createdAt = { $gte: startOfYear };
    }

    const viewsData = await PropertyViewModel.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          views: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const leadsData = await PropertyInteractionModel.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          leads: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Merge data
    const mergedData = new Map();

    // Populate Views
    viewsData.forEach((item: any) => {
      mergedData.set(item._id, {
        label: item._id,
        views: item.views,
        leads: 0,
      });
    });

    // Populate/Merge Leads
    leadsData.forEach((item: any) => {
      if (mergedData.has(item._id)) {
        mergedData.get(item._id).leads = item.leads;
      } else {
        mergedData.set(item._id, {
          label: item._id,
          views: 0,
          leads: item.leads,
        });
      }
    });

    // Convert Map to sorted Array
    return Array.from(mergedData.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  };

  getRecommendedProperties = async (propertyId: string, limit: number = 4) => {
    try {
      // Find similar IDs from Qdrant
      const similarResults = await this.qdrantService.searchSimilarProperties(
        propertyId,
        limit,
      );

      const ids = similarResults.map((res) => res.id);

      if (ids.length === 0) {
        return [];
      }

      // Fetch actual property data from MongoDB
      const properties = await PropertyModel.find({
        _id: { $in: ids },
        status: "PUBLISHED",
      })
        .populate("userId", "fullName avatarUrl")
        .lean()
        .exec();

      // Keep the sorted order returned by Qdrant
      properties.sort(
        (a: any, b: any) =>
          ids.indexOf(a._id.toString()) - ids.indexOf(b._id.toString()),
      );

      return properties;
    } catch (error) {
      console.error(
        `Error fetching recommended properties for ${propertyId}:`,
        error,
      );
      return [];
    }
  };

  aiSearchProperties = async (input: AiSearchInput) => {
    return this.runAiSearch(input, false);
  };

  aiSearchPropertiesWithExplanation = async (input: AiSearchInput) => {
    return this.runAiSearch(input, true);
  };
}
