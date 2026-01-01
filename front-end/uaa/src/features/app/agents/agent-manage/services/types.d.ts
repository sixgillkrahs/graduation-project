declare namespace IAgentService {
  export interface Agent {
    basicInfo: BasicInfo;
    businessInfo: BusinessInfo;
    imageInfo: ImageInfo;
    status: AgentStatusEnum;
    createdAt: string;
    updatedAt: string;
    id: string;
  }
}