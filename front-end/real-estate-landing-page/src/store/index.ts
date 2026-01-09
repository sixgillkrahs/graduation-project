import { configureStore } from "@reduxjs/toolkit";
import formReducer from "./store";
import verifyOTPReducer from "./verify.store";
import menuReducer from "./menu.store";
import listingReducer from "./listing.store";

export const store = configureStore({
  reducer: {
    form: formReducer,
    verifyOTP: verifyOTPReducer,
    menu: menuReducer,
    listing: listingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
