namespace IEditProfileService {
  export interface IAgentFormData {
    avatarUrl?: string;
    nameRegister: string;
    phone: string;
    description: string;
    certificateNumber: string;
    taxCode: string;
    yearsOfExperience: string;
    workingArea: string[];
    specialization: string[];
    bankAccountName: string;
    bankAccountNumber: string;
    bankName: string;
  }

  export interface IBuyerFormData {
    avatarUrl?: string;
    fullName: string;
    email: string;
    phone: string;
  }

  export type IFormData = IAgentFormData | IBuyerFormData;

  export interface IRequestPayload {
    avatarUrl?: string;
    basicInfo: BasicInfo;
    businessInfo: BusinessInfo;
    bankInfo: BankInfo;
    description: string;
  }

  export interface BasicInfo {
    nameRegister: string;
    phoneNumber: string;
  }

  export interface BusinessInfo {
    certificateNumber: string;
    taxCode: string;
    yearsOfExperience: string;
    workingArea: string[];
    specialization: string[];
  }

  export interface BankInfo {
    bankAccountName: string;
    bankAccountNumber: string;
    bankName: string;
  }
}
