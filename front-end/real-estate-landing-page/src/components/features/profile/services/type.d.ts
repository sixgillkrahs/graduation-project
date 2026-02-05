namespace IProfileService {
  export interface ProfileDTO {
    _id: string;
    basicInfo: BasicInfo;
    businessInfo: BusinessInfo;
    imageInfo: ImageInfo;
    bankInfo?: BankInfo;
    status: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
  }

  export interface ProfileUserDTO {
    _id: string;
    email: string;
    fullName: string;
    prefixPhone: string;
    address: string;
    phone: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    avatarUrl?: string;
    roleId: string;
    __v: number;
  }

  export interface BasicInfo {
    nameRegister: string;
    email: string;
    phoneNumber: string;
    identityInfo: IdentityInfo;
  }

  export interface IdentityInfo {
    IDNumber: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    placeOfBirth: string;
  }

  export interface BankInfo {
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
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

  export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
}
