import { configureStore } from "@reduxjs/toolkit";
import formReducer from "./store";
import verifyOTPReducer from "./verify.store";
import menuReducer from "./menu.store";
import listingReducer from "./listing.store";
import authReducer from "./auth.store";
import authDialogReducer from "./auth-dialog.store";
import profileReducer from "./profile.store";

export const store = configureStore({
  reducer: {
    form: formReducer,
    verifyOTP: verifyOTPReducer,
    menu: menuReducer,
    listing: listingReducer,
    auth: authReducer,
    authDialog: authDialogReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
