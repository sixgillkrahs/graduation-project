import { ListingState } from "@/models/listing.model";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: ListingState = {
  currentStep: 0,
  data: {
    demandType: "SALE",
    propertyType: "APARTMENT",
    projectName: "",
  },
};

const listingSlice = createSlice({
  name: "listing",
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      state.currentStep += 1;
    },
    prevStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    updateListingData: (
      state,
      action: PayloadAction<Partial<ListingState["data"]>>,
    ) => {
      state.data = { ...state.data, ...action.payload };
    },
    submitStep1: (
      state,
      action: PayloadAction<{
        demandType: "SALE" | "RENT";
        propertyType: "APARTMENT" | "HOUSE" | "VILLA" | "LAND" | "STREET_HOUSE";
        projectName: string;
      }>,
    ) => {
      state.data = { ...state.data, ...action.payload };
      state.currentStep += 1; // Auto advance
    },
    submitStep2: (state, action: PayloadAction<{ location: any }>) => {
      state.data = { ...state.data, ...action.payload };
      state.currentStep += 1;
    },
    submitStep3: (state, action: PayloadAction<{ features: any }>) => {
      state.data = { ...state.data, ...action.payload };
      state.currentStep += 1;
    },
  },
});

export const {
  setStep,
  nextStep,
  prevStep,
  updateListingData,
  submitStep1,
  submitStep2,
  submitStep3,
} = listingSlice.actions;
export default listingSlice.reducer;
