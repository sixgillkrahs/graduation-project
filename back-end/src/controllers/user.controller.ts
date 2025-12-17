import { UserService } from "@/services/user.service";
import { BaseController } from "./base.controller";
import { NextFunction, Request, Response } from "express";

export class UserController extends BaseController {
  constructor(private userService: UserService) {
    super();
  }

  createUser = (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (error) {
      throw error;
    }
  };
}
