namespace IEditProfileService {
  export interface IFormData {
    nameRegister: string;
    phone: string;
    certificateNumber: string;
    taxCode: string;
    yearsOfExperience: string;
    workingArea: string[];
    specialization: string[];
    bankAccountName: string;
    bankAccountNumber: string;
    bankName: string;
  }

  export interface IRequestPayload {
    basicInfo: BasicInfo;
    businessInfo: BusinessInfo;
    bankInfo: BankInfo;
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
