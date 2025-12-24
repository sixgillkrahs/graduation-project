import { singleton } from "@/decorators/singleton";
import AgentModel, { IAgent } from "@/models/agent.model";

@singleton
export class AgentService {
  constructor() {}

  getAgent = async (id: string) => {
    return await AgentModel.findById(id);
  };

  getAgentByIdNumber = async (idNumber: string) => {
    return await AgentModel.findOne({ "identityInfo.IDNumber": idNumber });
  };

  createAgentRegistration = async (agentData: IAgent) => {
    return await AgentModel.createAgent(agentData);
  };
}
