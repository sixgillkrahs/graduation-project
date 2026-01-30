import { Request } from "express";

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
          permissionIds: any[];
        };
        passwordHistories: {
          password: string;
          createdAt: Date;
        }[];
        createdAt: string;
        updatedAt: string;
      };
      requestId: string;
      io: Server;
    }
  }
}
