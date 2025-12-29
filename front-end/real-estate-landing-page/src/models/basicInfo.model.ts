export interface BasicInfo {
  nameRegister: string;
  email: string;
  phoneNumber: string;
  identityFront: string[];
  identityBack: string[];
  identityInfo: {
    fullName: string;
    IDNumber: string;
    dateOfBirth: string;
    gender: string;
    placeOfBirth: string;
    nationality: string;
  };
}

export interface BusinessInfo {
  certificateNumber: string;
  taxCode: string;
  yearsOfExperience: string | undefined;
  workingArea: [string] | undefined;
  specialization: [string] | undefined;
  certificateImage: string[];
}

export interface Verification {
  agreeToTerms: boolean;
}

export interface FormState {
  currentStep: number;
  basicInfo: BasicInfo;
  businessInfo: BusinessInfo;
  verification: Verification;
  isSubmitting: boolean;
  submitError: string | null;
  isSubmitSuccess: boolean;
}
