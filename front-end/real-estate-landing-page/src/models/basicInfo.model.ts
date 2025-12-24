export interface BasicInfo {
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface BusinessInfo {
  agentName: string;
  area: string[];
  IDNumber: string;
  businessName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  nationality: string;
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
}
