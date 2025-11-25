import { ResourcesService } from './../services/resources.service';
import { PermissionService } from "@/services/permission.service";
import { Optional } from "@prisma/client/runtime/library";
import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { Prisma } from "@prisma/client";
import { logger } from "@/config/logger";
import { OperationService } from "@/services/operation.service";



export class PermissionController extends BaseController {
    private permissionService: PermissionService;
    private operationService: OperationService;
    private resourcesService: ResourcesService;

    constructor(permissionService: PermissionService, operationService: OperationService, resourcesService: ResourcesService) {
        super()
        this.permissionService = permissionService;
        this.operationService = operationService;
        this.resourcesService = resourcesService;
    }

    getPermissions = async (req: Request, res: Response, next: NextFunction) => {
        this.handleRequest(req, res, next, async () => {
            try {
                const { limit, offset, search, sortField, sortOrder } = req.query;
                const permission = await this.permissionService.getPermissions(
                    limit ? Number(limit) : 10,
                    offset ? Number(offset) : 0,
                    search as string,
                    {
                        field: sortField as string,
                        order: sortOrder as 'asc' | 'desc',
                    },
                    {
                        id: true,
                        name: true,
                        description: true,
                        isActive: true,
                    }
                );
                return permission;
            } catch (error) {
                logger.error('Error in getPermissions', error);
                throw error;
            }
        });
    }

    getPermissionById = async (req: Request, res: Response, next: NextFunction) => {
        this.handleRequest(req, res, next, async () => {
            try {
                const { id } = req.params;
                const permission = await this.permissionService.getPermissionById(id, {
                    id: true,
                    name: true,
                    description: true,
                    isActive: true,
                    resources: {
                        select: {
                            name: true,
                            id: true
                        }
                    },
                    operation: {
                        select: {
                            name: true,
                            id: true
                        }
                    }
                });
                return permission;
            } catch (error) {
                logger.error('Error in getPermissionById', error);
                throw error;
            }
        });
    }

    createPermission = async (req: Request, res: Response, next: NextFunction) => {
        this.handleRequest(req, res, next, async () => {
            try {
                const { name, description, resourceId, operationId } = req.body;
                const resourceIdStr = String(resourceId);
                const operationIdNum = Number(operationId);
                const resource = await this.resourcesService.getResourceById(resourceIdStr);
                const operation = await this.operationService.getOperationById(operationIdNum.toString());

                if (!resource) {
                    throw new Error('Resource not found');
                }

                if (!operation) {
                    throw new Error('Operation not found');
                }

                const permission = await this.permissionService.createPermission({
                    name,
                    description,
                    isActive: true,
                    resources: {
                        connect: {
                            id: resourceIdStr,
                        }
                    },
                    operation: {
                        connect: {
                            id: operationIdNum,
                        }
                    }
                });
                return permission;
            } catch (error) {
                logger.error('Error in createPermission', error);
                throw error;
            }
        });
    }

    updatePermission = async (req: Request, res: Response, next: NextFunction) => {
        this.handleRequest(req, res, next, async () => {
            try {
                const { id } = req.params;
                const { name, description, resourceId, operationId } = req.body;
                const resourceIdStr = String(resourceId);
                const operationIdNum = Number(operationId);
                const resource = await this.resourcesService.getResourceById(resourceIdStr);
                const operation = await this.operationService.getOperationById(operationIdNum.toString());

                if (!resource) {
                    throw new Error('Resource not found');
                }

                if (!operation) {
                    throw new Error('Operation not found');
                }

                const permission = await this.permissionService.updatePermission(id, {
                    name,
                    description,
                    isActive: true,
                    resources: {
                        connect: {
                            id: resourceIdStr,
                        }
                    },
                    operation: {
                        connect: {
                            id: operationIdNum,
                        }
                    }
                });
                return permission;
            } catch (error) {
                logger.error('Error in updatePermission', error);
                throw error;
            }
        });
    }

    deletePermission = async (req: Request, res: Response, next: NextFunction) => {
        this.handleRequest(req, res, next, async () => {
            try {
                const { id } = req.params;
                await this.permissionService.deletePermission(id);
                return { message: 'Permission deleted successfully' };
            } catch (error) {
                logger.error('Error in deletePermission', error);
                throw error;
            }
        });
    }
}