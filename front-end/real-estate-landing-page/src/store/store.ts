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
    nameRegister: "",
    email: "",
    phoneNumber: "",
    identityBack: [],
    identityFront: [],
    identityInfo: {
      dateOfBirth: "",
      fullName: "",
      gender: "",
      IDNumber: "",
      nationality: "",
      placeOfBirth: "",
    },
  },
  businessInfo: {
    certificateNumber: "",
    specialization: [""],
    taxCode: "",
    workingArea: [""],
    yearsOfExperience: 0,
  },
  verification: {
    agreeToTerms: false,
  },
  isSubmitting: false,
  submitError: null,
  isSubmitSuccess: false,
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
      state.isSubmitSuccess = true;
    },
    submitFormFailure: (state, action: PayloadAction<string>) => {
      state.isSubmitting = false;
      state.submitError = action.payload;
      state.isSubmitSuccess = false;
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
