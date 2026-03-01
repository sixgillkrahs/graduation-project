import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { PropertyService } from "@/services/property.service";
import { ApiRequest } from "@/utils/apiRequest";
import {
  PropertyDirectionEnum,
  PropertyFurnitureEnum,
  PropertyLegalStatusEnum,
  PropertyStatusEnum,
} from "@/models/property.model";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";
import UserModel from "@/models/user.model";
import { NoticeService } from "@/services/notice.service";
import { NoticeTypeEnum } from "@/models/notice.model";
import { redisConnection } from "@/config/redis.connection";
import { PropertyInteractionService } from "@/services/property-interaction.service";
import { InteractionType } from "@/models/property-interaction.model";

export class PropertyController extends BaseController {
  constructor(
    private propertyService: PropertyService,
    private noticeService: NoticeService,
    private propertyInteractionService: PropertyInteractionService,
  ) {
    super();
  }

  /**
   * Parse custom filter params into MongoDB queries.
   * Handles: minBedrooms, minBathrooms, maxPrice, query (text search)
   */
  private parseFilters(filters: Record<string, any>): Record<string, any> {
    const parsed = { ...filters };

    if (parsed.minBedrooms) {
      parsed["features.bedrooms"] = { $gte: Number(parsed.minBedrooms) };
      delete parsed.minBedrooms;
    }

    if (parsed.minBathrooms) {
      parsed["features.bathrooms"] = { $gte: Number(parsed.minBathrooms) };
      delete parsed.minBathrooms;
    }

    if (parsed.maxPrice) {
      parsed["features.totalPrice"] = {
        $lte: Number(parsed.maxPrice) * 1_000_000_000,
      };
      delete parsed.maxPrice;
    }

    // Text search across multiple fields
    if (parsed.query) {
      const searchRegex = { $regex: parsed.query, $options: "i" };
      parsed["$or"] = [
        { title: searchRegex },
        { "location.address": searchRegex },
        { "location.province": searchRegex },
        { "location.district": searchRegex },
        { "location.ward": searchRegex },
        { projectName: searchRegex },
      ];
      delete parsed.query;
    }

    return parsed;
  }

  createProperty = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      // Assuming req.user is populated by auth middleware
      const user = req.user;
      if (!user || !user.userId) {
        const lang = req.lang;
        throw new AppError(
          lang === "vi"
            ? "Bạn cần đăng nhập để thực hiện chức năng này"
            : "You need to login",
          401,
          ErrorCode.UNAUTHORIZED,
        );
      }

      const body = req.body;
      const getDirection = (val: string) => {
        const map: Record<string, any> = {
          NORTH: PropertyDirectionEnum.NORTH,
          SOUTH: PropertyDirectionEnum.SOUTH,
          EAST: PropertyDirectionEnum.EAST,
          WEST: PropertyDirectionEnum.WEST,
          NORTH_EAST: PropertyDirectionEnum.NORTH_EAST,
          NORTH_WEST: PropertyDirectionEnum.NORTH_WEST,
          SOUTH_EAST: PropertyDirectionEnum.SOUTH_EAST,
          SOUTH_WEST: PropertyDirectionEnum.SOUTH_WEST,
        };
        return map[val] || undefined;
      };

      const getLegalStatus = (val: string) => {
        const map: Record<string, any> = {
          PINK_BOOK: PropertyLegalStatusEnum.PINK_BOOK,
          RED_BOOK: PropertyLegalStatusEnum.RED_BOOK,
          SALE_CONTRACT: PropertyLegalStatusEnum.SALE_CONTRACT,
          WAITING: PropertyLegalStatusEnum.WAITING,
          OTHER: PropertyLegalStatusEnum.OTHER,
        };
        return map[val] || undefined;
      };

      const getFurniture = (val: string) => {
        const map: Record<string, any> = {
          FULL: PropertyFurnitureEnum.FULL,
          BASIC: PropertyFurnitureEnum.BASIC,
          EMPTY: PropertyFurnitureEnum.EMPTY,
        };
        return map[val] || undefined;
      };

      const propertyData = {
        userId: user.userId._id as any,
        demandType: body.demandType,
        title: body.title,
        propertyType: body.propertyType,
        projectName: body.projectName,
        location: {
          province: body.province,
          ward: body.ward,
          district: "", // Optional in model now
          address: body.address,
          hideAddress: false,
          coordinates: {
            lat: Number(body.latitude) || 0,
            long: Number(body.longitude) || 0,
          },
        },
        features: {
          area: Number(body.area),
          price: Number(body.price),
          priceUnit: "MILLION" as any, // Default or derived
          bedrooms: Number(body.bedrooms) || 0,
          bathrooms: Number(body.bathrooms) || 0,
          direction: getDirection(body.direction),
          legalStatus: getLegalStatus(body.legalStatus),
          furniture: getFurniture(body.furniture),
        },
        media: {
          images: body.images || [],
          thumbnail: body?.thumbnail || "",
          video: body?.video || "",
          virtualTourUrls: body?.virtualTourUrls || [],
        },
        amenities: body.amenities || [],
        description: body.description || "No description",
        status: PropertyStatusEnum.PENDING,
        viewCount: 0,
      };

      const property = await this.propertyService.createProperty(propertyData);
      return property;
    });
  };

  getProperties = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { limit, page, sortField, sortOrder, ...filters } = req.query;

      const options = {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        sortBy: `${(sortField as string) || "createdAt"}:${(sortOrder as string) || "desc"}`,
        populate: "userId", // Populate owner info if needed
      };

      // Transform filters if necessary (e.g., regex search for address)
      // For now pass filters directly, assuming they match model fields or processed later.
      // But typically req.query contains strings, so numbers need conversion if strict matching.
      // However, usually detailed filtering requires more parsing.
      // I'll leave basic filtering for now.

      const properties = await this.propertyService.getProperties(
        options,
        this.parseFilters(filters as Record<string, any>),
      );
      return properties;
    });
  };

  getPendingProperties = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { limit, page, sortField, sortOrder, ...filters } = req.query;

      const options = {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        sortBy: `${(sortField as string) || "createdAt"}:${(sortOrder as string) || "desc"}`,
        populate: "userId", // Populate owner info if needed
      };

      // Handle user search
      const userFilter: any = {};
      if (filters["userId.fullName"]) {
        userFilter.fullName = {
          $regex: filters["userId.fullName"],
          $options: "i",
        };
        delete filters["userId.fullName"];
      }
      if (filters["userId.phone"]) {
        userFilter.phone = { $regex: filters["userId.phone"], $options: "i" };
        delete filters["userId.phone"];
      }

      // If filters come as object (extended query parser behavior for userId[fullName]) or simple dot notation
      if (filters.userId && typeof filters.userId === "object") {
        const uFilters = filters.userId as any;
        if (uFilters.fullName)
          userFilter.fullName = { $regex: uFilters.fullName, $options: "i" };
        if (uFilters.phone)
          userFilter.phone = { $regex: uFilters.phone, $options: "i" };
        delete filters.userId;
      }

      if (Object.keys(userFilter).length > 0) {
        const users = await UserModel.find(userFilter).select("_id");
        const userIds = users.map((u: any) => u._id);
        (filters as any).userId = { $in: userIds };
      }

      const queryFilters = {
        ...filters,
        status: PropertyStatusEnum.PENDING,
      };

      const properties = await this.propertyService.getProperties(
        options,
        queryFilters,
      );
      return properties;
    });
  };

  getPublishedProperties = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const { limit, page, sortField, sortOrder, ...filters } = req.query;

      const options = {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        sortBy: `${(sortField as string) || "createdAt"}:${(sortOrder as string) || "desc"}`,
        populate: "userId", // Populate owner info if needed
      };

      // Handle user search
      const userFilter: any = {};
      if (filters["userId.fullName"]) {
        userFilter.fullName = {
          $regex: filters["userId.fullName"],
          $options: "i",
        };
        delete filters["userId.fullName"];
      }
      if (filters["userId.phone"]) {
        userFilter.phone = { $regex: filters["userId.phone"], $options: "i" };
        delete filters["userId.phone"];
      }

      // If filters come as object (extended query parser behavior for userId[fullName]) or simple dot notation
      if (filters.userId && typeof filters.userId === "object") {
        const uFilters = filters.userId as any;
        if (uFilters.fullName)
          userFilter.fullName = { $regex: uFilters.fullName, $options: "i" };
        if (uFilters.phone)
          userFilter.phone = { $regex: uFilters.phone, $options: "i" };
        delete filters.userId;
      }

      if (Object.keys(userFilter).length > 0) {
        const users = await UserModel.find(userFilter).select("_id");
        const userIds = users.map((u: any) => u._id);
        (filters as any).userId = { $in: userIds };
      }

      const queryFilters = {
        ...filters,
        status: PropertyStatusEnum.PUBLISHED,
      };

      const properties = await this.propertyService.getProperties(
        options,
        queryFilters,
      );
      return properties;
    });
  };

  getRejectedProperties = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { limit, page, sortField, sortOrder, ...filters } = req.query;

      const options = {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        sortBy: `${(sortField as string) || "createdAt"}:${(sortOrder as string) || "desc"}`,
        populate: "userId", // Populate owner info if needed
      };

      // Handle user search
      const userFilter: any = {};
      if (filters["userId.fullName"]) {
        userFilter.fullName = {
          $regex: filters["userId.fullName"],
          $options: "i",
        };
        delete filters["userId.fullName"];
      }
      if (filters["userId.phone"]) {
        userFilter.phone = { $regex: filters["userId.phone"], $options: "i" };
        delete filters["userId.phone"];
      }

      // If filters come as object (extended query parser behavior for userId[fullName]) or simple dot notation
      if (filters.userId && typeof filters.userId === "object") {
        const uFilters = filters.userId as any;
        if (uFilters.fullName)
          userFilter.fullName = { $regex: uFilters.fullName, $options: "i" };
        if (uFilters.phone)
          userFilter.phone = { $regex: uFilters.phone, $options: "i" };
        delete filters.userId;
      }

      if (Object.keys(userFilter).length > 0) {
        const users = await UserModel.find(userFilter).select("_id");
        const userIds = users.map((u: any) => u._id);
        (filters as any).userId = { $in: userIds };
      }

      const queryFilters = {
        ...filters,
        status: PropertyStatusEnum.REJECTED,
      };

      const properties = await this.propertyService.getProperties(
        options,
        queryFilters,
      );
      return properties;
    });
  };

  getMyProperties = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const user = (req as any).user;
      if (!user || !user.userId) {
        throw new AppError("Unauthorized", 401, ErrorCode.UNAUTHORIZED);
      }

      const { limit, page, sortField, sortOrder, ...filters } = req.query;

      const options = {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        sortBy: `${(sortField as string) || "createdAt"}:${(sortOrder as string) || "desc"}`,
        populate: "userId",
      };

      // Enforce userId filter
      const queryFilters = {
        ...filters,
        userId: user.userId,
      };

      const properties = await this.propertyService.getProperties(
        options,
        queryFilters,
      );
      return properties;
    });
  };

  getPropertyById = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const lang = req.lang;
      const property = await this.propertyService.getPropertyById(id, "userId");

      if (!property) {
        throw new AppError(
          lang === "vi" ? "Bất động sản không tồn tại" : "Property not found",
          404,
          ErrorCode.NOT_FOUND,
        );
      }

      // // Record View
      // const user = (req as any).user;
      // const ip = req.ip || req.socket.remoteAddress;
      // const userAgent = req.get("User-Agent");
      // const cacheKey = `view:${ip}:${id}`;
      // const cached = await redisConnection.get(cacheKey);
      // if (cached) {
      //   return property;
      // }
      // await redisConnection.set(cacheKey, "1", "EX", 30 * 60);

      // // Non-blocking call to record view
      // this.propertyService.recordView(id, user?.userId, {
      //   ip: typeof ip === "string" ? ip : "",
      //   userAgent,
      // });

      return property;
    });
  };

  updateProperty = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const user = req.user;
      const lang = req.lang;

      // Check ownership
      const existingProperty = await this.propertyService.getPropertyById(id);
      if (!existingProperty) {
        throw new AppError(
          lang === "vi" ? "Bất động sản không tồn tại" : "Property not found",
          404,
          ErrorCode.NOT_FOUND,
        );
      }

      if (existingProperty.userId.toString() !== user.userId._id.toString()) {
        throw new AppError(
          lang === "vi"
            ? "Bạn không có quyền sửa tin này"
            : "Permission denied",
          403,
          ErrorCode.FORBIDDEN,
        );
      }

      const body = req.body;
      const getDirection = (val: string) => {
        const map: Record<string, any> = {
          NORTH: PropertyDirectionEnum.NORTH,
          SOUTH: PropertyDirectionEnum.SOUTH,
          EAST: PropertyDirectionEnum.EAST,
          WEST: PropertyDirectionEnum.WEST,
          NORTH_EAST: PropertyDirectionEnum.NORTH_EAST,
          NORTH_WEST: PropertyDirectionEnum.NORTH_WEST,
          SOUTH_EAST: PropertyDirectionEnum.SOUTH_EAST,
          SOUTH_WEST: PropertyDirectionEnum.SOUTH_WEST,
        };
        return map[val] || existingProperty.features?.direction;
      };

      const getLegalStatus = (val: string) => {
        const map: Record<string, any> = {
          PINK_BOOK: PropertyLegalStatusEnum.PINK_BOOK,
          RED_BOOK: PropertyLegalStatusEnum.RED_BOOK,
          SALE_CONTRACT: PropertyLegalStatusEnum.SALE_CONTRACT,
          WAITING: PropertyLegalStatusEnum.WAITING,
          OTHER: PropertyLegalStatusEnum.OTHER,
        };
        return map[val] || existingProperty.features?.legalStatus;
      };

      const getFurniture = (val: string) => {
        const map: Record<string, any> = {
          FULL: PropertyFurnitureEnum.FULL,
          BASIC: PropertyFurnitureEnum.BASIC,
          EMPTY: PropertyFurnitureEnum.EMPTY,
        };
        return map[val] || existingProperty.features?.furniture;
      };

      const propertyData = {
        demandType: body.demandType || existingProperty.demandType,
        title: body.title || existingProperty.title,
        propertyType: body.propertyType || existingProperty.propertyType,
        projectName: body.projectName ?? existingProperty.projectName,
        location: {
          province: body.province || existingProperty.location?.province,
          ward: body.ward || existingProperty.location?.ward,
          district: "", // Optional in model now
          address: body.address || existingProperty.location?.address,
          hideAddress: false,
          coordinates: {
            lat:
              Number(body.latitude) ||
              existingProperty.location?.coordinates?.lat ||
              0,
            long:
              Number(body.longitude) ||
              existingProperty.location?.coordinates?.long ||
              0,
          },
        },
        features: {
          area: Number(body.area) || existingProperty.features?.area,
          price: Number(body.price) || existingProperty.features?.price,
          priceUnit: "MILLION" as any, // Default or derived
          bedrooms:
            Number(body.bedrooms) || existingProperty.features?.bedrooms || 0,
          bathrooms:
            Number(body.bathrooms) || existingProperty.features?.bathrooms || 0,
          direction: getDirection(body.direction),
          legalStatus: getLegalStatus(body.legalStatus),
          furniture: getFurniture(body.furniture),
        },
        media: {
          images: body.images || existingProperty.media?.images || [],
          thumbnail: body?.thumbnail || existingProperty.media?.thumbnail || "",
          videoLink: body?.videoLink || existingProperty.media?.videoLink || "",
          virtualTourUrls:
            body?.virtualTourUrls ||
            existingProperty.media?.virtualTourUrls ||
            [],
        },
        amenities: body.amenities || existingProperty.amenities || [],
        description: body.description ?? existingProperty.description,
        status: PropertyStatusEnum.PENDING, // Always return to pending queue after someone edits
        rejectReason: "", // clear out any old rejection notice
      };

      const updatedProperty = await this.propertyService.updateProperty(
        id,
        propertyData,
      );
      return updatedProperty;
    });
  };

  deleteProperty = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const user = (req as any).user;
      const lang = req.lang;

      // Check ownership
      const existingProperty = await this.propertyService.getPropertyById(id);
      if (!existingProperty) {
        throw new AppError(
          lang === "vi" ? "Bất động sản không tồn tại" : "Property not found",
          404,
          ErrorCode.NOT_FOUND,
        );
      }

      if (existingProperty.userId.toString() !== user.userId) {
        throw new AppError(
          lang === "vi"
            ? "Bạn không có quyền xóa tin này"
            : "Permission denied",
          403,
          ErrorCode.FORBIDDEN,
        );
      }

      await this.propertyService.deleteProperty(id);
      return { success: true };
    });
  };

  approveProperty = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const { note } = req.body;
      const lang = req.lang;

      const existingProperty = await this.propertyService.getPropertyById(id);
      if (!existingProperty) {
        throw new AppError(
          lang === "vi" ? "Bất động sản không tồn tại" : "Property not found",
          404,
          ErrorCode.NOT_FOUND,
        );
      }

      // Allow status to be PUBLISHED or REJECTED. Default to PUBLISHED if not provided.
      const targetStatus = PropertyStatusEnum.PUBLISHED;

      if (
        ![PropertyStatusEnum.PUBLISHED, PropertyStatusEnum.REJECTED].includes(
          targetStatus,
        )
      ) {
        throw new AppError(
          lang === "vi" ? "Trạng thái không hợp lệ" : "Invalid status",
          400,
          ErrorCode.INVALID_INPUT,
        );
      }

      await this.propertyService.updateProperty(id, {
        status: targetStatus,
        adminNote: note,
      });

      // Embed property into Qdrant after approval
      this.propertyService.embedAndUpsertProperty(existingProperty);

      const io = req.io;
      if (io) {
        const ownerId = existingProperty.userId;
        const roomName = ownerId.toString();

        io.to(roomName).emit("property_status_update", {
          message: `Your property "${existingProperty.projectName || "Listing"}" has been approved!`,
          propertyId: id,
          status: targetStatus,
          timestamp: new Date().toISOString(),
        });

        await this.noticeService.createNotice({
          userId: ownerId,
          type: NoticeTypeEnum.PROPERTY,
          content: `Your property "${existingProperty.projectName || "Listing"}" has been approved!`,
          isRead: false,
          title: "Property approved",
        });
      } else {
        console.error(
          "[ApproveProperty] Socket IO instance missing on request",
        );
      }

      return "success";
    });
  };

  rejectProperty = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const { reason } = req.body;
      const lang = req.lang;

      const existingProperty = await this.propertyService.getPropertyById(id);
      if (!existingProperty) {
        throw new AppError(
          lang === "vi" ? "Bất động sản không tồn tại" : "Property not found",
          404,
          ErrorCode.NOT_FOUND,
        );
      }

      // Allow status to be PUBLISHED or REJECTED. Default to PUBLISHED if not provided.
      const targetStatus = PropertyStatusEnum.REJECTED;

      if (
        ![PropertyStatusEnum.PENDING, PropertyStatusEnum.REJECTED].includes(
          targetStatus,
        )
      ) {
        throw new AppError(
          lang === "vi" ? "Trạng thái không hợp lệ" : "Invalid status",
          400,
          ErrorCode.INVALID_INPUT,
        );
      }

      await this.propertyService.updateProperty(id, {
        status: targetStatus,
        rejectReason: reason,
      });

      const io = req.io;
      if (io) {
        const ownerId = existingProperty.userId;
        const roomName = ownerId.toString();

        io.to(roomName).emit("property_status_update", {
          message: `Your property "${existingProperty.projectName || "Listing"}" has been rejected. Reason: ${reason}`,
          propertyId: id,
          status: targetStatus,
          timestamp: new Date().toISOString(),
        });

        await this.noticeService.createNotice({
          userId: ownerId,
          type: NoticeTypeEnum.PROPERTY,
          content: `Your property "${existingProperty.projectName || "Listing"}" has been rejected.`,
          isRead: false,
          title: "Property rejected",
          metadata: {
            propertyId: id,
            status: targetStatus,
            timestamp: new Date().toISOString(),
            rejectReason: reason,
          },
        });
      } else {
        console.error(
          "[ApproveProperty] Socket IO instance missing on request",
        );
      }

      return "success";
    });
  };

  getOnSaleProperties = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { limit, page, sortField, sortOrder, ...filters } = req.query;
      const lang = req.lang;
      const user = (req as any).user;

      const options = {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 9,
        sortBy: `${(sortField as string) || "createdAt"}:${(sortOrder as string) || "desc"}`,
        populate: "userId", // Populate owner info if needed
      };

      const filterQuery = {
        ...this.parseFilters(filters as Record<string, any>),
        status: PropertyStatusEnum.PUBLISHED,
      };

      // Transform filters if necessary (e.g., regex search for address)
      // For now pass filters directly, assuming they match model fields or processed later.
      // But typically req.query contains strings, so numbers need conversion if strict matching.
      // However, usually detailed filtering requires more parsing.
      // I'll leave basic filtering for now.

      const properties = (await this.propertyService.getProperties(
        options,
        filterQuery,
      )) as any;

      let favoritedPropertyIds = new Set<string>();
      if (user && properties.results && properties.results.length > 0) {
        const propertyIds = properties.results.map(
          (p: any) => p._id || p.id,
        ) as string[];
        const userId = user.userId._id
          ? user.userId._id.toString()
          : user.userId.toString();
        const interactions =
          await this.propertyInteractionService.getLatestInteractionsForUser(
            userId,
            propertyIds,
            InteractionType.FAVORITE,
          );

        interactions.forEach((i: any) => {
          if (
            i.latestInteraction &&
            i.latestInteraction.metadata?.action !== "UNSAVE"
          ) {
            favoritedPropertyIds.add(i._id.toString());
          }
        });
      }

      const resultsWithFavorite = properties.results
        ? properties.results.map((p: any) => {
            const doc = p.toObject ? p.toObject() : p;
            return {
              ...doc,
              isFavorite: favoritedPropertyIds.has(doc._id.toString()),
            };
          })
        : [];

      return { ...properties, results: resultsWithFavorite };
    });
  };

  incrementViewProperty = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const user = (req as any).user;
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.get("User-Agent");
      const cacheKey = `view:${ip}:${id}`;
      const cached = await redisConnection.get(cacheKey);
      if (cached) {
        return;
      }
      await redisConnection.set(cacheKey, "1", "EX", 30 * 60);

      // Non-blocking call to record view
      this.propertyService.recordView(id, user?.userId?._id?.toString(), {
        ip: typeof ip === "string" ? ip : "",
        userAgent,
      });
      return true;
    });
  };

  recordInteraction = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const { type, metadata } = req.body;
      const user = (req as any).user;

      return await this.propertyService.recordInteraction(
        id,
        type,
        user?.userId?._id?.toString(),
        metadata,
      );
    });
  };

  getPropertyForLandingPage = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const lang = req.lang;
      const user = (req as any).user;
      const property = await this.propertyService.getPropertyById(id, "userId");
      if (!property) {
        throw new AppError(
          lang === "vi" ? "Bất động sản không tồn tại" : "Property not found",
          404,
          ErrorCode.NOT_FOUND,
        );
      }
      const interactions =
        await this.propertyInteractionService.getInteractions(
          id,
          InteractionType.FAVORITE,
          user?.userId?._id?.toString(),
        );

      const latestInteraction = interactions[0];
      const isFavorite =
        !!latestInteraction && latestInteraction.metadata?.action !== "UNSAVE";

      return {
        ...property,
        isFavorite,
      };
    });
  };

  /**
   * Get all favorite properties for the current user.
   * This endpoint is called from the landing page.
   */
  getFavoriteProperties = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const user = req.user;

      const userId = user.userId._id.toString();

      // 1. Get all currently-favorited property IDs
      const favoritePropertyIds =
        await this.propertyInteractionService.getFavoritePropertyIdsForUser(
          userId,
        );

      if (favoritePropertyIds.length === 0) {
        return {
          results: [],
          page: 1,
          limit: 10,
          totalPages: 0,
          totalResults: 0,
        };
      }

      const { limit, page, sortField, sortOrder, ...filters } = req.query;

      const options = {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        sortBy: `${(sortField as string) || "createdAt"}:${(sortOrder as string) || "desc"}`,
        populate: "userId",
      };

      const filter = {
        ...this.parseFilters(filters as Record<string, any>),
        _id: { $in: favoritePropertyIds },
        status: PropertyStatusEnum.PUBLISHED,
      };

      const properties = (await this.propertyService.getProperties(
        options,
        filter,
      )) as any;

      // Mark all as favorite since they come from the favorites list
      const resultsWithFavorite = properties.results
        ? properties.results.map((p: any) => {
            const doc = p.toObject ? p.toObject() : p;
            return {
              ...doc,
              isFavorite: true,
            };
          })
        : [];

      return { ...properties, results: resultsWithFavorite };
    });
  };

  getRecommendedProperties = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const limit = Number(req.query.limit) || 4;
      const lang = req.lang;

      const properties = await this.propertyService.getRecommendedProperties(
        id,
        limit,
      );

      return properties;
    });
  };
}
