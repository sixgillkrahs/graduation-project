import { singleton } from "@/decorators/singleton";
import AgentModel, { AgentStatusEnum, IAgent } from "@/models/agent.model";

@singleton
export class AgentService {
  constructor() {}

  getAgent = async (id: string) => {
    return await AgentModel.findById(id);
  };

  getAgentByIdNumber = async (idNumber: string) => {
    return await AgentModel.findOne({
      "basicInfo.identityInfo.IDNumber": idNumber,
    });
  };

  getAgentByEmail = async (email: string) => {
    return await AgentModel.findOne({
      "basicInfo.email": email,
    });
  };

  getAgentByUserId = async (userId: string) => {
    return await AgentModel.findOne({
      userId: userId,
    })
      .lean()
      .exec();
  };

  createAgentRegistration = async (agentData: IAgent) => {
    return await AgentModel.createAgent(agentData);
  };

  updateAgentRegistration = async (id: string, agentData: Partial<IAgent>) => {
    return await AgentModel.updateAgent(id, agentData);
  };

  getAgentRegistrations = async (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter?: Record<string, any>,
    select?: string,
  ) => {
    filter = filter || {};
    return await AgentModel.paginate?.(options, filter, select);
  };

  getAgentRegistrationById = async (id: string) => {
    return await AgentModel.findById(id).lean().exec();
  };

  getAgentsByUserIds = async (userIds: string[]) => {
    return await AgentModel.find({
      userId: { $in: userIds },
      status: AgentStatusEnum.APPROVED,
    })
      .select("userId planInfo status")
      .lean()
      .exec();
  };
}
