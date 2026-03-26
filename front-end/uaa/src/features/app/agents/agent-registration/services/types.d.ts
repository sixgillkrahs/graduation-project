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
    note?: string;
    userId?: string;
    accountLock?: AccountLock | null;
    unlockRequest?: UnlockRequest | null;
    unlockRequestHistories?: UnlockRequestHistory[];
    id: string;
  }

  export interface AccountLock {
    lockType: "TEMPORARY" | "PERMANENT";
    reason?: string | null;
    lockedAt: string;
    lockedUntil?: string | null;
  }

  export interface UnlockRequest {
    reason: string;
    contactEmail?: string | null;
    requestedAt: string;
  }

  export interface UnlockRequestHistory {
    reason: string;
    contactEmail?: string | null;
    requestedAt: string;
    decision: "APPROVED" | "REJECTED";
    reviewedAt: string;
    reviewedBy?: string | null;
    reviewedByName?: string | null;
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

  export interface ApproveBody {
    note?: string;
  }

  export interface LockAccountBody {
    lockType: "TEMPORARY" | "PERMANENT";
    reason: string;
    lockUntil?: string;
  }
}
