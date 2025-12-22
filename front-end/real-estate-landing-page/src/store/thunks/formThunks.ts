import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  submitFormFailure,
  submitFormStart,
  submitFormSuccess,
} from "../store";
import { RootState } from "..";

export const submitForm = createAsyncThunk(
  "form/submit",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    const formData = state.form;

    try {
      dispatch(submitFormStart());
      console.log(formData);
      // Validate all steps
      const errors = validateForm(formData);
      if (errors.length > 0) {
        throw new Error(errors.join(", "));
      }

      // Prepare data for API
      const payload = {
        ...formData.basicInfo,
        ...formData.businessInfo,
        ...formData.verification,
      };

      // Simulate API call
      const response = await fetch("/api/agent-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit application");
      }

      const data = await response.json();
      dispatch(submitFormSuccess());
      return data;
    } catch (error: any) {
      dispatch(submitFormFailure(error.message));
      throw error;
    }
  }
);

function validateForm(formData: any): string[] {
  const errors: string[] = [];

  // Validate Basic Info
  if (!formData.basicInfo.fullName) errors.push("Full name is required");
  if (!formData.basicInfo.email) errors.push("Email is required");
  if (!formData.basicInfo.phoneNumber) errors.push("Phone number is required");

  // Validate Business Info
  if (!formData.businessInfo.companyName)
    errors.push("Company name is required");
  if (!formData.businessInfo.businessType)
    errors.push("Business type is required");

  // Validate Verification
  if (!formData.verification.idNumber) errors.push("ID number is required");
  if (!formData.verification.agreeToTerms)
    errors.push("You must agree to the terms");

  return errors;
}
