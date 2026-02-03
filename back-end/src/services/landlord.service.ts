import { singleton } from "@/decorators/singleton";
import LandlordModel, { ILandlord } from "@/models/landlord.model";

@singleton
export class LandlordService {
  constructor() {}

  createLandlord = async (landlord: ILandlord) => {
    return await LandlordModel.create(landlord);
  };

  getLandlords = async (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter: Record<string, any> = {},
    select?: string,
  ) => {
    return await (LandlordModel as any).paginate?.(options, filter, select);
  };

  getLandlordById = async (id: string) => {
    return await LandlordModel.findById(id);
  };

  updateLandlord = async (id: string, updateData: Partial<ILandlord>) => {
    return await LandlordModel.findByIdAndUpdate(id, updateData, { new: true });
  };

  deleteLandlord = async (id: string) => {
    return await LandlordModel.findByIdAndDelete(id);
  };
}
