import mongoose from "mongoose";
import collections from "./config/collections";
import paginate from "./plugins/paginate.plugin";
import toJSON from "./plugins/toJSON.plugin";

export interface ILandlord {
  createdAt?: Date;
  updatedAt?: Date;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
}

export interface IAgentMethods {}

interface LandlordModel extends mongoose.Model<ILandlord, {}, IAgentMethods> {
  paginate?: (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter: Record<string, any>,
    select?: string,
  ) => Promise<mongoose.HydratedDocument<ILandlord, IAgentMethods>[]>;
  createLandlord(
    landlord: ILandlord,
  ): Promise<mongoose.HydratedDocument<ILandlord, IAgentMethods>>;
  getLandlordById(
    id: string,
  ): Promise<mongoose.HydratedDocument<ILandlord, IAgentMethods> | null>;
  updateLandlord(
    id: string,
    landlord: Partial<ILandlord>,
  ): Promise<mongoose.HydratedDocument<ILandlord, IAgentMethods> | null>;
  deleteLandlord(
    id: string,
  ): Promise<mongoose.HydratedDocument<ILandlord, IAgentMethods> | null>;
  searchLandlords(
    page: number,
    limit: number,
    searchTerm: string,
  ): Promise<mongoose.HydratedDocument<ILandlord, IAgentMethods>[]>;
}

const landlordSchema = new mongoose.Schema<
  ILandlord,
  LandlordModel,
  IAgentMethods
>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

landlordSchema.plugin(toJSON as any);
landlordSchema.plugin(paginate as any);

class LandlordClass {
  static async createLandlord(this: LandlordModel, landlordData: ILandlord) {
    return await this.create(landlordData);
  }

  static async getLandlordById(this: LandlordModel, id: string) {
    return await this.findById(id).exec();
  }

  static async updateLandlord(
    this: LandlordModel,
    id: string,
    updateData: Partial<ILandlord>,
  ) {
    return await this.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  static async deleteLandlord(this: LandlordModel, id: string) {
    return await this.findByIdAndDelete(id).exec();
  }

  static async searchLandlords(
    this: LandlordModel,
    page: number = 1,
    limit: number = 10,
    searchTerm: string,
  ) {
    const searchRegex = new RegExp(searchTerm, "i");

    return await this.paginate?.(
      {
        page,
        limit,
        sortBy: "createdAt:desc",
        populate: "userId",
      },
      {
        $or: [{ "identityInfo.agentName": searchRegex }],
      },
    );
  }
}

landlordSchema.loadClass(LandlordClass);

const LandlordModel = mongoose.model<ILandlord>(
  collections.landlords,
  landlordSchema,
);

export default LandlordModel;
