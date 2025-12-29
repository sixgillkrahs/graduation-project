declare namespace IAgentRegistrationService {
  export interface AgentRegistration {
    basicInfo: BasicInfo;
    businessInfo: BusinessInfo;
    imageInfo: ImageInfo;
    registrationLink: string;
    status: AgentStatusEnum;
    createdAt: string;
    updatedAt: string;
    reasonReject?: string;
    id: string;
  }

  export interface BasicInfo {
    identityInfo: IdentityInfo;
    nameRegister: string;
    email: string;
    phoneNumber: string;
  }

  export interface IdentityInfo {
    IDNumber: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    placeOfBirth: string;
  }

  export interface BusinessInfo {
    specialization: string[];
    workingArea: string[];
    taxCode: string;
    yearsOfExperience: string;
    certificateNumber: string;
  }

  export interface ImageInfo {
    certificateImage: string[];
    identityFront: string;
    identityBack: string;
  }

  export interface RejectBody {
    reason?: string;
  }
}
