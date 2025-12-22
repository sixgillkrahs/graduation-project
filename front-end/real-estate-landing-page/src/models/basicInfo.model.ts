export interface BasicInfo {
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface BusinessInfo {
  agentName: string;
  area: string;
  businessName: string;
}

export interface Verification {
  idType: string;
  idNumber: string;
  documentUrl: string;
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
