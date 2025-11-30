import mongoose, { SortOrder } from "mongoose";
import toJSON from "./plugins/toJSON.plugin";
import paginate from "./plugins/paginate.plugin";
import collections from "./config/collections";

export interface IResource {
  name: string;
  path: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IResourceMethods { }

interface ResourceModel
  extends mongoose.Model<IResource, {}, IResourceMethods> {
  createResource(
    resource: IResource,
  ): Promise<mongoose.HydratedDocument<IResource, IResourceMethods>>;
  getResourceById(
    id: string,
  ): Promise<mongoose.HydratedDocument<IResource, IResourceMethods> | null>;
  getResourcesPaginated(
    page: number,
    limit: number,
    sortField: string,
    sortOrder: number,
  ): Promise<{
    results: mongoose.HydratedDocument<IResource, IResourceMethods>[];
    totalPages: number;
    totalResults: number;
    page: number;
    limit: number;
  }>;
  updateResource(
    id: string,
    resource: Partial<IResource>,
  ): Promise<mongoose.HydratedDocument<IResource, IResourceMethods> | null>;
  deleteResource(
    id: string,
  ): Promise<mongoose.HydratedDocument<IResource, IResourceMethods> | null>;
  searchResources(
    page: number,
    limit: number,
    query: string,
  ): Promise<mongoose.HydratedDocument<IResource, IResourceMethods>[]>;
}

const resourceSchema = new mongoose.Schema<
  IResource,
  ResourceModel,
  IResourceMethods
>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    path: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

resourceSchema.plugin(toJSON);
resourceSchema.plugin(paginate);

class ResourceClass {
  static async createResource(this: ResourceModel, resourceData: IResource) {
    return await this.create(resourceData);
  }

  static async getResourceById(this: ResourceModel, id: string) {
    return await this.findById(id).exec();
  }

  static async getResourcesPaginated(
    this: ResourceModel,
    page: number = 1,
    limit: number = 10,
    sortBy: string = "createdAt",
    sortOrder: SortOrder = -1,
  ) {
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder };
    const [results, totalResults] = await Promise.all([
      this.find().sort(sort).skip(skip).limit(limit).exec(),
      this.countDocuments().exec(),
    ]);

    const totalPages = Math.ceil(totalResults / limit);

    return {
      results,
      totalPages,
      totalResults,
      page,
      limit,
    };
  }

  static async updateResource(
    this: ResourceModel,
    id: string,
    updateData: Partial<IResource>,
  ) {
    return await this.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  static async deleteResource(this: ResourceModel, id: string) {
    return await this.findByIdAndDelete(id).exec();
  }

  static async searchResources(
    this: ResourceModel,
    page: number = 1,
    limit: number = 10,
    searchTerm: string,
  ) {
    const skip = (page - 1) * limit;

    const searchRegex = new RegExp(searchTerm, "i");

    const [results, totalResults] = await Promise.all([
      this.find({
        $or: [{ name: searchRegex }, { description: searchRegex }],
      })
        .skip(skip)
        .limit(limit)
        .exec(),

      this.countDocuments({
        $or: [{ name: searchRegex }, { description: searchRegex }],
      }).exec(),
    ]);

    const totalPages = Math.ceil(totalResults / limit);

    return {
      results,
      totalPages,
      totalResults,
      page,
      limit,
    };
  }

  deleteResource(this: ResourceModel, id: string) {
    return this.findByIdAndDelete(id).exec();
  }

  // Instance methods (nếu cần)
  getSummary(this: mongoose.HydratedDocument<IResource, IResourceMethods>) {
    return {
      name: this.name,
      description: this.description?.substring(0, 100) + "...",
      createdAt: this.createdAt,
    };
  }
}

// Load class vào schema
resourceSchema.loadClass(ResourceClass);

// Tạo model
const ResourceModel = mongoose.model<IResource, ResourceModel>(
  collections.resources,
  resourceSchema,
);

export default ResourceModel;
