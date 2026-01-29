import { singleton } from "@/decorators/singleton";
import PropertyModel, { IProperty } from "@/models/property.model";
import { PopulateOptions } from "mongoose";

@singleton
export class PropertyService {
  constructor() {}

  createProperty = async (propertyData: IProperty) => {
    return await PropertyModel.create(propertyData);
  };

  getPropertyById = async (
    id: string,
    populate?: string | PopulateOptions | (string | PopulateOptions)[],
    select?: string,
  ) => {
    const query = PropertyModel.findById(id);

    if (populate) {
      query.populate(Array.isArray(populate) ? populate : [populate]);
    }

    if (select) {
      query.select(select);
    }
    return query.lean().exec() as Promise<IProperty | null>;
  };

  updateProperty = async (id: string, updateData: Partial<IProperty>) => {
    return await PropertyModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec();
  };

  deleteProperty = async (id: string) => {
    return await PropertyModel.findByIdAndDelete(id).lean().exec();
  };

  getProperties = async (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter: Record<string, any> = {},
    select?: string,
  ) => {
    return await PropertyModel.paginate?.(options, filter, select);
  };
}
