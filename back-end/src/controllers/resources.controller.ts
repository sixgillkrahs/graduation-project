import { HeroService } from "@/services/hero.service";
import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { ResourcesService } from "@/services/resources.service";
import { IResource } from "@/models/resource.model";

export class ResourcesController extends BaseController {
  constructor(private resourcesService: ResourcesService) {
    super();
  }

  getResourcesPaginated = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortField = (req.query.sortField as string) || "createdAt";
      const sortOrder = (req.query.sortOrder as string) === "asc" ? 1 : -1;
      return await this.resourcesService.getResourcesPaginated(
        page,
        limit,
        sortField,
        sortOrder,
      );
    });
  };

  createResource = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const resource = req.body as IResource;
      return await this.resourcesService.createResource(resource);
    });
  };

  getResourceById = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const id = req.params.id as string;
      return await this.resourcesService.getResourceById(id);
    });
  };

  updateResource = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const id = req.params.id as string;
      const resource = req.body as IResource;
      return await this.resourcesService.updateResource(id, resource);
    });
  };

  deleteResource = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const id = req.params.id as string;
      return await this.resourcesService.deleteResource(id);
    });
  };

  searchResources = (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const query = (req.query.query as string) || "";
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      return await this.resourcesService.searchResources(query, page, limit);
    });
  };
}
