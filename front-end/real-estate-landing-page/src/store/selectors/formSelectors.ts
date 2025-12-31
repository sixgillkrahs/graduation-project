import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "..";

export const selectCurrentStep = (state: RootState) => state.form.currentStep;
export const selectFormData = (state: RootState) => state.form;
export const selectIsSubmitting = (state: RootState) => state.form.isSubmitting;

export const selectAllFormData = createSelector([selectFormData], (form) => ({
  ...form.basicInfo,
  ...form.businessInfo,
  ...form.verification,
}));

export const selectIsStepValid = (step: number) =>
  createSelector([selectFormData], (form) => {
    switch (step) {
      case 0:
        return !!(
          form.basicInfo.identityInfo.fullName &&
          form.basicInfo.email &&
          form.basicInfo.phoneNumber
        );
      case 1:
        return !!(
          form.businessInfo.agentName &&
          form.businessInfo.area &&
          form.businessInfo.businessName &&
          form.businessInfo.IDNumber &&
          form.businessInfo.dateOfBirth &&
          form.businessInfo.gender &&
          form.businessInfo.address &&
          form.businessInfo.nationality
        );
      default:
        return false;
    }
  });
