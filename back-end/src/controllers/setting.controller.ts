import { SettingService } from "@/services/setting.service";
import type { IGeneralSettingsInput } from "@/models/setting.model";
import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";

export class SettingController extends BaseController {
  constructor(private settingService: SettingService) {
    super();
  }

  getPublicGeneralSettings = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      return this.settingService.getGeneralSettings();
    });
  };

  getGeneralSettings = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      return this.settingService.getGeneralSettings();
    });
  };

  updateGeneralSettings = async (
    req: Request<{}, {}, IGeneralSettingsInput>,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      return this.settingService.updateGeneralSettings(req.body);
    });
  };
}
