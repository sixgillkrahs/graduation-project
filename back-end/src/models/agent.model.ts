import mongoose from "mongoose";
import collections from "./config/collections";
import paginate from "./plugins/paginate.plugin";
import toJSON from "./plugins/toJSON.plugin";

export enum AgentStatusEnum {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

export interface IAgent {
  userId?: mongoose.Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  identityInfo: {
    agentName: string;
    IDNumber: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    nationality: string;
  };
  businessInfo: {
    phoneNumber: string;
    area: string[];
  };
  expirationDate?: Date;
  registrationLink?: string;
  status: AgentStatusEnum;
}

export interface IAgentMethods {}

interface AgentModel extends mongoose.Model<IAgent, {}, IAgentMethods> {
  paginate?: (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter: Record<string, any>,
    select?: string,
  ) => Promise<mongoose.HydratedDocument<IAgent, IAgentMethods>[]>;
  createAgent(
    agent: IAgent,
  ): Promise<mongoose.HydratedDocument<IAgent, IAgentMethods>>;
  getAgentById(
    id: string,
  ): Promise<mongoose.HydratedDocument<IAgent, IAgentMethods> | null>;
  updateAgent(
    id: string,
    agent: Partial<IAgent>,
  ): Promise<mongoose.HydratedDocument<IAgent, IAgentMethods> | null>;
  deleteAgent(
    id: string,
  ): Promise<mongoose.HydratedDocument<IAgent, IAgentMethods> | null>;
  searchAgents(
    page: number,
    limit: number,
    searchTerm: string,
  ): Promise<mongoose.HydratedDocument<IAgent, IAgentMethods>[]>;
}

const agentSchema = new mongoose.Schema<IAgent, AgentModel, IAgentMethods>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.users,
      required: false,
    },
    identityInfo: {
      agentName: {
        type: String,
        required: true,
        trim: true,
      },
      IDNumber: {
        type: String,
        required: true,
        trim: true,
      },
      dateOfBirth: {
        type: String,
        required: true,
        trim: true,
      },
      gender: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
      nationality: {
        type: String,
        required: true,
        trim: true,
      },
    },
    businessInfo: {
      phoneNumber: {
        type: String,
        required: true,
        trim: true,
      },
      area: {
        type: [String],
        required: true,
        trim: true,
      },
    },
    expirationDate: {
      type: Date,
    },
    registrationLink: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
      enum: AgentStatusEnum,
      default: AgentStatusEnum.PENDING,
    },
  },
  {
    timestamps: true,
  },
);

agentSchema.plugin(toJSON as any);
agentSchema.plugin(paginate as any);

class AgentClass {
  static async createAgent(this: AgentModel, agentData: IAgent) {
    return await this.create(agentData);
  }

  static async getAgentById(this: AgentModel, id: string) {
    return await this.findById(id).exec();
  }

  static async updateAgent(
    this: AgentModel,
    id: string,
    updateData: Partial<IAgent>,
  ) {
    return await this.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  static async deleteAgent(this: AgentModel, id: string) {
    return await this.findByIdAndDelete(id).exec();
  }

  static async searchAgents(
    this: AgentModel,
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

agentSchema.loadClass(AgentClass);

const AgentModel = mongoose.model<IAgent, AgentModel>(
  collections.agents,
  agentSchema,
);

export default AgentModel;
