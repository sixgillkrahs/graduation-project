import { configureStore } from "@reduxjs/toolkit";
import {
  BasicInfo,
  BusinessInfo,
  FormState,
  Verification,
} from "@/models/basicInfo.model";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: FormState = {
  currentStep: 0,
  basicInfo: {
    fullName: "",
    email: "",
    phoneNumber: "",
  },
  businessInfo: {
    agentName: "",
    area: "",
    businessName: "",
  },
  verification: {
    idType: "",
    idNumber: "",
    documentUrl: "",
    agreeToTerms: false,
  },
  isSubmitting: false,
  submitError: null,
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      if (state.currentStep < 2) {
        state.currentStep += 1;
      }
    },
    prevStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    updateBasicInfo: (state, action: PayloadAction<Partial<BasicInfo>>) => {
      state.basicInfo = { ...state.basicInfo, ...action.payload };
    },
    updateBusinessInfo: (
      state,
      action: PayloadAction<Partial<BusinessInfo>>
    ) => {
      state.businessInfo = { ...state.businessInfo, ...action.payload };
    },
    updateVerification: (
      state,
      action: PayloadAction<Partial<Verification>>
    ) => {
      state.verification = { ...state.verification, ...action.payload };
    },
    resetForm: (state) => {
      Object.assign(state, initialState);
    },
    submitFormStart: (state) => {
      state.isSubmitting = true;
      state.submitError = null;
    },
    submitFormSuccess: (state) => {
      state.isSubmitting = false;
      state.submitError = null;
    },
    submitFormFailure: (state, action: PayloadAction<string>) => {
      state.isSubmitting = false;
      state.submitError = action.payload;
    },
  },
});

export const {
  setCurrentStep,
  nextStep,
  prevStep,
  updateBasicInfo,
  updateBusinessInfo,
  updateVerification,
  resetForm,
  submitFormStart,
  submitFormSuccess,
  submitFormFailure,
} = formSlice.actions;

export default formSlice.reducer;
