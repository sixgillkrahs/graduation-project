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

export class PropertyController extends BaseController {
  constructor(private propertyService: PropertyService) {
    super();
  }

  createProperty = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      // Assuming req.user is populated by auth middleware
      const user = req.user;
      if (!user || !user.userId) {
        const lang = ApiRequest.getCurrentLang(req);
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
        filters,
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

      const queryFilters = {
        ...filters,
        status: PropertyStatusEnum.PENDING,
      };

      // Transform filters if necessary (e.g., regex search for address)
      // For now pass filters directly, assuming they match model fields or processed later.
      // But typically req.query contains strings, so numbers need conversion if strict matching.
      // However, usually detailed filtering requires more parsing.
      // I'll leave basic filtering for now.

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
      const lang = ApiRequest.getCurrentLang(req);
      const property = await this.propertyService.getPropertyById(id, "userId");

      if (!property) {
        throw new AppError(
          lang === "vi" ? "Bất động sản không tồn tại" : "Property not found",
          404,
          ErrorCode.NOT_FOUND,
        );
      }
      return property;
    });
  };

  updateProperty = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const user = (req as any).user;
      const lang = ApiRequest.getCurrentLang(req);

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
            ? "Bạn không có quyền sửa tin này"
            : "Permission denied",
          403,
          ErrorCode.FORBIDDEN,
        );
      }

      const updatedProperty = await this.propertyService.updateProperty(
        id,
        req.body,
      );
      return updatedProperty;
    });
  };

  deleteProperty = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const user = (req as any).user;
      const lang = ApiRequest.getCurrentLang(req);

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
      const { status } = req.body;
      const lang = ApiRequest.getCurrentLang(req);

      const existingProperty = await this.propertyService.getPropertyById(id);
      if (!existingProperty) {
        throw new AppError(
          lang === "vi" ? "Bất động sản không tồn tại" : "Property not found",
          404,
          ErrorCode.NOT_FOUND,
        );
      }

      // Allow status to be PUBLISHED or REJECTED. Default to PUBLISHED if not provided.
      const targetStatus = status || PropertyStatusEnum.PUBLISHED;

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

      const updatedProperty = await this.propertyService.updateProperty(id, {
        status: targetStatus,
      });

      return updatedProperty;
    });
  };
}
