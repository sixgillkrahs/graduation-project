import { BaseController } from "./base.controller";
import { LandlordService } from "@/services/landlord.service";
import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";

export class LandlordController extends BaseController {
  constructor(private landlordService: LandlordService) {
    super();
  }

  getLandlords = (
    req: Request<
      {},
      {},
      {},
      {
        limit?: string;
        page?: string;
        sortField?: string;
        sortOrder?: string;
        search?: string;
      }
    >,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const { limit, page, sortField, sortOrder, search } = req.query;

      let filter: Record<string, any> = {};

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phoneNumber: { $regex: search, $options: "i" } },
        ];
      }

      const result = await this.landlordService.getLandlords(
        {
          page: Number(page) || 1,
          limit: Number(limit) || 10,
          sortBy: `${(sortField as string) || "createdAt"}:${(sortOrder as string) || "desc"}`,
        },
        filter,
      );

      return result;
    });
  };

  createLandlord = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { name, email, phoneNumber, address } = req.body;

      const landlord = await this.landlordService.createLandlord({
        name,
        email,
        phoneNumber,
        address,
      });

      return landlord;
    });
  };

  getLandlord = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params;

      let landlord = await this.landlordService.getLandlordById(id);

      if (!landlord) {
        throw new AppError("Landlord not found", 404, ErrorCode.NOT_FOUND);
      }

      return landlord;
    });
  };

  updateLandlord = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const updateData = req.body;
      const updatedLandlord = await this.landlordService.updateLandlord(
        id,
        updateData,
      );

      if (!updatedLandlord) {
        throw new AppError("Landlord not found", 404, ErrorCode.NOT_FOUND);
      }

      return updatedLandlord;
    });
  };

  deleteLandlord = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params;

      const deleted = await this.landlordService.deleteLandlord(id);
      if (!deleted) {
        throw new AppError("Landlord not found", 404, ErrorCode.NOT_FOUND);
      }

      return true;
    });
  };
}
