namespace IProfileService {
  export interface ProfileDTO {
    _id: string;
    basicInfo: BasicInfo;
    businessInfo: BusinessInfo;
    imageInfo: ImageInfo;
    status: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
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
}
