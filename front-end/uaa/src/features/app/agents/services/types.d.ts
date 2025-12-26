declare namespace IAgentRegistrationService {
  export interface AgentRegistration {
    identityInfo: IdentityInfo;
    businessInfo: BusinessInfo;
    registrationLink: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    id: string;
  }

  export interface IdentityInfo {
    agentName: string;
    IDNumber: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    nationality: string;
  }

  export interface BusinessInfo {
    phoneNumber: string;
    area: string[];
    email: string;
  }
}
