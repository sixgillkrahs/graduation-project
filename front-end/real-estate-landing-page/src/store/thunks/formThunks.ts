import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  submitFormFailure,
  submitFormStart,
  submitFormSuccess,
} from "../store";
import { RootState } from "..";
import request from "@/lib/axios/request";
import { toast } from "sonner";

export const submitForm = createAsyncThunk(
  "form/submit",
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    const formData = state.form;
    try {
      dispatch(submitFormStart());
      const errors = validateForm(formData);
      if (errors.length > 0) {
        throw new Error(errors.join(", "));
      }

      const payload = {
        ...formData.basicInfo,
        ...formData.businessInfo,
        ...formData.verification,
      };
      const response = await request({
        method: "POST",
        url: "/agents-registrations/application",
        headers: {
          "Content-Type": "application/json",
        },
        data: payload,
      });

      if (!response) {
        throw new Error("Không nhận được phản hồi từ máy chủ");
      }

      dispatch(submitFormSuccess());

      return "";
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Đã có lỗi không xác định xảy ra";

      dispatch(submitFormFailure(errorMessage));

      toast.error(errorMessage);

      return rejectWithValue(errorMessage);
    }
  },
);

function validateForm(formData: any): string[] {
  const errors: string[] = [];

  if (!formData.basicInfo?.nameRegister) {
    errors.push("Full name is required");
  }

  if (!formData.basicInfo?.email) {
    errors.push("Email is required");
  }

  if (!formData.basicInfo?.phoneNumber) {
    errors.push("Phone number is required");
  }

  if (
    !formData.basicInfo?.identityFront ||
    formData.basicInfo.identityFront.length === 0
  ) {
    errors.push("Identity front image is required");
  }

  if (
    !formData.basicInfo?.identityBack ||
    formData.basicInfo.identityBack.length === 0
  ) {
    errors.push("Identity back image is required");
  }

  if (!formData.businessInfo?.certificateNumber) {
    errors.push("Certificate number is required");
  }

  if (
    !formData.businessInfo?.specialization ||
    formData.businessInfo.specialization.length === 0
  ) {
    errors.push("Specialization is required");
  }

  if (!formData.businessInfo?.taxCode) {
    errors.push("Tax code is required");
  }

  if (
    !formData.businessInfo?.workingArea ||
    formData.businessInfo.workingArea.length === 0
  ) {
    errors.push("Working area is required");
  }

  if (!formData.businessInfo?.yearsOfExperience) {
    errors.push("Years of experience is required");
  }

  if (!formData.verification?.agreeToTerms) {
    errors.push("You must agree to the terms");
  }

  return errors;
}
