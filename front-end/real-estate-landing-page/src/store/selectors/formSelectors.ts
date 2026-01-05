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
