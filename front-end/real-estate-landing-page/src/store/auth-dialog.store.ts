import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthDialogState {
  isOpen: boolean;
  title?: string;
  description?: string;
  redirectUrl?: string; // Optional custom redirect URL
}

const initialState: AuthDialogState = {
  isOpen: false,
  title: undefined,
  description: undefined,
  redirectUrl: undefined,
};

const authDialogSlice = createSlice({
  name: "authDialog",
  initialState,
  reducers: {
    showAuthDialog: (
      state,
      action: PayloadAction<{
        title?: string;
        description?: string;
        redirectUrl?: string;
      }>,
    ) => {
      // Allow overriding default title/desc if provided, else undefined to fallback to component defaults
      state.title = action.payload.title;
      state.description = action.payload.description;
      state.redirectUrl = action.payload.redirectUrl;
      state.isOpen = true;
    },
    hideAuthDialog: (state) => {
      state.isOpen = false;
      // Reset state on close
      state.title = undefined;
      state.description = undefined;
      state.redirectUrl = undefined;
    },
  },
});

export const { showAuthDialog, hideAuthDialog } = authDialogSlice.actions;

export default authDialogSlice.reducer;
