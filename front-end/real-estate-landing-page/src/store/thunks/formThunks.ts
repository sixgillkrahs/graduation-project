import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  submitFormFailure,
  submitFormStart,
  submitFormSuccess,
} from "../store";
import { RootState } from "..";
import request from "@/lib/axios/request";
import { showToast } from "@/components/ui/Toast";

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
      console.log(payload);
      const response = await request({
        method: "POST",
        url: "/agents/application",
        headers: {
          "Content-Type": "application/json",
        },
        data: payload,
      });

      if (!response) {
        throw new Error("Không nhận được phản hồi từ máy chủ");
      }

      dispatch(submitFormSuccess());

      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Đã có lỗi không xác định xảy ra";

      dispatch(submitFormFailure(errorMessage));

      showToast.error("Đăng ký thất bại", errorMessage);

      return rejectWithValue(errorMessage);
    }
  }
);

function validateForm(formData: any): string[] {
  const errors: string[] = [];

  if (!formData.basicInfo.fullName) errors.push("Full name is required");
  if (!formData.basicInfo.email) errors.push("Email is required");
  if (!formData.basicInfo.phoneNumber) errors.push("Phone number is required");

  if (!formData.businessInfo.agentName) errors.push("Agent name is required");
  if (!formData.businessInfo.area) errors.push("Area is required");
  if (!formData.businessInfo.IDNumber) errors.push("ID number is required");
  if (!formData.businessInfo.dateOfBirth)
    errors.push("Date of birth is required");
  if (!formData.businessInfo.gender) errors.push("Gender is required");
  if (!formData.businessInfo.address) errors.push("Address is required");
  if (!formData.businessInfo.nationality)
    errors.push("Nationality is required");

  if (!formData.verification.agreeToTerms)
    errors.push("You must agree to the terms");

  return errors;
}
