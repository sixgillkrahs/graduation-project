import { LocationService } from "@/services/location.service";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";
import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";

export class LocationController extends BaseController {
  constructor(private locationService: LocationService) {
    super();
  }

  search = async (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const query = String(req.query.q || "").trim();
      const lang = String(req.query.lang || "").trim() || undefined;
      const limit = this.parseOptionalNumber(req.query.limit);
      const lat = this.parseOptionalNumber(req.query.lat);
      const lng = this.parseOptionalNumber(req.query.lng);

      return this.locationService.searchLocations(query, {
        limit,
        lat,
        lng,
        lang,
      });
    });
  };

  reverse = async (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const lat = this.parseRequiredNumber(req.query.lat, "lat");
      const lng = this.parseRequiredNumber(req.query.lng, "lng");
      const lang = req.lang || undefined;

      return this.locationService.reverseGeocode({
        lat,
        lng,
        lang,
      });
    });
  };

  getProvinces = async (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      return {
        results: await this.locationService.getProvinceOptions(),
      };
    });
  };

  getLocalUnits = async (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const provinceCode = this.parseRequiredNumber(
        req.query.provinceCode,
        "provinceCode",
      );

      return {
        results: await this.locationService.getLocalUnitOptions(provinceCode),
      };
    });
  };

  private parseOptionalNumber(value: unknown) {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      throw new AppError(
        "Invalid query parameter",
        400,
        ErrorCode.INVALID_INPUT,
      );
    }

    return parsed;
  }

  private parseRequiredNumber(value: unknown, fieldName: string) {
    const parsed = this.parseOptionalNumber(value);
    if (parsed === undefined) {
      throw new AppError(
        `${fieldName} is required`,
        400,
        ErrorCode.MISSING_REQUIRED_FIELD,
      );
    }

    return parsed;
  }
}
