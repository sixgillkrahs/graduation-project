import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { PropertyService } from "@/services/property.service";
import { ApiRequest } from "@/utils/apiRequest";
import { PropertyStatusEnum } from "@/models/property.model";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";

export class PropertyController extends BaseController {
  constructor(private propertyService: PropertyService) {
    super();
  }

  createProperty = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      // Assuming req.user is populated by auth middleware
      const user = (req as any).user;
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

      const propertyData = {
        ...req.body,
        userId: user.userId,
        status: PropertyStatusEnum.PENDING, // Default status
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
      const property = await this.propertyService.getPropertyById(id);

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
}
