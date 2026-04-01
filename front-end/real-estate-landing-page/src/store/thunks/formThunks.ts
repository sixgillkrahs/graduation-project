import { createAsyncThunk } from "@reduxjs/toolkit";
import request from "@/lib/axios/request";
import { getClientTranslation } from "@/lib/i18n/getClientTranslation";
import { toast } from "@/lib/toast";
import type { RootState } from "..";
import {
  submitFormFailure,
  submitFormStart,
  submitFormSuccess,
} from "../store";

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
        throw new Error(
          getClientTranslation("RecruitmentPage.validation.noServerResponse"),
        );
      }

      dispatch(submitFormSuccess());

      return "";
    } catch (error: unknown) {
      const errorMessage =
        getRequestErrorMessage(error) ||
        getClientTranslation("notifications.unknownError");

      dispatch(submitFormFailure(errorMessage));

      toast.error(errorMessage);

      return rejectWithValue(errorMessage);
    }
  },
);

function getRequestErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const candidate = error as {
    message?: string;
    response?: {
      data?: {
        message?: string;
      };
    };
  };

  return candidate.response?.data?.message || candidate.message;
}

function validateForm(formData: RootState["form"]): string[] {
  const t = getClientTranslation;
  const errors: string[] = [];

  if (!formData.basicInfo?.nameRegister) {
    errors.push(t("RecruitmentPage.validation.nameRequired"));
  }

  if (!formData.basicInfo?.email) {
    errors.push(t("RecruitmentPage.validation.emailRequired"));
  }

  if (!formData.basicInfo?.phoneNumber) {
    errors.push(t("RecruitmentPage.validation.phoneRequired"));
  }

  if (
    !formData.basicInfo?.identityFront ||
    formData.basicInfo.identityFront.length === 0
  ) {
    errors.push(t("RecruitmentPage.validation.identityFrontRequired"));
  }

  if (
    !formData.basicInfo?.identityBack ||
    formData.basicInfo.identityBack.length === 0
  ) {
    errors.push(t("RecruitmentPage.validation.identityBackRequired"));
  }

  if (!formData.businessInfo?.certificateNumber) {
    errors.push(t("RecruitmentPage.validation.certificateNumberRequired"));
  }

  if (
    !formData.businessInfo?.specialization ||
    formData.businessInfo.specialization.length === 0
  ) {
    errors.push(t("RecruitmentPage.validation.specializationRequired"));
  }

  if (!formData.businessInfo?.taxCode) {
    errors.push(t("RecruitmentPage.validation.taxCodeRequired"));
  }

  if (
    !formData.businessInfo?.workingArea ||
    formData.businessInfo.workingArea.length === 0
  ) {
    errors.push(t("RecruitmentPage.validation.workingAreaRequired"));
  }

  if (!formData.businessInfo?.yearsOfExperience) {
    errors.push(t("RecruitmentPage.validation.yearsOfExperienceRequired"));
  }

  if (!formData.verification?.agreeToTerms) {
    errors.push(t("RecruitmentPage.validation.agreeToTermsRequired"));
  }

  return errors;
}
