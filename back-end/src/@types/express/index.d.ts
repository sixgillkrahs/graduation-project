import { Request } from "express";
import { Operation } from "@/models/permission.model";

declare global {
  namespace Express {
    interface Request {
      user: {
        _id: string;
        username: string;
        password: string;
        userId: {
          _id: string;
          email: string;
          fullName: string;
          phone: string;
          isActive: boolean;
          avatarUrl: string;
        };
        roleId: {
          _id: string;
          name: string;
          code: string;
          permissionIds: Array<{
            _id: string;
            operation: Operation;
            isActive?: boolean;
            resourceId?: {
              _id: string;
              path?: string;
            };
          }>;
        };
        passwordHistories: {
          password: string;
          createdAt: Date;
        }[];
        createdAt: string;
        updatedAt: string;
      };
      requestId: string;
      lang: keyof typeof import("../../i18n/validationMessages").validationMessages;
      io: Server;
    }
  }
}
