import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth.store";
import authDialogReducer from "./auth-dialog.store";
import chatReducer from "./chat.store";
import listingReducer from "./listing.store";
import menuReducer from "./menu.store";
import profileReducer from "./profile.store";
import propertyCompareReducer from "./property-compare.store";
import formReducer from "./store";
import verifyOTPReducer from "./verify.store";

export const store = configureStore({
  reducer: {
    form: formReducer,
    verifyOTP: verifyOTPReducer,
    menu: menuReducer,
    listing: listingReducer,
    auth: authReducer,
    authDialog: authDialogReducer,
    profile: profileReducer,
    chat: chatReducer,
    propertyCompare: propertyCompareReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
