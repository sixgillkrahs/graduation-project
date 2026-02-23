import { PermissionService } from "@/services/permission.service";
import { RoleService } from "@/services/role.service";
import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { IRole } from "@/models/role.model";
import { IPermission } from "@/models/permission.model";
import { logger } from "@/config/logger";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";
import { ApiRequest } from "@/utils/apiRequest";

export class RoleController extends BaseController {
  constructor(
    private roleService: RoleService,
    private permissionService: PermissionService,
  ) {
    super();
  }

  createRole = async (
    req: Request<
      {},
      {},
      {
        name: string;
        code: string;
        permissionIds: string[];
        description?: string;
        isActive?: boolean;
        isDefault?: boolean;
      }
    >,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const { name, permissionIds, description, isActive, isDefault, code } =
        req.body;
      const permissionList: IPermission[] =
        await this.permissionService.checkPermissionList(permissionIds);
      if (permissionList.length !== permissionIds.length) {
        throw new Error("Some permissions are not found");
      }
      const roleModel: IRole = {
        name,
        code,
        permissionIds: permissionList.map((item) => item._id!),
        description,
        isActive: isActive ?? true,
        isDefault: isDefault ?? false,
      };
      return await this.roleService.createRole(roleModel);
    });
  };

  getRoles = async (
    req: Request<
      {},
      {},
      {},
      {
        limit?: string;
        page?: string;
        sortField?: string;
        sortOrder?: string;
        name?: string;
        isActive?: string;
      }
    >,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      try {
        const { limit, page, sortField, sortOrder, name, isActive } = req.query;

        let filter: Record<string, any> = {};
        if (name) {
          filter.name = { $regex: name, $options: "i" };
        }
        if (isActive !== undefined) {
          filter.isActive = isActive;
        }

        const role = await this.roleService.getRolePaginated(
          {
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            sortBy: `${(sortField as string) || "createdAt"}:${(sortOrder as string) || "desc"}`,
            // populate: "permissionIds:id name",
          },
          filter,
          "id name code isActive isDefault isSystem createdAt updatedAt",
        );
        return role;
      } catch (error) {
        logger.error("Error in getRoles", error);
        throw error;
      }
    });
  };

  updateRole = async (
    req: Request<
      { id: string },
      {},
      {
        name: string;
        permissionIds: string[];
        description?: string;
        isActive?: boolean;
        isDefault?: boolean;
      }
    >,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const lang = req.lang;
      const { id } = req.params;
      const { name, permissionIds, description, isActive, isDefault } =
        req.body;
      const permissionList: IPermission[] =
        await this.permissionService.checkPermissionList(permissionIds);
      if (permissionList.length !== permissionIds.length) {
        throw new Error("Some permissions are not found");
      }
      const role = await this.roleService.getRoleById(id);
      if (role == null) {
        throw new AppError(
          lang === "vi" ? "Error occur" : "Error occur",
          401,
          ErrorCode.EXTERNAL_SERVICE_ERROR,
        );
      }
      const roleModel: IRole = {
        name,
        code: role.code,
        permissionIds: permissionList.map((item) => item._id!),
        description,
        isActive: isActive ?? true,
        isDefault: isDefault ?? false,
      };
      return await this.roleService.updateRole(id, roleModel);
    });
  };

  deleteRole = async (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params as {
        id: string;
      };
      return await this.roleService.deleteRole(id);
    });
  };

  changeStatus = async (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.query as {
        id: string;
      };
      const { isActive } = req.body as {
        isActive?: boolean;
      };
      return await this.roleService.changeStatus(id, isActive ?? true);
    });
  };

  changeDefaultStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.query as {
        id: string;
      };
      const { isDefault } = req.body as {
        isDefault?: boolean;
      };
      return await this.roleService.changeDefaultStatus(id, isDefault ?? false);
    });
  };

  getRole = async (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { id } = req.params as {
        id: string;
      };
      const role = await this.roleService.getRoleById(id);
      if (!role) {
        throw new Error("Role not found");
      }
      return role;
    });
  };
}
