import { ResourcesService } from "./../services/resources.service";
import { PermissionService } from "@/services/permission.service";
import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { logger } from "@/config/logger";
import { Operation } from "@/models/permission.model";

export class PermissionController extends BaseController {
  private permissionService: PermissionService;
  private resourcesService: ResourcesService;

  constructor(
    permissionService: PermissionService,
    resourcesService: ResourcesService,
  ) {
    super();
    this.permissionService = permissionService;
    this.resourcesService = resourcesService;
  }

  getPermissions = async (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      try {
        const { limit, page, sortField, sortOrder, query } = req.query;
        let filter = {};
        if (query) {
          filter = { name: { $regex: query as string, $options: "i" } };
        }

        const permission = await this.permissionService.getPermissionsPaginated(
          {
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            sortBy: `${sortField as string}:${sortOrder as string}`,
            populate: "resourceId:id name",
          },
          filter,
        );
        return permission;
      } catch (error) {
        logger.error("Error in getPermissions", error);
        throw error;
      }
    });
  };

  getPermissionById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      try {
        const { id } = req.params;
        return await this.permissionService.getPermissionById(id);
      } catch (error) {
        logger.error("Error in getPermissionById", error);
        throw error;
      }
    });
  };

  createPermission = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      try {
        const { name, description, resourceId, operation } = req.body as {
          name: string;
          description: string;
          resourceId: string;
          operation: Operation;
        };
        if (!name || !resourceId || !operation) {
          throw new Error("Missing required fields");
        }
        const resource =
          await this.resourcesService.getResourceById(resourceId);
        if (!resource) {
          throw new Error("Resource not found");
        }
        if (!Object.values(Operation).includes(operation)) {
          throw new Error("Invalid operation");
        }
        const permission = await this.permissionService.createPermission({
          name,
          description,
          isActive: true,
          resourceId: resource.id,
          operation,
        });
        return permission;
      } catch (error) {
        logger.error("Error in createPermission", error);
        throw error;
      }
    });
  };

  updatePermission = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      try {
        const { id } = req.params;
        const { name, description, resourceId, operation } = req.body as {
          name: string;
          description: string;
          resourceId: string;
          operation: Operation;
        };
        if (!id || !name || !resourceId || !operation) {
          throw new Error("Missing required fields");
        }
        const resource =
          await this.resourcesService.getResourceById(resourceId);
        if (!resource) {
          throw new Error("Resource not found");
        }
        if (!Object.values(Operation).includes(operation)) {
          throw new Error("Invalid operation");
        }
        const permission = await this.permissionService.updatePermission(id, {
          name,
          description,
          resourceId: resource.id,
          operation,
        });
        return permission;
      } catch (error) {
        logger.error("Error in updatePermission", error);
        throw error;
      }
    });
  };

  deletePermission = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      try {
        const { id } = req.params;
        await this.permissionService.deletePermission(id);
        return { message: "Permission deleted successfully" };
      } catch (error) {
        logger.error("Error in deletePermission", error);
        throw error;
      }
    });
  };

  updatePermissionStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      try {
        const { id } = req.params;
        const { isActive } = req.body as {
          isActive: boolean;
        };
        if (!id || isActive === undefined) {
          throw new Error("Missing required fields");
        }
        const permission = await this.permissionService.updatePermission(id, {
          isActive,
        });
        return permission;
      } catch (error) {
        logger.error("Error in updatePermission", error);
        throw error;
      }
    });
  };
}
