import { singleton } from "@/decorators/singleton";
import ResourceModel from "@/models/resource.model";
import Resource, { IResource } from "@/models/resource.model";

@singleton
export class ResourcesService {
  constructor() {}

  getResourcesPaginated = async (
    page: number,
    limit: number,
    sortField: string,
    sortOrder: number,
  ) => {
    return await ResourceModel.getResourcesPaginated(
      page,
      limit,
      sortField,
      sortOrder,
    );
  };

  createResource = async (resource: IResource) => {
    return await ResourceModel.createResource(resource);
  };

  searchResources = async (query: string, page: number, limit: number) => {
    return await ResourceModel.searchResources(page, limit, query);
  };

  getResourceById = async (id: string) => {
    return await ResourceModel.getResourceById(id);
  };

  updateResource = async (id: string, resource: IResource) => {
    return await ResourceModel.updateResource(id, resource);
  };

  deleteResource = async (id: string) => {
    return await ResourceModel.deleteResource(id);
  };
}
