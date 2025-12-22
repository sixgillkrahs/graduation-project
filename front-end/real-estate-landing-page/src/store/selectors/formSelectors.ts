import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "..";

// Selector cơ bản
export const selectCurrentStep = (state: RootState) => state.form.currentStep;
export const selectFormData = (state: RootState) => state.form;
export const selectIsSubmitting = (state: RootState) => state.form.isSubmitting;

// Selector tính toán (derived)
export const selectAllFormData = createSelector([selectFormData], (form) => ({
  ...form.basicInfo,
  ...form.businessInfo,
  ...form.verification,
}));

export const selectIsStepValid = (step: number) =>
  createSelector([selectFormData], (form) => {
    switch (step) {
      case 0: // Basic Info
        return !!(
          form.basicInfo.fullName &&
          form.basicInfo.email &&
          form.basicInfo.phoneNumber
        );
      case 1: // Business Info
        return !!(
          form.businessInfo.agentName &&
          form.businessInfo.area &&
          form.businessInfo.businessName
        );
      case 2: // Verification
        return !!(form.verification.idNumber && form.verification.agreeToTerms);
      default:
        return false;
    }
  });
